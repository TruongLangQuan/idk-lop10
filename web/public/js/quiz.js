/**
 * idk-lop10 AI Notebook - Practice Quiz Module
 * Socratic & Standard Quiz Engine with Instant Feedback
 */

let currentQuizQuestions = [];
let currentQuizScore = 0;

async function generateQuiz() {
  if (AppState.selectedSourceIds.size === 0) {
    alert("Vui lòng tích chọn tài liệu ở cột bên trái để tạo câu hỏi trắc nghiệm.");
    return;
  }
  const btn = document.getElementById("generateQuizBtn");
  if (btn) {
    btn.disabled = true;
    btn.innerText = "Đang soạn đề...";
  }

  try {
    const res = await fetch("/api/tools/quiz", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ selected_sources: Array.from(AppState.selectedSourceIds) })
    });
    const data = await res.json();
    currentQuizQuestions = data.questions || [];
    currentQuizScore = 0;
    renderQuiz();
  } catch (err) {
    alert("Lỗi tạo đề trắc nghiệm: " + err.message);
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerText = "Tạo đề mới";
    }
  }
}

function renderQuiz() {
  const container = document.getElementById("quizQuestionsContainer");
  const scoreCard = document.getElementById("quizScoreCard");
  const scoreText = document.getElementById("quizScoreText");

  if (scoreCard) scoreCard.classList.remove("hidden");
  if (scoreText) scoreText.innerText = `0 / ${currentQuizQuestions.length}`;

  if (!container) return;
  container.innerHTML = "";

  currentQuizQuestions.forEach((q, qIdx) => {
    const card = document.createElement("div");
    card.className = "p-3.5 rounded-xl bg-cardbg border border-borderbase space-y-2.5";
    card.innerHTML = `
      <div class="text-xs font-semibold text-white leading-snug">
        <span class="text-blue-400">Câu ${qIdx + 1}:</span> ${q.question}
      </div>
      <div class="space-y-1.5" id="options-q-${qIdx}">
        ${q.options.map((opt, optIdx) => `
          <button onclick="checkAnswer(${qIdx}, ${optIdx})" class="w-full text-left p-2.5 rounded-lg border border-borderbase bg-panelbg hover:border-slate-600 text-xs text-slate-200 transition-all option-btn">
            ${opt}
          </button>
        `).join('')}
      </div>
      <div id="explanation-q-${qIdx}" class="hidden p-3 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-300 space-y-1">
        <strong class="text-blue-400 block font-medium">Giải thích chi tiết:</strong>
        <p class="leading-relaxed">${q.explanation}</p>
      </div>
    `;
    container.appendChild(card);
  });
}

function checkAnswer(qIdx, optIdx) {
  const q = currentQuizQuestions[qIdx];
  const optContainer = document.getElementById(`options-q-${qIdx}`);
  const explanation = document.getElementById(`explanation-q-${qIdx}`);
  if (!optContainer || !q) return;

  const buttons = optContainer.querySelectorAll("button");

  buttons.forEach((btn, idx) => {
    btn.disabled = true;
    if (idx === q.answer) {
      btn.classList.add("bg-blue-950/70", "border-blue-500", "text-blue-200");
    } else if (idx === optIdx && idx !== q.answer) {
      btn.classList.add("bg-red-950/70", "border-red-500", "text-red-200");
    }
  });

  if (optIdx === q.answer) {
    currentQuizScore++;
    const scoreText = document.getElementById("quizScoreText");
    if (scoreText) scoreText.innerText = `${currentQuizScore} / ${currentQuizQuestions.length}`;
  }

  if (explanation) explanation.classList.remove("hidden");
}
