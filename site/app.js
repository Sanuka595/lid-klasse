(function () {
  const KEY = "lid-klasse-v1";
  const EXAM_MS = 60 * 60 * 1000;
  const LANDS = [
    ["BE", "Berlin"],
    ["BB", "Brandenburg"],
    ["BW", "Baden-Württemberg"],
    ["BY", "Bayern"],
    ["HB", "Bremen"],
    ["HE", "Hessen"],
    ["HH", "Hamburg"],
    ["MV", "Mecklenburg-Vorpommern"],
    ["NI", "Niedersachsen"],
    ["NW", "Nordrhein-Westfalen"],
    ["RP", "Rheinland-Pfalz"],
    ["SH", "Schleswig-Holstein"],
    ["SL", "Saarland"],
    ["SN", "Sachsen"],
    ["ST", "Sachsen-Anhalt"],
    ["TH", "Thüringen"],
  ];
  const QUESTIONS = window.LID_QUESTIONS || [];
  const BY_ID = new Map(QUESTIONS.map((q) => [q.id, q]));
  const TERMS = (window.LID_GLOSSARY || [])
    .slice()
    .sort((a, b) => b[0].length - a[0].length);

  const app = document.getElementById("app");
  const landSelect = document.getElementById("land");
  const themeBtn = document.getElementById("theme");
  const dataBtn = document.getElementById("data-btn");

  const state = load();

  function load() {
    let saved = {};
    try { saved = JSON.parse(localStorage.getItem(KEY) || "{}"); } catch (e) { saved = {}; }
    return {
      mode: saved.mode || "learn",
      land: saved.land || "BE",
      theme: saved.theme || "",
      hints: saved.hints !== false,
      filter: saved.filter || "all",
      index: typeof saved.index === "number" ? saved.index : 0,
      revealed: false,
      pick: null,
      hint: null,
      hintWord: null,
      stats: saved.stats || {},
      stars: saved.stars || {},
      exam: saved.exam || null,
      confirmSubmit: false,
      showDataModal: false,
      doneList: false,
    };
  }

  function save() {
    localStorage.setItem(KEY, JSON.stringify({
      mode: state.mode,
      land: state.land,
      theme: state.theme,
      hints: state.hints,
      filter: state.filter,
      index: state.index,
      stats: state.stats,
      stars: state.stars,
      exam: state.exam,
    }));
  }

  function esc(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
    }[c]));
  }

  function isLetter(ch) {
    return /\p{L}/u.test(ch || "");
  }

  function decorate(text) {
    if (!state.hints || state.mode === "exam") return esc(text);
    const lower = text.toLowerCase();
    const used = new Array(text.length).fill(false);
    const hits = [];
    for (const [term, hint] of TERMS) {
      const needle = term.toLowerCase();
      let from = 0;
      while (from < text.length) {
        const at = lower.indexOf(needle, from);
        if (at < 0) break;
        const end = at + needle.length;
        const leftOk = at === 0 || !isLetter(text[at - 1]);
        const rightOk = end === text.length || !isLetter(text[end]);
        const free = used.slice(at, end).every((bit) => !bit);
        if (leftOk && rightOk && free) {
          for (let i = at; i < end; i++) used[i] = true;
          hits.push({ at, end, hint });
        }
        from = at + 1;
      }
    }
    hits.sort((a, b) => a.at - b.at);
    let html = "";
    let cursor = 0;
    for (const hit of hits) {
      html += esc(text.slice(cursor, hit.at));
      html += `<span class="word" data-act="hint" data-hint="${esc(hit.hint)}">${esc(text.slice(hit.at, hit.end))}</span>`;
      cursor = hit.end;
    }
    html += esc(text.slice(cursor));
    return html;
  }

  function pool() {
    return QUESTIONS
      .filter((q) => q.land === null || q.land === state.land)
      .sort((a, b) => (Number(a.land !== null) - Number(b.land !== null)) || (a.num - b.num));
  }

  function visible() {
    const all = pool();
    if (state.filter === "new") return all.filter((q) => !state.stats[q.id]);
    if (state.filter === "bad") return all.filter((q) => state.stats[q.id] && state.stats[q.id].last === "bad");
    if (state.filter === "star") return all.filter((q) => Boolean(state.stars[q.id]));
    return all;
  }

  function counts() {
    const all = pool();
    let seen = 0;
    let ok = 0;
    let bad = 0;
    let star = 0;
    for (const q of all) {
      if (state.stars[q.id]) star += 1;
      const row = state.stats[q.id];
      if (!row) continue;
      seen += 1;
      if (row.last === "ok") ok += 1;
      if (row.last === "bad") bad += 1;
    }
    return { total: all.length, seen, ok, bad, star };
  }

  function mark(id, good) {
    const prev = state.stats[id] || { ok: 0, bad: 0, last: "" };
    if (good) prev.ok += 1;
    else prev.bad += 1;
    prev.last = good ? "ok" : "bad";
    state.stats[id] = prev;
    save();
  }

  function toggleStar(id) {
    if (state.stars[id]) {
      delete state.stars[id];
    } else {
      state.stars[id] = true;
    }
    save();
    render();
  }

  function shuffle(list) {
    const out = list.slice();
    for (let i = out.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const tmp = out[i];
      out[i] = out[j];
      out[j] = tmp;
    }
    return out;
  }

  function startExam() {
    const general = shuffle(QUESTIONS.filter((q) => q.land === null)).slice(0, 30);
    const local = shuffle(QUESTIONS.filter((q) => q.land === state.land)).slice(0, 3);
    state.exam = {
      land: state.land,
      ids: shuffle(general.concat(local)).map((q) => q.id),
      picks: {},
      i: 0,
      started: Date.now(),
      done: null,
    };
    state.confirmSubmit = false;
    state.mode = "exam";
    save();
    render();
  }

  function remaining() {
    if (!state.exam || state.exam.done) return 0;
    return state.exam.started + EXAM_MS - Date.now();
  }

  function clock(ms) {
    const s = Math.max(0, Math.ceil(ms / 1000));
    const m = Math.floor(s / 60);
    const r = s % 60;
    return String(m).padStart(2, "0") + ":" + String(r).padStart(2, "0");
  }

  function finishExam() {
    const exam = state.exam;
    if (!exam || exam.done) return;
    let score = 0;
    const wrong = [];
    for (const id of exam.ids) {
      const q = BY_ID.get(id);
      const pick = exam.picks[id];
      const good = pick === q.correct;
      if (good) score += 1;
      else wrong.push(id);
      mark(id, good);
    }
    exam.done = { score, wrong, at: Date.now() };
    save();
    render();
  }

  function figureFor(q) {
    const drawn = window.LID_FIGURE ? window.LID_FIGURE(q.id) : "";
    if (drawn) return drawn;
    if (!q.image) return "";
    return `<p class="note">Abbildung im offiziellen Katalog, Seite ${q.page}. Das Foto wird hier nicht gehostet.</p>`;
  }

  function optionClass(q, i, revealed, pick) {
    const classes = ["opt"];
    if (revealed) {
      if (i === q.correct) classes.push("is-right");
      else if (i === pick) classes.push("is-wrong");
    } else if (i === pick) classes.push("picked");
    return classes.join(" ");
  }

  function renderDataModal() {
    return `
      <section class="card modal-card">
        <h2>Fortschritt & Daten</h2>
        <p class="quiet">Sichere deinen Lernstand als Datei, übertrage ihn auf ein anderes Gerät oder setze die Statistik zurück.</p>
        <div class="row">
          <button type="button" class="text-btn" data-act="export-data">Fortschritt exportieren (JSON)</button>
          <label class="file-label text-btn">
            Fortschritt importieren
            <input type="file" accept=".json" style="display:none" data-act="import-file">
          </label>
          <button type="button" class="text-btn mark" data-act="reset-data">Statistik zurücksetzen</button>
        </div>
        <div id="data-msg" class="quiet" style="margin-top:0.6rem"></div>
        <div class="row" style="margin-top:0.8rem">
          <button type="button" class="go" data-act="close-data-modal">Schließen</button>
        </div>
      </section>`;
  }

  function renderLearn() {
    if (state.showDataModal) {
      app.innerHTML = renderDataModal();
      return;
    }

    const list = visible();
    const pinned = state.pin ? BY_ID.get(state.pin) : null;
    const c = counts();

    if (!list.length && !pinned) {
      app.innerHTML = `
        <div class="status">
          <span>${c.seen} von ${c.total} gesehen · ${c.ok} richtig · ${c.bad} falsch · ${c.star} gemerkt</span>
          <span class="filters">
            <button type="button" class="text-btn ${state.filter === "all" ? "on" : ""}" data-act="filter" data-filter="all">Alle</button>
            <button type="button" class="text-btn ${state.filter === "new" ? "on" : ""}" data-act="filter" data-filter="new">Neu</button>
            <button type="button" class="text-btn ${state.filter === "bad" ? "on" : ""}" data-act="filter" data-filter="bad">Falsch (${c.bad})</button>
            <button type="button" class="text-btn ${state.filter === "star" ? "on" : ""}" data-act="filter" data-filter="star">Gemerkt (${c.star})</button>
          </span>
        </div>
        <p>In dieser Liste ist noch nichts. Wähle „Alle“ oder merke dir Fragen mit dem Stern.</p>`;
      return;
    }

    if (state.doneList) {
      app.innerHTML = `
        <div class="status">
          <span>Auswahl abgeschlossen · ${c.seen} gesehen · ${c.ok} richtig · ${c.bad} falsch</span>
        </div>
        <article class="card done-card">
          <h2>Auswahl abgeschlossen 🎉</h2>
          <p>Du hast alle Fragen in diesem Filter durchgesehen.</p>
          <div class="row">
            <button type="button" class="go" data-act="restart-filter">Von vorne wiederholen</button>
            ${c.bad > 0 ? `<button type="button" class="text-btn" data-act="filter" data-filter="bad">Nur Fehler üben (${c.bad})</button>` : ""}
            <button type="button" class="text-btn" data-act="filter" data-filter="all">Alle Fragen anzeigen</button>
          </div>
        </article>`;
      return;
    }

    if (state.index >= list.length) state.index = Math.max(0, list.length - 1);
    if (state.index < 0) state.index = 0;
    const q = pinned || list[state.index];
    const revealed = state.revealed;
    const pick = state.pick;
    const isStarred = Boolean(state.stars[q.id]);

    const opts = q.options.map((text, i) =>
      `<button type="button" class="${optionClass(q, i, revealed, pick)}" data-act="pick" data-i="${i}" role="radio" aria-checked="${i === pick ? "true" : "false"}" ${revealed ? "disabled" : ""}>
        <span class="box" aria-hidden="true"></span><span>${decorate(text)}</span>
      </button>`
    ).join("");

    let verdict = "";
    if (revealed) {
      const good = pick === q.correct;
      verdict = good
        ? `<p class="mark ok">Richtig.</p>`
        : `<p class="mark bad">Falsch. Im Lernschlüssel: ${esc(q.options[q.correct])}</p>`;
    }

    const hint = state.hint
      ? `<div class="hintline" lang="uk">
          <span><b>${esc(state.hintWord || "")}</b> — ${esc(state.hint)}</span>
          <button type="button" class="hint-close" data-act="close-hint" title="Schließen" aria-label="Schließen">×</button>
        </div>`
      : "";

    app.innerHTML = `
      <div class="status">
        <span>Frage ${state.index + 1} von ${list.length} · ${c.seen} gesehen · ${c.ok} richtig · ${c.bad} falsch</span>
        <span class="filters" ${state.mode === "wrong" ? "hidden" : ""}>
          <button type="button" class="text-btn ${state.filter === "all" ? "on" : ""}" data-act="filter" data-filter="all">Alle</button>
          <button type="button" class="text-btn ${state.filter === "new" ? "on" : ""}" data-act="filter" data-filter="new">Neu</button>
          <button type="button" class="text-btn ${state.filter === "bad" ? "on" : ""}" data-act="filter" data-filter="bad">Falsch (${c.bad})</button>
          <button type="button" class="text-btn ${state.filter === "star" ? "on" : ""}" data-act="filter" data-filter="star">Gemerkt (${c.star})</button>
        </span>
      </div>
      <article class="card">
        <div class="q-header">
          <p class="q-num">${q.land ? q.land : "Allgemein"} ${q.num}</p>
          <button type="button" class="star-btn ${isStarred ? "on" : ""}" data-act="toggle-star" data-id="${esc(q.id)}" title="${isStarred ? "Aus Gemerkt entfernen" : "Frage merken"}">
            ${isStarred ? "★ Gemerkt" : "☆ Merken"}
          </button>
        </div>
        <p class="q-text">${decorate(q.question)}</p>
        ${hint}
        ${figureFor(q)}
        <div class="options" role="radiogroup">${opts}</div>
        ${verdict}
      </article>
      <div class="row">
        <button type="button" class="text-btn" data-act="prev" ${state.index === 0 ? "disabled" : ""}>Zurück</button>
        <button type="button" class="go" data-act="next">Weiter</button>
        <button type="button" class="text-btn" data-act="toggle-hints">${state.hints ? "Wörter aus" : "Wörter an"}</button>
      </div>`;
  }

  function renderExam() {
    if (state.showDataModal) {
      app.innerHTML = renderDataModal();
      return;
    }

    const exam = state.exam;
    if (!exam) {
      const landName = (LANDS.find((row) => row[0] === state.land) || ["", state.land])[1];
      app.innerHTML = `
        <section class="exam-intro card">
          <h2>Prüfung</h2>
          <p>33 Fragen, 60 Minuten. 30 allgemeine und 3 aus ${esc(landName)}.</p>
          <p>Vier Antworten, eine davon richtig. Auflösung erst am Ende. Keine Worttipps.</p>
          <p>Kurs „Leben in Deutschland“: ab 15 von 33. Einbürgerungstest: ab 17 von 33.</p>
          <div class="row"><button type="button" class="go" data-act="start-exam">Prüfung beginnen</button></div>
        </section>`;
      return;
    }

    if (exam.done) {
      const score = exam.done.score;
      const course = score >= 15;
      const citizen = score >= 17;
      const items = exam.done.wrong.map((id) => {
        const q = BY_ID.get(id);
        const pick = exam.picks[id];
        const yours = pick === 0 || pick > 0 ? q.options[pick] : "keine Antwort";
        return `<li><button type="button" data-act="open" data-id="${esc(id)}">${esc(q.land || "Allgemein")} ${q.num}</button><br>${esc(q.question)}<br><span class="quiet">Deine Antwort: ${esc(yours)}. Lernschlüssel: ${esc(q.options[q.correct])}</span></li>`;
      }).join("");

      app.innerHTML = `
        <section class="result card">
          <h2>${score} von 33</h2>
          <div class="lines">
            <div class="${course ? "hit" : "miss"}">Kurs Leben in Deutschland: ${course ? "bestanden" : "nicht bestanden"} (ab 15).</div>
            <div class="${citizen ? "hit" : "miss"}">Einbürgerungstest: ${citizen ? "bestanden" : "nicht bestanden"} (ab 17).</div>
          </div>
          ${items ? `<h3>Falsch oder offen</h3><ol class="miss-list">${items}</ol>` : "<p>Keine Fehler in diesem Durchgang.</p>"}
          <div class="row">
            <button type="button" class="go" data-act="start-exam">Neue Prüfung starten</button>
            <button type="button" class="text-btn" data-act="close-exam">Schließen</button>
            <button type="button" class="text-btn" data-act="study-wrong">Diese Fehler lernen</button>
          </div>
        </section>`;
      return;
    }

    const q = BY_ID.get(exam.ids[exam.i]);
    const pick = Object.prototype.hasOwnProperty.call(exam.picks, q.id) ? exam.picks[q.id] : null;
    const left = remaining();

    const gridCells = exam.ids.map((id, idx) => {
      const isCurrent = idx === exam.i;
      const isPicked = Object.prototype.hasOwnProperty.call(exam.picks, id);
      let cls = "exam-cell";
      if (isCurrent) cls += " current";
      if (isPicked) cls += " picked";
      return `<button type="button" class="${cls}" data-act="exam-jump" data-idx="${idx}" title="Frage ${idx + 1}">${idx + 1}</button>`;
    }).join("");

    const unpicked = exam.ids.length - Object.keys(exam.picks).length;
    const confirmBox = state.confirmSubmit
      ? `<div class="confirm-box">
          <p><strong>Unbeantwortete Fragen:</strong> Du hast ${unpicked} von 33 Fragen noch nicht beantwortet.</p>
          <p class="quiet">Unbeantwortete Fragen gelten als nicht bestanden.</p>
          <div class="row">
            <button type="button" class="go" data-act="confirm-submit-exam">Ja, jetzt abgeben</button>
            <button type="button" class="text-btn" data-act="cancel-submit-exam">Weiter bearbeiten</button>
          </div>
        </div>`
      : "";

    const opts = q.options.map((text, i) =>
      `<button type="button" class="${optionClass(q, i, false, pick)}" data-act="exam-pick" data-i="${i}" role="radio" aria-checked="${i === pick ? "true" : "false"}">
        <span class="box" aria-hidden="true"></span><span>${esc(text)}</span>
      </button>`
    ).join("");

    app.innerHTML = `
      <div class="exam-status-bar">
        <div class="status">
          <span>Frage ${exam.i + 1} von 33 · ${Object.keys(exam.picks).length}/33 beantwortet</span>
          <span id="clock" class="clock ${left < 5 * 60 * 1000 ? "low" : ""}">${clock(left)}</span>
        </div>
        <div class="exam-grid">${gridCells}</div>
      </div>
      ${confirmBox}
      <article class="card">
        <p class="q-num">${q.land ? q.land : "Allgemein"} ${q.num}</p>
        <p class="q-text">${esc(q.question)}</p>
        ${figureFor(q)}
        <div class="options" role="radiogroup">${opts}</div>
      </article>
      <div class="row">
        <button type="button" class="text-btn" data-act="exam-prev" ${exam.i === 0 ? "disabled" : ""}>Zurück</button>
        <button type="button" class="text-btn" data-act="exam-next" ${exam.i === exam.ids.length - 1 ? "disabled" : ""}>Weiter</button>
        <button type="button" class="go" data-act="submit-exam">Abgeben</button>
      </div>`;
  }

  function renderGrid() {
    if (state.showDataModal) {
      app.innerHTML = renderDataModal();
      return;
    }

    const all = pool();
    const general = all.filter((q) => q.land === null);
    const local = all.filter((q) => q.land);
    const cell = (q) => {
      const row = state.stats[q.id];
      const isStarred = Boolean(state.stars[q.id]);
      let cls = row ? row.last : "";
      if (isStarred) cls = (cls ? cls + " " : "") + "starred";
      return `<button type="button" class="${cls}" data-act="open" data-id="${esc(q.id)}" title="${isStarred ? "★ Gemerkt" : ""}">${q.num}</button>`;
    };
    const landName = (LANDS.find((row) => row[0] === state.land) || ["", ""])[1];
    app.innerHTML = `
      <p class="quiet">Antippen öffnet die Frage. Grün zuletzt richtig, rot zuletzt falsch.</p>
      <h3>Allgemeine Fragen</h3>
      <div class="grid">${general.map(cell).join("")}</div>
      <h3>${esc(landName)}</h3>
      <div class="grid">${local.map(cell).join("")}</div>`;
  }

  function render() {
    document.querySelectorAll("[data-mode]").forEach((btn) => {
      btn.classList.toggle("on", btn.dataset.mode === state.mode);
    });
    landSelect.disabled = Boolean(state.exam && !state.exam.done);
    if (state.mode === "exam") renderExam();
    else if (state.mode === "grid") renderGrid();
    else if (state.mode === "wrong") {
      state.filter = "bad";
      renderLearn();
    } else renderLearn();
  }

  function openQuestion(id) {
    state.mode = "learn";
    state.filter = "all";
    state.doneList = false;
    const list = visible();
    const idx = list.findIndex((q) => q.id === id);
    state.index = idx < 0 ? 0 : idx;
    state.revealed = false;
    state.pick = null;
    state.hint = null;
    state.pin = null;
    state.showDataModal = false;
    save();
    render();
  }

  function onClick(event) {
    const el = event.target.closest("[data-act], [data-mode]");
    if (!el) return;
    const act = el.dataset.act;

    if (el.dataset.mode) {
      state.mode = el.dataset.mode;
      state.revealed = false;
      state.pick = null;
      state.hint = null;
      state.pin = null;
      state.doneList = false;
      state.showDataModal = false;
      if (state.mode === "wrong") state.filter = "bad";
      if (state.mode === "learn" && state.filter === "bad") state.filter = "all";
      save();
      render();
      return;
    }

    if (act === "close-hint") {
      state.hint = null;
      state.hintWord = null;
      render();
      return;
    }

    if (act === "hint") {
      state.hint = el.dataset.hint;
      state.hintWord = el.textContent;
      render();
      return;
    }

    if (act === "toggle-hints") {
      state.hints = !state.hints;
      state.hint = null;
      save();
      render();
      return;
    }

    if (act === "toggle-star") {
      toggleStar(el.dataset.id);
      return;
    }

    if (act === "filter") {
      state.filter = el.dataset.filter;
      state.index = 0;
      state.revealed = false;
      state.pick = null;
      state.hint = null;
      state.pin = null;
      state.doneList = false;
      save();
      render();
      return;
    }

    if (act === "restart-filter") {
      state.index = 0;
      state.revealed = false;
      state.pick = null;
      state.hint = null;
      state.pin = null;
      state.doneList = false;
      save();
      render();
      return;
    }

    if (act === "pick") {
      if (state.revealed) return;
      const list = visible();
      const q = list[state.index];
      state.pick = Number(el.dataset.i);
      state.revealed = true;
      state.pin = q.id;
      mark(q.id, state.pick === q.correct);
      render();
      return;
    }

    if (act === "next") {
      const list = visible();
      const pinned = state.pin;
      const stillThere = pinned && list.some((q) => q.id === pinned);
      state.pin = null;
      state.revealed = false;
      state.pick = null;
      state.hint = null;

      if (stillThere && state.index < list.length - 1) {
        state.index += 1;
      } else if (!stillThere && state.index >= list.length) {
        state.index = Math.max(0, list.length - 1);
      } else if (state.index >= list.length - 1) {
        state.doneList = true;
      }
      save();
      render();
      return;
    }

    if (act === "prev") {
      if (state.index > 0) state.index -= 1;
      state.revealed = false;
      state.pick = null;
      state.hint = null;
      state.pin = null;
      state.doneList = false;
      save();
      render();
      return;
    }

    if (act === "open") {
      openQuestion(el.dataset.id);
      return;
    }

    if (act === "start-exam") {
      startExam();
      return;
    }

    if (act === "exam-jump") {
      state.exam.i = Number(el.dataset.idx);
      state.confirmSubmit = false;
      save();
      render();
      return;
    }

    if (act === "exam-pick") {
      const exam = state.exam;
      const q = BY_ID.get(exam.ids[exam.i]);
      exam.picks[q.id] = Number(el.dataset.i);
      save();
      render();
      return;
    }

    if (act === "exam-next") {
      if (state.exam.i < state.exam.ids.length - 1) state.exam.i += 1;
      state.confirmSubmit = false;
      save();
      render();
      return;
    }

    if (act === "exam-prev") {
      if (state.exam.i > 0) state.exam.i -= 1;
      state.confirmSubmit = false;
      save();
      render();
      return;
    }

    if (act === "submit-exam") {
      const exam = state.exam;
      const unpicked = exam.ids.length - Object.keys(exam.picks).length;
      if (unpicked > 0 && !state.confirmSubmit) {
        state.confirmSubmit = true;
        render();
        return;
      }
      state.confirmSubmit = false;
      finishExam();
      return;
    }

    if (act === "confirm-submit-exam") {
      state.confirmSubmit = false;
      finishExam();
      return;
    }

    if (act === "cancel-submit-exam") {
      state.confirmSubmit = false;
      render();
      return;
    }

    if (act === "close-exam") {
      state.exam = null;
      state.mode = "learn";
      state.confirmSubmit = false;
      save();
      render();
      return;
    }

    if (act === "study-wrong") {
      state.exam = null;
      state.mode = "wrong";
      state.filter = "bad";
      state.index = 0;
      state.revealed = false;
      state.pick = null;
      state.pin = null;
      state.doneList = false;
      save();
      render();
      return;
    }

    if (act === "close-data-modal") {
      state.showDataModal = false;
      render();
      return;
    }

    if (act === "export-data") {
      const payload = {
        app: "lid-klasse",
        version: 1,
        exportedAt: new Date().toISOString(),
        land: state.land,
        stats: state.stats,
        stars: state.stars,
      };
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `lid-klasse-fortschritt-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      const msg = document.getElementById("data-msg");
      if (msg) msg.textContent = "Fortschritt wurde als Datei heruntergeladen.";
      return;
    }

    if (act === "reset-data") {
      if (window.confirm("Möchtest du wirklich deinen gesamten Lernfortschritt zurücksetzen?")) {
        state.stats = {};
        state.stars = {};
        save();
        const msg = document.getElementById("data-msg");
        if (msg) msg.textContent = "Statistik wurde erfolgreich zurückgesetzt.";
        render();
      }
      return;
    }
  }

  function handleFileImport(event) {
    const file = event.target.files && event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function (e) {
      try {
        const parsed = JSON.parse(e.target.result);
        if (parsed && typeof parsed.stats === "object") {
          state.stats = Object.assign(state.stats || {}, parsed.stats);
          if (parsed.stars && typeof parsed.stars === "object") {
            state.stars = Object.assign(state.stars || {}, parsed.stars);
          }
          if (parsed.land && LANDS.some(([code]) => code === parsed.land)) {
            state.land = parsed.land;
            landSelect.value = state.land;
          }
          save();
          const msg = document.getElementById("data-msg");
          if (msg) msg.textContent = "Fortschritt erfolgreich importiert!";
          render();
        } else {
          alert("Ungültiges Dateiformat. JSON mit 'stats' erwartet.");
        }
      } catch (err) {
        alert("Fehler beim Lesen der Datei: " + err.message);
      }
    };
    reader.readAsText(file);
  }

  function applyTheme() {
    if (state.theme) document.documentElement.dataset.theme = state.theme;
    else delete document.documentElement.dataset.theme;
    const dark = document.documentElement.dataset.theme === "dark" ||
      (!state.theme && window.matchMedia("(prefers-color-scheme: dark)").matches);
    themeBtn.textContent = dark ? "Tag" : "Nacht";
  }

  LANDS.forEach(([code, name]) => {
    const opt = document.createElement("option");
    opt.value = code;
    opt.textContent = name;
    landSelect.appendChild(opt);
  });
  landSelect.value = state.land;
  landSelect.addEventListener("change", () => {
    state.land = landSelect.value;
    state.index = 0;
    state.revealed = false;
    state.pick = null;
    state.doneList = false;
    save();
    render();
  });

  themeBtn.addEventListener("click", () => {
    const dark = themeBtn.textContent === "Nacht";
    state.theme = dark ? "dark" : "light";
    save();
    applyTheme();
  });

  if (dataBtn) {
    dataBtn.addEventListener("click", () => {
      state.showDataModal = !state.showDataModal;
      render();
    });
  }

  document.body.addEventListener("click", onClick);
  document.body.addEventListener("change", (e) => {
    if (e.target && e.target.dataset && e.target.dataset.act === "import-file") {
      handleFileImport(e);
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.target.closest("select, input, textarea")) return;

    const n = Number(event.key);
    if (n >= 1 && n <= 4) {
      const selector = state.mode === "exam" ? `[data-act="exam-pick"][data-i="${n - 1}"]` : `[data-act="pick"][data-i="${n - 1}"]`;
      const btn = app.querySelector(selector);
      if (btn && !btn.disabled) {
        btn.click();
        return;
      }
    }

    if (event.key === "Enter" || event.key === " ") {
      if (state.mode === "learn" && state.revealed) {
        event.preventDefault();
        const nextBtn = app.querySelector('[data-act="next"]');
        if (nextBtn) nextBtn.click();
        return;
      }
    }

    if (event.key === "ArrowRight" || event.key === "n") {
      event.preventDefault();
      const selector = state.mode === "exam" ? '[data-act="exam-next"]' : '[data-act="next"]';
      const btn = app.querySelector(selector);
      if (btn && !btn.disabled) btn.click();
      return;
    }

    if (event.key === "ArrowLeft" || event.key === "p") {
      event.preventDefault();
      const selector = state.mode === "exam" ? '[data-act="exam-prev"]' : '[data-act="prev"]';
      const btn = app.querySelector(selector);
      if (btn && !btn.disabled) btn.click();
      return;
    }

    if (event.key === "Escape") {
      if (state.hint) {
        state.hint = null;
        render();
        return;
      }
      if (state.confirmSubmit) {
        state.confirmSubmit = false;
        render();
        return;
      }
      if (state.showDataModal) {
        state.showDataModal = false;
        render();
        return;
      }
    }
  });

  if (!QUESTIONS.length || QUESTIONS.length !== 460 || QUESTIONS.some((q) => q.options.length !== 4 || q.correct < 0 || q.correct > 3)) {
    app.innerHTML = `<p class="warn">Fragedaten unvollständig. Erwartet 460 Fragen mit vier Antworten.</p>`;
  } else {
    applyTheme();
    render();
  }

  setInterval(() => {
    const el = document.getElementById("clock");
    if (!el || !state.exam || state.exam.done) return;
    const left = remaining();
    el.textContent = clock(left);
    el.classList.toggle("low", left < 5 * 60 * 1000);
    if (left <= 0) finishExam();
  }, 1000);

  if ("serviceWorker" in navigator && location.protocol !== "file:") {
    navigator.serviceWorker.register("sw.js").catch(() => {});
  }
})();
