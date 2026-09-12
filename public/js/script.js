//! Reforzando Operaciones Básicas - Versión final
//! Institución Educativa José Carlos Mariátegui - Ayabaca

const inspirationalQuotes = [
  { text: "La educación es el arma más poderosa que puedes usar para cambiar el mundo.", author: "Nelson Mandela" },
  { text: "La educación no es preparación para la vida; la educación es la vida misma.", author: "John Dewey" },
  { text: "No te preocupes por tus dificultades en matemáticas; te aseguro que las mías son aún mayores.", author: "Albert Einstein" },
  { text: "El éxito es la suma de pequeños esfuerzos repetidos día tras día.", author: "Robert Collier" },
  { text: "La mente que se abre a una nueva idea jamás vuelve a su tamaño original.", author: "Albert Einstein" },
  { text: "La única forma de aprender matemáticas es haciendo matemáticas.", author: "Paul Halmos" },
  { text: "No dejes que lo que no puedes hacer interfiera con lo que puedes hacer.", author: "John Wooden" },
  { text: "La educación es el pasaporte al futuro.", author: "Malcolm X" }
];

const operationsConfig = {
  suma: {
    name: "Suma",
    levels: {
      1: { min: 1, max: 9, count: 5 },
      2: { min: 10, max: 30, count: 5 },
      3: { min: 20, max: 60, count: 5 },
      4: { min: 40, max: 99, count: 5 },
      5: { min: 100, max: 300, count: 5 },
      6: { min: 200, max: 600, count: 5 },
      7: { min: 400, max: 900, count: 5 },
      8: { min: 500, max: 999, count: 5 }
    }
  },
  resta: {
    name: "Resta",
    levels: {
      1: { min: 1, max: 9, count: 5 },
      2: { min: 10, max: 30, count: 5 },
      3: { min: 20, max: 60, count: 5 },
      4: { min: 40, max: 99, count: 5 },
      5: { min: 100, max: 300, count: 5 },
      6: { min: 200, max: 600, count: 5 },
      7: { min: 400, max: 900, count: 5 },
      8: { min: 500, max: 999, count: 5 }
    }
  },
  multiplicacion: {
    name: "Multiplicación",
    levels: {
      1: { min: 2, max: 5, count: 5 },
      2: { min: 2, max: 9, count: 5 },
      3: { min: 3, max: 12, count: 5 },
      4: { min: 4, max: 15, count: 5 },
      5: { min: 6, max: 19, count: 5 },
      6: { min: 7, max: 25, count: 5 },
      7: { min: 9, max: 35, count: 5 },
      8: { min: 11, max: 49, count: 5 }
    }
  },
  division: {
    name: "División",
    levels: {
      1: { min: 2, max: 5, count: 5 },
      2: { min: 2, max: 9, count: 5 },
      3: { min: 3, max: 12, count: 5 },
      4: { min: 4, max: 15, count: 5 },
      5: { min: 5, max: 20, count: 5 },
      6: { min: 6, max: 25, count: 5 },
      7: { min: 7, max: 30, count: 5 },
      8: { min: 8, max: 40, count: 5 }
    }
  }
};

let state = {
  studentName: "",
  currentOperation: null,
  currentLevel: 1,
  score: 0,
  aciertos: 0,
  errores: 0,
  questionsInCurrentLevel: 0,
  totalQuestions: 0,
  pendingOperation: null
};

let timerInterval = null;
let operationGrid, gameArea, questionText, answerButtons, timerEl, levelDisplay;
let controlsOverlay, finalScoreEl, restartBtn, controls;
let nameOverlay, nameInput, startChallengeBtn;

function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function obtenerMaximoAciertos() {
  try {
    const v = localStorage.getItem("max_aciertos");
    return v ? parseInt(v, 10) : 0;
  } catch (e) {
    return 0;
  }
}

function guardarMaximoAciertos(v) {
  try {
    localStorage.setItem("max_aciertos", String(v));
  } catch (e) {}
}

function createParticles() {
  try {
    const container = document.getElementById("particles");
    if (!container || container.children.length > 0) return;
    const colors = ["#3b82f6", "#ec4899", "#22c55e", "#f97316", "#8b5cf6"];
    for (let i = 0; i < 10; i++) {
      const p = document.createElement("div");
      p.className = "particle";
      p.style.left = Math.random() * 100 + "%";
      p.style.background = colors[i % colors.length];
      p.style.animationDelay = (Math.random() * 6) + "s";
      p.style.animationDuration = (14 + Math.random() * 10) + "s";
      container.appendChild(p);
    }
  } catch (e) {}
}

function celebrate(el) {
  if (!el) return;
  el.style.animation = "pulseSuccess 0.6s ease-out";
  setTimeout(function () { el.style.animation = ""; }, 650);
}

function errorShake(el) {
  if (!el) return;
  el.style.animation = "shake 0.5s ease-out";
  setTimeout(function () { el.style.animation = ""; }, 550);
}

function levelUpEffect() {
  const card = document.getElementById("questionCard");
  if (!card) return;
  card.style.animation = "levelUp 0.8s ease-out";
  setTimeout(function () { card.style.animation = ""; }, 850);
}

function initOperationButtons() {
  const gridEl = document.getElementById("operationGrid");
  if (!gridEl) return;
  gridEl.innerHTML = "";

  const icons = {
    suma: '<svg class="op-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="26" height="26"><path d="M12 5v14M5 12h14"/></svg>',
    resta: '<svg class="op-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" width="26" height="26"><path d="M5 12h14"/></svg>',
    multiplicacion: '<svg class="op-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="26" height="26"><path d="M5 5l14 14M19 5l-14 14"/></svg>',
    division: '<svg class="op-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="26" height="26"><circle cx="12" cy="5" r="1" fill="currentColor"/><circle cx="12" cy="19" r="1" fill="currentColor"/><path d="M5 12h14"/></svg>'
  };

  Object.keys(operationsConfig).forEach(function (key) {
    const cfg = operationsConfig[key];
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "operation-btn";
    btn.setAttribute("data-operation", key);
    btn.innerHTML = icons[key] + "<span>" + cfg.name + "</span>";
    btn.addEventListener("click", function () {
      unlockAudio();
      startOperation(key);
    });
    gridEl.appendChild(btn);
  });
}

function startOperation(operationKey) {
  showNameModal(operationKey);
}

function showNameModal(operationKey) {
  state.pendingOperation = operationKey;
  // Ocultar de inmediato título, insignia, institución, bienvenida y pie al hacer clic en cualquier operación
  const mh = document.getElementById("mainHeader");
  if (mh) mh.style.display = "none";
  const ct = document.getElementById("controls");
  if (ct) ct.style.display = "none";
  const ft = document.getElementById("siteFooter");
  if (ft) ft.style.display = "none";
  if (!nameOverlay || !nameInput || !startChallengeBtn) {
    startGameWithName(operationKey, "Estudiante");
    return;
  }
  nameInput.value = state.studentName || "";
  startChallengeBtn.disabled = nameInput.value.trim().length < 2;
  nameOverlay.classList.add("active");
  setTimeout(function () { try { nameInput.focus(); } catch (e) {} }, 100);
}

function startGameWithName(operationKey, studentName) {
  state.studentName = studentName;
  state.currentOperation = operationKey;
  state.currentLevel = 1;
  state.score = 0;
  state.aciertos = 0;
  state.errores = 0;
  state.questionsInCurrentLevel = 0;
  state.totalQuestions = 0;

  const btns = document.querySelectorAll(".operation-btn");
  btns.forEach(function (btn) {
    if (btn.dataset.operation === operationKey) btn.classList.add("active");
    else btn.classList.remove("active");
  });

  if (controls) controls.style.display = "none";
  const mainHeader = document.getElementById("mainHeader");
  if (mainHeader) mainHeader.style.display = "none";
  const siteFooter = document.getElementById("siteFooter");
  if (siteFooter) siteFooter.style.display = "none";
  if (gameArea) gameArea.style.display = "block";

  updateStudentNameDisplay(studentName);
  updateCounters();
  document.getElementById("score").textContent = "0";
  if (levelDisplay) levelDisplay.textContent = "Nivel 1";

  showQuestion();
  startTimer();
}

function updateStudentNameDisplay(name) {
  let nameEl = document.getElementById("studentNameDisplay");
  if (!nameEl) {
    nameEl = document.createElement("div");
    nameEl.id = "studentNameDisplay";
    nameEl.style.cssText = "text-align:center;margin-bottom:1.2rem;padding:0.9rem;border-radius:12px;border:2px solid var(--border);background:#f8fafc;font-weight:700;";
    const header = document.querySelector(".game-header");
    if (header && header.parentNode) header.parentNode.insertBefore(nameEl, header.nextSibling);
  }
  nameEl.textContent = "Estudiante: " + name;
}

function updateCounters() {
  const c = document.getElementById("correctCount");
  const w = document.getElementById("wrongCount");
  if (c) c.textContent = state.aciertos;
  if (w) w.textContent = state.errores;
}

function generateQuestion(operation, level) {
  const cfg = operationsConfig[operation].levels[level];
  const min = cfg.min;
  const max = cfg.max;
  let a, b, answer;

  if (operation === "suma") {
    a = rand(min, max);
    b = rand(min, max);
    answer = a + b;
    return { question: a + " + " + b, answer: answer };
  }
  if (operation === "resta") {
    a = rand(min, max);
    b = rand(2, a);
    answer = a - b;
    return { question: a + " − " + b, answer: answer };
  }
  if (operation === "multiplicacion") {
    const hi = Math.min(max, 99);
    const lo = Math.max(2, Math.min(min, hi));
    a = rand(lo, hi);
    b = rand(2, Math.min(12 + level, 25));
    answer = a * b;
    return { question: a + " × " + b, answer: answer };
  }
  // division exacta
  b = rand(Math.max(2, Math.min(min, max)), Math.max(3, Math.min(max, 60)));
  if (b < 2) b = 2;
  const q = rand(2, Math.max(3, Math.min(25, Math.floor(max / b) || 5)));
  a = b * q;
  answer = q;
  return { question: a + " ÷ " + b, answer: answer };
}

function showQuestion() {
  if (!state.currentOperation) return;
  const q = generateQuestion(state.currentOperation, state.currentLevel);
  if (questionText) questionText.innerHTML = "<span>" + q.question + " = ?</span>";
  if (!answerButtons) return;

  answerButtons.innerHTML = "";
  const correctAnswer = q.answer;
  const wrongs = new Set();
  let guard = 0;
  while (wrongs.size < 3 && guard < 100) {
    guard++;
    let w;
    if (state.currentOperation === "division") w = correctAnswer + rand(-4, 4);
    else w = correctAnswer + rand(-8, 8);
    if (w >= 0 && w !== correctAnswer) wrongs.add(w);
  }
  const all = Array.from(wrongs).concat([correctAnswer]).sort(function () { return Math.random() - 0.5; });
  all.forEach(function (ans) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "answer-btn";
    btn.textContent = ans;
    btn.addEventListener("click", function () { checkAnswer(ans, correctAnswer, btn); });
    answerButtons.appendChild(btn);
  });

  state.questionsInCurrentLevel++;
  state.totalQuestions++;
}

function showFeedback(ok) {
  let bar = document.getElementById("feedbackBar");
  if (!bar) {
    bar = document.createElement("div");
    bar.id = "feedbackBar";
    bar.className = "feedback-bar";
    const card = document.getElementById("questionCard");
    if (card) card.appendChild(bar);
  }
  const quote = inspirationalQuotes[Math.floor(Math.random() * inspirationalQuotes.length)];
  bar.className = "feedback-bar show " + (ok ? "correct" : "wrong");
  bar.innerHTML = (ok ? "✅ ¡Correcto!" : "❌ Casi lo logras") +
    " &nbsp;|&nbsp; Aciertos: <strong>" + state.aciertos + "</strong> · Errores: <strong>" + state.errores + "</strong>" +
    "<br><em style='font-weight:400'>“" + quote.text + "” — " + quote.author + "</em>";
}

function checkAnswer(selected, correct, btn) {
  unlockAudio();
  const buttons = answerButtons ? answerButtons.querySelectorAll(".answer-btn") : [];
  buttons.forEach(function (b) {
    const v = parseInt(b.textContent, 10);
    if (v === correct) b.classList.add("correct");
    if (b === btn && v !== correct) b.classList.add("wrong");
    b.disabled = true;
  });

  if (selected === correct) {
    state.score += 10 * state.currentLevel;
    state.aciertos++;
    document.getElementById("score").textContent = state.score;
    updateCounters();
    showFeedback(true);
    celebrate(btn);
    setTimeout(function () {
      if (state.questionsInCurrentLevel >= getQuestionsForLevel()) nextLevel();
      else showQuestion();
    }, 1400);
  } else {
    state.errores++;
    updateCounters();
    showFeedback(false);
    errorShake(btn);
    setTimeout(function () { showQuestion(); }, 1800);
  }
}

function getQuestionsForLevel() {
  return operationsConfig[state.currentOperation].levels[state.currentLevel].count;
}

function nextLevel() {
  state.currentLevel++;
  state.questionsInCurrentLevel = 0;
  const maxLevel = Object.keys(operationsConfig[state.currentOperation].levels).length;
  if (state.currentLevel > maxLevel) {
    levelUpEffect();
    setTimeout(function () { endGame(true); }, 900);
    return;
  }
  levelUpEffect();
  if (levelDisplay) levelDisplay.textContent = "Nivel " + state.currentLevel;
  showQuestion();
  // El cronómetro NO se reinicia: los 60 segundos son únicos para todo el reto
}

function clearTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
}

let audioCtx = null;
let audioReady = false;

// Desbloquear audio DENTRO del gesto del usuario (clic). Sin esto el navegador lo silencia.
function unlockAudio() {
  try {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    if (!audioCtx) audioCtx = new AC();
    if (audioCtx.state === "suspended") {
      const p = audioCtx.resume();
      if (p && p.then) p.then(function () { audioReady = true; });
      else audioReady = true;
    } else {
      audioReady = true;
    }
  } catch (e) {}
}

function playTick(urgent) {
  try {
    if (!audioCtx || !audioReady) return;
    if (audioCtx.state === "suspended") {
      audioCtx.resume();
      return;
    }
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = "sine";
    osc.frequency.value = urgent ? 1320 : 880;
    const vol = urgent ? 0.22 : 0.14;
    const dur = urgent ? 0.16 : 0.1;
    gain.gain.setValueAtTime(vol, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + dur);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + dur);
  } catch (e) {}
}

function startTimer() {
  clearTimer();
  // Tiempo ÚNICO de 60 segundos para todo el reto: no se reinicia al acertar ni al subir de nivel
  const seconds = 60;
  let left = seconds;
  if (timerEl) {
    timerEl.textContent = left;
    timerEl.classList.remove("pulse-warn", "pulse-critical");
  }
  timerInterval = setInterval(function () {
    left--;
    playTick(left <= 5);
    if (timerEl) {
      timerEl.textContent = left;
      timerEl.classList.remove("pulse-warn", "pulse-critical");
      if (left <= 15 && left > 5) timerEl.classList.add("pulse-warn");
      if (left <= 5 && left > 0) timerEl.classList.add("pulse-critical");
    }
    if (left <= 0) {
      clearTimer();
      endGame(false);
    }
  }, 1000);
}

function endGame(victoria) {
  clearTimer();
  const prevMax = obtenerMaximoAciertos();
  const nuevoMax = state.aciertos > prevMax ? state.aciertos : prevMax;
  guardarMaximoAciertos(nuevoMax);

  if (gameArea) gameArea.style.display = "none";
  if (controlsOverlay) controlsOverlay.classList.add("active");

  const fs = document.getElementById("finalScore");
  if (fs) fs.textContent = state.score;
  const tc = document.getElementById("totalCorrect");
  if (tc) tc.textContent = state.aciertos;
  const tw = document.getElementById("totalWrong");
  if (tw) tw.textContent = state.errores;
  const mx = document.getElementById("maxAciertos");
  if (mx) mx.textContent = nuevoMax;

  const name = state.studentName || "Estudiante";
  const title = controlsOverlay ? controlsOverlay.querySelector("h2") : null;
  if (title) {
    title.textContent = victoria ? "¡VICTORIA TOTAL, " + name + "!" : "¡Buen esfuerzo, " + name + "!";
    title.style.color = victoria ? "#15803d" : "#b91c1c";
  }
  const sub = controlsOverlay ? controlsOverlay.querySelector(".subtitle") : null;
  if (sub) {
    sub.innerHTML = victoria
      ? "¡Felicitaciones, <strong>" + name + "</strong>! Completaste todos los niveles con <strong>" + state.aciertos + " aciertos</strong>."
      : "¡Buen esfuerzo, <strong>" + name + "</strong>! Lograste <strong>" + state.aciertos + " aciertos</strong> y " + state.errores + " errores.";
  }
  const qEl = document.getElementById("inspirationalQuote");
  if (qEl) {
    const q = inspirationalQuotes[Math.floor(Math.random() * inspirationalQuotes.length)];
    qEl.innerHTML = "<em>“" + q.text + "”</em><br><small>— " + q.author + "</small>";
  }
  if (victoria) levelUpEffect();
}

// Volver a la pantalla principal (botón ✕ o tecla Escape)
function goToMain() {
  clearTimer();
  const no = document.getElementById("nameOverlay");
  if (no) no.classList.remove("active");
  if (controlsOverlay) controlsOverlay.classList.remove("active");
  if (gameArea) gameArea.style.display = "none";
  if (controls) controls.style.display = "block";
  const mh = document.getElementById("mainHeader");
  if (mh) mh.style.display = "";
  const sft = document.getElementById("siteFooter");
  if (sft) sft.style.display = "";
  state.currentOperation = null;
  state.currentLevel = 1;
  state.score = 0;
  state.aciertos = 0;
  state.errores = 0;
  state.questionsInCurrentLevel = 0;
  state.totalQuestions = 0;
  state.pendingOperation = null;
  const sc = document.getElementById("score");
  if (sc) sc.textContent = "0";
  const lv = document.getElementById("levelDisplay");
  if (lv) lv.textContent = "Nivel 1";
  if (timerEl) {
    timerEl.textContent = "60";
    timerEl.classList.remove("pulse-warn", "pulse-critical");
  }
  updateCounters();
  initOperationButtons();
}

document.addEventListener("DOMContentLoaded", function () {
  createParticles();

  operationGrid = document.getElementById("operationGrid");
  gameArea = document.getElementById("gameArea");
  questionText = document.getElementById("questionText");
  answerButtons = document.getElementById("answerButtons");
  timerEl = document.getElementById("timer");
  levelDisplay = document.getElementById("levelDisplay");
  controlsOverlay = document.getElementById("controlsOverlay");
  finalScoreEl = document.getElementById("finalScore");
  restartBtn = document.getElementById("restartBtn");
  controls = document.getElementById("controls");
  nameOverlay = document.getElementById("nameOverlay");
  nameInput = document.getElementById("studentName");
  startChallengeBtn = document.getElementById("startChallengeBtn");

  initOperationButtons();
  updateCounters();

  if (nameInput && startChallengeBtn) {
    nameInput.addEventListener("input", function () {
      startChallengeBtn.disabled = nameInput.value.trim().length < 2;
    });
    nameInput.addEventListener("keydown", function (e) {
      if (e.key === "Enter" && !startChallengeBtn.disabled) {
        unlockAudio();
        const op = state.pendingOperation || "suma";
        nameOverlay.classList.remove("active");
        startGameWithName(op, nameInput.value.trim());
      }
    });
    startChallengeBtn.addEventListener("click", function () {
      unlockAudio();
      const op = state.pendingOperation || "suma";
      nameOverlay.classList.remove("active");
      startGameWithName(op, nameInput.value.trim());
    });
  }

  if (restartBtn) {
    restartBtn.addEventListener("click", function () {
      goToMain();
    });
  }

  const backBtn = document.getElementById("backBtn");
  if (backBtn) {
    backBtn.addEventListener("click", function () {
      goToMain();
    });
  }

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      const gameVisible = gameArea && gameArea.style.display !== "none";
      const nameOpen = nameOverlay && nameOverlay.classList.contains("active");
      const endOpen = controlsOverlay && controlsOverlay.classList.contains("active");
      if (gameVisible || nameOpen || endOpen) {
        goToMain();
      }
    }
  });
});
