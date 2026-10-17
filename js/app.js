/* NeuraLearn — gamification engine (progress stored in localStorage) */
(function () {
  "use strict";

  var STORE_KEY = "neuralearn-v1";
  var XP_PER_LEVEL = 150;

  var MODULES = {
    fundamentals: { title: "AI Fundamentals", badge: "AI Explorer", badgeDesc: "Completed the AI Fundamentals module" },
    tools: { title: "Practical AI Tools", badge: "Prompt Pro", badgeDesc: "Completed the Practical AI Tools module" },
    ethics: { title: "Ethical AI Use", badge: "Ethics Guardian", badgeDesc: "Completed the Ethical AI Use module" }
  };
  var MASTER_BADGE = { name: "AI Master", desc: "Completed all three modules" };

  function blank() { return { xp: 0, completed: {}, badges: [] }; }

  function load() {
    try {
      var raw = localStorage.getItem(STORE_KEY);
      return raw ? JSON.parse(raw) : blank();
    } catch (e) { return blank(); }
  }

  function save(state) {
    localStorage.setItem(STORE_KEY, JSON.stringify(state));
  }

  function getLevel(xp) { return Math.floor(xp / XP_PER_LEVEL) + 1; }

  function awardBadge(state, name, desc) {
    var has = state.badges.some(function (b) { return b.name === name; });
    if (!has) { state.badges.push({ name: name, desc: desc }); return true; }
    return false;
  }

  /* Complete a module: awards quiz XP + 50 bonus on first completion, plus badges. */
  function completeModule(moduleId, quizXp) {
    var state = load();
    state.xp += quizXp;
    var firstTime = !state.completed[moduleId];
    state.completed[moduleId] = true;
    var newBadges = [];
    if (firstTime) {
      state.xp += 50;
      var m = MODULES[moduleId];
      if (m && awardBadge(state, m.badge, m.badgeDesc)) newBadges.push(m.badge);
      var allDone = Object.keys(MODULES).every(function (k) { return state.completed[k]; });
      if (allDone && awardBadge(state, MASTER_BADGE.name, MASTER_BADGE.desc)) {
        newBadges.push(MASTER_BADGE.name);
      }
    }
    save(state);
    return { state: state, newBadges: newBadges, firstTime: firstTime };
  }

  /* ---- Dashboard (index page) ---- */
  function renderDashboard() {
    var state = load();
    var level = getLevel(state.xp);
    var set = function (id, v) { var el = document.getElementById(id); if (el) el.textContent = v; };

    set("dash-level", level);
    set("dash-xp", state.xp + " XP");
    var doneCount = Object.keys(MODULES).filter(function (k) { return state.completed[k]; }).length;
    set("dash-modules", doneCount + " / " + Object.keys(MODULES).length);

    var intoLevel = state.xp % XP_PER_LEVEL;
    var fill = document.getElementById("dash-xp-fill");
    if (fill) fill.style.width = Math.round((intoLevel / XP_PER_LEVEL) * 100) + "%";
    set("dash-xp-next", (XP_PER_LEVEL - intoLevel) + " XP to level " + (level + 1));

    var badgeBox = document.getElementById("dash-badges");
    if (badgeBox) {
      badgeBox.innerHTML = "";
      var all = Object.keys(MODULES).map(function (k) {
        return { name: MODULES[k].badge, desc: MODULES[k].badgeDesc };
      });
      all.push(MASTER_BADGE);
      all.forEach(function (b) {
        var earned = state.badges.some(function (x) { return x.name === b.name; });
        var div = document.createElement("div");
        div.className = "badge" + (earned ? "" : " locked");
        div.innerHTML = "<span></span><small></small>";
        div.querySelector("span").textContent = (earned ? "★ " : "☆ ") + b.name;
        div.querySelector("small").textContent = b.desc;
        badgeBox.appendChild(div);
      });
    }

    document.querySelectorAll(".card[data-module]").forEach(function (card) {
      var id = card.getAttribute("data-module");
      var status = card.querySelector(".card-status");
      if (status) status.textContent = state.completed[id] ? "✓ Completed" : "";
    });

    var reset = document.getElementById("reset-progress");
    if (reset) reset.addEventListener("click", function () {
      if (confirm("Reset all XP, badges, and progress?")) {
        save(blank());
        renderDashboard();
      }
    });
  }

  /* ---- Quiz engine (module pages) ---- */
  function initQuiz(moduleId, questions) {
    var box = document.getElementById("quiz");
    if (!box) return;
    var state = load();
    if (state.completed[moduleId]) {
      box.innerHTML = "<h2>Module quiz</h2><p class='quiz-result'>You already completed this module — nice work! Retake it anytime for practice.</p>";
    }

    var form = document.createElement("form");
    questions.forEach(function (q, i) {
      var div = document.createElement("div");
      div.className = "q";
      div.innerHTML = "<p>" + (i + 1) + ". " + q.q + "</p>";
      q.choices.forEach(function (c, j) {
        var label = document.createElement("label");
        var radio = document.createElement("input");
        radio.type = "radio";
        radio.name = "q" + i;
        radio.value = j;
        label.appendChild(radio);
        label.appendChild(document.createTextNode(c));
        div.appendChild(label);
      });
      form.appendChild(div);
    });

    var btn = document.createElement("button");
    btn.type = "submit";
    btn.className = "btn";
    btn.textContent = "Check answers";
    form.appendChild(btn);

    var result = document.createElement("div");
    result.className = "quiz-result";
    box.appendChild(form);
    box.appendChild(result);

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var correct = 0;
      var qs = form.querySelectorAll(".q");
      questions.forEach(function (q, i) {
        var picked = form.querySelector('input[name="q' + i + '"]:checked');
        var ok = picked && parseInt(picked.value, 10) === q.answer;
        if (ok) correct++;
        qs[i].classList.remove("correct", "wrong");
        qs[i].classList.add(ok ? "correct" : "wrong");
      });
      var quizXp = correct * 10;
      var res = completeModule(moduleId, quizXp);
      var html = "You got " + correct + " / " + questions.length + " correct (+" + quizXp + " XP)";
      if (res.firstTime) html += " + 50 XP module bonus!";
      if (res.newBadges.length) {
        html += "<br><span class='new-badge'>★ New badge" + (res.newBadges.length > 1 ? "s" : "") +
          ": " + res.newBadges.join(", ") + "</span>";
      }
      result.innerHTML = html;
      btn.disabled = true;
    });
  }

  window.renderDashboard = renderDashboard;
  window.initQuiz = initQuiz;
  window.NeuraLearn = { load: load, MODULES: MODULES };
})();
