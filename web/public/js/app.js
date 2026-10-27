/**
 * idk-lop10 AI Notebook - Main Application Logic
 * Core State, Sources Explorer, Chat Engine, KaTeX & Modal Handlers
 */

// Global State
window.AppState = {
  allSubjects: [],
  allDocuments: [],
  currentSubjectFilter: 'all',
  selectedSourceIds: new Set(),
  isSocraticMode: false,
  chatHistory: []
};

document.addEventListener("DOMContentLoaded", () => {
  fetchSubjects();
  if (typeof fetchPodcastsList === "function") {
    fetchPodcastsList();
  }
});

// ==========================================
// 1. SOURCES MANAGEMENT (NotebookLM Style)
// ==========================================
async function fetchSubjects() {
  try {
    const res = await fetch("/api/subjects");
    const data = await res.json();
    AppState.allSubjects = data.subjects || [];
    AppState.allDocuments = data.documents || [];
    renderSubjectTabs();
    renderDocumentList();
    updateSourcesBadge();
  } catch (err) {
    console.error("Lỗi nạp danh sách tài liệu:", err);
  }
}

function renderSubjectTabs() {
  const tabs = document.getElementById("subjectTabs");
  if (!tabs) return;

  const isAll = AppState.currentSubjectFilter === 'all';
  tabs.innerHTML = `
    <button onclick="selectSubject('all')" class="subject-tab ${isAll ? 'active bg-slate-800 text-slate-100 border-slate-700' : 'text-slate-400 border-transparent hover:text-slate-200'} whitespace-nowrap px-2.5 py-1 rounded-md border text-[11px] font-medium transition-all">Tất cả</button>
  `;

  AppState.allSubjects.forEach(s => {
    if (s.count === 0) return;
    const btn = document.createElement("button");
    const isActive = AppState.currentSubjectFilter === s.id;
    btn.onclick = () => selectSubject(s.id);
    btn.className = `subject-tab ${isActive ? 'active bg-slate-800 text-slate-100 border-slate-700' : 'text-slate-400 border-transparent hover:text-slate-200'} whitespace-nowrap px-2.5 py-1 rounded-md border text-[11px] font-medium transition-all`;
    btn.innerText = `${s.name} (${s.count})`;
    tabs.appendChild(btn);
  });
}

function selectSubject(subId) {
  AppState.currentSubjectFilter = subId;
  renderSubjectTabs();
  renderDocumentList();
}

function filterSources() {
  renderDocumentList();
}

function renderDocumentList() {
  const container = document.getElementById("documentList");
  if (!container) return;

  const searchInput = document.getElementById("sourceSearch");
  const search = searchInput ? searchInput.value.toLowerCase().trim() : "";

  const filtered = AppState.allDocuments.filter(doc => {
    const matchSub = AppState.currentSubjectFilter === 'all' || doc.subject_id === AppState.currentSubjectFilter;
    const matchSearch = !search || doc.title.toLowerCase().includes(search) || doc.path.toLowerCase().includes(search);
    return matchSub && matchSearch;
  });

  if (filtered.length === 0) {
    container.innerHTML = `<div class="text-center py-8 text-xs text-slate-500">Không tìm thấy tài liệu phù hợp.</div>`;
    return;
  }

  container.innerHTML = "";
  filtered.forEach(doc => {
    const isChecked = AppState.selectedSourceIds.has(doc.id);
    const item = document.createElement("div");
    item.className = `group p-2 rounded-lg border transition-all flex items-start gap-2.5 ${isChecked ? 'bg-slate-800/50 border-slate-700' : 'bg-cardbg/40 border-borderbase hover:border-slate-700'}`;

    const subName = doc.subject_id.replace('idk-', '').toUpperCase();

    item.innerHTML = `
      <input type="checkbox" ${isChecked ? 'checked' : ''} onchange="toggleSourceSelect('${doc.id}')" class="mt-0.5">
      <div class="flex-1 min-w-0 cursor-pointer" onclick="toggleSourceSelect('${doc.id}')">
        <div class="flex items-center gap-1.5 mb-0.5">
          <span class="text-[9px] uppercase font-semibold px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 border border-slate-700/60 font-mono">${subName}</span>
          <span class="text-[9px] text-slate-500 uppercase font-mono">${doc.file_type}</span>
        </div>
        <h4 class="text-xs font-medium text-slate-200 group-hover:text-white truncate" title="${doc.title}">${doc.title}</h4>
        <p class="text-[10px] text-slate-500 truncate font-mono">${doc.path}</p>
      </div>
      <button onclick="previewDocument('${doc.path}', '${doc.title.replace(/'/g, "\\'")}')" title="Xem trước tài liệu" class="p-1 text-slate-500 hover:text-slate-200 opacity-60 group-hover:opacity-100 transition-opacity">
        <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
          <circle cx="12" cy="12" r="3"></circle>
        </svg>
      </button>
    `;
    container.appendChild(item);
  });
}

function toggleSourceSelect(docId) {
  if (AppState.selectedSourceIds.has(docId)) {
    AppState.selectedSourceIds.delete(docId);
  } else {
    AppState.selectedSourceIds.add(docId);
  }
  renderDocumentList();
  updateSourcesBadge();
}

function selectAllSources(enable) {
  if (enable) {
    AppState.allDocuments.forEach(d => AppState.selectedSourceIds.add(d.id));
  } else {
    AppState.selectedSourceIds.clear();
  }
  renderDocumentList();
  updateSourcesBadge();
}

function updateSourcesBadge() {
  const count = AppState.selectedSourceIds.size;
  const badge = document.getElementById("sourcesCountBadge");
  const text = document.getElementById("sourcesCountText");
  const pillsContainer = document.getElementById("activeSourcesPills");

  if (text) text.innerText = `${count} nguồn đã chọn`;
  if (badge) {
    if (count > 0) {
      badge.classList.remove("hidden");
    } else {
      badge.classList.add("hidden");
    }
  }

  if (pillsContainer) {
    pillsContainer.innerHTML = "";
    Array.from(AppState.selectedSourceIds).slice(0, 5).forEach(id => {
      const doc = AppState.allDocuments.find(d => d.id === id);
      if (!doc) return;
      const pill = document.createElement("span");
      pill.className = "inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] bg-slate-800 border border-slate-700 text-slate-300";
      pill.innerHTML = `
        <span class="truncate max-w-[120px]">${doc.title}</span>
        <button onclick="toggleSourceSelect('${doc.id}')" class="text-slate-400 hover:text-red-400">×</button>
      `;
      pillsContainer.appendChild(pill);
    });
    if (count > 5) {
      const extra = document.createElement("span");
      extra.className = "text-[10px] text-slate-500 self-center";
      extra.innerText = `+${count - 5} nữa`;
      pillsContainer.appendChild(extra);
    }
  }
}

// ==========================================
// 2. DOCUMENT PREVIEW MODAL
// ==========================================
async function previewDocument(path, title) {
  const modal = document.getElementById("previewModal");
  const modalTitle = document.getElementById("modalTitle");
  const modalContent = document.getElementById("modalContent");

  modalTitle.innerText = title;
  modalContent.innerHTML = `<div class="text-center py-10 text-slate-500">Đang đọc dữ liệu...</div>`;
  modal.classList.remove("hidden");

  try {
    const res = await fetch(`/api/document/content?path=${encodeURIComponent(path)}`);
    const data = await res.json();
    if (data.content) {
      modalContent.innerHTML = `<div class="prose prose-invert prose-sm max-w-none">${marked.parse(data.content)}</div>`;
      renderMathInElement(modalContent, {
        delimiters: [
          {left: '$$', right: '$$', display: true},
          {left: '$', right: '$', display: false}
        ],
        throwOnError: false
      });
    } else {
      modalContent.innerHTML = `<div class="text-slate-400 italic">Tài liệu không có nội dung văn bản.</div>`;
    }
  } catch (err) {
    modalContent.innerHTML = `<div class="text-red-400">Lỗi nạp tệp: ${err.message}</div>`;
  }
}

function closePreviewModal() {
  const modal = document.getElementById("previewModal");
  if (modal) modal.classList.add("hidden");
}

// ==========================================
// 3. SOCRATIC MODE TOGGLE
// ==========================================
function toggleSocratic() {
  AppState.isSocraticMode = !AppState.isSocraticMode;
  const thumb = document.getElementById("socraticThumb");
  const btn = document.getElementById("socraticBtn");
  const indicator = document.getElementById("tutorModeIndicator");

  if (AppState.isSocraticMode) {
    thumb.classList.remove("translate-x-0", "bg-slate-400");
    thumb.classList.add("translate-x-4", "bg-white");
    btn.classList.remove("bg-slate-800");
    btn.classList.add("bg-blue-600");
    indicator.innerHTML = `<span class="w-1.5 h-1.5 rounded-full bg-blue-400"></span> Chế độ: <strong class="text-blue-400 font-medium">Gia sư Socratic (Gợi mở tư duy)</strong>`;
  } else {
    thumb.classList.remove("translate-x-4", "bg-white");
    thumb.classList.add("translate-x-0", "bg-slate-400");
    btn.classList.remove("bg-blue-600");
    btn.classList.add("bg-slate-800");
    indicator.innerHTML = `<span class="w-1.5 h-1.5 rounded-full bg-slate-500"></span> Chế độ: <strong class="text-slate-300 font-medium">Trợ lý học tập chuyên sâu</strong>`;
  }
}

// ==========================================
// 4. CHAT ENGINE (SSE Streaming & Citations)
// ==========================================
function usePrompt(text) {
  const input = document.getElementById("chatInput");
  if (input) {
    input.value = text;
    sendMessage();
  }
}

function handleInputKey(e) {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
}

function clearChat() {
  AppState.chatHistory = [];
  const messagesContainer = document.getElementById("chatMessages");
  const welcome = document.getElementById("welcomeBanner");
  if (welcome) welcome.style.display = "block";
  if (messagesContainer) {
    messagesContainer.innerHTML = welcome ? welcome.outerHTML : "";
  }
}

async function sendMessage() {
  const input = document.getElementById("chatInput");
  const text = input ? input.value.trim() : "";
  if (!text) return;

  const welcome = document.getElementById("welcomeBanner");
  if (welcome) welcome.style.display = "none";

  input.value = "";
  appendMessage("user", text);
  AppState.chatHistory.push({ role: "user", content: text });

  const aiMsgEl = appendMessage("assistant", "");
  const contentEl = aiMsgEl.querySelector(".message-body");

  try {
    const payload = {
      messages: AppState.chatHistory,
      selected_sources: Array.from(AppState.selectedSourceIds),
      tutor_mode: AppState.isSocraticMode
    };

    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      contentEl.innerText = `Lỗi phản hồi (${res.status}): ${await res.text()}`;
      return;
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder("utf-8");
    let accumulated = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split("\n");

      for (const line of lines) {
        if (line.startsWith("data: ")) {
          const dataStr = line.slice(6).trim();
          if (dataStr === "[DONE]") break;
          try {
            const parsed = JSON.parse(dataStr);
            if (parsed.text) {
              accumulated += parsed.text;
              contentEl.innerHTML = marked.parse(accumulated);
            } else if (parsed.error) {
              accumulated += `\n\n[Lỗi: ${parsed.error}]`;
              contentEl.innerHTML = marked.parse(accumulated);
            }
          } catch (e) {}
        }
      }
    }

    AppState.chatHistory.push({ role: "assistant", content: accumulated });

    renderMathInElement(contentEl, {
      delimiters: [
        {left: '$$', right: '$$', display: true},
        {left: '$', right: '$', display: false}
      ],
      throwOnError: false
    });

    convertCitationPills(contentEl);

  } catch (err) {
    contentEl.innerText = `Đã xảy ra sự cố kết nối: ${err.message}`;
  }
}

function appendMessage(role, content) {
  const container = document.getElementById("chatMessages");
  const wrap = document.createElement("div");
  wrap.className = `flex ${role === 'user' ? 'justify-end' : 'justify-start'}`;

  if (role === 'user') {
    wrap.innerHTML = `
      <div class="max-w-xl bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-slate-100 text-xs shadow">
        <p class="whitespace-pre-wrap leading-relaxed">${content}</p>
      </div>
    `;
  } else {
    wrap.innerHTML = `
      <div class="max-w-3xl bg-cardbg border border-borderbase rounded-xl px-4 py-3.5 text-slate-200 text-xs shadow space-y-2">
        <div class="flex items-center gap-2 mb-1">
          <div class="w-5 h-5 rounded bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <svg class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 2a8 8 0 0 0-8 8c0 3.3 2 6.1 5 7.4V20a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2v-2.6c3-1.3 5-4.1 5-7.4a8 8 0 0 0-8-8z"></path>
            </svg>
          </div>
          <span class="text-xs font-semibold text-slate-200">idk-lop10 Assistant</span>
          <span class="text-[10px] text-slate-500">${AppState.isSocraticMode ? '• Socratic Mode' : '• Nguồn xác thực'}</span>
        </div>
        <div class="message-body prose prose-invert prose-sm max-w-none leading-relaxed text-slate-300">${content ? marked.parse(content) : '<span class="text-slate-500 animate-pulse">Đang tra cứu tài liệu và tư duy...</span>'}</div>
      </div>
    `;
  }

  container.appendChild(wrap);
  container.scrollTop = container.scrollHeight;
  return wrap;
}

function convertCitationPills(el) {
  el.innerHTML = el.innerHTML.replace(/\[(?:Doc\s*)?(\d+)(?::\s*([^\]]+))?\]/g, (match, num, name) => {
    return `<button class="inline-flex items-center gap-1 px-1.5 py-0.2 mx-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 text-[10px] font-mono hover:bg-slate-700 hover:text-white transition-colors" title="Trích dẫn [${num}]: ${name || ''}">[${num}]</button>`;
  });
}

// ==========================================
// 5. STUDIO TAB SWITCHER
// ==========================================
function switchStudioTab(tabId) {
  ['podcast', 'quiz'].forEach(id => {
    const btn = document.getElementById(`tabBtn-${id}`);
    const content = document.getElementById(`tab-${id}`);
    if (!btn || !content) return;

    if (id === tabId) {
      btn.className = "studio-tab active flex-1 py-2 px-3 text-center rounded-lg bg-slate-800 text-slate-100 border border-slate-700 transition-all flex items-center justify-center gap-2";
      content.classList.remove("hidden");
    } else {
      btn.className = "studio-tab flex-1 py-2 px-3 text-center rounded-lg text-slate-400 hover:text-slate-200 border border-transparent transition-all flex items-center justify-center gap-2";
      content.classList.add("hidden");
    }
  });
}
