# Architecture & Data Flow: idk-lop10

## 1. System Pipeline

```mermaid
graph TD
    K12Online["K12 Online Learning Platform"] -->|Session Cookies (k12_session_cookies.json)| Crawler["Python Scraper (crawl_assigned_lessons.py / k12_crawler.py)"]

    Crawler --> RawData["Raw JSON Feeds (assigned_lessons.json, assigned_videos.json)"]
    Textbooks["Textbook Assets (tienganh10.pdf, hyperframes-egypt)"] --> IngestionEngine["AI Document Ingestion Engine"]

    RawData --> IngestionEngine
    IngestionEngine --> LLM["LLM Processing (Qwen via idk-omniroute)"]

    LLM --> Subjects["Subject Hubs (idk-toan, idk-hoa, idk-sinh, idk-van, idk-tin...)"]
    Subjects --> Summaries["Markdown Study Summaries & Formula Sheets"]
    Subjects --> Quizzes["Practice Quizzes & Solved Exercises"]

    Subjects --> WebUI["Web Interactive Notebook (web/)"]
```

---

## 2. Directory Matrix

- `idk-toan/`: Mệnh đề, tập hợp, bất phương trình, hệ thức lượng trong tam giác, vectơ.
- `idk-vat-li/`: Động học, lực và chuyển động, năng lượng, động lượng.
- `idk-hoa/`: Cấu tạo nguyên tử, bảng tuần hoàn, liên kết hóa học, phản ứng oxi hóa - khử.
- `idk-sinh/`: Sinh học tế bào, phân chia tế bào, vi sinh vật và virus.
- `idk-tin/`: Lập trình Python cơ bản, cấu trúc dữ liệu, giải thuật tìm kiếm/sắp xếp.
- `idk-van/`: Thơ ca, truyện ngắn, nghị luận xã hội, kỹ năng viết đoạn văn.
- `idk-tieng-anh/`: Vocabulary units, grammar structures, listening scripts from `tienganh10.pdf`.
- `idk-lich-su/` & `idk-dia-li/`: Lịch sử văn minh thế giới, địa lí tự nhiên và kinh tế.
- `idk-gddp/` & `idk-hdtn/`: Giáo dục địa phương và Hoạt động trải nghiệm hướng nghiệp.
