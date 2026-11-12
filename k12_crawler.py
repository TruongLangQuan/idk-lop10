#!/usr/bin/env python3
"""
idk-lop10 - K12Online Automated Crawler & Document Extractor
Bypasses F5 BIG-IP Bot Defense via Playwright Chromium,
crawls all Grade 10 subjects (Hóa, Lý, Toán, Văn, Sử, Địa, Tin, Tiếng Anh, GDDP),
extracts ActivePresenter slides & PDF attachments, converts slides to high-res PDFs,
and organizes them into ~/idk-lop10/<subject>/ for auto-syncing to AI Notebook.
"""

import os
import re
import sys
import json
import asyncio
import requests
import img2pdf
from pathlib import Path
from playwright.async_api import async_playwright

USERNAME = os.environ.get("K12_USER", "")
PASSWORD = os.environ.get("K12_PASS", "")
if not USERNAME or not PASSWORD:
    # Nếu chưa đặt env, thử đọc từ file .env hoặc nhắc nhở
    pass
BASE_DIR = Path(__file__).resolve().parent

# Mapping of K12Online Subject IDs to idk-lop10 folders
SUBJECTS = [
    {"name": "Hóa học 10", "id": "16", "folder": "idk-hoa"},
    {"name": "Ngữ văn 10", "id": "18", "folder": "idk-van"},
    {"name": "Lịch sử 10", "id": "12", "folder": "idk-lich-su"},
    {"name": "Tin học 10", "id": "09", "folder": "idk-tin"},
    {"name": "Sinh học 10", "id": "15", "folder": "idk-sinh"},
    {"name": "Vật lí 10", "id": "17", "folder": "idk-vat-li"},
    {"name": "Toán học 10", "id": "01", "folder": "idk-toan"},
    {"name": "Tiếng Anh 10", "id": "08", "folder": "idk-tieng-anh"},
    {"name": "Địa lí 10", "id": "14", "folder": "idk-dia-li"},
    {"name": "GD Kinh tế & Pháp luật 10", "id": "100", "folder": "idk-gddp"},
]

def sanitize_filename(name: str) -> str:
    # Clean unwanted prefixes like 110110.0303a5_
    name = re.sub(r'^[0-9a-zA-Z\.\-_]+\s*-\s*', '', name)
    name = re.sub(r'^[0-9]{5,}[0-9a-zA-Z\.\-_]*_', '', name)
    name = re.sub(r'[\\/*?:"<>|]', '', name)
    name = re.sub(r'\s+', '_', name.strip())
    return name[:120]

async def crawl_k12():
    print("=" * 65)
    print(f"[*] KHỞI ĐỘNG K12ONLINE AUTO-CRAWLER: {USERNAME}")
    print("=" * 65)
    
    async with async_playwright() as p:
        browser = await p.chromium.launch(
            headless=True,
            args=["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"]
        )
        context = await browser.new_context(
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
            viewport={"width": 1440, "height": 900},
            locale="vi-VN"
        )
        page = await context.new_page()
        
        # 1. Đăng nhập K12Online
        print("\n[Bước 1/4] Đăng nhập K12Online và vượt F5 BIG-IP WAF...")
        await page.goto("https://k12online.vn", wait_until="domcontentloaded", timeout=45000)
        await page.wait_for_selector("input[name='fields[username]']", timeout=15000)
        
        login_script = """
            async ({ username, password }) => {
                const tokenEl = document.querySelector('input[name="securityToken"]');
                const token = tokenEl ? tokenEl.value : '';
                const form = new FormData();
                form.append('fields[username]', username);
                form.append('fields[password]', password);
                form.append('remember', '1');
                form.append('securityToken', token);
                
                const res = await fetch('/api/LMS/K12/Member/login', {
                    method: 'POST',
                    body: form,
                    headers: { 'X-Requested-With': 'XMLHttpRequest' }
                });
                return await res.json();
            }
        """
        login_res = await page.evaluate(login_script, {"username": USERNAME, "password": PASSWORD})
        redirect_url = login_res.get("redirectURL")
        if not redirect_url:
            print("[!] Đăng nhập không thành công. Kiểm tra lại thông tin tài khoản.")
            await browser.close()
            return
            
        print("[+] Đăng nhập thành công! Chuyển hướng SSO vào THPT Giồng Ông Tố...")
        await page.goto(redirect_url, wait_until="domcontentloaded", timeout=45000)
        await page.wait_for_timeout(3000)
        
        # Thiết lập session requests với cookie đã xác thực
        cookies = await context.cookies()
        session = requests.Session()
        session.headers.update({
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
        })
        for c in cookies:
            session.cookies.set(c["name"], c["value"], domain=c.get("domain", ""))
            
        total_extracted = 0
        
        # 2. Quét qua từng môn học
        print("\n[Bước 2/4] Duyệt danh mục môn học Khối 10...")
        for sub in SUBJECTS:
            sub_name = sub["name"]
            sub_id = sub["id"]
            sub_folder = BASE_DIR / sub["folder"]
            sub_folder.mkdir(parents=True, exist_ok=True)
            
            lib_url = f"https://hcm.k12online.vn/79000703/page/Software/Library/Home/Book/list?filters[grades]=10&filters[subjectIds]={sub_id}&site=2003571"
            print(f"\n>>> [{sub_name}] Đang quét học liệu (Mã môn: {sub_id})...")
            
            try:
                await page.goto(lib_url, wait_until="domcontentloaded", timeout=30000)
                await page.wait_for_timeout(2500)
            except Exception as e:
                print(f"  [!] Lỗi tải danh sách: {e}")
                continue
                
            links = await page.locator("a").all()
            books = {}
            for l in links:
                href = await l.get_attribute("href")
                txt = (await l.inner_text()).strip()
                if href and "/book/" in href and txt:
                    bid = href.split("/book/")[1].split("?")[0].split("/")[0]
                    if bid not in books:
                        books[bid] = txt
                        
            print(f"  Phát hiện {len(books)} bài giảng.")
            
            # 3. Trích xuất tài liệu từng bài giảng
            for idx, (bid, btitle) in enumerate(books.items(), 1):
                clean_name = sanitize_filename(btitle)
                print(f"  [{idx}/{len(books)}] {btitle[:60]}...")
                
                # Mở trang chi tiết bài học
                view_url = f"https://hcm.k12online.vn/79000703/page/Software/Library/Home/Book/Lesson/view/{bid}?site=2003571"
                try:
                    await page.goto(view_url, wait_until="domcontentloaded", timeout=25000)
                    await page.wait_for_timeout(2000)
                except Exception:
                    continue
                    
                # Lấy tất cả các học liệu con (SCORM, PDF)
                cw_elements = await page.locator("a[data-type]").all()
                coursewares = []
                for cwe in cw_elements:
                    dt = await cwe.get_attribute("data-type")
                    href = await cwe.get_attribute("href")
                    title = (await cwe.get_attribute("title")) or (await cwe.inner_text()).strip()
                    if dt in ["Courseware.Scorm", "Courseware.PDF", "Courseware.Document"]:
                        coursewares.append({"type": dt, "href": href, "title": title})
                        
                # Nếu không tìm thấy bằng a[data-type], thử kiểm tra iframe trực tiếp
                if not coursewares:
                    iframes = await page.locator("iframe").all()
                    for f in iframes:
                        src = await f.get_attribute("src")
                        if src and "/upload/" in src:
                            coursewares.append({"type": "Courseware.Scorm", "href": view_url, "title": btitle, "direct_iframe": src})
                            
                for cw in coursewares:
                    cw_type = cw["type"]
                    cw_title = cw["title"] or btitle
                    cw_clean = sanitize_filename(cw_title)
                    pdf_dest = sub_folder / f"{cw_clean}.pdf"
                    
                    if pdf_dest.exists() and pdf_dest.stat().st_size > 10000:
                        print(f"    [SKIP] Đã tồn tại: {pdf_dest.name}")
                        continue
                        
                    # TH 1: Học liệu PDF
                    if cw_type == "Courseware.PDF":
                        try:
                            await page.goto(cw["href"], wait_until="domcontentloaded", timeout=20000)
                            await page.wait_for_timeout(2500)
                            html = await page.content()
                            pdf_matches = re.findall(r"https?://[^\s\"\x27\<\>]+(?:\.pdf)", html)
                            if pdf_matches:
                                pdf_url = pdf_matches[0]
                                print(f"    [DOWNLOADING PDF] {pdf_url}")
                                r_pdf = session.get(pdf_url, timeout=30)
                                if r_pdf.status_code == 200 and len(r_pdf.content) > 1000:
                                    with open(pdf_dest, "wb") as f_out:
                                        f_out.write(r_pdf.content)
                                    print(f"    [✓] Đã tải PDF ({len(r_pdf.content)/1024:.1f} KB): {pdf_dest.name}")
                                    total_extracted += 1
                        except Exception as ex_pdf:
                            print(f"    [!] Lỗi tải PDF: {ex_pdf}")
                            
                    # TH 2: Học liệu SCORM / ActivePresenter (Chuyển đổi thành PDF)
                    elif cw_type == "Courseware.Scorm":
                        try:
                            iframe_src = cw.get("direct_iframe")
                            if not iframe_src:
                                await page.goto(cw["href"], wait_until="domcontentloaded", timeout=20000)
                                await page.wait_for_timeout(2500)
                                iframe_el = page.locator("iframe").first
                                if await iframe_el.count() > 0:
                                    iframe_src = await iframe_el.get_attribute("src")
                                    
                            if iframe_src and "/upload/" in iframe_src:
                                base_pkg = f"https://hcm.k12online.vn{iframe_src}".rsplit('/', 1)[0]
                                session.headers["Referer"] = f"{base_pkg}/index.html"
                                
                                slide_images = []
                                for s_idx in range(10000, 10080):
                                    img_url = f"{base_pkg}/resources/res_{s_idx:05d}.png"
                                    try:
                                        r_img = session.get(img_url, timeout=8)
                                        if r_img.status_code == 200 and len(r_img.content) > 1000:
                                            slide_images.append(r_img.content)
                                        else:
                                            break
                                    except Exception:
                                        break
                                        
                                if slide_images:
                                    with open(pdf_dest, "wb") as f_pdf:
                                        f_pdf.write(img2pdf.convert(slide_images))
                                    size_mb = pdf_dest.stat().st_size / (1024 * 1024)
                                    print(f"    [✓] Đã tạo PDF ({len(slide_images)} slides, {size_mb:.2f} MB): {pdf_dest.name}")
                                    total_extracted += 1
                                else:
                                    print("    [!] Không tìm thấy slide ảnh PNG trong gói SCORM.")
                        except Exception as ex_scorm:
                            print(f"    [!] Lỗi trích xuất SCORM: {ex_scorm}")
                            
        print("\n" + "=" * 65)
        print(f"[Bước 4/4] HOÀN TẤT! Đã bóc tách thành công {total_extracted} tài liệu PDF.")
        print(f"Toàn bộ tài liệu được lưu tại: {BASE_DIR}")
        print("Syncthing đang tự động đồng bộ sang máy chủ để nạp vào AI Notebook!")
        print("=" * 65)
        await browser.close()

if __name__ == "__main__":
    asyncio.run(crawl_k12())
