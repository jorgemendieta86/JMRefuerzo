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

const HISTORY_STORAGE_KEY = "reto_historial_v1";
const PROGRESS_STORAGE_KEY = "reto_progreso_v1";
const QUESTIONS_PER_CHALLENGE = 10;
const MAX_LEVEL = 8;

const operationsConfig = {
  suma: {
    name: "Suma",
    levels: {
      1: { min: 1, max: 9, count: QUESTIONS_PER_CHALLENGE },
      2: { min: 10, max: 30, count: QUESTIONS_PER_CHALLENGE },
      3: { min: 20, max: 60, count: QUESTIONS_PER_CHALLENGE },
      4: { min: 40, max: 99, count: QUESTIONS_PER_CHALLENGE },
      5: { min: 100, max: 300, count: QUESTIONS_PER_CHALLENGE },
      6: { min: 200, max: 600, count: QUESTIONS_PER_CHALLENGE },
      7: { min: 400, max: 900, count: QUESTIONS_PER_CHALLENGE },
      8: { min: 500, max: 999, count: QUESTIONS_PER_CHALLENGE }
    }
  },
  resta: {
    name: "Resta",
    levels: {
      1: { min: 1, max: 9, count: QUESTIONS_PER_CHALLENGE },
      2: { min: 10, max: 30, count: QUESTIONS_PER_CHALLENGE },
      3: { min: 20, max: 60, count: QUESTIONS_PER_CHALLENGE },
      4: { min: 40, max: 99, count: QUESTIONS_PER_CHALLENGE },
      5: { min: 100, max: 300, count: QUESTIONS_PER_CHALLENGE },
      6: { min: 200, max: 600, count: QUESTIONS_PER_CHALLENGE },
      7: { min: 400, max: 900, count: QUESTIONS_PER_CHALLENGE },
      8: { min: 500, max: 999, count: QUESTIONS_PER_CHALLENGE }
    }
  },
  multiplicacion: {
    name: "Multiplicación",
    levels: {
      1: { min: 2, max: 5, count: QUESTIONS_PER_CHALLENGE },
      2: { min: 2, max: 9, count: QUESTIONS_PER_CHALLENGE },
      3: { min: 3, max: 12, count: QUESTIONS_PER_CHALLENGE },
      4: { min: 4, max: 15, count: QUESTIONS_PER_CHALLENGE },
      5: { min: 6, max: 19, count: QUESTIONS_PER_CHALLENGE },
      6: { min: 7, max: 25, count: QUESTIONS_PER_CHALLENGE },
      7: { min: 9, max: 35, count: QUESTIONS_PER_CHALLENGE },
      8: { min: 11, max: 49, count: QUESTIONS_PER_CHALLENGE }
    }
  },
  division: {
    name: "División",
    levels: {
      1: { min: 2, max: 5, count: QUESTIONS_PER_CHALLENGE },
      2: { min: 2, max: 9, count: QUESTIONS_PER_CHALLENGE },
      3: { min: 3, max: 12, count: QUESTIONS_PER_CHALLENGE },
      4: { min: 4, max: 15, count: QUESTIONS_PER_CHALLENGE },
      5: { min: 5, max: 20, count: QUESTIONS_PER_CHALLENGE },
      6: { min: 6, max: 25, count: QUESTIONS_PER_CHALLENGE },
      7: { min: 7, max: 30, count: QUESTIONS_PER_CHALLENGE },
      8: { min: 8, max: 40, count: QUESTIONS_PER_CHALLENGE }
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
  questionsAnswered: 0,
  totalQuestions: 0,
  pendingOperation: null,
  challengeEnded: false
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

function readStoredValue(key, fallback) {
  try {
    const value = JSON.parse(localStorage.getItem(key));
    return value === null ? fallback : value;
  } catch (e) {
    return fallback;
  }
}

function writeStoredValue(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {}
}

function normalizeStudentName(name) {
  return String(name || "").trim().toLocaleLowerCase("es");
}

function getProgressKey(studentName, operation) {
  return normalizeStudentName(studentName) + "::" + operation;
}

function getChallengeHistory() {
  const history = readStoredValue(HISTORY_STORAGE_KEY, []);
  return Array.isArray(history) ? history : [];
}

function getStudentOperationLevel(studentName, operation) {
  const progress = readStoredValue(PROGRESS_STORAGE_KEY, {});
  const savedLevel = parseInt(progress[getProgressKey(studentName, operation)], 10);
  return savedLevel >= 1 && savedLevel <= MAX_LEVEL ? savedLevel : 1;
}

function saveChallengeResult() {
  const nextLevel = Math.min(state.currentLevel + 1, MAX_LEVEL);
  const history = getChallengeHistory();
  history.push({
    studentName: state.studentName || "Estudiante",
    operation: state.currentOperation,
    operationName: operationsConfig[state.currentOperation].name,
    level: state.currentLevel,
    nextLevel: nextLevel,
    aciertos: state.aciertos,
    errores: state.errores,
    totalQuestions: state.questionsAnswered,
    score: state.score,
    completedAt: new Date().toISOString()
  });
  writeStoredValue(HISTORY_STORAGE_KEY, history);

  const progress = readStoredValue(PROGRESS_STORAGE_KEY, {});
  progress[getProgressKey(state.studentName, state.currentOperation)] = nextLevel;
  writeStoredValue(PROGRESS_STORAGE_KEY, progress);
  renderHistory(state.studentName);
  return nextLevel;
}

function formatHistoryDate(value) {
  try {
    return new Intl.DateTimeFormat("es-PE", {
      dateStyle: "short",
      timeStyle: "short"
    }).format(new Date(value));
  } catch (e) {
    return "-";
  }
}

function renderHistory(selectedStudent) {
  const body = document.getElementById("historyTableBody");
  const countEl = document.getElementById("historyCount");
  const filterEl = document.getElementById("historyStudentFilter");
  if (!body) return;

  const history = getChallengeHistory().slice().reverse();
  const previousFilter = filterEl ? filterEl.value : "all";
  const studentNames = [];
  const studentKeys = new Set();

  history.forEach(function (record) {
    const name = record.studentName || "Estudiante";
    const key = normalizeStudentName(name);
    if (!studentKeys.has(key)) {
      studentKeys.add(key);
      studentNames.push({ key: key, name: name });
    }
  });

  if (filterEl) {
    filterEl.innerHTML = "";
    const allOption = document.createElement("option");
    allOption.value = "all";
    allOption.textContent = "Todos los estudiantes";
    filterEl.appendChild(allOption);

    studentNames.sort(function (a, b) {
      return a.name.localeCompare(b.name, "es");
    });
    studentNames.forEach(function (student) {
      const option = document.createElement("option");
      option.value = student.key;
      option.textContent = student.name;
      filterEl.appendChild(option);
    });

    const requestedFilter = selectedStudent
      ? normalizeStudentName(selectedStudent)
      : previousFilter;
    const hasRequestedStudent = requestedFilter === "all" || studentKeys.has(requestedFilter);
    filterEl.value = hasRequestedStudent ? requestedFilter : "all";
  }

  const activeFilter = filterEl ? filterEl.value : "all";
  const visibleHistory = activeFilter === "all"
    ? history
    : history.filter(function (record) {
      return normalizeStudentName(record.studentName || "Estudiante") === activeFilter;
    });

  body.innerHTML = "";
  if (countEl) countEl.textContent = visibleHistory.length + (visibleHistory.length === 1 ? " reto" : " retos");

  if (visibleHistory.length === 0) {
    const emptyRow = document.createElement("tr");
    emptyRow.className = "history-empty";
    const emptyCell = document.createElement("td");
    emptyCell.colSpan = 6;
    emptyCell.textContent = activeFilter === "all"
      ? "Todavía no hay retos registrados."
      : "Este estudiante todavía no tiene retos registrados.";
    emptyRow.appendChild(emptyCell);
    body.appendChild(emptyRow);
    return;
  }

  visibleHistory.forEach(function (record) {
    const row = document.createElement("tr");
    const values = [
      record.studentName || "Estudiante",
      record.operationName || (operationsConfig[record.operation] || {}).name || record.operation,
      "Nivel " + record.level + " → " + record.nextLevel,
      String(record.aciertos) + "/" + (record.totalQuestions || QUESTIONS_PER_CHALLENGE),
      String(record.errores),
      formatHistoryDate(record.completedAt)
    ];
    values.forEach(function (value, index) {
      const cell = document.createElement("td");
      cell.textContent = value;
      if (index === 3) cell.className = record.aciertos >= 10 ? "history-success" : "history-score";
      row.appendChild(cell);
    });
    body.appendChild(row);
  });
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
  state.currentLevel = getStudentOperationLevel(studentName, operationKey);
  state.score = 0;
  state.aciertos = 0;
  state.errores = 0;
  state.questionsInCurrentLevel = 0;
  state.questionsAnswered = 0;
  state.totalQuestions = 0;
  state.challengeEnded = false;

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
  if (levelDisplay) levelDisplay.textContent = "Nivel " + state.currentLevel;

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

function getMagnitudeRange(operation, level, twoDigits) {
  if (!twoDigits) {
    return operation === "suma" || operation === "resta"
      ? { min: 1, max: 9 }
      : { min: 2, max: 9 };
  }

  const growth = Math.max(0, level - 1);
  if (operation === "suma" || operation === "resta") {
    return { min: 10, max: Math.min(99, 20 + growth * 15) };
  }
  if (operation === "multiplicacion") {
    return { min: 10, max: Math.min(99, 20 + growth * 12) };
  }
  return { min: 10, max: Math.min(99, 24 + growth * 12) };
}

function applySign(value, level) {
  if (level < 2 || value === 0) return value;
  return Math.random() < 0.5 ? -value : value;
}

function formatNumber(value) {
  return String(value);
}

function formatSignedOperation(a, b, operator, level) {
  if (level < 2) return formatNumber(a, level) + " " + operator + " " + formatNumber(b, level);

  const first = formatNumber(a, level);
  const second = Math.abs(b);
  const secondText = formatNumber(second, level);

  if (operator === "+") {
    return first + (b < 0 ? " - " : " + ") + secondText;
  }
  return first + (b < 0 ? " + " : " - ") + secondText;
}

function generateQuestion(operation, level, questionIndex) {
  const twoDigits = questionIndex % 2 === 1;
  const range = getMagnitudeRange(operation, level, twoDigits);
  let a, b, answer;

  if (operation === "suma") {
    a = applySign(rand(range.min, range.max), level);
    b = applySign(rand(range.min, range.max), level);
    answer = a + b;
    return { question: formatSignedOperation(a, b, "+", level), answer: answer };
  }
  if (operation === "resta") {
    const first = rand(range.min, range.max);
    const second = level < 2 ? rand(range.min, first) : rand(range.min, range.max);
    a = applySign(first, level);
    b = applySign(second, level);
    answer = a - b;
    return { question: formatSignedOperation(a, b, "-", level), answer: answer };
  }
  if (operation === "multiplicacion") {
    a = applySign(rand(range.min, range.max), level);
    b = applySign(rand(2, Math.min(9, 5 + level)), level);
    answer = a * b;
    return { question: formatNumber(a, level) + " × " + formatNumber(b, level), answer: answer };
  }

  // División exacta, con dividendo de una o dos cifras según la posición.
  const divisorMagnitude = rand(2, Math.min(9, 3 + level, range.max));
  const quotientMin = twoDigits ? Math.max(1, Math.ceil(range.min / divisorMagnitude)) : 1;
  const quotientMax = Math.max(quotientMin, Math.floor(range.max / divisorMagnitude));
  const quotient = rand(quotientMin, quotientMax);
  a = applySign(divisorMagnitude * quotient, level);
  b = applySign(divisorMagnitude, level);
  answer = a / b;
  return { question: formatNumber(a, level) + " ÷ " + formatNumber(b, level), answer: answer };
}

function showQuestion() {
  if (!state.currentOperation) return;
  if (state.questionsAnswered >= getQuestionsForLevel()) {
    endGame(true);
    return;
  }
  const q = generateQuestion(state.currentOperation, state.currentLevel, state.questionsAnswered);
  if (questionText) questionText.innerHTML = "<span>" + q.question + " = ?</span>";
  if (!answerButtons) return;

  answerButtons.innerHTML = "";
  const correctAnswer = q.answer;
  const wrongs = new Set();
  let guard = 0;
  while (wrongs.size < 3 && guard < 100) {
    guard++;
    const delta = state.currentOperation === "division" ? rand(1, 5) : rand(1, 12);
    const w = correctAnswer + (Math.random() < 0.5 ? -delta : delta);
    if (w !== correctAnswer) wrongs.add(w);
  }
  let fallback = correctAnswer + 1;
  while (wrongs.size < 3) {
    if (fallback === correctAnswer) fallback++;
    wrongs.add(fallback++);
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

  state.questionsInCurrentLevel = state.questionsAnswered + 1;
  state.totalQuestions = state.questionsAnswered + 1;
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
  if (state.challengeEnded) return;
  const buttons = answerButtons ? answerButtons.querySelectorAll(".answer-btn") : [];
  buttons.forEach(function (b) {
    const v = Number(b.textContent);
    if (v === correct) b.classList.add("correct");
    if (b === btn && v !== correct) b.classList.add("wrong");
    b.disabled = true;
  });

  state.questionsAnswered++;
  state.questionsInCurrentLevel = state.questionsAnswered;
  state.totalQuestions = state.questionsAnswered;

  if (selected === correct) {
    state.score += 10 * state.currentLevel;
    state.aciertos++;
    document.getElementById("score").textContent = state.score;
    updateCounters();
    showFeedback(true);
    celebrate(btn);
    setTimeout(function () {
      if (state.challengeEnded) return;
      if (state.questionsAnswered >= getQuestionsForLevel()) endGame(true);
      else showQuestion();
    }, 1400);
  } else {
    state.errores++;
    updateCounters();
    showFeedback(false);
    errorShake(btn);
    setTimeout(function () {
      if (state.challengeEnded) return;
      if (state.questionsAnswered >= getQuestionsForLevel()) endGame(true);
      else showQuestion();
    }, 1800);
  }
}

function getQuestionsForLevel() {
  return operationsConfig[state.currentOperation].levels[state.currentLevel].count;
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
  if (state.challengeEnded) return;
  state.challengeEnded = true;
  clearTimer();
  const nextLevel = saveChallengeResult();
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
    title.textContent = victoria ? "¡Reto completado, " + name + "!" : "¡Buen esfuerzo, " + name + "!";
    title.style.color = victoria ? "#15803d" : "#b91c1c";
  }
  const sub = controlsOverlay ? controlsOverlay.querySelector(".subtitle") : null;
  if (sub) {
    sub.innerHTML = victoria
      ? "¡Felicitaciones, <strong>" + name + "</strong>! Lograste <strong>" + state.aciertos + " aciertos</strong>. Tu siguiente reto comenzará en el nivel <strong>" + nextLevel + "</strong>."
      : "¡Buen esfuerzo, <strong>" + name + "</strong>! Lograste <strong>" + state.aciertos + " aciertos</strong> y " + state.errores + " errores. Tu siguiente reto comenzará en el nivel <strong>" + nextLevel + "</strong>.";
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
  state.questionsAnswered = 0;
  state.totalQuestions = 0;
  state.pendingOperation = null;
  state.challengeEnded = false;
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
  renderHistory();
}

document.addEventListener("DOMContentLoaded", function () {
  createParticles();

  const welcomeOverlay = document.getElementById("welcomeOverlay");
  const closeWelcomeBtn = document.getElementById("closeWelcomeBtn");
  const mainHeader = document.getElementById("mainHeader");
  const controlsEl = document.getElementById("controls");
  const siteFooter = document.getElementById("siteFooter");

  if (mainHeader) mainHeader.style.display = "none";
  if (controlsEl) controlsEl.style.display = "none";
  if (siteFooter) siteFooter.style.display = "none";

  if (welcomeOverlay && closeWelcomeBtn) {
    closeWelcomeBtn.addEventListener("click", function () {
      unlockAudio();
      welcomeOverlay.classList.remove("active");
      if (mainHeader) mainHeader.style.display = "";
      if (controlsEl) controlsEl.style.display = "block";
      if (siteFooter) siteFooter.style.display = "";
    });
  }

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
  renderHistory();

  const historyStudentFilter = document.getElementById("historyStudentFilter");
  if (historyStudentFilter) {
    historyStudentFilter.addEventListener("change", function () {
      renderHistory();
    });
  }

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
