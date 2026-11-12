/**
 * idk-lop10 AI Notebook - Practice & Exam Engine (Chuẩn Bộ GD&ĐT 2025)
 * Hỗ trợ:
 * - 4 Định dạng câu hỏi: Trắc nghiệm 4 lựa chọn, Đúng/Sai 4 ý, Trả lời ngắn, Tự luận
 * - Giao diện 2 cột: Đề bài cuộn bên trái – Phiếu trả lời trắc nghiệm (OMR Answer Sheet) cố định bên phải
 * - 2 Chế độ: Thi thử (Exam - đếm ngược & nộp bài) & Luyện tập (Practice - xem đáp án tức thì)
 * - AI chấm điểm & nhận xét tự luận chi tiết
 */

const QuizEngine = {
  data: null,
  mode: 'exam', // 'exam' | 'practice'
  preset: 'standard_45', // 'quick_15', 'standard_45', 'comprehensive_essay', 'custom'
  difficulty: 'mixed',
  timeRemaining: 0,
  timerInterval: null,
  answers: {
    part1: {}, // qIdx: optIdx
    part2: {}, // qIdx: { a: bool, b: bool, c: bool, d: bool }
    part3: {}, // qIdx: string
    part4: {}  // qIdx: string
  },
  flags: new Set(),
  isSubmitted: false,
  results: null,

  setPreset(preset) {
    this.preset = preset;
    document.querySelectorAll('.quiz-preset-btn').forEach(btn => {
      if (btn.dataset.preset === preset) {
        btn.classList.add('bg-blue-600', 'text-white', 'border-blue-500');
        btn.classList.remove('bg-panelbg', 'text-slate-300', 'border-borderbase');
      } else {
        btn.classList.remove('bg-blue-600', 'text-white', 'border-blue-500');
        btn.classList.add('bg-panelbg', 'text-slate-300', 'border-borderbase');
      }
    });

    const customFields = document.getElementById('quizCustomFields');
    if (customFields) {
      if (preset === 'custom') {
        customFields.classList.remove('hidden');
      } else {
        customFields.classList.add('hidden');
      }
    }
  },

  setMode(mode) {
    this.mode = mode;
    const examBtn = document.getElementById('modeBtn-exam');
    const pracBtn = document.getElementById('modeBtn-practice');
    if (examBtn && pracBtn) {
      if (mode === 'exam') {
        examBtn.className = "flex-1 py-1.5 px-2.5 rounded-lg text-xs font-semibold bg-blue-600 text-white shadow";
        pracBtn.className = "flex-1 py-1.5 px-2.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white";
      } else {
        pracBtn.className = "flex-1 py-1.5 px-2.5 rounded-lg text-xs font-semibold bg-emerald-600 text-white shadow";
        examBtn.className = "flex-1 py-1.5 px-2.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white";
      }
    }
  },

  async startQuizGeneration() {
    if (AppState.selectedSourceIds.size === 0) {
      alert("Vui lòng tích chọn ít nhất 1 tài liệu ở cột bên trái để AI tạo đề.");
      return;
    }

    const btn = document.getElementById("generateQuizBtn");
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = `
        <svg class="animate-spin w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <circle cx="12" cy="12" r="10" stroke-width="4" stroke="currentColor" class="opacity-25"></circle>
          <path fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" class="opacity-75"></path>
        </svg>
        <span>Đang soạn đề BGD...</span>
      `;
    }

    const payload = {
      selected_sources: Array.from(AppState.selectedSourceIds),
      preset: this.preset,
      difficulty: document.getElementById('quizDifficultySelect')?.value || 'mixed',
      num_mcq: parseInt(document.getElementById('customMcqCount')?.value || 12),
      num_tf: parseInt(document.getElementById('customTfCount')?.value || 4),
      num_short: parseInt(document.getElementById('customShortCount')?.value || 4),
      num_essay: parseInt(document.getElementById('customEssayCount')?.value || 0),
      time_limit_minutes: parseInt(document.getElementById('customTimeLimit')?.value || 45)
    };

    try {
      const res = await fetch("/api/tools/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      this.initExam(data);
    } catch (err) {
      alert("Lỗi tạo đề thi: " + err.message);
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = `
          <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="9 11 12 14 22 4"></polyline>
            <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
          </svg>
          <span>Tạo Đề Thi Mới</span>
        `;
      }
    }
  },

  initExam(data) {
    this.data = data;
    this.isSubmitted = false;
    this.results = null;
    this.answers = { part1: {}, part2: {}, part3: {}, part4: {} };
    this.flags.clear();

    const timeMinutes = data.time_limit_minutes || 45;
    this.timeRemaining = timeMinutes * 60;

    this.renderExamArena();
    document.getElementById('examArenaModal').classList.remove('hidden');

    if (this.mode === 'exam') {
      this.startTimer();
    } else {
      document.getElementById('examTimerContainer').classList.add('hidden');
    }
  },

  startTimer() {
    clearInterval(this.timerInterval);
    const container = document.getElementById('examTimerContainer');
    if (container) container.classList.remove('hidden');

    this.updateTimerDisplay();
    this.timerInterval = setInterval(() => {
      this.timeRemaining--;
      this.updateTimerDisplay();
      if (this.timeRemaining <= 0) {
        clearInterval(this.timerInterval);
        alert("Đã hết thời gian làm bài! Hệ thống tự động thu bài và chấm điểm.");
        this.submitExam();
      }
    }, 1000);
  },

  updateTimerDisplay() {
    const el = document.getElementById('examTimerDisplay');
    if (!el) return;
    const m = Math.floor(Math.max(0, this.timeRemaining) / 60);
    const s = Math.max(0, this.timeRemaining) % 60;
    el.innerText = `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;

    if (this.timeRemaining < 300) { // Dưới 5 phút
      el.parentElement.classList.add('timer-critical');
    } else {
      el.parentElement.classList.remove('timer-critical');
    }
  },

  closeArena() {
    if (!this.isSubmitted && this.mode === 'exam') {
      if (!confirm("Bạn đang trong phòng thi. Bạn có chắc chắn muốn thoát không?")) {
        return;
      }
    }
    clearInterval(this.timerInterval);
    document.getElementById('examArenaModal').classList.add('hidden');
  },

  /* ================== RENDER EXAM ARENA ================== */
  renderExamArena() {
    const titleEl = document.getElementById('examTitle');
    if (titleEl) titleEl.innerText = this.data.title || "Đề Kiểm Tra Chuẩn BGD 2025";

    const qCol = document.getElementById('examQuestionsCol');
    const omrCol = document.getElementById('examOmrCol');
    if (!qCol || !omrCol) return;

    qCol.innerHTML = "";
    omrCol.innerHTML = "";

    // 1. Render Cột Trái: Đề bài
    this.renderQuestionSheets(qCol);

    // 2. Render Cột Phải: Phiếu OMR Sheet
    this.renderOmrSheet(omrCol);

    this.updateProgress();
  },

  renderQuestionSheets(container) {
    let globalIndex = 1;

    // --- PHẦN I: Trắc nghiệm 4 lựa chọn ---
    if (this.data.part1_mcq && this.data.part1_mcq.length > 0) {
      const p1Header = document.createElement("div");
      p1Header.className = "p-3 rounded-lg bg-slate-900/80 border border-slate-700 flex items-center justify-between";
      p1Header.innerHTML = `
        <div>
          <span class="text-xs font-bold text-blue-400 uppercase tracking-wider">PHẦN I: CÂU TRẮC NGHIỆM NHIỀU PHƯƠNG ÁN</span>
          <p class="text-[11px] text-slate-400">Chọn 1 phương án đúng duy nhất (A, B, C hoặc D)</p>
        </div>
        <span class="text-[11px] px-2 py-0.5 rounded bg-blue-950 text-blue-300 font-medium">${this.data.part1_mcq.length} câu</span>
      `;
      container.appendChild(p1Header);

      this.data.part1_mcq.forEach((q, idx) => {
        const qNum = globalIndex++;
        const card = document.createElement("div");
        card.id = `q-card-part1-${idx}`;
        card.className = "p-4 rounded-xl bg-cardbg border border-borderbase space-y-3 question-card transition-all";
        card.innerHTML = `
          <div class="flex items-start justify-between gap-3">
            <div class="text-xs font-medium text-slate-100 leading-relaxed">
              <strong class="text-blue-400 font-bold">Câu ${qNum}:</strong> ${q.question}
            </div>
            <button onclick="QuizEngine.toggleFlag('part1-${idx}')" id="flag-part1-${idx}" title="Đánh dấu xem lại" class="p-1 rounded text-slate-500 hover:text-amber-400 transition-colors">
              <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path><line x1="4" y1="22" x2="4" y2="15"></line></svg>
            </button>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
            ${q.options.map((opt, optIdx) => {
              const char = String.fromCharCode(65 + optIdx);
              return `
                <div onclick="QuizEngine.selectPart1Answer(${idx}, ${optIdx})" id="q-opt-part1-${idx}-${optIdx}" class="p-2.5 rounded-lg border border-borderbase bg-panelbg hover:border-slate-500 cursor-pointer flex items-center gap-2.5 transition-all text-slate-200">
                  <span class="w-5 h-5 rounded-full border border-slate-600 flex items-center justify-center text-[10px] font-bold text-slate-400">${char}</span>
                  <span class="leading-snug">${opt}</span>
                </div>
              `;
            }).join('')}
          </div>
          <div id="explanation-part1-${idx}" class="hidden p-3 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-300 space-y-1">
            <strong class="text-emerald-400 block font-semibold">Lời giải chi tiết:</strong>
            <p class="leading-relaxed">${q.explanation || "Không có giải thích chi tiết."}</p>
          </div>
        `;
        container.appendChild(card);
      });
    }

    // --- PHẦN II: Trắc nghiệm Đúng / Sai ---
    if (this.data.part2_true_false && this.data.part2_true_false.length > 0) {
      const p2Header = document.createElement("div");
      p2Header.className = "p-3 rounded-lg bg-slate-900/80 border border-slate-700 flex items-center justify-between mt-4";
      p2Header.innerHTML = `
        <div>
          <span class="text-xs font-bold text-purple-400 uppercase tracking-wider">PHẦN II: CÂU TRẮC NGHIỆM ĐÚNG / SAI</span>
          <p class="text-[11px] text-slate-400">Trong mỗi ý a, b, c, d của từng câu, chọn Đúng hoặc Sai</p>
        </div>
        <span class="text-[11px] px-2 py-0.5 rounded bg-purple-950 text-purple-300 font-medium">${this.data.part2_true_false.length} câu</span>
      `;
      container.appendChild(p2Header);

      this.data.part2_true_false.forEach((q, idx) => {
        const qNum = globalIndex++;
        const card = document.createElement("div");
        card.id = `q-card-part2-${idx}`;
        card.className = "p-4 rounded-xl bg-cardbg border border-borderbase space-y-3 question-card transition-all";
        card.innerHTML = `
          <div class="flex items-start justify-between gap-3">
            <div class="text-xs font-medium text-slate-100 leading-relaxed">
              <strong class="text-purple-400 font-bold">Câu ${qNum}:</strong> ${q.question}
            </div>
            <button onclick="QuizEngine.toggleFlag('part2-${idx}')" id="flag-part2-${idx}" title="Đánh dấu xem lại" class="p-1 rounded text-slate-500 hover:text-amber-400 transition-colors">
              <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path><line x1="4" y1="22" x2="4" y2="15"></line></svg>
            </button>
          </div>
          <div class="space-y-2 border-t border-slate-800 pt-2 text-xs">
            ${(q.sub_items || []).map((sub) => `
              <div class="p-2 rounded-lg bg-panelbg border border-borderbase flex items-center justify-between gap-3">
                <span class="text-slate-300 font-normal leading-snug"><strong class="text-slate-100 uppercase">${sub.id})</strong> ${sub.text}</span>
                <div class="flex items-center gap-1.5 shrink-0">
                  <button onclick="QuizEngine.selectPart2Answer(${idx}, '${sub.id}', true)" id="btn-tf-${idx}-${sub.id}-true" class="px-2.5 py-1 rounded text-[11px] font-bold border border-slate-700 bg-slate-800 text-slate-400 hover:border-emerald-500 transition-all">Đúng</button>
                  <button onclick="QuizEngine.selectPart2Answer(${idx}, '${sub.id}', false)" id="btn-tf-${idx}-${sub.id}-false" class="px-2.5 py-1 rounded text-[11px] font-bold border border-slate-700 bg-slate-800 text-slate-400 hover:border-red-500 transition-all">Sai</button>
                </div>
              </div>
            `).join('')}
          </div>
          <div id="explanation-part2-${idx}" class="hidden p-3 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-300 space-y-1">
            <strong class="text-emerald-400 block font-semibold">Lời giải chi tiết:</strong>
            <p class="leading-relaxed">${q.explanation || "Không có giải thích chi tiết."}</p>
          </div>
        `;
        container.appendChild(card);
      });
    }

    // --- PHẦN III: Trả lời ngắn ---
    if (this.data.part3_short_answer && this.data.part3_short_answer.length > 0) {
      const p3Header = document.createElement("div");
      p3Header.className = "p-3 rounded-lg bg-slate-900/80 border border-slate-700 flex items-center justify-between mt-4";
      p3Header.innerHTML = `
        <div>
          <span class="text-xs font-bold text-amber-400 uppercase tracking-wider">PHẦN III: CÂU TRẮC NGHIỆM TRẢ LỜI NGẮN</span>
          <p class="text-[11px] text-slate-400">Điền kết quả tính toán hoặc từ khóa súc tích vào ô</p>
        </div>
        <span class="text-[11px] px-2 py-0.5 rounded bg-amber-950 text-amber-300 font-medium">${this.data.part3_short_answer.length} câu</span>
      `;
      container.appendChild(p3Header);

      this.data.part3_short_answer.forEach((q, idx) => {
        const qNum = globalIndex++;
        const card = document.createElement("div");
        card.id = `q-card-part3-${idx}`;
        card.className = "p-4 rounded-xl bg-cardbg border border-borderbase space-y-3 question-card transition-all";
        card.innerHTML = `
          <div class="flex items-start justify-between gap-3">
            <div class="text-xs font-medium text-slate-100 leading-relaxed">
              <strong class="text-amber-400 font-bold">Câu ${qNum}:</strong> ${q.question}
            </div>
            <button onclick="QuizEngine.toggleFlag('part3-${idx}')" id="flag-part3-${idx}" title="Đánh dấu xem lại" class="p-1 rounded text-slate-500 hover:text-amber-400 transition-colors">
              <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path><line x1="4" y1="22" x2="4" y2="15"></line></svg>
            </button>
          </div>
          <div class="flex items-center gap-3">
            <span class="text-xs text-slate-400 font-medium">Đáp số:</span>
            <input type="text" oninput="QuizEngine.setPart3Answer(${idx}, this.value)" id="input-short-${idx}" placeholder="Gõ đáp số..." class="w-48 px-3 py-1.5 rounded-lg bg-panelbg border border-borderbase text-xs text-white focus:outline-none focus:border-amber-500 font-mono">
          </div>
          <div id="explanation-part3-${idx}" class="hidden p-3 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-300 space-y-1">
            <strong class="text-emerald-400 block font-semibold">Đáp án chuẩn & Hướng dẫn:</strong>
            <p class="font-mono text-emerald-300">Đáp án: ${q.answer}</p>
            <p class="leading-relaxed">${q.explanation || ""}</p>
          </div>
        `;
        container.appendChild(card);
      });
    }

    // --- PHẦN IV: Tự luận ---
    if (this.data.part4_essay && this.data.part4_essay.length > 0) {
      const p4Header = document.createElement("div");
      p4Header.className = "p-3 rounded-lg bg-slate-900/80 border border-slate-700 flex items-center justify-between mt-4";
      p4Header.innerHTML = `
        <div>
          <span class="text-xs font-bold text-rose-400 uppercase tracking-wider">PHẦN IV: CÂU HỎI TỰ LUẬN (AI CHẤM ĐIỂM)</span>
          <p class="text-[11px] text-slate-400">Trình bày lời giải hoặc lập luận chi tiết. AI sẽ đối chiếu barem để chấm.</p>
        </div>
        <span class="text-[11px] px-2 py-0.5 rounded bg-rose-950 text-rose-300 font-medium">${this.data.part4_essay.length} câu</span>
      `;
      container.appendChild(p4Header);

      this.data.part4_essay.forEach((q, idx) => {
        const qNum = globalIndex++;
        const card = document.createElement("div");
        card.id = `q-card-part4-${idx}`;
        card.className = "p-4 rounded-xl bg-cardbg border border-borderbase space-y-3 question-card transition-all";
        card.innerHTML = `
          <div class="flex items-start justify-between gap-3">
            <div class="text-xs font-medium text-slate-100 leading-relaxed">
              <strong class="text-rose-400 font-bold">Câu ${qNum} (${q.max_score || 2.0}đ):</strong> ${q.question}
            </div>
            <button onclick="QuizEngine.toggleFlag('part4-${idx}')" id="flag-part4-${idx}" title="Đánh dấu xem lại" class="p-1 rounded text-slate-500 hover:text-amber-400 transition-colors">
              <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path><line x1="4" y1="22" x2="4" y2="15"></line></svg>
            </button>
          </div>
          <div>
            <textarea oninput="QuizEngine.setPart4Answer(${idx}, this.value)" id="input-essay-${idx}" rows="4" placeholder="Nhập câu trả lời hoặc các bước giải của bạn..." class="w-full p-3 rounded-lg bg-panelbg border border-borderbase text-xs text-slate-100 focus:outline-none focus:border-rose-500 leading-relaxed font-sans"></textarea>
          </div>
          <div id="essay-feedback-${idx}" class="hidden p-3.5 rounded-lg bg-slate-900 border border-slate-700 text-xs space-y-2">
            <div class="flex items-center justify-between">
              <strong class="text-rose-400 font-semibold flex items-center gap-1.5">
                <svg class="w-3.5 h-3.5 text-rose-400" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
                AI Chấm Điểm & Nhận Xét:
              </strong>
              <span id="essay-score-${idx}" class="px-2 py-0.5 rounded bg-rose-950 font-bold text-rose-300">0 / 2.0</span>
            </div>
            <p id="essay-comment-${idx}" class="text-slate-300 leading-relaxed"></p>
            <div id="essay-criteria-${idx}" class="text-[11px] text-slate-400 border-t border-slate-800 pt-2 space-y-1"></div>
          </div>
        `;
        container.appendChild(card);
      });
    }
  },

  /* ================== RENDER PHIẾU OMR SHEET ================== */
  renderOmrSheet(container) {
    let globalIndex = 1;

    const sheetWrapper = document.createElement("div");
    sheetWrapper.className = "omr-sheet-container p-4 space-y-4 text-xs";

    // Header Phiếu OMR
    sheetWrapper.innerHTML = `
      <div class="border-b border-borderbase pb-3 flex items-center justify-between">
        <div>
          <span class="text-[10px] font-bold text-blue-400 uppercase tracking-widest block">BỘ GIÁO DỤC VÀ ĐÀO TẠO</span>
          <h4 class="text-xs font-extrabold text-white">PHIẾU TRẢ LỜI TRẮC NGHIỆM</h4>
        </div>
        <div class="text-right">
          <span class="text-[10px] text-slate-400 block">Kỳ thi THPT Khối 10</span>
          <span class="text-[10px] font-mono text-slate-500">Mã đề: 102</span>
        </div>
      </div>
    `;

    // Phần I OMR
    if (this.data.part1_mcq && this.data.part1_mcq.length > 0) {
      const p1Sec = document.createElement("div");
      p1Sec.className = "space-y-2 border-b border-borderbase pb-3";
      p1Sec.innerHTML = `<span class="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Phần I: 4 Phương án</span>`;

      const grid = document.createElement("div");
      grid.className = "grid grid-cols-1 gap-1.5";

      this.data.part1_mcq.forEach((q, idx) => {
        const qNum = globalIndex++;
        const row = document.createElement("div");
        row.className = "flex items-center justify-between p-1 rounded hover:bg-slate-800/40";
        row.innerHTML = `
          <span onclick="QuizEngine.scrollToQuestion('part1-${idx}')" class="font-mono font-bold text-slate-300 w-12 cursor-pointer hover:text-blue-400 transition-colors">
            C${qNum < 10 ? '0' + qNum : qNum}
          </span>
          <div class="flex items-center gap-1.5">
            ${['A', 'B', 'C', 'D'].map((char, optIdx) => `
              <span onclick="QuizEngine.selectPart1Answer(${idx}, ${optIdx})" id="omr-bubble-part1-${idx}-${optIdx}" class="omr-bubble">
                ${char}
              </span>
            `).join('')}
          </div>
        `;
        grid.appendChild(row);
      });
      p1Sec.appendChild(grid);
      sheetWrapper.appendChild(p1Sec);
    }

    // Phần II OMR
    if (this.data.part2_true_false && this.data.part2_true_false.length > 0) {
      const p2Sec = document.createElement("div");
      p2Sec.className = "space-y-2 border-b border-borderbase pb-3";
      p2Sec.innerHTML = `<span class="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Phần II: Đúng / Sai</span>`;

      this.data.part2_true_false.forEach((q, idx) => {
        const qNum = globalIndex++;
        const box = document.createElement("div");
        box.className = "p-2 rounded-lg bg-panelbg border border-borderbase/60 space-y-1";
        box.innerHTML = `
          <div onclick="QuizEngine.scrollToQuestion('part2-${idx}')" class="font-mono font-bold text-slate-300 text-[11px] cursor-pointer hover:text-purple-400 transition-colors">
            Câu ${qNum}:
          </div>
          <div class="grid grid-cols-2 gap-x-2 gap-y-1">
            ${['a', 'b', 'c', 'd'].map(char => `
              <div class="flex items-center justify-between text-[11px] bg-slate-900/60 px-1.5 py-0.5 rounded">
                <span class="font-bold text-slate-400 uppercase">${char}</span>
                <div class="flex items-center gap-1">
                  <span onclick="QuizEngine.selectPart2Answer(${idx}, '${char}', true)" id="omr-tf-${idx}-${char}-true" class="omr-bubble !w-5 !h-5 !text-[9px]">Đ</span>
                  <span onclick="QuizEngine.selectPart2Answer(${idx}, '${char}', false)" id="omr-tf-${idx}-${char}-false" class="omr-bubble !w-5 !h-5 !text-[9px]">S</span>
                </div>
              </div>
            `).join('')}
          </div>
        `;
        p2Sec.appendChild(box);
      });
      sheetWrapper.appendChild(p2Sec);
    }

    // Phần III OMR
    if (this.data.part3_short_answer && this.data.part3_short_answer.length > 0) {
      const p3Sec = document.createElement("div");
      p3Sec.className = "space-y-2 border-b border-borderbase pb-3";
      p3Sec.innerHTML = `<span class="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Phần III: Trả lời ngắn</span>`;

      const grid3 = document.createElement("div");
      grid3.className = "grid grid-cols-2 gap-2";

      this.data.part3_short_answer.forEach((q, idx) => {
        const qNum = globalIndex++;
        const box = document.createElement("div");
        box.className = "p-1.5 rounded bg-panelbg border border-borderbase flex items-center justify-between";
        box.innerHTML = `
          <span onclick="QuizEngine.scrollToQuestion('part3-${idx}')" class="font-mono font-bold text-slate-400 cursor-pointer hover:text-amber-400">C${qNum}:</span>
          <span id="omr-short-val-${idx}" class="font-mono font-bold text-amber-400 truncate max-w-[65px] text-[11px]">-</span>
        `;
        grid3.appendChild(box);
      });
      p3Sec.appendChild(grid3);
      sheetWrapper.appendChild(p3Sec);
    }

    // Phần IV OMR
    if (this.data.part4_essay && this.data.part4_essay.length > 0) {
      const p4Sec = document.createElement("div");
      p4Sec.className = "space-y-1.5";
      p4Sec.innerHTML = `<span class="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Phần IV: Tự luận</span>`;

      this.data.part4_essay.forEach((q, idx) => {
        const qNum = globalIndex++;
        const row = document.createElement("div");
        row.className = "p-1.5 rounded bg-panelbg border border-borderbase flex items-center justify-between text-[11px]";
        row.innerHTML = `
          <span onclick="QuizEngine.scrollToQuestion('part4-${idx}')" class="font-mono font-bold text-slate-400 cursor-pointer hover:text-rose-400">Câu ${qNum}:</span>
          <span id="omr-essay-status-${idx}" class="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">Chưa làm</span>
        `;
        p4Sec.appendChild(row);
      });
      sheetWrapper.appendChild(p4Sec);
    }

    container.appendChild(sheetWrapper);
  },

  /* ================== TWO-WAY INTERACTION ================== */
  selectPart1Answer(qIdx, optIdx) {
    if (this.isSubmitted) return;

    this.answers.part1[qIdx] = optIdx;

    // 1. Cập nhật trên thẻ đề bài
    const qCard = document.getElementById(`q-card-part1-${qIdx}`);
    if (qCard) {
      qCard.querySelectorAll('[id^="q-opt-part1-"]').forEach((el, idx) => {
        if (idx === optIdx) {
          el.classList.add('border-blue-500', 'bg-blue-950/40', 'text-white');
          el.querySelector('span:first-child').classList.add('bg-blue-600', 'text-white', 'border-blue-500');
        } else {
          el.classList.remove('border-blue-500', 'bg-blue-950/40', 'text-white');
          el.querySelector('span:first-child').classList.remove('bg-blue-600', 'text-white', 'border-blue-500');
        }
      });
    }

    // 2. Cập nhật trên Phiếu OMR Sheet (tô chì)
    for (let i = 0; i < 4; i++) {
      const bubble = document.getElementById(`omr-bubble-part1-${qIdx}-${i}`);
      if (bubble) {
        if (i === optIdx) {
          bubble.classList.add('filled');
        } else {
          bubble.classList.remove('filled');
        }
      }
    }

    // 3. Nếu ở chế độ Luyện tập: Kiểm tra tức thì
    if (this.mode === 'practice') {
      this.checkInstantPart1(qIdx, optIdx);
    }

    this.updateProgress();
  },

  selectPart2Answer(qIdx, subId, val) {
    if (this.isSubmitted) return;

    if (!this.answers.part2[qIdx]) this.answers.part2[qIdx] = {};
    this.answers.part2[qIdx][subId] = val;

    // Cập nhật nút trên câu hỏi
    const btnTrue = document.getElementById(`btn-tf-${qIdx}-${subId}-true`);
    const btnFalse = document.getElementById(`btn-tf-${qIdx}-${subId}-false`);
    if (btnTrue && btnFalse) {
      if (val === true) {
        btnTrue.className = "px-2.5 py-1 rounded text-[11px] font-bold border border-emerald-500 bg-emerald-950 text-emerald-200";
        btnFalse.className = "px-2.5 py-1 rounded text-[11px] font-bold border border-slate-700 bg-slate-800 text-slate-400";
      } else {
        btnFalse.className = "px-2.5 py-1 rounded text-[11px] font-bold border border-red-500 bg-red-950 text-red-200";
        btnTrue.className = "px-2.5 py-1 rounded text-[11px] font-bold border border-slate-700 bg-slate-800 text-slate-400";
      }
    }

    // Cập nhật phiếu OMR
    const bubbleTrue = document.getElementById(`omr-tf-${qIdx}-${subId}-true`);
    const bubbleFalse = document.getElementById(`omr-tf-${qIdx}-${subId}-false`);
    if (bubbleTrue && bubbleFalse) {
      if (val === true) {
        bubbleTrue.classList.add('filled');
        bubbleFalse.classList.remove('filled');
      } else {
        bubbleFalse.classList.add('filled');
        bubbleTrue.classList.remove('filled');
      }
    }

    this.updateProgress();
  },

  setPart3Answer(qIdx, val) {
    if (this.isSubmitted) return;
    this.answers.part3[qIdx] = val.trim();

    const omrVal = document.getElementById(`omr-short-val-${qIdx}`);
    if (omrVal) {
      omrVal.innerText = val.trim() || "-";
    }
    this.updateProgress();
  },

  setPart4Answer(qIdx, val) {
    if (this.isSubmitted) return;
    this.answers.part4[qIdx] = val.trim();

    const omrStatus = document.getElementById(`omr-essay-status-${qIdx}`);
    if (omrStatus) {
      if (val.trim()) {
        omrStatus.innerText = "Đã làm";
        omrStatus.className = "text-[10px] px-1.5 py-0.5 rounded bg-blue-950 text-blue-300 font-medium";
      } else {
        omrStatus.innerText = "Chưa làm";
        omrStatus.className = "text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400";
      }
    }
    this.updateProgress();
  },

  toggleFlag(qKey) {
    const btn = document.getElementById(`flag-${qKey}`);
    const card = document.getElementById(`q-card-${qKey}`);
    if (this.flags.has(qKey)) {
      this.flags.delete(qKey);
      if (btn) btn.classList.remove('text-amber-400');
      if (card) card.classList.remove('flagged-card');
    } else {
      this.flags.add(qKey);
      if (btn) btn.classList.add('text-amber-400');
      if (card) card.classList.add('flagged-card');
    }
  },

  scrollToQuestion(qKey) {
    const card = document.getElementById(`q-card-${qKey}`);
    if (card) {
      card.scrollIntoView({ behavior: 'smooth', block: 'center' });
      card.classList.add('omr-active-focus');
      setTimeout(() => card.classList.remove('omr-active-focus'), 1200);
    }
  },

  updateProgress() {
    let answered = 0;
    let total = 0;

    if (this.data.part1_mcq) {
      total += this.data.part1_mcq.length;
      answered += Object.keys(this.answers.part1).length;
    }
    if (this.data.part2_true_false) {
      total += this.data.part2_true_false.length;
      Object.values(this.answers.part2).forEach(subMap => {
        if (Object.keys(subMap).length === 4) answered++;
      });
    }
    if (this.data.part3_short_answer) {
      total += this.data.part3_short_answer.length;
      Object.values(this.answers.part3).forEach(v => {
        if (v) answered++;
      });
    }
    if (this.data.part4_essay) {
      total += this.data.part4_essay.length;
      Object.values(this.answers.part4).forEach(v => {
        if (v) answered++;
      });
    }

    const progEl = document.getElementById('examProgressText');
    if (progEl) progEl.innerText = `${answered} / ${total} câu`;
  },

  checkInstantPart1(qIdx, optIdx) {
    const q = this.data.part1_mcq[qIdx];
    const exp = document.getElementById(`explanation-part1-${qIdx}`);
    if (exp) exp.classList.remove('hidden');

    const bubble = document.getElementById(`omr-bubble-part1-${qIdx}-${optIdx}`);
    const correctBubble = document.getElementById(`omr-bubble-part1-${qIdx}-${q.answer}`);

    if (optIdx === q.answer) {
      if (bubble) bubble.classList.add('correct');
    } else {
      if (bubble) bubble.classList.add('incorrect');
      if (correctBubble) correctBubble.classList.add('key-answer');
    }
  },

  /* ================== SUBMIT & GRADING ================== */
  async submitExam() {
    if (!this.data) return;
    if (this.isSubmitted) return;

    if (!confirm("Bạn có chắc chắn muốn nộp bài thi không?")) return;

    this.isSubmitted = true;
    clearInterval(this.timerInterval);

    const submitBtn = document.getElementById('submitExamBtn');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerText = "Đang chấm bài...";
    }

    let scoreP1 = 0;
    let scoreP2 = 0;
    let scoreP3 = 0;
    let scoreP4 = 0;

    // 1. Chấm Phần I (Trắc nghiệm 4 chọn 1)
    if (this.data.part1_mcq) {
      this.data.part1_mcq.forEach((q, idx) => {
        const userOpt = this.answers.part1[idx];
        const correctBubble = document.getElementById(`omr-bubble-part1-${idx}-${q.answer}`);
        const exp = document.getElementById(`explanation-part1-${idx}`);
        if (exp) exp.classList.remove('hidden');

        if (userOpt !== undefined) {
          const userBubble = document.getElementById(`omr-bubble-part1-${idx}-${userOpt}`);
          if (userOpt === q.answer) {
            scoreP1 += 0.25;
            if (userBubble) userBubble.classList.add('correct');
          } else {
            if (userBubble) userBubble.classList.add('incorrect');
            if (correctBubble) correctBubble.classList.add('key-answer');
          }
        } else {
          if (correctBubble) correctBubble.classList.add('key-answer');
        }
      });
    }

    // 2. Chấm Phần II (Đúng/Sai chuẩn BGD: 1 ý=0.1đ, 2 ý=0.25đ, 3 ý=0.5đ, 4 ý=1.0đ)
    if (this.data.part2_true_false) {
      this.data.part2_true_false.forEach((q, idx) => {
        const userSubs = this.answers.part2[idx] || {};
        let correctCount = 0;
        const exp = document.getElementById(`explanation-part2-${idx}`);
        if (exp) exp.classList.remove('hidden');

        (q.sub_items || []).forEach(sub => {
          const uVal = userSubs[sub.id];
          const bTrue = document.getElementById(`omr-tf-${idx}-${sub.id}-true`);
          const bFalse = document.getElementById(`omr-tf-${idx}-${sub.id}-false`);

          if (uVal !== undefined) {
            if (uVal === sub.answer) {
              correctCount++;
              if (uVal === true && bTrue) bTrue.classList.add('correct');
              if (uVal === false && bFalse) bFalse.classList.add('correct');
            } else {
              if (uVal === true && bTrue) bTrue.classList.add('incorrect');
              if (uVal === false && bFalse) bFalse.classList.add('incorrect');
            }
          }
        });

        // Quy đổi điểm câu Phần II
        if (correctCount === 1) scoreP2 += 0.1;
        else if (correctCount === 2) scoreP2 += 0.25;
        else if (correctCount === 3) scoreP2 += 0.5;
        else if (correctCount === 4) scoreP2 += 1.0;
      });
    }

    // 3. Chấm Phần III (Trả lời ngắn: 0.5đ/câu)
    if (this.data.part3_short_answer) {
      this.data.part3_short_answer.forEach((q, idx) => {
        const userAns = (this.answers.part3[idx] || "").toLowerCase().replace(/\s+/g, '');
        const correctAns = String(q.answer || "").toLowerCase().replace(/\s+/g, '');
        const acceptables = (q.acceptable_answers || []).map(a => String(a).toLowerCase().replace(/\s+/g, ''));
        acceptables.push(correctAns);

        const exp = document.getElementById(`explanation-part3-${idx}`);
        if (exp) exp.classList.remove('hidden');

        const omrBox = document.getElementById(`omr-short-val-${idx}`);
        if (userAns && acceptables.includes(userAns)) {
          scoreP3 += 0.5;
          if (omrBox) omrBox.parentElement.classList.add('border-emerald-500', 'bg-emerald-950/40');
        } else {
          if (omrBox) omrBox.parentElement.classList.add('border-red-500', 'bg-red-950/40');
        }
      });
    }

    // 4. Chấm Phần IV (AI chấm tự luận)
    if (this.data.part4_essay && this.data.part4_essay.length > 0) {
      for (let idx = 0; idx < this.data.part4_essay.length; idx++) {
        const q = this.data.part4_essay[idx];
        const studentText = this.answers.part4[idx] || "";
        const feedbackBox = document.getElementById(`essay-feedback-${idx}`);
        const scoreBox = document.getElementById(`essay-score-${idx}`);
        const commentBox = document.getElementById(`essay-comment-${idx}`);
        const critBox = document.getElementById(`essay-criteria-${idx}`);

        if (feedbackBox) feedbackBox.classList.remove('hidden');

        if (studentText.trim().length > 5) {
          try {
            const aiRes = await fetch("/api/tools/grade-essay", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                question: q.question,
                student_answer: studentText,
                suggested_answer: q.suggested_answer,
                rubric: q.rubric,
                max_score: q.max_score || 2.0
              })
            });
            const gradeData = await aiRes.json();
            const earned = parseFloat(gradeData.score) || 0;
            scoreP4 += earned;

            if (scoreBox) scoreBox.innerText = `${earned} / ${q.max_score || 2.0}`;
            if (commentBox) commentBox.innerText = gradeData.feedback || "Đã hoàn thành.";
            if (critBox && gradeData.strengths) {
              critBox.innerHTML = `
                <div class="text-emerald-400">✓ Điểm đạt: ${gradeData.strengths.join('; ')}</div>
                ${gradeData.improvements ? `<div class="text-amber-400">⚡ Cần cải thiện: ${gradeData.improvements.join('; ')}</div>` : ''}
              `;
            }
          } catch (e) {
            if (commentBox) commentBox.innerText = "Lỗi khi AI chấm điểm tự luận: " + e.message;
          }
        } else {
          if (scoreBox) scoreBox.innerText = `0 / ${q.max_score || 2.0}`;
          if (commentBox) commentBox.innerText = "Học sinh không làm hoặc bài làm quá ngắn.";
        }
      }
    }

    // Tổng kết điểm quy đổi thang 10
    const rawTotal = scoreP1 + scoreP2 + scoreP3 + scoreP4;
    let maxPossible = 0;
    if (this.data.part1_mcq) maxPossible += this.data.part1_mcq.length * 0.25;
    if (this.data.part2_true_false) maxPossible += this.data.part2_true_false.length * 1.0;
    if (this.data.part3_short_answer) maxPossible += this.data.part3_short_answer.length * 0.5;
    if (this.data.part4_essay) {
      this.data.part4_essay.forEach(q => maxPossible += (q.max_score || 2.0));
    }

    const finalGrade10 = maxPossible > 0 ? ((rawTotal / maxPossible) * 10).toFixed(2) : 0;

    this.showResultModal(finalGrade10, rawTotal, maxPossible, scoreP1, scoreP2, scoreP3, scoreP4);

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.className = "px-4 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-semibold shadow cursor-default";
      submitBtn.innerText = `Đã Chấm: ${finalGrade10} / 10`;
    }
  },

  showResultModal(grade10, raw, max, p1, p2, p3, p4) {
    const modal = document.getElementById('examResultModal');
    if (!modal) return;

    document.getElementById('resFinalGrade').innerText = grade10;
    document.getElementById('resRawScore').innerText = `${raw.toFixed(2)} / ${max.toFixed(2)}`;
    document.getElementById('resPart1').innerText = p1.toFixed(2);
    document.getElementById('resPart2').innerText = p2.toFixed(2);
    document.getElementById('resPart3').innerText = p3.toFixed(2);
    document.getElementById('resPart4').innerText = p4.toFixed(2);

    // Xếp loại học lực
    const rankEl = document.getElementById('resRankText');
    const g = parseFloat(grade10);
    if (g >= 9.0) rankEl.innerText = "Xuất Sắc - Nắm vững 100% kiến thức trọng tâm!";
    else if (g >= 8.0) rankEl.innerText = "Giỏi - Khả năng vận dụng kiến thức rất tốt.";
    else if (g >= 6.5) rankEl.innerText = "Khá - Cần ôn kỹ lại các câu sai ở phần Đúng/Sai.";
    else if (g >= 5.0) rankEl.innerText = "Trung Bình - Cần luyện tập thêm các câu nhận biết & thông hiểu.";
    else rankEl.innerText = "Cần Cố Gắng - Hãy ôn lại bài giảng và tạo podcast nghe lại!";

    modal.classList.remove('hidden');
  },

  closeResultModal() {
    document.getElementById('examResultModal').classList.add('hidden');
  }

  async loadK12Exam() {
    try {
      const res = await fetch('/data/exam_k12_hoa_ch2.json');
      if (!res.ok) throw new Error('Không tải được đề kiểm tra K12');
      const exam = await res.json();
      
      // Map to QuizEngine schema
      const formatted = {
        title: exam.title,
        duration_minutes: exam.duration_minutes || 45,
        part1_mcq: exam.part1.map(q => ({
          question: q.question,
          options: q.options,
          correct_index: q.correct,
          explanation: q.explanation,
          user_answer: q.user_answer
        })),
        part2_true_false: exam.part2.map(q => ({
          question: q.question,
          sub_questions: q.items.map(it => ({
            id: it.id,
            statement: it.text,
            is_correct: it.correct,
            explanation: it.explanation,
            user_answer: it.user
          }))
        })),
        part3_short_answer: exam.part3.map(q => ({
          question: q.question,
          correct_answer: q.correct,
          acceptable_answers: [q.correct],
          explanation: q.explanation
        })),
        part4_essay: []
      };

      this.data = formatted;
      this.mode = 'exam';
      this.openArena();

      // Optionally auto-select user's previous answers for review
      setTimeout(() => {
        // Pre-fill user answers if available
        exam.part1.forEach((q, idx) => {
          if (q.user_answer !== undefined && q.user_answer !== null) {
            this.selectPart1Answer(idx, q.user_answer);
          }
        });
        exam.part2.forEach((q, idx) => {
          q.items.forEach(it => {
            if (it.user !== undefined && it.user !== null) {
              this.selectPart2Answer(idx, it.id, it.user);
            }
          });
        });
      }, 300);

    } catch (e) {
      console.error(e);
      alert('Không thể tải đề K12Online: ' + e.message);
    }
  },
};

// Expose to window
window.QuizEngine = QuizEngine;
window.generateQuiz = () => QuizEngine.startQuizGeneration();
