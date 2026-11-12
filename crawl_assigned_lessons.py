#!/usr/bin/env python3
"""
idk-lop10 - Crawl Teacher-Assigned Lessons on K12Online
Source: https://hcm.k12online.vn/79000703/page/LMS/Lesson/Student/teacherList
Extracts all review guides, PDFs, SCORM slide decks, and documents assigned by teachers
at THPT Giồng Ông Tố, saving directly into ~/idk-lop10/<subject>/
"""

import os
import re
import json
import asyncio
import requests
import img2pdf
from pathlib import Path
from playwright.async_api import async_playwright

BASE_DIR = Path.home() / "idk-lop10"

SUBJECT_DIR_MAP = {
    "lịch sử": "idk-lich-su",
    "hóa học": "idk-hoa",
    "tin học": "idk-tin",
    "sinh học": "idk-sinh",
    "ngoại ngữ": "idk-tieng-anh",
    "tiếng anh": "idk-tieng-anh",
    "ngữ văn": "idk-van",
    "toán": "idk-toan",
    "vật lí": "idk-vat-li",
    "vật lý": "idk-vat-li",
    "gdcd": "idk-gddp",
    "giáo dục kinh tế và pháp luật": "idk-gddp",
}

def sanitize_filename(name: str) -> str:
    name = re.sub(r'^[0-9a-zA-Z\.\-_]+\s*-\s*', '', name)
    name = re.sub(r'^[0-9]{5,}[0-9a-zA-Z\.\-_]*_', '', name)
    name = re.sub(r'[\\/*?:"<>|]', '', name)
    name = re.sub(r'\s+', '_', name.strip())
    return name[:120]

async def crawl_assigned():
    print("=" * 65)
    print("[*] BẮT ĐẦU CRAWL BÀI GIẢNG GIÁO VIÊN GIAO (THPT GIỒNG ÔNG TỐ)")
    print("=" * 65)
    
    with open(BASE_DIR / "assigned_lessons.json", "r", encoding="utf-8") as f:
        lessons = json.load(f)
        
    with open(BASE_DIR / "k12_session_cookies.json", "r", encoding="utf-8") as f:
        cookies = json.load(f)
        
    session = requests.Session()
    session.headers.update({
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
    })
    for c in cookies:
        session.cookies.set(c["name"], c["value"], domain=c.get("domain", ""))
        
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
        await context.add_cookies(cookies)
        page = await context.new_page()
        
        extracted_docs = 0
        video_links = []
        
        for idx, item in enumerate(lessons, 1):
            lid = item["id"]
            title = item["title"]
            subject = item["subject"]
            teacher = item["teacher"]
            clean_title = sanitize_filename(title)
            
            sub_key = subject.lower().strip()
            folder_name = SUBJECT_DIR_MAP.get(sub_key, "idk-khac")
            dest_dir = BASE_DIR / folder_name
            dest_dir.mkdir(parents=True, exist_ok=True)
            
            print(f"\n[{idx:02d}/{len(lessons)}] ({subject}) {title} - GV: {teacher}")
            url = f"https://hcm.k12online.vn/79000703/page/LMS/Lesson/learn/{lid}?&site=2003571"
            
            try:
                await page.goto(url, wait_until="domcontentloaded", timeout=25000)
                await page.wait_for_timeout(2500)
            except Exception as e:
                print(f"  [!] Lỗi mở bài học: {e}")
                continue
                
            # Click leaf nodes trong fancytree nếu có
            try:
                nodes = await page.locator(".fancytree-title").all()
                if nodes:
                    await nodes[-1].click(force=True)
                    await page.wait_for_timeout(2000)
            except Exception:
                pass
                
            html = await page.content()
            
            # 1. Tìm tài liệu PDF trực tiếp
            pdf_urls = re.findall(r"https?://[^\s\"\x27\<\>]+(?:\.pdf)", html)
            for pdf_url in set(pdf_urls):
                pdf_name = f"{clean_title}.pdf"
                pdf_path = dest_dir / pdf_name
                
                if pdf_path.exists() and pdf_path.stat().st_size > 1000:
                    print(f"  [SKIP] Đã có file: {pdf_path.name}")
                    continue
                    
                print(f"  [DOWNLOADING PDF] {pdf_url}")
                try:
                    r_pdf = session.get(pdf_url, timeout=30)
                    if r_pdf.status_code == 200 and len(r_pdf.content) > 1000:
                        with open(pdf_path, "wb") as f_out:
                            f_out.write(r_pdf.content)
                        size_kb = len(r_pdf.content) / 1024
                        print(f"  [✓] Đã lưu PDF ({size_kb:.1f} KB): {pdf_path.name}")
                        print(f"      Vị trí: {pdf_path}")
                        extracted_docs += 1
                except Exception as ex_pdf:
                    print(f"  [!] Lỗi tải file: {ex_pdf}")
                    
            # 2. Tìm bài giảng SCORM / ActivePresenter
            iframes = await page.locator("iframe").all()
            for f in iframes:
                src = await f.get_attribute("src")
                if src and "/upload/" in src:
                    pdf_name = f"{clean_title}.pdf"
                    pdf_path = dest_dir / pdf_name
                    if pdf_path.exists() and pdf_path.stat().st_size > 10000:
                        print(f"  [SKIP] Đã có slide PDF: {pdf_path.name}")
                        continue
                        
                    base_pkg = f"https://hcm.k12online.vn{src}".rsplit('/', 1)[0]
                    session.headers["Referer"] = f"{base_pkg}/index.html"
                    
                    slide_images = []
                    for s_idx in range(10000, 10080):
                        img_url = f"{base_pkg}/resources/res_{s_idx:05d}.png"
                        try:
                            r_img = session.get(img_url, timeout=6)
                            if r_img.status_code == 200 and len(r_img.content) > 1000:
                                slide_images.append(r_img.content)
                            else:
                                break
                        except Exception:
                            break
                            
                    if slide_images:
                        try:
                            with open(pdf_path, "wb") as f_pdf:
                                f_pdf.write(img2pdf.convert(slide_images))
                            size_mb = pdf_path.stat().st_size / (1024 * 1024)
                            print(f"  [✓] Đã tạo PDF từ SCORM ({len(slide_images)} slides, {size_mb:.2f} MB): {pdf_path.name}")
                            extracted_docs += 1
                        except Exception as ex_scorm:
                            print(f"  [!] Lỗi ghép PDF SCORM: {ex_scorm}")
                            
            # 3. Ghi nhận link Video bài giảng nếu có
            vid_elements = await page.locator("video, source").all()
            for v in vid_elements:
                v_src = await v.get_attribute("src")
                if v_src and ("static.k12online.vn" in v_src or ".mp4" in v_src or ".m3u8" in v_src):
                    video_links.append({
                        "subject": subject,
                        "title": title,
                        "teacher": teacher,
                        "url": v_src
                    })
                    print(f"  [VIDEO] {v_src}")
                    
        # Lưu danh sách video vào file json
        if video_links:
            with open(BASE_DIR / "assigned_videos.json", "w", encoding="utf-8") as f_v:
                json.dump(video_links, f_v, ensure_ascii=False, indent=2)
            print(f"\n[+] Đã lưu {len(video_links)} link video bài giảng vào: {BASE_DIR / 'assigned_videos.json'}")
            
        print("\n" + "=" * 65)
        print(f"[*] HOÀN THÀNH CRAWL BÀI GIẢNG CỦA GIÁO VIÊN!")
        print(f"Tổng số tài liệu PDF mới được lưu: {extracted_docs}")
        print(f"Thư mục lưu trữ: {BASE_DIR}")
        print("Syncthing đang tự động đồng bộ sang máy chủ để nạp vào AI Notebook!")
        print("=" * 65)
        
        await browser.close()

if __name__ == "__main__":
    asyncio.run(crawl_assigned())
