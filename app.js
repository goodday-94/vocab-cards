(function () {
  "use strict";

  const content = document.getElementById("content");
  const titleEl = document.getElementById("title");
  const subtitleEl = document.getElementById("subtitle");
  const backBtn = document.getElementById("back-btn");

  // ---------- Speech ----------
  function speak(word, btn) {
    if (!window.speechSynthesis) {
      alert("Sorry, your browser does not support speech synthesis.");
      return;
    }
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(word);
    u.lang = "en-US";
    u.rate = 0.85;
    if (btn) {
      btn.classList.add("playing");
      u.onend = () => btn.classList.remove("playing");
      u.onerror = () => btn.classList.remove("playing");
    }
    window.speechSynthesis.speak(u);
  }

  const speakerSVG =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">' +
    '<path d="M11 5L6 9H2v6h4l5 4z" fill="currentColor"/>' +
    '<path d="M15.5 9a3.5 3.5 0 010 6"/>' +
    '<path d="M18 6a7 7 0 010 12"/>' +
    "</svg>";

  // ---------- Helpers ----------
  function escapeHTML(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function showError(msg) {
    content.innerHTML = '<div class="error">' + msg + "</div>";
  }

  // ---------- Views ----------
  async function showTopics() {
    titleEl.textContent = "Vocabulary";
    subtitleEl.textContent = "Pick a topic to learn";
    backBtn.hidden = true;
    location.hash = "";

    try {
      const res = await fetch("data/topics.json", { cache: "no-cache" });
      if (!res.ok) throw new Error("HTTP " + res.status);
      const data = await res.json();

      const cards = data.topics
        .map(
          (t) =>
            '<div class="topic-card" data-topic="' +
            escapeHTML(t.id) +
            '">' +
            '<div class="icon">' +
            (t.icon || "📚") +
            "</div>" +
            '<div class="name">' +
            escapeHTML(t.title) +
            "</div>" +
            '<div class="count">' +
            (t.count || 0) +
            " words</div>" +
            "</div>"
        )
        .join("");

      content.innerHTML = '<div class="topic-grid">' + cards + "</div>";

      content.querySelectorAll(".topic-card").forEach((c) => {
        c.addEventListener("click", () => showTopic(c.dataset.topic));
      });
    } catch (e) {
      showError(
        "Couldn't load topics. If you opened this file directly, please serve it through a local server " +
          '(e.g. <code>python -m http.server</code> in the project folder, then open <code>http://localhost:8000</code>).'
      );
      console.error(e);
    }
  }

  async function showTopic(topicId) {
    backBtn.hidden = false;
    location.hash = topicId;

    try {
      const res = await fetch("data/" + topicId + ".json", {
        cache: "no-cache",
      });
      if (!res.ok) throw new Error("HTTP " + res.status);
      const data = await res.json();

      titleEl.textContent = data.title;
      subtitleEl.textContent = data.words.length + " words";

      const cards = data.words
        .map((w) => {
          const wordAttr = escapeHTML(w.word);
          return (
            '<div class="vocab-card">' +
            '<div class="illus" data-word="' +
            wordAttr +
            '">' +
            w.svg +
            "</div>" +
            '<div class="word-row">' +
            '<div class="word">' +
            escapeHTML(w.word) +
            "</div>" +
            '<button class="spk" data-word="' +
            wordAttr +
            '" aria-label="Pronounce ' +
            wordAttr +
            '">' +
            speakerSVG +
            "</button>" +
            "</div>" +
            '<div class="ipa">' +
            escapeHTML(w.ipa) +
            "</div>" +
            '<div class="chinese">' +
            escapeHTML(w.chinese) +
            "</div>" +
            "</div>"
          );
        })
        .join("");

      content.innerHTML = '<div class="vocab-grid">' + cards + "</div>";

      content.querySelectorAll(".spk").forEach((b) => {
        b.addEventListener("click", (e) => {
          e.stopPropagation();
          speak(b.dataset.word, b);
        });
      });

      content.querySelectorAll(".illus").forEach((s) => {
        s.addEventListener("click", () => {
          const btn = s.parentElement.querySelector(".spk");
          speak(s.dataset.word, btn);
        });
      });

      window.scrollTo(0, 0);
    } catch (e) {
      showError("Couldn't load this topic.");
      console.error(e);
    }
  }

  // ---------- Routing ----------
  backBtn.addEventListener("click", showTopics);

  window.addEventListener("hashchange", () => {
    const hash = location.hash.replace(/^#/, "");
    if (hash) showTopic(hash);
    else showTopics();
  });

  // Init: show topic from URL hash if present, else home
  const initial = location.hash.replace(/^#/, "");
  if (initial) showTopic(initial);
  else showTopics();
})();
