(function () {
  "use strict";

  const REPO_OWNER = "goodday-94";
  const REPO_NAME  = "vocab-cards";
  const REPO_BRANCH = "main";

  const sidebarEl   = document.getElementById("sidebar");
  const topicList   = document.getElementById("topic-list");
  const divider     = document.getElementById("divider");
  const content     = document.getElementById("content");
  const sortWordsBtn = document.getElementById("sort-words");
  const sortDateBtn  = document.getElementById("sort-date");
  const tokenBtn    = document.getElementById("token-btn");
  const modal       = document.getElementById("modal");
  const modalWord   = document.getElementById("modal-word");
  const modalIpa    = document.getElementById("modal-ipa");
  const modalChinese = document.getElementById("modal-chinese");
  const modalSave   = document.getElementById("modal-save");
  const modalCancel = document.getElementById("modal-cancel");

  let allTopics        = [];
  let currentTopicData = null;
  let activeTopicId    = null;
  let sortKey          = null;
  let sortDir          = "desc";
  let editMode         = false;
  let studyMode        = false;
  let editingIndex     = -1;
  let dragSrcIndex     = -1;

  // ---------- Token ----------
  function getToken() { return sessionStorage.getItem("gh_token"); }

  function updateTokenUI() {
    const has = !!getToken();
    tokenBtn.classList.toggle("active", has);
    tokenBtn.title = has ? "Token set — click to clear" : "Set GitHub token to enable editing";
  }

  tokenBtn.addEventListener("click", function () {
    if (getToken()) {
      if (confirm("Clear GitHub token?")) {
        sessionStorage.removeItem("gh_token");
        editMode = false;
        updateTokenUI();
        if (currentTopicData) renderCards();
      }
    } else {
      const t = prompt("Paste your GitHub Personal Access Token (needs repo write scope):");
      if (t && t.trim()) {
        sessionStorage.setItem("gh_token", t.trim());
        updateTokenUI();
        if (currentTopicData) renderCards();
      }
    }
  });

  // ---------- Speech (UK) ----------
  function speak(word, btn) {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(word);
    u.lang = "en-GB";
    u.rate = 0.85;
    if (btn) {
      btn.classList.add("playing");
      u.onend  = function () { btn.classList.remove("playing"); };
      u.onerror = function () { btn.classList.remove("playing"); };
    }
    window.speechSynthesis.speak(u);
  }

  const speakerSVG =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">' +
    '<path d="M11 5L6 9H2v6h4l5 4z" fill="currentColor"/>' +
    '<path d="M15.5 9a3.5 3.5 0 010 6"/>' +
    '<path d="M18 6a7 7 0 010 12"/></svg>';

  function escapeHTML(s) {
    return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
  }

  // ---------- Render cards ----------
  function renderCards() {
    if (!currentTopicData) return;
    const token = getToken();

    let html = '<div class="content-top">' +
      '<h2 class="topic-heading">' + escapeHTML(currentTopicData.title) + '</h2>' +
      '<div class="content-actions">';
    html += '<button id="study-toggle" class="edit-toggle' + (studyMode ? ' active' : '') + '">Study</button>';
    if (token) {
      if (editMode) {
        html += '<button id="save-btn" class="save-btn">Save to GitHub</button>';
        html += '<button id="edit-toggle" class="edit-toggle active">Done</button>';
      } else {
        html += '<button id="edit-toggle" class="edit-toggle">✎ Edit</button>';
      }
    }
    html += '</div></div>';

    const typeOrder = ["noun", "verb", "adj", "phrase"];
    const typeLabels = { noun: "Nouns", verb: "Verbs", adj: "Adjectives", phrase: "Phrases" };
    const groups = {};
    currentTopicData.words.forEach(function (w, i) {
      const t = w.type || "noun";
      if (!groups[t]) groups[t] = [];
      groups[t].push({ w: w, i: i });
    });

    typeOrder.forEach(function (type) {
      if (!groups[type] || !groups[type].length) return;
      html += '<div class="type-section">' +
        '<div class="type-label">' + typeLabels[type] + '</div>' +
        '<div class="vocab-grid">' +
        groups[type].map(function (entry) {
          const w = entry.w, i = entry.i;
          const wa = escapeHTML(w.word);
          const isPhrase = type === "phrase";
          const inStudy = studyMode && !editMode;
          return '<div class="vocab-card' + (editMode ? " editable" : "") + (isPhrase ? " phrase-card" : "") + (inStudy ? " study-mode" : "") +
            '" data-index="' + i + '"' + (editMode ? ' draggable="true"' : "") + '>' +
            (editMode
              ? '<div class="card-toolbar">' +
                '<button class="card-btn edit-btn" data-index="' + i + '">✎</button>' +
                '<button class="card-btn delete-btn" data-index="' + i + '">×</button>' +
                '</div>'
              : '') +
            (!isPhrase && w.svg ? '<div class="illus" data-word="' + wa + '">' + w.svg + '</div>' : '') +
            '<div class="word-row"><div class="word">' + escapeHTML(w.word) + '</div>' +
            (!isPhrase ? '<button class="spk" data-word="' + wa + '" aria-label="Pronounce ' + wa + '">' + speakerSVG + '</button>' : '') +
            '</div>' +
            (!isPhrase && w.ipa ? '<div class="ipa">' + escapeHTML(w.ipa) + '</div>' : '') +
            '<div class="chinese">' + escapeHTML(w.chinese) + '</div>' +
            '</div>';
        }).join('') +
        '</div></div>';
    });

    content.innerHTML = html;

    // Speak
    content.querySelectorAll(".spk").forEach(function (b) {
      b.addEventListener("click", function (e) { e.stopPropagation(); speak(b.dataset.word, b); });
    });
    content.querySelectorAll(".illus").forEach(function (s) {
      s.addEventListener("click", function () { speak(s.dataset.word, s.parentElement.querySelector(".spk")); });
    });

    // Study toggle
    const studyToggle = document.getElementById("study-toggle");
    if (studyToggle) {
      studyToggle.addEventListener("click", function () { studyMode = !studyMode; renderCards(); });
    }

    // Edit toggle
    const editToggle = document.getElementById("edit-toggle");
    if (editToggle) {
      editToggle.addEventListener("click", function () { editMode = !editMode; renderCards(); });
    }

    // Save button
    const saveBtn = document.getElementById("save-btn");
    if (saveBtn) saveBtn.addEventListener("click", saveToGitHub);

    // Card reveal in study mode
    if (studyMode && !editMode) {
      content.querySelectorAll(".vocab-card.study-mode").forEach(function (card) {
        card.addEventListener("click", function (e) {
          if (e.target.closest(".spk")) return;
          card.classList.toggle("revealed");
        });
      });
    }

    // Edit / delete buttons
    content.querySelectorAll(".edit-btn").forEach(function (b) {
      b.addEventListener("click", function (e) { e.stopPropagation(); openModal(parseInt(b.dataset.index)); });
    });
    content.querySelectorAll(".delete-btn").forEach(function (b) {
      b.addEventListener("click", function (e) {
        e.stopPropagation();
        const i = parseInt(b.dataset.index);
        if (confirm('Delete "' + currentTopicData.words[i].word + '"?')) {
          currentTopicData.words.splice(i, 1);
          renderCards();
        }
      });
    });

    // Drag to reorder
    if (editMode) {
      content.addEventListener("dragstart", function (e) {
        const card = e.target.closest(".vocab-card");
        if (!card) return;
        dragSrcIndex = parseInt(card.dataset.index);
        e.dataTransfer.effectAllowed = "move";
        setTimeout(function () { card.classList.add("dragging"); }, 0);
      });
      content.addEventListener("dragover", function (e) {
        e.preventDefault();
        const card = e.target.closest(".vocab-card");
        content.querySelectorAll(".vocab-card").forEach(function (c) { c.classList.remove("drag-over"); });
        if (card) card.classList.add("drag-over");
      });
      content.addEventListener("drop", function (e) {
        e.preventDefault();
        const card = e.target.closest(".vocab-card");
        if (!card) return;
        const dropIndex = parseInt(card.dataset.index);
        if (dragSrcIndex === dropIndex) return;
        const moved = currentTopicData.words.splice(dragSrcIndex, 1)[0];
        currentTopicData.words.splice(dropIndex, 0, moved);
        renderCards();
      });
      content.addEventListener("dragend", function () {
        content.querySelectorAll(".vocab-card").forEach(function (c) { c.classList.remove("dragging", "drag-over"); });
      });
    }
  }

  // ---------- Modal ----------
  function openModal(index) {
    editingIndex = index;
    const w = currentTopicData.words[index];
    modalWord.value = w.word;
    modalIpa.value  = w.ipa;
    modalChinese.value = w.chinese;
    modal.hidden = false;
    modalWord.focus();
  }

  modalSave.addEventListener("click", function () {
    if (editingIndex < 0) return;
    currentTopicData.words[editingIndex].word    = modalWord.value.trim();
    currentTopicData.words[editingIndex].ipa     = modalIpa.value.trim();
    currentTopicData.words[editingIndex].chinese = modalChinese.value.trim();
    modal.hidden = true;
    renderCards();
  });
  modalCancel.addEventListener("click", function () { modal.hidden = true; });
  modal.addEventListener("click", function (e) { if (e.target === modal) modal.hidden = true; });

  // Enter key in modal submits
  [modalWord, modalIpa, modalChinese].forEach(function (inp) {
    inp.addEventListener("keydown", function (e) { if (e.key === "Enter") modalSave.click(); });
  });

  // ---------- GitHub API save ----------
  function toBase64Unicode(str) {
    return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, function (m, p1) {
      return String.fromCharCode(parseInt(p1, 16));
    }));
  }

  async function saveToGitHub() {
    const token = getToken();
    if (!token) return;

    const saveBtn = document.getElementById("save-btn");
    if (saveBtn) { saveBtn.textContent = "Saving…"; saveBtn.disabled = true; }

    const path   = "data/" + activeTopicId + ".json";
    const apiUrl = "https://api.github.com/repos/" + REPO_OWNER + "/" + REPO_NAME + "/contents/" + path;
    const headers = { "Authorization": "Bearer " + token, "Accept": "application/vnd.github+json" };

    try {
      const getRes = await fetch(apiUrl + "?ref=" + REPO_BRANCH, { headers: headers });
      if (!getRes.ok) throw new Error("Could not read file (HTTP " + getRes.status + ")");
      const fileData = await getRes.json();

      const putRes = await fetch(apiUrl, {
        method: "PUT",
        headers: Object.assign({ "Content-Type": "application/json" }, headers),
        body: JSON.stringify({
          message: "Update " + activeTopicId + " words",
          content: toBase64Unicode(JSON.stringify(currentTopicData, null, 2)),
          sha: fileData.sha,
          branch: REPO_BRANCH
        })
      });

      if (!putRes.ok) {
        const err = await putRes.json();
        throw new Error(err.message || "Save failed (HTTP " + putRes.status + ")");
      }

      if (saveBtn) { saveBtn.textContent = "Saved ✓"; }
      setTimeout(function () { if (document.getElementById("save-btn")) renderCards(); }, 2000);
    } catch (e) {
      alert("Save failed: " + e.message);
      if (saveBtn) { saveBtn.textContent = "Save to GitHub"; saveBtn.disabled = false; }
      console.error(e);
    }
  }

  // ---------- Sidebar ----------
  function getSortedTopics() {
    if (!sortKey) return allTopics.slice();
    return allTopics.slice().sort(function (a, b) {
      const av = a[sortKey] != null ? a[sortKey] : "";
      const bv = b[sortKey] != null ? b[sortKey] : "";
      if (av < bv) return sortDir === "desc" ? 1 : -1;
      if (av > bv) return sortDir === "desc" ? -1 : 1;
      return 0;
    });
  }

  function renderSidebar() {
    topicList.innerHTML = getSortedTopics().map(function (t) {
      return '<div class="topic-row' + (t.id === activeTopicId ? " active" : "") +
        '" data-topic="' + escapeHTML(t.id) + '">' +
        '<span class="topic-icon">' + (t.icon || "📚") + "</span>" +
        '<span class="topic-name">' + escapeHTML(t.title) + "</span>" +
        '<span class="topic-count">' + (t.count || 0) + "</span>" +
        '<span class="topic-date">' + escapeHTML(t.updatedAt || "") + "</span>" +
        "</div>";
    }).join("");
    topicList.querySelectorAll(".topic-row").forEach(function (row) {
      row.addEventListener("click", function () { loadTopic(row.dataset.topic); });
    });
  }

  // ---------- Sort ----------
  function setSort(key) {
    sortDir = sortKey === key ? (sortDir === "desc" ? "asc" : "desc") : "desc";
    sortKey = key;
    sortWordsBtn.classList.toggle("active", sortKey === "count");
    sortDateBtn.classList.toggle("active", sortKey === "updatedAt");
    sortWordsBtn.textContent = "Words " + (sortKey === "count" ? (sortDir === "desc" ? "↓" : "↑") : "↕");
    sortDateBtn.textContent  = "Date "  + (sortKey === "updatedAt" ? (sortDir === "desc" ? "↓" : "↑") : "↕");
    renderSidebar();
  }
  sortWordsBtn.addEventListener("click", function () { setSort("count"); });
  sortDateBtn.addEventListener("click",  function () { setSort("updatedAt"); });

  // ---------- Load topic ----------
  async function loadTopic(topicId) {
    activeTopicId = topicId;
    editMode = false;
    renderSidebar();
    location.hash = topicId;
    content.scrollTop = 0;
    try {
      const res = await fetch("data/" + topicId + ".json", { cache: "no-cache" });
      if (!res.ok) throw new Error("HTTP " + res.status);
      currentTopicData = await res.json();
      renderCards();
    } catch (e) {
      content.innerHTML = '<div class="error">Couldn\'t load this topic.</div>';
      console.error(e);
    }
  }

  // ---------- Init ----------
  async function init() {
    updateTokenUI();
    try {
      const res = await fetch("data/topics.json", { cache: "no-cache" });
      if (!res.ok) throw new Error("HTTP " + res.status);
      const data = await res.json();
      allTopics = data.topics;
      renderSidebar();
      const hash = location.hash.replace(/^#/, "");
      const initial = allTopics.find(function (t) { return t.id === hash; });
      loadTopic(initial ? hash : allTopics[0].id);
    } catch (e) {
      content.innerHTML = '<div class="error">Couldn\'t load topics. Serve through a local server ' +
        '(e.g. <code>python -m http.server 8080</code>).</div>';
      console.error(e);
    }
  }

  window.addEventListener("hashchange", function () {
    const hash = location.hash.replace(/^#/, "");
    if (hash && hash !== activeTopicId) loadTopic(hash);
  });

  // ---------- Sidebar drag resize ----------
  let isResizing = false;
  divider.addEventListener("mousedown", function (e) { isResizing = true; divider.classList.add("dragging"); e.preventDefault(); });
  document.addEventListener("mousemove", function (e) {
    if (!isResizing) return;
    sidebarEl.style.width = Math.min(480, Math.max(160, e.clientX)) + "px";
  });
  document.addEventListener("mouseup", function () {
    if (isResizing) { isResizing = false; divider.classList.remove("dragging"); }
  });

  init();
})();
