# Workflow & Crawler Instructions: idk-lop10

## 1. Setup & Environment
- **Python**: 3.10+
- **Dependencies**: `pip install requests beautifulsoup4 playwright pdfplumber`
- **Session Auth**: Update `k12_session_cookies.json` with cookies extracted from browser when login sessions expire.

---

## 2. Crawler & Ingestion Workflows

### 2.1. Crawling Assigned Lessons & Homework
```bash
python crawl_assigned_lessons.py
```
- Reads session credentials from `k12_session_cookies.json`.
- Outputs structured assignments to `assigned_lessons.json` and video links to `assigned_videos.json`.

### 2.2. Extracting & Summarizing Textbook Chapters
To extract and summarize sections from `tienganh10.pdf` or subject PDFs:
```bash
python k12_crawler.py --extract --subject toan --chapter 1
```

---

## 3. Serving the Interactive Web Notebook
From `/home/truonglangquan/idk-lop10`:
```bash
cd web && python -m http.server 3000
```
Open browser at `http://localhost:3000` to review interactive study cards and test papers.
