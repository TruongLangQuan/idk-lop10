# Historical Context & Pipeline Evolution: idk-lop10

## 1. Background & Evolution
- `idk-lop10` was created to aggregate study materials, automate the ingestion of online homework from Vietnamese K12 educational portals, and build an AI-powered revision repository.
- Rather than manually navigating slow school web interfaces, Python scrapers (`crawl_assigned_lessons.py`) extract lesson deadlines, video requirements, and quizzes into structured JSON files.

---

## 2. Key Solved Issues
- **Session Expiration**: K12 online tokens invalidate after inactivity. Introduced `k12_session_cookies.json` schema so cookies can be dropped in directly without touching the crawler codebase.
- **Multimodal Assets**: Audio files (`test_voice.mp3`, `test1.mp3`) and textbook scans (`tienganh10.pdf`) were integrated into the ingestion pipeline for automated transcription and vocabulary flashcard generation.
