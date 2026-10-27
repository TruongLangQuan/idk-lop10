/**
 * idk-lop10 AI Notebook - Podcast Studio Module
 * Audio Overview Generator, Player & History
 */

async function generatePodcast() {
  if (AppState.selectedSourceIds.size === 0) {
    alert("Vui lòng tích chọn ít nhất 1 bài học/tài liệu ở cột bên trái để tạo Podcast.");
    return;
  }

  const btn = document.getElementById("generatePodcastBtn");
  const wave = document.getElementById("soundwaveContainer");
  if (!btn) return;

  btn.disabled = true;
  btn.innerHTML = `
    <svg class="animate-spin w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor"></circle>
      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
    </svg>
    <span>Đang khởi tạo...</span>
  `;
  if (wave) wave.classList.remove("hidden");

  try {
    const res = await fetch("/api/podcast/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ selected_sources: Array.from(AppState.selectedSourceIds) })
    });

    if (!res.ok) {
      const err = await res.json();
      alert(`Lỗi tạo Podcast: ${err.detail || 'Không xác định'}`);
      return;
    }

    const data = await res.json();
    loadPodcastToPlayer(data);
    fetchPodcastsList();
  } catch (err) {
    alert("Đã xảy ra lỗi kết nối: " + err.message);
  } finally {
    btn.disabled = false;
    btn.innerHTML = `
      <svg class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
        <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
        <line x1="12" y1="19" x2="12" y2="23"></line>
        <line x1="8" y1="23" x2="16" y2="23"></line>
      </svg>
      <span>Tạo Podcast</span>
    `;
    if (wave) wave.classList.add("hidden");
  }
}

function loadPodcastToPlayer(data) {
  const titleEl = document.getElementById("playerTitle");
  const subEl = document.getElementById("playerSubtitle");
  const player = document.getElementById("mainAudioPlayer");
  const transcriptContainer = document.getElementById("podcastTranscript");

  if (titleEl) titleEl.innerText = data.title;
  if (subEl) subEl.innerText = `Audio Overview (${data.script ? data.script.length : 0} lượt đối đáp)`;
  
  if (player) {
    player.src = data.audio_url;
    player.play().catch(() => {});
  }

  if (transcriptContainer) {
    transcriptContainer.innerHTML = "";
    if (data.script && data.script.length > 0) {
      data.script.forEach(turn => {
        const div = document.createElement("div");
        const isHoaiMy = turn.speaker === "HoaiMy";
        div.className = `p-2.5 rounded-lg border ${isHoaiMy ? 'bg-slate-800/40 border-slate-700 text-slate-200' : 'bg-cardbg border-borderbase text-slate-200'}`;
        div.innerHTML = `
          <div class="text-[10px] font-semibold tracking-wide uppercase mb-0.5 ${isHoaiMy ? 'text-blue-400' : 'text-slate-400'}">${isHoaiMy ? 'Hoài My' : 'Nam Minh'}</div>
          <div class="text-xs leading-relaxed">${turn.text}</div>
        `;
        transcriptContainer.appendChild(div);
      });
    }
  }
}

async function fetchPodcastsList() {
  try {
    const res = await fetch("/api/podcasts");
    const data = await res.json();
    const list = document.getElementById("podcastHistoryList");
    if (!list) return;

    if (!data.podcasts || data.podcasts.length === 0) {
      list.innerHTML = `<div class="text-[11px] text-slate-500">Chưa có tập podcast nào trong bộ nhớ đệm.</div>`;
      return;
    }

    list.innerHTML = "";
    data.podcasts.forEach(p => {
      const item = document.createElement("div");
      item.className = "p-2 rounded-lg bg-cardbg border border-borderbase hover:border-slate-700 cursor-pointer transition-all flex items-center justify-between";
      item.onclick = () => loadPodcastToPlayer(p);
      item.innerHTML = `
        <div class="min-w-0 flex-1 pr-2">
          <h5 class="text-xs font-medium text-slate-200 truncate">${p.title}</h5>
          <p class="text-[10px] text-slate-500 font-mono">Tập #${p.id}</p>
        </div>
        <span class="text-xs text-blue-400">
          <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="5 3 19 12 5 21 5 3"></polygon>
          </svg>
        </span>
      `;
      list.appendChild(item);
    });
  } catch (e) {
    console.error("Lỗi lấy danh sách podcast:", e);
  }
}
