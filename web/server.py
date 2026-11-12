import os
import sys
import json
import uuid
import asyncio
import subprocess
from pathlib import Path
from typing import List, Optional, Dict, Any

from fastapi import FastAPI, HTTPException, Request, Query
from fastapi.responses import StreamingResponse, JSONResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import httpx
import edge_tts
from pypdf import PdfReader

# Configuration
OMNIROUTE_URL = os.environ.get("OMNIROUTE_URL", "http://host.docker.internal:20128/v1")
OMNIROUTE_KEY = os.environ.get("OMNIROUTE_KEY", "sk-3bee253d3225390d-33c2f8-c31e5814")
OMNIROUTE_MODEL = os.environ.get("OMNIROUTE_MODEL", "auto/gemini")
DOCS_PATH = Path(os.environ.get("DOCS_PATH", "/data/documents"))
STORAGE_PATH = Path(os.environ.get("STORAGE_PATH", "/data/storage"))
AUDIO_DIR = STORAGE_PATH / "audio"
AUDIO_DIR.mkdir(parents=True, exist_ok=True)

app = FastAPI(title="idk-lop10 AI Notebook API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.middleware("http")
async def add_cache_headers(request, call_next):
    response = await call_next(request)
    # Force browsers not to cache HTML, CSS, JS during development
    path = request.url.path
    if path == "/" or path.endswith((".html", ".js", ".css")):
        response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
        response.headers["Pragma"] = "no-cache"
        response.headers["Expires"] = "0"
    return response

SUBJECT_META = {
    "idk-van": {"name": "Ngữ văn 10", "icon": "book-open", "color": "emerald"},
    "idk-toan": {"name": "Toán học 10", "icon": "calculator", "color": "blue"},
    "idk-hoa": {"name": "Hóa học 10", "icon": "flask-conical", "color": "purple"},
    "idk-vat-li": {"name": "Vật lí 10", "icon": "atom", "color": "indigo"},
    "idk-sinh": {"name": "Sinh học 10", "icon": "dna", "color": "green"},
    "idk-lich-su": {"name": "Lịch sử 10", "icon": "landmark", "color": "amber"},
    "idk-dia-li": {"name": "Địa lí 10", "icon": "globe", "color": "teal"},
    "idk-tin": {"name": "Tin học 10", "icon": "terminal", "color": "cyan"},
    "idk-tieng-anh": {"name": "Tiếng Anh 10", "icon": "languages", "color": "sky"},
    "idk-gddp": {"name": "GD Kinh tế & Pháp luật 10", "icon": "map-pin", "color": "rose"},
    "idk-hdtn": {"name": "HĐTN & Hướng nghiệp", "icon": "compass", "color": "orange"},
}

IGNORE_DIRS = {".git", ".system_generated", "hyperframes-egypt", "__pycache__", "videos", "renders", "compositions", "screenshot", "thuyet-trinh-image", "anh-de-bai"}

def get_title_from_file(path: Path) -> str:
    if path.suffix.lower() == ".md":
        try:
            with open(path, "r", encoding="utf-8", errors="ignore") as f:
                for _ in range(15):
                    line = f.readline()
                    if not line:
                        break
                    line_s = line.strip()
                    if line_s.startswith("# "):
                        return line_s[2:].strip()
        except Exception:
            pass
    stem = path.stem.replace("_", " ").replace("-", " ")
    return stem.title()

def extract_file_content(path: Path, max_chars: int = 40000) -> str:
    if not path.is_file():
        return ""
    suffix = path.suffix.lower()
    if suffix in [".md", ".txt"]:
        try:
            with open(path, "r", encoding="utf-8", errors="ignore") as f:
                return f.read(max_chars)
        except Exception as e:
            return f"[Lỗi đọc tệp: {e}]"
    elif suffix == ".pdf":
        try:
            reader = PdfReader(path)
            extracted = []
            char_count = 0
            for i, page in enumerate(reader.pages[:30]):
                txt = page.extract_text() or ""
                extracted.append(f"--- [Trang {i+1}] ---\n{txt}")
                char_count += len(txt)
                if char_count >= max_chars:
                    break
            return "\n".join(extracted)
        except Exception as e:
            return f"[Lỗi đọc PDF: {e}]"
    return ""

@app.api_route("/health", methods=["GET", "HEAD"])
def health():
    return {"status": "ok", "service": "idk-lop10-ai-notebook"}

@app.get("/api/subjects")
def get_subjects():
    if not DOCS_PATH.exists():
        return {"subjects": [], "documents": []}

    docs_list = []
    for root, dirs, files in os.walk(DOCS_PATH):
        dirs[:] = [d for d in dirs if d not in IGNORE_DIRS and not d.startswith(".")]
        
        rel_root = Path(root).relative_to(DOCS_PATH)
        parts = rel_root.parts
        subject_id = parts[0] if len(parts) > 0 and parts[0] != "." else "idk-khac"

        for file in files:
            if file.startswith("."):
                continue
            ext = Path(file).suffix.lower()
            if ext not in [".md", ".txt", ".pdf"]:
                continue
            
            full_path = Path(root) / file
            rel_file = full_path.relative_to(DOCS_PATH)
            title = get_title_from_file(full_path)
            size = full_path.stat().st_size
            
            docs_list.append({
                "id": str(rel_file),
                "title": title,
                "path": str(rel_file),
                "subject_id": subject_id,
                "file_type": ext.lstrip("."),
                "size_bytes": size,
            })

    subjects_dict = {}
    for sub_id, meta in SUBJECT_META.items():
        subjects_dict[sub_id] = {
            "id": sub_id,
            "name": meta["name"],
            "icon": meta["icon"],
            "color": meta["color"],
            "count": 0
        }

    for doc in docs_list:
        sid = doc["subject_id"]
        if sid not in subjects_dict:
            subjects_dict[sid] = {
                "id": sid,
                "name": sid.replace("idk-", "").title(),
                "icon": "folder",
                "color": "slate",
                "count": 0
            }
        subjects_dict[sid]["count"] += 1

    return {
        "subjects": list(subjects_dict.values()),
        "documents": sorted(docs_list, key=lambda x: (x["subject_id"], x["title"]))
    }

@app.get("/api/document/content")
def get_document_content(path: str = Query(..., description="Relative document path")):
    target = DOCS_PATH / path
    if not target.resolve().is_relative_to(DOCS_PATH.resolve()):
        raise HTTPException(status_code=400, detail="Invalid path")
    if not target.exists() or not target.is_file():
        raise HTTPException(status_code=404, detail="Document not found")

    content = extract_file_content(target)
    title = get_title_from_file(target)
    return {
        "path": path,
        "title": title,
        "file_type": target.suffix.lstrip("."),
        "content": content
    }

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    messages: List[ChatMessage]
    selected_sources: List[str] = []
    tutor_mode: bool = False

@app.post("/api/chat")
async def chat_endpoint(req: ChatRequest):
    sources_text = []
    for idx, rel_p in enumerate(req.selected_sources[:10]):
        file_p = DOCS_PATH / rel_p
        if file_p.exists() and file_p.is_file():
            c = extract_file_content(file_p, max_chars=25000)
            t = get_title_from_file(file_p)
            sources_text.append(f"=== [TÀI LIỆU {idx+1}: {t}] (Tệp: {rel_p}) ===\n{c}\n")

    grounded_context = "\n".join(sources_text) if sources_text else "Không có tài liệu nào được chỉ định riêng. Hãy giải thích theo chuẩn chương trình GDPT 2018 Lớp 10."

    if req.tutor_mode:
        tutor_guidance = (
            "CHẾ ĐỘ GIA SƯ SOCRATIC ĐANG BẬT:\n"
            "- Không đưa ra ngay bài giải trọn gói nếu học sinh hỏi bài tập.\n"
            "- Hãy đặt câu hỏi gợi mở, hướng dẫn học sinh nhận biết dạng bài, công thức áp dụng hoặc luận điểm chính.\n"
            "- Khen ngợi nỗ lực tư duy, dẫn dắt từng bước ngắn gọn, gần gũi."
        )
    else:
        tutor_guidance = (
            "CHẾ ĐỘ TRỢ LÝ HỌC TẬP CHUYÊN SÂU:\n"
            "- Trả lời đầy đủ, hệ thống, khoa học, dễ tiếp thu, có ví dụ minh họa và bài học thực tiễn.\n"
            "- Tổng hợp luận điểm rõ ràng bằng gạch đầu dòng."
        )

    system_prompt = f"""Bạn là idk-lop10 AI Notebook - Trợ lý và Gia sư Học tập Lớp 10 thông minh dựa trên mô hình NotebookLM và Astra AI.
Đối tượng: Học sinh Lớp 10 THPT Việt Nam (Chương trình GDPT 2018: Kết nối tri thức, Chân trời sáng tạo, Cánh diều).

{tutor_guidance}

QUY TẮC BẮT BUỘC VỀ TRÍCH DẪN & ĐỊNH DẠNG:
1. TRÍCH DẪN NGUỒN: Khi sử dụng thông tin từ tài liệu đính kèm, HÃY GHI RÕ TRÍCH DẪN bằng cú pháp đánh số `[Doc 1]` hoặc `[1: Tên tài liệu]` để giao diện có thể tạo liên kết cho học sinh bấm xem đoạn gốc.
2. TOÁN HỌC & CÔNG THỨC: Sử dụng KaTeX chuẩn LaTeX giữa dấu `$inline$` hoặc `$$block$$`. Ví dụ: `$v = v_0 + at$`, `$$\Delta = b^2 - 4ac$$`.
3. PHƯƠNG TRÌNH HÓA HỌC: Trình bày rõ ràng công thức và điều kiện phản ứng (ví dụ: `$$\\text{{Fe}} + 2\\text{{HCl}} \\to \\text{{FeCl}}_2 + \\text{{H}}_2 \\uparrow$$`).
4. VĂN PHONG: Thân thiện, chuẩn mực, khích lệ tinh thần tự học của học sinh.

TÀI LIỆU HỌC TẬP THAM KHẢO HIỆN TẠI:
{grounded_context}
"""

    messages_payload = [{"role": "system", "content": system_prompt}]
    for m in req.messages[-10:]:
        messages_payload.append({"role": m.role, "content": m.content})

    async def event_generator():
        client = httpx.AsyncClient(timeout=120.0)
        try:
            headers = {
                "Authorization": f"Bearer {OMNIROUTE_KEY}",
                "Content-Type": "application/json"
            }
            body = {
                "model": OMNIROUTE_MODEL,
                "messages": messages_payload,
                "stream": True,
                "temperature": 0.4
            }
            async with client.stream("POST", f"{OMNIROUTE_URL}/chat/completions", headers=headers, json=body) as response:
                if response.status_code != 200:
                    err_text = await response.aread()
                    yield f"data: {json.dumps({'error': f'OmniRoute Error {response.status_code}: {err_text.decode()}'})}\n\n"
                    return

                async for line in response.aiter_lines():
                    if not line:
                        continue
                    if line.startswith("data: "):
                        data_str = line[6:].strip()
                        if data_str == "[DONE]":
                            yield "data: [DONE]\n\n"
                            break
                        try:
                            data_json = json.loads(data_str)
                            delta = data_json.get("choices", [{}])[0].get("delta", {})
                            content = delta.get("content", "")
                            if content:
                                yield f"data: {json.dumps({'text': content})}\n\n"
                        except Exception:
                            continue
        except Exception as e:
            yield f"data: {json.dumps({'error': str(e)})}\n\n"
        finally:
            await client.aclose()

    return StreamingResponse(event_generator(), media_type="text/event-stream")

async def synthesize_speaker_audio(text: str, speaker: str, out_file: Path) -> bool:
    import re
    is_hoai_my = "hoai" in speaker.lower() or "my" in speaker.lower() or "female" in speaker.lower()
    voice = "vi-VN-HoaiMyNeural"
    rate = "+0%" if is_hoai_my else "-5%"

    # Clean text: remove markdown, quotes, emojis, and condense spaces
    clean_text = re.sub(r'[*#"“”–—…]+', ' ', text).strip()
    clean_text = re.sub(r'\s+', ' ', clean_text)
    if len(clean_text) < 3:
        return False

    for attempt in range(4):
        try:
            if out_file.exists():
                out_file.unlink()
            comm = edge_tts.Communicate(clean_text, voice, rate=rate)
            await comm.save(str(out_file))
            if out_file.exists() and out_file.stat().st_size > 300:
                return True
        except Exception:
            pass
        await asyncio.sleep(2.0 * (attempt + 1))

    # Ultimate fallback without rate parameter
    try:
        if out_file.exists():
            out_file.unlink()
        comm = edge_tts.Communicate(clean_text, voice)
        await comm.save(str(out_file))
        if out_file.exists() and out_file.stat().st_size > 300:
            return True
    except Exception:
        pass

    return False

# Podcast Generation
class PodcastRequest(BaseModel):
    selected_sources: List[str]
    topic: Optional[str] = None

@app.post("/api/podcast/generate")
async def generate_podcast(req: PodcastRequest):
    if not req.selected_sources:
        raise HTTPException(status_code=400, detail="Vui lòng chọn ít nhất 1 tài liệu để tạo Audio Overview.")

    sources_text = []
    titles = []
    for rel_p in req.selected_sources[:6]:
        file_p = DOCS_PATH / rel_p
        if file_p.exists() and file_p.is_file():
            c = extract_file_content(file_p, max_chars=15000)
            t = get_title_from_file(file_p)
            titles.append(t)
            sources_text.append(f"--- {t} ---\n{c}\n")

    topic_title = req.topic or (", ".join(titles[:2]) if titles else "Tổng quan bài học")
    combined_docs = "\n".join(sources_text)

    script_prompt = f"""Bạn là nhà sản xuất chương trình Audio Overview NotebookLM dành cho học sinh Lớp 10 Việt Nam.
Hãy sáng tác một kịch bản trò chuyện Audio Podcast ngắn gọn (đúng 6 lượt thoại xen kẽ, mỗi lượt 1-2 câu ngắn gọn, súc tích) giữa 2 bạn học sinh:
- Hoài My (Nữ, thông minh, tò mò, mở đầu và đặt câu hỏi gợi mở).
- Nam Minh (Nam, giải thích bản chất kiến thức bằng ví dụ thực tế dễ hiểu, dí dỏm).

Chủ đề: {topic_title}
Tài liệu học tập:
{combined_docs[:15000]}

YÊU CẦU:
- Câu từ tự nhiên, không đọc nguyên văn sách giáo khoa, không dùng từ ngữ quá phức tạp.
- TRẢ VỀ DUY NHẤT một chuỗi JSON hợp lệ (không kèm markdown ```json ```):
[
  {{"speaker": "HoaiMy", "text": "Chào Minh! Cậu đã đọc phần kiến thức trọng tâm của bài này chưa?"}},
  {{"speaker": "NamMinh", "text": "Chào My! Mình xem rồi, phần thú vị nhất chính là..."}}
]
"""

    async with httpx.AsyncClient(timeout=90.0) as client:
        res = await client.post(
            f"{OMNIROUTE_URL}/chat/completions",
            headers={"Authorization": f"Bearer {OMNIROUTE_KEY}"},
            json={
                "model": OMNIROUTE_MODEL,
                "messages": [{"role": "user", "content": script_prompt}],
                "temperature": 0.7
            }
        )
        if res.status_code != 200:
            raise HTTPException(status_code=500, detail=f"Lỗi tạo kịch bản từ AI: {res.text}")

        res_json = res.json()
        raw_script = res_json["choices"][0]["message"]["content"].strip()
        if raw_script.startswith("```"):
            raw_script = raw_script.split("\n", 1)[1]
            if raw_script.endswith("```"):
                raw_script = raw_script.rsplit("```", 1)[0]
            raw_script = raw_script.strip()

        try:
            dialogue = json.loads(raw_script)
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Không phân tích được kịch bản đối thoại JSON: {e}")

    podcast_id = str(uuid.uuid4())[:8]
    temp_dir = AUDIO_DIR / f"temp_{podcast_id}"
    temp_dir.mkdir(parents=True, exist_ok=True)
    
    file_list = []
    successful_dialogue = []
    try:
        for idx, turn in enumerate(dialogue):
            speaker = turn.get("speaker", "HoaiMy")
            text = turn.get("text", "").strip()
            if not text:
                continue

            chunk_file = temp_dir / f"chunk_{idx:03d}.mp3"
            ok = await synthesize_speaker_audio(text, speaker, chunk_file)
            if ok and chunk_file.exists() and chunk_file.stat().st_size > 300:
                file_list.append(chunk_file)
                successful_dialogue.append(turn)
            await asyncio.sleep(1.2)

        if not file_list:
            raise RuntimeError("Không thể tạo các đoạn âm thanh từ máy chủ giọng đọc.")

        final_mp3 = AUDIO_DIR / f"{podcast_id}.mp3"

        # Concat using pure binary join (Edge-TTS produces identical sample rate & bitrate)
        with open(final_mp3, "wb") as outfile:
            for p in file_list:
                with open(p, "rb") as infile:
                    outfile.write(infile.read())

        # Save metadata
        meta = {
            "id": podcast_id,
            "title": topic_title,
            "sources": req.selected_sources,
            "script": successful_dialogue,
            "audio_url": f"/audio/{podcast_id}.mp3"
        }
        with open(AUDIO_DIR / f"{podcast_id}.json", "w", encoding="utf-8") as f:
            json.dump(meta, f, ensure_ascii=False, indent=2)

        return meta
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Lỗi tạo âm thanh Podcast: {e}")
    finally:
        try:
            for p in file_list:
                if p.exists():
                    p.unlink()
            if (temp_dir / "concat.txt").exists():
                (temp_dir / "concat.txt").unlink()
            temp_dir.rmdir()
        except Exception:
            pass

@app.get("/api/podcasts")
def list_podcasts():
    podcasts = []
    for meta_file in AUDIO_DIR.glob("*.json"):
        try:
            with open(meta_file, "r", encoding="utf-8") as f:
                data = json.load(f)
                mp3_file = AUDIO_DIR / f"{data.get('id')}.mp3"
                if mp3_file.exists():
                    data["size_bytes"] = mp3_file.stat().st_size
                    podcasts.append(data)
        except Exception:
            continue
    return {"podcasts": sorted(podcasts, key=lambda x: x.get("id", ""), reverse=True)}

# Tools: Quiz, Flashcards, Mindmap
class ToolRequest(BaseModel):
    selected_sources: List[str]

class QuizRequest(BaseModel):
    selected_sources: List[str]
    preset: Optional[str] = "standard_45"  # "quick_15", "standard_45", "comprehensive_essay", "custom"
    difficulty: Optional[str] = "mixed"     # "recognition", "comprehension", "application", "mixed"
    num_mcq: Optional[int] = 12
    num_tf: Optional[int] = 4
    num_short: Optional[int] = 6
    num_essay: Optional[int] = 0
    time_limit_minutes: Optional[int] = 45

class GradeEssayRequest(BaseModel):
    question: str
    student_answer: str
    suggested_answer: Optional[str] = ""
    rubric: Optional[str] = ""
    max_score: Optional[float] = 2.0
    source_context: Optional[str] = ""

@app.post("/api/tools/quiz")
async def generate_quiz(req: QuizRequest):
    if not req.selected_sources:
        raise HTTPException(status_code=400, detail="Vui lòng chọn tài liệu để tạo đề trắc nghiệm.")
    
    docs = []
    for rel_p in req.selected_sources[:6]:
        fp = DOCS_PATH / rel_p
        if fp.exists():
            docs.append(f"--- {fp.name} ---\n{extract_file_content(fp, 10000)}")

    # Adjust question counts based on preset
    preset = req.preset or "standard_45"
    if preset == "quick_15":
        n_mcq, n_tf, n_short, n_essay = 10, 0, 0, 0
        time_limit = 15
        preset_name = "Đề 15 phút Kiểm tra Nhanh"
    elif preset == "standard_45":
        n_mcq, n_tf, n_short, n_essay = 12, 4, 4, 0
        time_limit = 45
        preset_name = "Đề 45 phút Chuẩn Bộ GD&ĐT 2025"
    elif preset == "comprehensive_essay":
        n_mcq, n_tf, n_short, n_essay = 10, 3, 3, 1
        time_limit = 50
        preset_name = "Đề Toàn diện có Tự luận"
    else:  # custom
        n_mcq = max(0, min(req.num_mcq or 10, 40))
        n_tf = max(0, min(req.num_tf or 0, 10))
        n_short = max(0, min(req.num_short or 0, 15))
        n_essay = max(0, min(req.num_essay or 0, 4))
        time_limit = max(5, min(req.time_limit_minutes or 45, 120))
        preset_name = "Đề Khảo sát Tùy chỉnh"

    diff_map = {
        "recognition": "chú trọng Nhận biết (ghi nhớ định nghĩa, công thức cốt lõi)",
        "comprehension": "chú trọng Thông hiểu (giải thích hiện tượng, so sánh)",
        "application": "chú trọng Vận dụng & Vận dụng cao (bài toán thực tế, suy luận sâu)",
        "mixed": "phân bổ cân đối: 40% Nhận biết, 30% Thông hiểu, 20% Vận dụng, 10% Vận dụng cao"
    }
    diff_desc = diff_map.get(req.difficulty, diff_map["mixed"])

    prompt = f"""Bạn là chuyên gia khảo thí biên soạn đề thi Lớp 10 theo đúng Chương trình Giáo dục Phổ thông 2018 và Định dạng Đề thi Mới của Bộ GD&ĐT.
Dựa vào nội dung tài liệu học tập sau:
{chr(10).join(docs)[:22000]}

HÃY SOẠN BỘ ĐỀ THI: "{preset_name}"
- Mức độ: {diff_desc}
- Cấu trúc yêu cầu:
  + Phần I: {n_mcq} câu hỏi trắc nghiệm nhiều phương án (4 lựa chọn A, B, C, D; chỉ 1 đáp án đúng).
  + Phần II: {n_tf} câu hỏi trắc nghiệm Đúng/Sai (Mỗi câu gồm 1 ngữ cảnh/dữ kiện chung và 4 mệnh đề con a, b, c, d; mỗi mệnh đề xác định là Đúng (true) hoặc Sai (false)).
  + Phần III: {n_short} câu hỏi trắc nghiệm trả lời ngắn (Điền đáp số là số nguyên, số thập phân hoặc từ khóa ngắn gọn).
  + Phần IV: {n_essay} câu hỏi tự luận (nếu số lượng > 0; yêu cầu lập luận, giải thích hoặc giải chi tiết).

YÊU CẦU: Trả về DUY NHẤT một đối tượng JSON hợp lệ (không kèm markdown ```json ```, không kèm văn bản giải thích ngoài JSON):
{{
  "title": "{preset_name}",
  "preset": "{preset}",
  "time_limit_minutes": {time_limit},
  "part1_mcq": [
    {{
      "id": 1,
      "question": "Nội dung câu hỏi...",
      "options": ["A. ...", "B. ...", "C. ...", "D. ..."],
      "answer": 0,
      "explanation": "Phân tích vì sao đáp án đúng và vì sao các phương án khác sai...",
      "difficulty": "Nhận biết"
    }}
  ],
  "part2_true_false": [
    {{
      "id": 1,
      "question": "Thông tin dữ kiện chung...",
      "sub_items": [
        {{"id": "a", "text": "Mệnh đề a...", "answer": true}},
        {{"id": "b", "text": "Mệnh đề b...", "answer": false}},
        {{"id": "c", "text": "Mệnh đề c...", "answer": true}},
        {{"id": "d", "text": "Mệnh đề d...", "answer": false}}
      ],
      "explanation": "Giải thích chi tiết cho từng mệnh đề a, b, c, d...",
      "difficulty": "Thông hiểu"
    }}
  ],
  "part3_short_answer": [
    {{
      "id": 1,
      "question": "Câu hỏi tính toán hoặc điền kết quả...",
      "answer": "12",
      "acceptable_answers": ["12", "12.0"],
      "explanation": "Lời giải từng bước ra đáp số...",
      "difficulty": "Vận dụng"
    }}
  ],
  "part4_essay": [
    {{
      "id": 1,
      "question": "Đề bài câu hỏi tự luận...",
      "suggested_answer": "Đáp án mẫu chi tiết và các ý đạt điểm...",
      "rubric": "Tiêu chí chấm điểm từng ý",
      "max_score": 2.0,
      "difficulty": "Vận dụng cao"
    }}
  ]
}}
"""
    async with httpx.AsyncClient(timeout=90.0) as client:
        res = await client.post(
            f"{OMNIROUTE_URL}/chat/completions",
            headers={"Authorization": f"Bearer {OMNIROUTE_KEY}"},
            json={"model": OMNIROUTE_MODEL, "messages": [{"role": "user", "content": prompt}], "temperature": 0.3}
        )
        if res.status_code != 200:
            raise HTTPException(status_code=500, detail=res.text)
        txt = res.json()["choices"][0]["message"]["content"].strip()
        if txt.startswith("```"):
            txt = txt.split("\n", 1)[1].rsplit("```", 1)[0].strip()
        
        parsed = json.loads(txt)
        # Ensure default arrays exist
        parsed.setdefault("part1_mcq", [])
        parsed.setdefault("part2_true_false", [])
        parsed.setdefault("part3_short_answer", [])
        parsed.setdefault("part4_essay", [])
        parsed.setdefault("time_limit_minutes", time_limit)
        parsed.setdefault("title", preset_name)
        return parsed

@app.post("/api/tools/grade-essay")
async def grade_essay(req: GradeEssayRequest):
    if not req.question or not req.student_answer:
        raise HTTPException(status_code=400, detail="Thiếu câu hỏi hoặc bài làm của học sinh.")

    prompt = f"""Bạn là giáo viên giám khảo chấm thi Lớp 10 công tâm và chuẩn mực.
Hãy chấm điểm bài làm tự luận của học sinh dựa trên câu hỏi, đáp án gợi ý và tiêu chí chấm sau:

CÂU HỎI:
{req.question}

ĐÁP ÁN GỢI Ý & TIÊU CHÍ CHẤM:
{req.suggested_answer}
{req.rubric}

BÀI LÀM CỦA HỌC SINH:
\"\"\"{req.student_answer}\"\"\"

THANG ĐIỂM TỐI ĐA: {req.max_score} điểm.

YÊU CẦU:
Trả về DUY NHẤT một đối tượng JSON hợp lệ (không kèm markdown ```json ```):
{{
  "score": 1.75,
  "max_score": {req.max_score},
  "feedback": "Nhận xét tổng quan súc tích, mang tính xây dựng và chỉ rõ mức độ hiểu bài...",
  "strengths": ["Ý đúng 1...", "Ý đúng 2..."],
  "improvements": ["Lỗi sai hoặc ý cần bổ sung..."]
}}
"""
    async with httpx.AsyncClient(timeout=45.0) as client:
        res = await client.post(
            f"{OMNIROUTE_URL}/chat/completions",
            headers={"Authorization": f"Bearer {OMNIROUTE_KEY}"},
            json={"model": OMNIROUTE_MODEL, "messages": [{"role": "user", "content": prompt}], "temperature": 0.2}
        )
        if res.status_code != 200:
            raise HTTPException(status_code=500, detail=res.text)
        txt = res.json()["choices"][0]["message"]["content"].strip()
        if txt.startswith("```"):
            txt = txt.split("\n", 1)[1].rsplit("```", 1)[0].strip()
        return json.loads(txt)

@app.post("/api/tools/flashcards")
async def generate_flashcards(req: ToolRequest):
    if not req.selected_sources:
        raise HTTPException(status_code=400, detail="Vui lòng chọn tài liệu để tạo Flashcards.")
    
    docs = []
    for rel_p in req.selected_sources[:6]:
        fp = DOCS_PATH / rel_p
        if fp.exists():
            docs.append(f"--- {fp.name} ---\n{extract_file_content(fp, 10000)}")

    prompt = f"""Dựa vào tài liệu học tập Lớp 10 sau, tạo 8 thẻ ghi nhớ (Flashcards) về các khái niệm cốt lõi, công thức hoặc sự kiện quan trọng nhất:
{chr(10).join(docs)[:20000]}

YÊU CẦU:
Trả về DUY NHẤT một mảng JSON hợp lệ (không kèm markdown ```json ```):
[
  {{
    "front": "Khái niệm hoặc câu hỏi ôn tập (Mặt trước)",
    "back": "Định nghĩa súc tích, công thức, bản chất cần nhớ (Mặt sau)",
    "tag": "Chủ đề / Bài"
  }}
]
"""
    async with httpx.AsyncClient(timeout=60.0) as client:
        res = await client.post(
            f"{OMNIROUTE_URL}/chat/completions",
            headers={"Authorization": f"Bearer {OMNIROUTE_KEY}"},
            json={"model": OMNIROUTE_MODEL, "messages": [{"role": "user", "content": prompt}], "temperature": 0.4}
        )
        if res.status_code != 200:
            raise HTTPException(status_code=500, detail=res.text)
        txt = res.json()["choices"][0]["message"]["content"].strip()
        if txt.startswith("```"):
            txt = txt.split("\n", 1)[1].rsplit("```", 1)[0].strip()
        return {"flashcards": json.loads(txt)}

@app.post("/api/tools/mindmap")
async def generate_mindmap(req: ToolRequest):
    if not req.selected_sources:
        raise HTTPException(status_code=400, detail="Vui lòng chọn tài liệu để tạo Sơ đồ tư duy.")
    
    docs = []
    for rel_p in req.selected_sources[:6]:
        fp = DOCS_PATH / rel_p
        if fp.exists():
            docs.append(f"--- {fp.name} ---\n{extract_file_content(fp, 10000)}")

    prompt = f"""Dựa vào tài liệu sau, hãy tạo cú pháp Mermaid.js cho Sơ đồ tư duy (mindmap hoặc graph TD) hệ thống hóa toàn bộ kiến thức:
{chr(10).join(docs)[:20000]}

YÊU CẦU:
- Cú pháp Mermaid.js hợp lệ, ngắn gọn, phân cấp rõ ràng (gốc -> các nhánh lớn -> các ý chi tiết).
- Trả về DUY NHẤT một đối tượng JSON (không kèm markdown):
{{
  "mermaid": "mindmap\\n  root((Chủ đề chính))\\n    Nhánh 1\\n      Chi tiết A\\n    Nhánh 2\\n      Chi tiết B"
}}
"""
    async with httpx.AsyncClient(timeout=60.0) as client:
        res = await client.post(
            f"{OMNIROUTE_URL}/chat/completions",
            headers={"Authorization": f"Bearer {OMNIROUTE_KEY}"},
            json={"model": OMNIROUTE_MODEL, "messages": [{"role": "user", "content": prompt}], "temperature": 0.3}
        )
        if res.status_code != 200:
            raise HTTPException(status_code=500, detail=res.text)
        txt = res.json()["choices"][0]["message"]["content"].strip()
        if txt.startswith("```"):
            txt = txt.split("\n", 1)[1].rsplit("```", 1)[0].strip()
        return json.loads(txt)

PUBLIC_DIR = Path(__file__).parent / "public"
PUBLIC_DIR.mkdir(parents=True, exist_ok=True)

# Mount audio files and static frontend
app.mount("/audio", StaticFiles(directory=str(AUDIO_DIR)), name="audio")
app.mount("/", StaticFiles(directory=str(PUBLIC_DIR), html=True), name="public")
