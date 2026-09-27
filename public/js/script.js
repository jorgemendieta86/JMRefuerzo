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
const FAILED_ATTEMPTS_STORAGE_KEY = "reto_intentos_fallidos_v1";
const ACTIVE_SESSION_STORAGE_KEY = "reto_sesion_activa_v1";
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
  challengeEnded: false,
  challengeStartedAt: null,
  elapsedSeconds: 0,
  currentQuestion: null,
  answerOptions: []
};

let timerInterval = null;
let operationGrid, gameArea, questionText, answerButtons, timerEl, levelDisplay;
let controlsOverlay, finalScoreEl, restartBtn, controls;
let nameOverlay, nameInput, startChallengeBtn;
let signHint, signHintText;

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

function getActiveSession() {
  const session = readStoredValue(ACTIVE_SESSION_STORAGE_KEY, null);
  return session && session.studentName && session.currentOperation ? session : null;
}

function saveActiveSession() {
  if (!state.currentOperation || state.challengeEnded || !state.studentName) return;
  writeStoredValue(ACTIVE_SESSION_STORAGE_KEY, {
    studentName: state.studentName,
    currentOperation: state.currentOperation,
    currentLevel: state.currentLevel,
    score: state.score,
    aciertos: state.aciertos,
    errores: state.errores,
    questionsAnswered: state.questionsAnswered,
    totalQuestions: state.totalQuestions,
    elapsedSeconds: state.elapsedSeconds,
    currentQuestion: state.currentQuestion,
    answerOptions: state.answerOptions,
    savedAt: Date.now()
  });
}

function clearActiveSession() {
  try { localStorage.removeItem(ACTIVE_SESSION_STORAGE_KEY); } catch (e) {}
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

function getConsecutiveFailures(studentName, operation, level) {
  const attempts = readStoredValue(FAILED_ATTEMPTS_STORAGE_KEY, {});
  const record = attempts[getProgressKey(studentName, operation)];
  if (!record || parseInt(record.level, 10) !== level) return 0;

  const failures = parseInt(record.failures, 10);
  return failures >= 1 ? failures : 0;
}

function saveChallengeResult() {
  const challengePassed = state.aciertos >= QUESTIONS_PER_CHALLENGE;
  const previousFailures = getConsecutiveFailures(
    state.studentName,
    state.currentOperation,
    state.currentLevel
  );
  const failures = challengePassed ? 0 : previousFailures + 1;
  const lowerLevel = failures >= 2;
  const nextLevel = challengePassed
    ? Math.min(state.currentLevel + 1, MAX_LEVEL)
    : lowerLevel
      ? Math.max(state.currentLevel - 1, 1)
      : state.currentLevel;

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
    elapsedSeconds: state.elapsedSeconds,
    score: state.score,
    completedAt: new Date().toISOString()
  });
  writeStoredValue(HISTORY_STORAGE_KEY, history);

  const progress = readStoredValue(PROGRESS_STORAGE_KEY, {});
  progress[getProgressKey(state.studentName, state.currentOperation)] = nextLevel;
  writeStoredValue(PROGRESS_STORAGE_KEY, progress);

  const attempts = readStoredValue(FAILED_ATTEMPTS_STORAGE_KEY, {});
  const attemptKey = getProgressKey(state.studentName, state.currentOperation);
  if (failures > 0 && !lowerLevel) {
    attempts[attemptKey] = {
      level: state.currentLevel,
      failures: failures
    };
  } else {
    delete attempts[attemptKey];
  }
  writeStoredValue(FAILED_ATTEMPTS_STORAGE_KEY, attempts);

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

function formatElapsedTime(seconds) {
  const totalSeconds = Math.max(0, Math.floor(Number(seconds) || 0));
  const minutes = Math.floor(totalSeconds / 60);
  const remainingSeconds = totalSeconds % 60;
  return String(minutes).padStart(2, "0") + ":" + String(remainingSeconds).padStart(2, "0");
}

function formatStoredElapsedTime(seconds) {
  return seconds === undefined || seconds === null ? "-" : formatElapsedTime(seconds);
}

function exportResultsToPdf() {
  const pdfApi = window.jspdf;
  if (!pdfApi || !pdfApi.jsPDF) {
    window.alert("No se pudo cargar el generador de PDF. Comprueba tu conexión e inténtalo nuevamente.");
    return;
  }

  const filterEl = document.getElementById("historyStudentFilter");
  const activeFilter = filterEl ? filterEl.value : "all";
  if (activeFilter === "all") {
    window.alert("Selecciona un estudiante para guardar sus resultados.");
    return;
  }
  const history = getChallengeHistory().slice().reverse().filter(function (record) {
    return normalizeStudentName(record.studentName || "Estudiante") === activeFilter;
  });
  const selectedName = filterEl && filterEl.options[filterEl.selectedIndex]
    ? filterEl.options[filterEl.selectedIndex].text
    : "Estudiante";
  const doc = new pdfApi.jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  const columns = [
    { label: "Estudiante", width: 44 },
    { label: "Operacion", width: 34 },
    { label: "Nivel", width: 31 },
    { label: "Aciertos", width: 25 },
    { label: "Errores", width: 22 },
    { label: "Tiempo", width: 25 },
    { label: "Fecha", width: pageWidth - margin * 2 - 181 }
  ];

  function drawHeader() {
    doc.setTextColor(37, 99, 235);
    doc.setFontSize(17);
    doc.setFont(undefined, "bold");
    doc.text("Reforzando Operaciones Basicas", margin, 17);
    doc.setTextColor(71, 85, 105);
    doc.setFontSize(9);
    doc.setFont(undefined, "normal");
    doc.text("Institucion Educativa Jose Carlos Mariategui - Socchabamba, Ayabaca", margin, 23);
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(11);
    doc.setFont(undefined, "bold");
    doc.text("Resultados: " + selectedName, margin, 33);
    doc.setFontSize(8);
    doc.setFont(undefined, "normal");
    doc.text("Generado el " + formatHistoryDate(new Date().toISOString()), pageWidth - margin, 33, { align: "right" });
  }

  function drawTableHeader(y) {
    doc.setFillColor(239, 246, 255);
    doc.setDrawColor(191, 219, 254);
    doc.rect(margin, y - 5, pageWidth - margin * 2, 9, "FD");
    doc.setTextColor(30, 64, 175);
    doc.setFontSize(8);
    doc.setFont(undefined, "bold");
    let x = margin + 2;
    columns.forEach(function (column) {
      doc.text(column.label, x, y);
      x += column.width;
    });
  }

  drawHeader();
  let y = 45;
  drawTableHeader(y);
  y += 10;

  if (history.length === 0) {
    doc.setTextColor(71, 85, 105);
    doc.setFont(undefined, "normal");
    doc.setFontSize(10);
    doc.text("No hay resultados registrados para este filtro.", margin, y + 5);
  } else {
    history.forEach(function (record, index) {
      if (y > pageHeight - 15) {
        doc.addPage();
        drawHeader();
        y = 45;
        drawTableHeader(y);
        y += 10;
      }

      if (index % 2 === 0) {
        doc.setFillColor(248, 250, 252);
        doc.rect(margin, y - 5, pageWidth - margin * 2, 8, "F");
      }
      const values = [
        record.studentName || "Estudiante",
        record.operationName || (operationsConfig[record.operation] || {}).name || record.operation || "-",
        "Nivel " + (record.level || "-") + " > " + (record.nextLevel || "-"),
        String(record.aciertos || 0) + "/" + (record.totalQuestions || QUESTIONS_PER_CHALLENGE),
        String(record.errores || 0),
        formatStoredElapsedTime(record.elapsedSeconds),
        formatHistoryDate(record.completedAt)
      ];
      doc.setTextColor(15, 23, 42);
      doc.setFontSize(7.5);
      doc.setFont(undefined, "normal");
      let x = margin + 2;
      values.forEach(function (value, valueIndex) {
        doc.text(doc.splitTextToSize(String(value), columns[valueIndex].width - 4)[0], x, y);
        x += columns[valueIndex].width;
      });
      y += 8;
    });
  }

  const date = new Date().toISOString().slice(0, 10);
  const studentFileName = selectedName
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "estudiante";
  doc.save("resultados-" + studentFileName + "-" + date + ".pdf");
}

function updateExportButtonState() {
  const exportPdfBtn = document.getElementById("exportPdfBtn");
  const filterEl = document.getElementById("historyStudentFilter");
  if (exportPdfBtn) exportPdfBtn.disabled = !filterEl || filterEl.value === "all";
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
  updateExportButtonState();

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
    emptyCell.colSpan = 7;
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
      formatStoredElapsedTime(record.elapsedSeconds),
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
  const stored = getActiveSession();
  const sameSession = stored &&
    normalizeStudentName(stored.studentName) === normalizeStudentName(studentName) &&
    stored.currentOperation === operationKey &&
    Date.now() - Number(stored.savedAt || 0) < 24 * 60 * 60 * 1000;
  const resume = sameSession && window.confirm(
    "Tienes un reto pendiente de " + operationsConfig[operationKey].name + ". ¿Deseas continuar donde lo dejaste?"
  );

  state.studentName = studentName;
  state.currentOperation = operationKey;
  state.currentLevel = resume ? stored.currentLevel : getStudentOperationLevel(studentName, operationKey);
  state.score = resume ? stored.score : 0;
  state.aciertos = resume ? stored.aciertos : 0;
  state.errores = resume ? stored.errores : 0;
  state.questionsInCurrentLevel = resume ? stored.questionsAnswered : 0;
  state.questionsAnswered = resume ? stored.questionsAnswered : 0;
  state.totalQuestions = resume ? stored.totalQuestions : 0;
  state.challengeEnded = false;
  state.elapsedSeconds = resume ? stored.elapsedSeconds : 0;
  state.challengeStartedAt = resume
    ? Date.now() - state.elapsedSeconds * 1000
    : Date.now();
  state.currentQuestion = resume ? stored.currentQuestion : null;
  state.answerOptions = resume && Array.isArray(stored.answerOptions) ? stored.answerOptions : [];
  if (!resume) clearActiveSession();

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
  document.getElementById("score").textContent = state.score;
  if (levelDisplay) levelDisplay.textContent = "Nivel " + state.currentLevel;

  showQuestion();
  startTimer(resume);
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

function getMagnitudeRange(operation, level, questionIndex) {
  const occasionalSingleDigit = level === 1 && questionIndex % 5 === 0;
  if (occasionalSingleDigit) {
    return operation === "suma" || operation === "resta"
      ? { min: 1, max: 9 }
      : { min: 2, max: 9 };
  }

  const ranges = {
    1: { min: 10, max: 30 },
    2: { min: 10, max: 30 },
    3: { min: 20, max: 60 },
    4: { min: 40, max: 99 },
    5: { min: 100, max: 300 },
    6: { min: 200, max: 600 },
    7: { min: 400, max: 900 },
    8: { min: 500, max: 999 }
  };
  return ranges[level] || ranges[1];
}

function applySign(value, level) {
  if (value === 0) return value;
  return Math.random() < 0.5 ? -value : value;
}

function formatNumber(value) {
  return String(value);
}

function formatSignedOperation(a, b, operator, level) {
  const first = formatNumber(a, level);
  if (level === 1) {
    const magnitude = formatNumber(Math.abs(b), level);
    if (operator === "+") return first + (b < 0 ? " - " : " + ") + magnitude;
    return first + (b < 0 ? " + " : " - ") + magnitude;
  }
  const second = b < 0 ? "(" + formatNumber(b, level) + ")" : formatNumber(b, level);
  return first + " " + operator + " " + second;
}

function generateQuestion(operation, level, questionIndex) {
  const range = getMagnitudeRange(operation, level, questionIndex);
  let a, b, answer;

  if (operation === "suma") {
    a = applySign(rand(range.min, range.max), level);
    b = applySign(rand(range.min, range.max), level);
    answer = a + b;
    return { question: formatSignedOperation(a, b, "+", level), answer: answer, a: a, b: b };
  }
  if (operation === "resta") {
    const first = rand(range.min, range.max);
    const second = level < 2 ? rand(range.min, first) : rand(range.min, range.max);
    a = applySign(first, level);
    b = applySign(second, level);
    answer = a - b;
    return { question: formatSignedOperation(a, b, "-", level), answer: answer, a: a, b: b };
  }
  if (operation === "multiplicacion") {
    a = applySign(rand(range.min, range.max), level);
    b = applySign(rand(range.min, range.max), level);
    answer = a * b;
    const second = level === 1 ? formatNumber(b, level) : (b < 0 ? "(" + formatNumber(b, level) + ")" : formatNumber(b, level));
    return { question: formatNumber(a, level) + " × " + second, answer: answer, a: a, b: b };
  }

  const divisorMagnitude = rand(range.min, range.max);
  const quotientMin = range.min;
  const quotientMax = Math.max(quotientMin, range.max);
  const quotient = rand(quotientMin, quotientMax);
  a = applySign(divisorMagnitude * quotient, level);
  b = applySign(divisorMagnitude, level);
  answer = a / b;
  const divisorText = level === 1 ? formatNumber(b, level) : (b < 0 ? "(" + formatNumber(b, level) + ")" : formatNumber(b, level));
  return { question: formatNumber(a, level) + " ÷ " + divisorText, answer: answer, a: a, b: b };
}

function getDistractors(q, operation) {
  const values = operation === "suma"
    ? [q.a - q.b, -q.a + q.b, -q.answer]
    : operation === "resta"
      ? [q.a + q.b, q.b - q.a, -q.answer]
      : [-q.answer, Math.abs(q.answer), q.answer + 1];
  return values;
}

function getSignHint(operation) {
  const hints = {
    suma: "Con signos iguales, suma los valores y conserva el signo. Con signos diferentes, resta los valores y conserva el signo del número con mayor valor absoluto.",
    resta: "Convierte la resta en suma del opuesto: a - b = a + (-b). Después aplica la regla de la suma.",
    multiplicacion: "En la multiplicación: signos iguales dan positivo y signos diferentes dan negativo.",
    division: "En la división se aplica la misma regla: signos iguales dan cociente positivo y signos diferentes dan cociente negativo."
  };
  return hints[operation] || "Observa los signos y aplica la regla correspondiente.";
}

function showQuestion() {
  if (!state.currentOperation) return;
  if (state.aciertos >= QUESTIONS_PER_CHALLENGE) {
    endGame(true);
    return;
  }
  const q = state.currentQuestion || generateQuestion(state.currentOperation, state.currentLevel, state.questionsAnswered);
  state.currentQuestion = q;
  if (questionText) questionText.innerHTML = "<span>" + q.question + " = ?</span>";
  if (signHint) signHint.style.display = state.questionsAnswered === 0 ? "block" : "none";
  if (signHintText && state.questionsAnswered === 0) signHintText.textContent = getSignHint(state.currentOperation);
  if (!answerButtons) return;

  answerButtons.innerHTML = "";
  const correctAnswer = q.answer;
  const wrongs = new Set(getDistractors(q, state.currentOperation));
  wrongs.delete(correctAnswer);
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
  const generatedOptions = Array.from(wrongs).concat([correctAnswer]).sort(function () { return Math.random() - 0.5; });
  const all = state.answerOptions.length === 4 ? state.answerOptions : generatedOptions;
  state.answerOptions = all;
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
  saveActiveSession();
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
  if (signHint) signHint.style.display = "none";
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
    state.currentQuestion = null;
    state.answerOptions = [];
    saveActiveSession();
    showFeedback(true);
    celebrate(btn);
    setTimeout(function () {
      if (state.challengeEnded) return;
      if (state.aciertos >= QUESTIONS_PER_CHALLENGE) endGame(true);
      else showQuestion();
    }, 1400);
  } else {
    state.errores++;
    updateCounters();
    state.currentQuestion = null;
    state.answerOptions = [];
    saveActiveSession();
    showFeedback(false);
    errorShake(btn);
    setTimeout(function () {
      if (state.challengeEnded) return;
      if (state.aciertos >= QUESTIONS_PER_CHALLENGE) endGame(true);
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

function startTimer(preserveElapsed) {
  clearTimer();
  if (!state.challengeStartedAt) state.challengeStartedAt = Date.now();
  if (!preserveElapsed) state.elapsedSeconds = 0;
  if (timerEl) {
    timerEl.textContent = formatElapsedTime(state.elapsedSeconds);
    timerEl.classList.remove("pulse-warn", "pulse-critical");
  }
  timerInterval = setInterval(function () {
    state.elapsedSeconds = Math.floor((Date.now() - state.challengeStartedAt) / 1000);
    if (timerEl) {
      timerEl.textContent = formatElapsedTime(state.elapsedSeconds);
      timerEl.classList.remove("pulse-warn", "pulse-critical");
    }
  }, 1000);
}

function endGame() {
  if (state.challengeEnded) return;
  state.challengeEnded = true;
  clearTimer();
  state.elapsedSeconds = Math.floor((Date.now() - state.challengeStartedAt) / 1000);
  clearActiveSession();
  const retoSuperado = state.aciertos >= QUESTIONS_PER_CHALLENGE;
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
  const et = document.getElementById("elapsedTime");
  if (et) et.textContent = formatElapsedTime(state.elapsedSeconds);

  const name = state.studentName || "Estudiante";
  const title = controlsOverlay ? controlsOverlay.querySelector("h2") : null;
  if (title) {
    title.textContent = retoSuperado ? "¡Reto completado, " + name + "!" : "¡Buen esfuerzo, " + name + "!";
    title.style.color = retoSuperado ? "#15803d" : "#b91c1c";
  }
  const sub = controlsOverlay ? controlsOverlay.querySelector(".subtitle") : null;
  if (sub) {
    sub.innerHTML = retoSuperado
      ? "¡Felicitaciones, <strong>" + name + "</strong>! Lograste <strong>" + state.aciertos + " aciertos</strong>. Tu siguiente reto comenzará en el nivel <strong>" + nextLevel + "</strong>."
      : "¡Buen esfuerzo, <strong>" + name + "</strong>! Lograste <strong>" + state.aciertos + " aciertos</strong> y " + state.errores + " errores. Tu siguiente reto comenzará en el nivel <strong>" + nextLevel + "</strong>.";
  }
  const qEl = document.getElementById("inspirationalQuote");
  if (qEl) {
    const q = inspirationalQuotes[Math.floor(Math.random() * inspirationalQuotes.length)];
    qEl.innerHTML = "<em>“" + q.text + "”</em><br><small>— " + q.author + "</small>";
  }
  if (retoSuperado) levelUpEffect();
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
  state.challengeStartedAt = null;
  state.elapsedSeconds = 0;
  state.currentQuestion = null;
  state.answerOptions = [];
  const sc = document.getElementById("score");
  if (sc) sc.textContent = "0";
  const lv = document.getElementById("levelDisplay");
  if (lv) lv.textContent = "Nivel 1";
  if (timerEl) {
    timerEl.textContent = "00:00";
    timerEl.classList.remove("pulse-warn", "pulse-critical");
  }
  updateCounters();
  initOperationButtons();
  renderHistory();
}

document.addEventListener("DOMContentLoaded", function () {
  createParticles();

  const mainHeader = document.getElementById("mainHeader");
  const controlsEl = document.getElementById("controls");
  const siteFooter = document.getElementById("siteFooter");

  operationGrid = document.getElementById("operationGrid");
  gameArea = document.getElementById("gameArea");
  questionText = document.getElementById("questionText");
  answerButtons = document.getElementById("answerButtons");
  timerEl = document.getElementById("timer");
  levelDisplay = document.getElementById("levelDisplay");
  signHint = document.getElementById("signHint");
  signHintText = document.getElementById("signHintText");
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

  const exportPdfBtn = document.getElementById("exportPdfBtn");
  if (exportPdfBtn) exportPdfBtn.addEventListener("click", exportResultsToPdf);
  updateExportButtonState();

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

  document.addEventListener("visibilitychange", function () {
    if (document.visibilityState === "hidden") saveActiveSession();
  });
  window.addEventListener("pagehide", saveActiveSession);
});
