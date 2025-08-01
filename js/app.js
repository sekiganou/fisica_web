/**
 * Quiz EGID - File principale dell'applicazione
 * Gestisce la logica del quiz, le transizioni tra schermate,
 * il salvataggio delle statistiche e l'interazione con l'utente
 */

// Stato dell'applicazione
const appState = {
  // Domande e stati del quiz
  questions: [],
  currentQuestions: [],
  currentQuestionIndex: 0,
  selectedCategory: null,
  selectedAnswerIndex: null,
  userAnswers: [], // Array per memorizzare le risposte dell'utente
  quizType: null, // Tipo di quiz: 'random', 'topic', 'all', 'from_question'
  startQuestionNumber: null, // Per quiz "inizia da domanda"

  // Statistiche della sessione corrente
  correctAnswers: 0,
  incorrectAnswers: 0,
  quizStartTime: null,

  // Statistiche complessive (persistenti)
  stats: {
    totalQuestions: 0,
    totalCorrect: 0,
    totalIncorrect: 0,
    categoryStats: {},
    quizHistory: [],
  },
};

// Elementi DOM
const screens = {
  welcome: document.getElementById("welcome-screen"),
  topicSelect: document.getElementById("topic-select-screen"),
  questionSelect: document.getElementById("question-select-screen"),
  quiz: document.getElementById("quiz-screen"),
  result: document.getElementById("result-screen"),
  review: document.getElementById("review-screen"),
  stats: document.getElementById("stats-screen"),
};

// Carica le domande e inizializza l'app
window.addEventListener("DOMContentLoaded", async () => {
  // Carica le statistiche salvate
  loadStats();

  // Carica tutte le domande
  appState.questions = await loadAllQuestionsAndImages();

  // Inizializza gli event listener
  initEventListeners();

  // Carica le categorie nella schermata di selezione
  loadTopics();

  // Aggiorna statistiche UI
  updateStatsUI();
});

// Inizializza tutti gli event listener dell'app
function initEventListeners() {
  // Navigazione principale
  document
    .getElementById("startRandomBtn")
    .addEventListener("click", startRandomQuiz);
  document
    .getElementById("startTopicBtn")
    .addEventListener("click", () => showScreen("topicSelect"));
  document
    .getElementById("startAllQuizBtn")
    .addEventListener("click", startAllQuestions);
  document
    .getElementById("startFromQuestionBtn")
    .addEventListener("click", () => showScreen("questionSelect"));
  document
    .getElementById("backFromTopicsBtn")
    .addEventListener("click", () => showScreen("welcome"));
  document
    .getElementById("backFromQuestionSelectBtn")
    .addEventListener("click", () => showScreen("welcome"));
  document
    .getElementById("statsBtn")
    .addEventListener("click", () => showScreen("stats"));
  document
    .getElementById("closeStatsBtn")
    .addEventListener("click", () => showScreen("welcome"));

  // Selezione domanda di partenza
  document
    .getElementById("startQuestionNumber")
    .addEventListener("input", updateQuestionPreview);
  document
    .getElementById("startFromSelectedBtn")
    .addEventListener("click", startFromSelectedQuestion);

  // Quiz
  document
    .getElementById("nextQuestionBtn")
    .addEventListener("click", nextQuestion);
  document
    .getElementById("quitQuizBtn")
    .addEventListener("click", () => showScreen("welcome"));
  document
    .getElementById("fullscreenBtn")
    .addEventListener("click", toggleFullscreen);

  // Risultati
  document.getElementById("reviewBtn").addEventListener("click", reviewAnswers);
  document
    .getElementById("newQuizBtn")
    .addEventListener("click", () => showScreen("welcome"));

  // Revisione
  document
    .getElementById("backToResultsBtn")
    .addEventListener("click", () => showScreen("result"));
  document
    .getElementById("newQuizFromReviewBtn")
    .addEventListener("click", () => showScreen("welcome"));

  // Reset
  document
    .getElementById("resetBtn")
    .addEventListener("click", showResetConfirmation);
  document
    .getElementById("confirmResetBtn")
    .addEventListener("click", resetAllStats);
  document
    .getElementById("cancelResetBtn")
    .addEventListener("click", hideModal);

  // Sources info modal
  document
    .getElementById("sourcesInfoBtn")
    .addEventListener("click", toggleSourcesModal);
  document
    .getElementById("closeSourcesModal")
    .addEventListener("click", hideSourcesModal);

  // Filtro AI
  document
    .getElementById("includeAIQuestions")
    .addEventListener("change", updateQuestionCount);
}

// Carica le categorie nella schermata di selezione degli argomenti
function loadTopics() {
  const filteredQuestions = getFilteredQuestions();
  const topics = getAllCategories(filteredQuestions);
  const topicsContainer = document.getElementById("topicsContainer");

  topicsContainer.innerHTML = "";

  topics.forEach((topic) => {
    const topicCard = document.createElement("div");
    topicCard.className = "topic-card";
    topicCard.setAttribute("data-topic", topic);

    // Calcola statistiche per il topic usando domande filtrate
    const topicQuestions = filteredQuestions.filter(
      (q) => q.category === topic
    ).length;
    const topicStats = appState.stats.categoryStats[topic] || {
      correct: 0,
      incorrect: 0,
      total: 0,
    };

    const completionPercentage =
      topicQuestions > 0
        ? Math.round((topicStats.total / topicQuestions) * 100)
        : 0;

    const successRate =
      topicStats.total > 0
        ? Math.round((topicStats.correct / topicStats.total) * 100)
        : 0;

    topicCard.innerHTML = `
            <h3>${topic}</h3>
            <div class="topic-stats">
                <span>${topicQuestions} domande</span>
                <span>${completionPercentage}% usate</span>
                <span>${successRate}% corrette</span>
            </div>
        `;

    topicCard.addEventListener("click", () => {
      startTopicQuiz(topic);
    });

    topicsContainer.appendChild(topicCard);
  });
}

// Avvia un quiz con domande casuali
function startRandomQuiz() {
  // Prendi 12 domande casuali filtrate in base alle preferenze AI
  const filteredQuestions = getFilteredQuestions();
  const shuffled = shuffleArray(filteredQuestions);
  const numQuestions = Math.min(12, shuffled.length);
  appState.currentQuestions = shuffled.slice(0, numQuestions);

  // Mescola anche le risposte di ogni domanda
  appState.currentQuestions = appState.currentQuestions.map((q) =>
    shuffleAnswers(q)
  );

  // Imposta il tipo di quiz
  appState.quizType = "random";

  // Traccia l'evento con Plausible
  trackEvent("quiz_started", {
    type: "random",
    questions_count: numQuestions,
    ai_included: document.getElementById("includeAIQuestions").checked,
  });

  // Inizia il quiz
  startQuiz();
}

// Avvia un quiz con domande di una specifica categoria
function startTopicQuiz(topic) {
  // Filtra le domande per categoria e preferenze AI
  const filteredQuestions = getFilteredQuestions();
  const topicQuestions = filteredQuestions.filter((q) => q.category === topic);

  // Mescola e prendi fino a 12 domande
  const shuffled = shuffleArray(topicQuestions);
  const numQuestions = Math.min(12, shuffled.length);

  appState.currentQuestions = shuffled.slice(0, numQuestions);
  appState.selectedCategory = topic;
  appState.quizType = "topic";

  // Mescola anche le risposte di ogni domanda
  appState.currentQuestions = appState.currentQuestions.map((q) =>
    shuffleAnswers(q)
  );

  // Traccia l'evento con Plausible
  trackEvent("quiz_started", {
    type: "topic",
    topic: topic,
    questions_count: numQuestions,
    ai_included: document.getElementById("includeAIQuestions").checked,
  });

  // Inizia il quiz
  startQuiz();
}

// Avvia un quiz con TUTTE le domande disponibili
function startAllQuestions() {
  // Prendi tutte le domande filtrate in base alle preferenze AI
  const filteredQuestions = getFilteredQuestions();
  appState.currentQuestions = shuffleArray(filteredQuestions.slice());
  appState.quizType = "all";

  // Mescola anche le risposte di ogni domanda
  appState.currentQuestions = appState.currentQuestions.map((q) =>
    shuffleAnswers(q)
  );

  // Traccia l'evento con Plausible
  trackEvent("quiz_started", {
    type: "all_questions",
    questions_count: appState.currentQuestions.length,
    ai_included: document.getElementById("includeAIQuestions").checked,
  });

  // Inizia il quiz
  startQuiz();
}

// Carica i dati per la schermata di selezione domanda
function loadQuestionSelector() {
  const filteredQuestions = getFilteredQuestions();
  const totalQuestions = filteredQuestions.length;
  const aiQuestions = appState.questions.filter((q) =>
    q.text.includes("(AI)")
  ).length;
  const includeAI = document.getElementById("includeAIQuestions").checked;

  document.getElementById(
    "totalAvailableQuestions"
  ).textContent = `${totalQuestions} ${
    includeAI ? "(con " + aiQuestions + " AI)" : "(senza AI)"
  }`;
  document.getElementById("maxQuestionNumber").textContent = totalQuestions;
  document.getElementById("startQuestionNumber").max = totalQuestions;
  document.getElementById("startQuestionNumber").value = 1;
  updateQuestionPreview();
}

// Aggiorna l'anteprima della domanda selezionata
function updateQuestionPreview() {
  const questionNumber = parseInt(
    document.getElementById("startQuestionNumber").value
  );
  const previewElement = document.getElementById("questionPreview");
  const filteredQuestions = getFilteredQuestions();

  if (questionNumber >= 1 && questionNumber <= filteredQuestions.length) {
    const question = filteredQuestions[questionNumber - 1];
    const isAIGenerated = question.text.includes("(AI)");

    if (isAIGenerated) {
      // Rimuovi (AI) dal testo e aggiungi icona
      const cleanQuestionText = question.text.replace(/\s*\(AI\)\s*$/, "");
      previewElement.innerHTML = `${cleanQuestionText} <span class="ai-indicator" title="Domanda generata da AI">AI</span>`;
    } else {
      previewElement.textContent = question.text;
    }

    previewElement.style.fontStyle = "normal";
    previewElement.style.color = "var(--gray-800)";
  } else {
    previewElement.textContent =
      "Seleziona un numero di domanda valido per vedere l'anteprima";
    previewElement.style.fontStyle = "italic";
    previewElement.style.color = "var(--gray-500)";
  }
}

// Avvia il quiz da una domanda specifica
function startFromSelectedQuestion() {
  const startNumber = parseInt(
    document.getElementById("startQuestionNumber").value
  );
  const filteredQuestions = getFilteredQuestions();

  if (startNumber < 1 || startNumber > filteredQuestions.length) {
    alert("Numero di domanda non valido!");
    return;
  }

  // Prendi le domande dalla posizione selezionata fino alla fine (usando domande filtrate)
  const questionsFromStart = filteredQuestions.slice(startNumber - 1);
  appState.currentQuestions = questionsFromStart.map((q) => shuffleAnswers(q));
  appState.quizType = "from_question";
  appState.startQuestionNumber = startNumber;

  // Traccia l'evento con Plausible
  trackEvent("quiz_started", {
    type: "from_question",
    start_question: startNumber,
    questions_count: appState.currentQuestions.length,
    ai_included: document.getElementById("includeAIQuestions").checked,
  });

  // Inizia il quiz
  startQuiz();
}

// Inizializza un nuovo quiz
function startQuiz() {
  // Reset stato quiz
  appState.currentQuestionIndex = 0;
  appState.correctAnswers = 0;
  appState.incorrectAnswers = 0;
  appState.selectedAnswerIndex = null;
  appState.userAnswers = []; // Reset dell'array delle risposte
  appState.quizStartTime = new Date();

  // Aggiorna informazioni tipo quiz
  updateQuizTypeInfo();

  // Aggiorna UI
  updateQuizUI();

  // Mostra schermata quiz
  showScreen("quiz");
}

// Passa alla prossima domanda o termina il quiz
function nextQuestion() {
  // Se non è stata selezionata una risposta, non fare nulla
  if (appState.selectedAnswerIndex === null) return;

  // Controlla se la risposta è corretta
  const currentQuestion =
    appState.currentQuestions[appState.currentQuestionIndex];
  const isCorrect =
    appState.selectedAnswerIndex === currentQuestion.correctIndex;

  // Salva la risposta dell'utente
  appState.userAnswers[appState.currentQuestionIndex] =
    appState.selectedAnswerIndex;

  // Aggiorna le statistiche
  if (isCorrect) {
    appState.correctAnswers++;
  } else {
    appState.incorrectAnswers++;
  }

  // Traccia la risposta con Plausible
  trackEvent("answer_submitted", {
    question_index: appState.currentQuestionIndex,
    question_category: currentQuestion.category,
    is_correct: isCorrect,
    question_text: currentQuestion.text.substring(0, 50) + "...", // Includi un estratto breve della domanda
  });

  // Aggiorna statistiche persistenti
  updatePersistentStats(currentQuestion.category, isCorrect);

  // Passa alla prossima domanda o termina il quiz
  appState.currentQuestionIndex++;

  // Reset selezione risposta
  appState.selectedAnswerIndex = null;

  // Controlla se il quiz è finito
  if (appState.currentQuestionIndex >= appState.currentQuestions.length) {
    finishQuiz();
  } else {
    updateQuizUI();
  }
}

// Finalizza il quiz e mostra i risultati
function finishQuiz() {
  // Calcola il tempo impiegato
  const endTime = new Date();
  const timeElapsed = Math.round((endTime - appState.quizStartTime) / 1000); // in secondi

  // Formatta il tempo mm:ss
  const minutes = Math.floor(timeElapsed / 60);
  const seconds = timeElapsed % 60;
  const formattedTime = `${minutes}:${seconds.toString().padStart(2, "0")}`;

  // Calcola il punteggio su scala 0-31
  const totalQuestions = appState.currentQuestions.length;
  const score = Math.round((appState.correctAnswers / totalQuestions) * 31);

  // Determina se promosso (18/31 = soglia di promozione)
  const isPromoted = score >= 18;
  const promotionStatus = isPromoted ? "✅ PROMOSSO" : "❌ BOCCIATO";

  // Calcola anche la percentuale per il tracking
  const correctPercentage =
    totalQuestions > 0
      ? Math.round((appState.correctAnswers / totalQuestions) * 100)
      : 0;

  // Traccia il completamento del quiz con Plausible
  trackEvent("quiz_completed", {
    category: appState.selectedCategory || "Random",
    correct_answers: appState.correctAnswers,
    total_questions: totalQuestions,
    score_31: score,
    is_promoted: isPromoted,
    success_rate: correctPercentage,
    time_taken: timeElapsed,
    avg_time_per_question: Math.round(timeElapsed / totalQuestions),
  });

  // Aggiorna interfaccia risultati
  document.getElementById("finalScore").textContent = `${score}/31`;
  document.getElementById("finalCorrect").textContent = appState.correctAnswers;
  document.getElementById("finalIncorrect").textContent =
    appState.incorrectAnswers;
  document.getElementById("quizTime").textContent = formattedTime;

  // Aggiorna stato promozione
  const promotionElement = document.getElementById("promotionStatus");
  promotionElement.textContent = promotionStatus;
  promotionElement.className = `promotion-status ${
    isPromoted ? "promoted" : "failed"
  }`;

  // Salva risultati nella cronologia
  appState.stats.quizHistory.push({
    date: new Date().toISOString(),
    category: appState.selectedCategory || "Random",
    correct: appState.correctAnswers,
    incorrect: appState.incorrectAnswers,
    total: totalQuestions,
    score: score,
    isPromoted: isPromoted,
    time: timeElapsed,
    questions: appState.currentQuestions,
    userAnswers: appState.userAnswers || [],
  });

  // Salva nella local storage
  saveStats();

  // Mostra schermata risultati
  showScreen("result");
}

// Aggiorna l'interfaccia del quiz con la domanda corrente
function updateQuizUI() {
  const currentQuestion =
    appState.currentQuestions[appState.currentQuestionIndex];
  const totalQuestions = appState.currentQuestions.length;

  // Aggiorna indicatori di progresso
  document.getElementById("currentQuestionNumber").textContent =
    appState.currentQuestionIndex + 1;
  document.getElementById("totalQuestions").textContent = totalQuestions;
  document.getElementById("progressFill").style.width = `${
    ((appState.currentQuestionIndex + 1) / totalQuestions) * 100
  }%`;

  // Aggiorna contatori risposte
  document.getElementById("correctCount").textContent = appState.correctAnswers;
  document.getElementById("incorrectCount").textContent =
    appState.incorrectAnswers;

  // Aggiorna la domanda con icona AI se necessario
  const questionElement = document.getElementById("questionText");
  const questionImageElement = document.getElementById("questionImage");
  const isAIGenerated = currentQuestion.text.includes("(AI)");

  if (isAIGenerated) {
    // Rimuovi (AI) dal testo della domanda
    const cleanQuestionText = currentQuestion.text.replace(/\s*\(AI\)\s*$/, "");
    questionElement.innerHTML = `${cleanQuestionText} <span class="ai-indicator" title="Domanda generata da AI">AI</span>`;
  } else {
    questionElement.textContent = currentQuestion.text;
  }
  console.log("Immagine associata alla domanda:", currentQuestion.image);
  if (currentQuestion.image && currentQuestion.image.trim() !== "") {
    questionImageElement.setAttribute("src", currentQuestion.image);
    questionImageElement.style.display = "";
  } else {
    questionImageElement.removeAttribute("src");
    questionImageElement.style.display = "none";
  }

  // Aggiorna le risposte
  const answersContainer = document.getElementById("answersContainer");
  answersContainer.innerHTML = "";

  currentQuestion.answers.forEach((answer, index) => {
    const answerElement = document.createElement("div");
    answerElement.className = "answer-option";
    answerElement.innerHTML = `
            <div class="answer-indicator">${String.fromCharCode(
              65 + index
            )}</div>
            <div class="answer-text">${answer}</div>
        `;

    // Aggiungi event listener per selezionare la risposta
    answerElement.addEventListener("click", () => {
      selectAnswer(index, answersContainer);
    });

    answersContainer.appendChild(answerElement);
  });

  // Disabilita pulsante prossima domanda finché non viene selezionata una risposta
  document.getElementById("nextQuestionBtn").disabled = true;
}

// Gestisce la selezione di una risposta
function selectAnswer(index, container) {
  // Se è già stata selezionata una risposta, ignora
  if (appState.selectedAnswerIndex !== null) return;

  // Aggiorna lo stato
  appState.selectedAnswerIndex = index;

  // Aggiorna UI
  const answerElements = container.querySelectorAll(".answer-option");

  answerElements.forEach((el, i) => {
    // Rimuovi classi precedenti
    el.classList.remove("selected", "correct", "incorrect");

    // Aggiungi classe appropriata
    if (i === index) {
      el.classList.add("selected");

      const currentQuestion =
        appState.currentQuestions[appState.currentQuestionIndex];
      if (i === currentQuestion.correctIndex) {
        el.classList.add("correct");
      } else {
        el.classList.add("incorrect");

        // Mostra la risposta corretta
        answerElements[currentQuestion.correctIndex].classList.add("correct");
      }
    }
  });

  // Abilita pulsante prossima domanda
  document.getElementById("nextQuestionBtn").disabled = false;

  // Passa automaticamente alla prossima domanda dopo 1.5 secondi
  setTimeout(() => {
    nextQuestion();
  }, 1500);
}

// Filtra le domande in base alle preferenze AI
function getFilteredQuestions(questions = appState.questions) {
  const includeAI = document.getElementById("includeAIQuestions").checked;

  if (includeAI) {
    return questions; // Restituisce tutte le domande
  } else {
    return questions.filter((question) => !question.text.includes("(AI)")); // Esclude domande AI
  }
}

// Aggiorna il conteggio delle domande quando cambia il filtro AI
function updateQuestionCount() {
  const includeAI = document.getElementById("includeAIQuestions").checked;
  const totalQuestions = appState.questions.length;
  const aiQuestions = appState.questions.filter((q) =>
    q.text.includes("(AI)")
  ).length;
  const filteredQuestions = getFilteredQuestions().length;

  console.log(
    `📊 Filtro AI ${
      includeAI ? "ATTIVO" : "DISATTIVO"
    }: ${filteredQuestions}/${totalQuestions} domande disponibili (${aiQuestions} AI)`
  );

  // Aggiorna le informazioni nella schermata di selezione domanda se è aperta
  if (
    document
      .getElementById("question-select-screen")
      .classList.contains("active")
  ) {
    loadQuestionSelector();
  }
}

// Aggiorna le statistiche persistenti
function updatePersistentStats(category, isCorrect) {
  // Incrementa contatori globali
  appState.stats.totalQuestions++;

  if (isCorrect) {
    appState.stats.totalCorrect++;
  } else {
    appState.stats.totalIncorrect++;
  }

  // Aggiorna statistiche per categoria
  if (!appState.stats.categoryStats[category]) {
    appState.stats.categoryStats[category] = {
      total: 0,
      correct: 0,
      incorrect: 0,
    };
  }

  appState.stats.categoryStats[category].total++;

  if (isCorrect) {
    appState.stats.categoryStats[category].correct++;
  } else {
    appState.stats.categoryStats[category].incorrect++;
  }

  // Salva le statistiche
  saveStats();
}

// Aggiorna l'interfaccia della schermata statistiche
function updateStatsUI() {
  // Aggiorna contatori principali
  document.getElementById("statsTotalQuestions").textContent =
    appState.stats.totalQuestions;
  document.getElementById("statsTotalCorrect").textContent =
    appState.stats.totalCorrect;
  document.getElementById("statsTotalIncorrect").textContent =
    appState.stats.totalIncorrect;

  // Calcola e aggiorna il tasso di successo
  const successRate =
    appState.stats.totalQuestions > 0
      ? Math.round(
          (appState.stats.totalCorrect / appState.stats.totalQuestions) * 100
        )
      : 0;
  document.getElementById("statsSuccessRate").textContent = `${successRate}%`;

  // Traccia la visualizzazione delle statistiche con Plausible
  trackEvent("view_statistics", {
    total_questions: appState.stats.totalQuestions,
    success_rate: successRate,
    quiz_history_count: appState.stats.quizHistory.length,
    categories_count: Object.keys(appState.stats.categoryStats).length,
  });

  // Animazione dei contatori
  animateCounters();

  // Genera lista degli argomenti meno conosciuti
  if (Object.keys(appState.stats.categoryStats).length > 0) {
    generateLeastKnownTopicsList();
  }

  // Genera grafico performance se esiste cronologia
  if (appState.stats.quizHistory.length > 0) {
    generatePerformanceChart();
  }
}

// Funzione per animare i contatori nella schermata statistiche
function animateCounters() {
  const elements = document.querySelectorAll(".stats-counter");
  elements.forEach((el) => {
    // Aggiungi classi per animazione
    el.classList.add("animated-counter");
    setTimeout(() => {
      el.classList.add("counter-visible");
    }, 100);
  });
}

// Genera la lista degli argomenti meno conosciuti
function generateLeastKnownTopicsList() {
  const leastKnownTopicsContainer = document.getElementById("leastKnownTopics");
  leastKnownTopicsContainer.innerHTML = "";

  // Calcola il tasso di successo per ogni categoria
  const categoryRates = Object.entries(appState.stats.categoryStats)
    .map(([category, stats]) => {
      const successRate =
        stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;
      return { category, successRate, total: stats.total };
    })
    // Filtra le categorie con almeno 3 domande risposte
    .filter((item) => item.total >= 3)
    // Ordina per tasso di successo crescente
    .sort((a, b) => a.successRate - b.successRate);

  // Prendi i 5 argomenti peggiori
  const worstTopics = categoryRates.slice(0, 5);

  if (worstTopics.length === 0) {
    leastKnownTopicsContainer.innerHTML =
      "<p>Non ci sono ancora abbastanza dati per questo calcolo.</p>";
    return;
  }

  // Aggiungi alla lista
  worstTopics.forEach((topic) => {
    const listItem = document.createElement("li");
    listItem.innerHTML = `
            <span>${topic.category}</span>
            <span>${topic.successRate}% corretto (${topic.total} domande)</span>
        `;
    leastKnownTopicsContainer.appendChild(listItem);
  });
}

// Genera il grafico delle performance
function generatePerformanceChart() {
  const ctx = document.getElementById("performanceChart").getContext("2d");

  // Determina se siamo su dispositivo mobile
  const isMobile = window.innerWidth <= 480;

  // Prendi gli ultimi quiz (meno su mobile per una migliore visualizzazione)
  const maxQuizToShow = isMobile ? 3 : 10;
  const recentQuizzes = [...appState.stats.quizHistory]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, maxQuizToShow)
    .reverse();

  // Prepara i dati
  const labels = recentQuizzes.map((q, i) => {
    const date = new Date(q.date);
    const formattedDate = `${date.getDate()}/${date.getMonth() + 1}`;
    return `Quiz ${i + 1}\n${formattedDate}`;
  });
  const correctData = recentQuizzes.map((q) => q.correct);
  const incorrectData = recentQuizzes.map((q) => q.incorrect);
  const percentages = recentQuizzes.map((q) => {
    const total = q.correct + q.incorrect;
    return total > 0 ? Math.round((q.correct / total) * 100) : 0;
  });

  // Distruggi il grafico esistente se presente
  try {
    if (window.performanceChart instanceof Chart) {
      window.performanceChart.destroy();
    } else if (window.performanceChart) {
      delete window.performanceChart;
    }
  } catch (e) {
    console.error("Errore durante la distruzione del grafico:", e);
    // In caso di errore, assicuriamoci che la vecchia istanza sia rimossa
    delete window.performanceChart;
  }

  // Crea nuovo grafico
  window.performanceChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: labels,
      datasets: [
        {
          label: "Risposte corrette",
          data: correctData,
          backgroundColor: "#37b24d",
          borderColor: "#2b8a3e",
          borderWidth: 1,
        },
        {
          label: "Risposte errate",
          data: incorrectData,
          backgroundColor: "#e03131",
          borderColor: "#c92a2a",
          borderWidth: 1,
        },
      ],
    },
    options: {
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: "Numero di risposte",
          },
          stacked: true,
        },
        x: {
          title: {
            display: true,
            text: "Quiz recenti",
          },
        },
      },
      plugins: {
        legend: {
          position: "top",
          labels: {
            // Font più piccolo su dispositivi mobili
            font: {
              size: window.innerWidth <= 480 ? 10 : 12,
            },
            boxWidth: window.innerWidth <= 480 ? 10 : 15,
          },
        },
        title: {
          display: true,
          text: "Performance negli ultimi quiz",
          font: {
            size: window.innerWidth <= 480 ? 14 : 16,
            weight: "bold",
          },
          padding: {
            bottom: window.innerWidth <= 480 ? 10 : 15,
          },
        },
        tooltip: {
          callbacks: {
            afterBody: function (context) {
              const index = context[0].dataIndex;
              return `Percentuale di successo: ${percentages[index]}%`;
            },
          },
        },
        datalabels: {
          display: function (context) {
            return context.dataset.label === "Risposte corrette";
          },
          align: "top",
          anchor: "end",
          formatter: function (value, context) {
            const index = context.dataIndex;
            return percentages[index] + "%";
          },
          color: "#333",
          font: {
            weight: "bold",
          },
        },
      },
      responsive: true,
      maintainAspectRatio: false,
    },
  });
}

// Funzione per rivedere le risposte dell'ultimo quiz
function reviewAnswers() {
  // Aggiorna contatori nella schermata di revisione
  document.getElementById("reviewCorrect").textContent =
    appState.correctAnswers;
  document.getElementById("reviewIncorrect").textContent =
    appState.incorrectAnswers;

  // Traccia la revisione delle risposte con Plausible
  trackEvent("review_answers", {
    correct_answers: appState.correctAnswers,
    incorrect_answers: appState.incorrectAnswers,
    category: appState.selectedCategory || "Random",
  });

  // Ottieni il contenitore per le domande
  const reviewContainer = document.getElementById("reviewContainer");
  reviewContainer.innerHTML = "";

  // Per ogni domanda del quiz
  appState.currentQuestions.forEach((question, index) => {
    // Crea un elemento per la domanda
    const questionElement = document.createElement("div");
    questionElement.className = "review-question-item";

    // Determina se la risposta dell'utente era corretta
    const userAnswerIndex = getUserAnswerForQuestion(index);
    const isCorrect = userAnswerIndex === question.correctIndex;

    // Determina se la risposta dell'utente è quella corretta
    const userAnswer = question.answers[userAnswerIndex];
    const correctAnswer = question.answers[question.correctIndex];
    const isUserAnswerCorrect = userAnswerIndex === question.correctIndex;

    // Aggiungi la classe appropriata
    questionElement.classList.add(isCorrect ? "correct" : "incorrect");

    // Gestione icona AI per il testo della domanda
    const isAIGenerated = question.text.includes("(AI)");
    const questionImage = question.image || "";
    const questionTextHtml = isAIGenerated
      ? `${question.text.replace(
          /\s*\(AI\)\s*$/,
          ""
        )} <span class="ai-indicator" title="Domanda generata da AI">AI</span>`
      : question.text;

    // Contenuto HTML della domanda e risposte
    questionElement.innerHTML = `
            <div class="review-question-header">
                <div class="review-question-number">Domanda ${index + 1}</div>
                <div class="review-question-result ${
                  isCorrect ? "correct" : "incorrect"
                }">
                    ${
                      isCorrect
                        ? '<i class="fas fa-check"></i> Corretta'
                        : '<i class="fas fa-times"></i> Errata'
                    }
                </div>
            </div>
            <div class="review-question-text">${questionTextHtml}</div>
            <img src="${questionImage}" />
            <div class="review-answers-container">
                ${question.answers
                  .map(
                    (answer, answerIndex) => `
                    <div class="review-answer ${
                      answerIndex === question.correctIndex ? "correct" : ""
                    } ${
                      answerIndex === userAnswerIndex &&
                      answerIndex !== question.correctIndex
                        ? "incorrect"
                        : ""
                    }">
                        <div class="answer-indicator">${String.fromCharCode(
                          65 + answerIndex
                        )}</div>
                        <div class="answer-text">${answer}</div>
                        ${
                          answerIndex === question.correctIndex &&
                          answerIndex !== userAnswerIndex
                            ? '<div class="answer-tag correct"><i class="fas fa-check"></i> Corretta</div>'
                            : ""
                        }
                        ${
                          answerIndex === userAnswerIndex &&
                          answerIndex !== question.correctIndex
                            ? '<div class="answer-tag incorrect"><i class="fas fa-times"></i> La tua risposta</div>'
                            : ""
                        }
                        ${
                          answerIndex === userAnswerIndex &&
                          answerIndex === question.correctIndex
                            ? '<div class="answer-tag correct"><i class="fas fa-check"></i> La tua risposta</div>'
                            : ""
                        }
                    </div>
                `
                  )
                  .join("")}
            </div>
        `;

    // Aggiungi la domanda al contenitore
    reviewContainer.appendChild(questionElement);
  });

  // Mostra la schermata di revisione
  showScreen("review");
}

// Funzione di supporto per ottenere la risposta dell'utente a una specifica domanda
function getUserAnswerForQuestion(questionIndex) {
  // Ottieni la risposta dall'array userAnswers
  if (
    appState.userAnswers &&
    appState.userAnswers[questionIndex] !== undefined
  ) {
    return appState.userAnswers[questionIndex];
  }

  // Fallback nel caso non ci sia una risposta salvata
  return null;
}

// Mostra il modale di conferma reset
function showResetConfirmation() {
  const modal = document.getElementById("resetConfirmModal");
  modal.classList.add("show");
}

// Nasconde tutti i modali
function hideModal() {
  const modals = document.querySelectorAll(".modal");
  modals.forEach((modal) => modal.classList.remove("show"));
}

// Resetta tutte le statistiche
function resetAllStats() {
  // Traccia l'evento di reset con Plausible
  trackEvent("reset_stats", {
    previous_total_questions: appState.stats.totalQuestions,
    previous_quiz_history_count: appState.stats.quizHistory.length,
  });

  // Reset dello stato
  appState.stats = {
    totalQuestions: 0,
    totalCorrect: 0,
    totalIncorrect: 0,
    categoryStats: {},
    quizHistory: [],
  };

  // Salva stato vuoto
  saveStats();

  // Aggiorna UI
  loadTopics();
  updateStatsUI();

  // Nascondi modale
  hideModal();

  // Torna alla home
  showScreen("welcome");
}

// Cambia la schermata visibile
function showScreen(screenName) {
  // Nascondi tutte le schermate
  Object.values(screens).forEach((screen) => screen.classList.remove("active"));

  // Mostra la schermata richiesta
  screens[screenName].classList.add("active");

  // Aggiorna visibilità pulsante fullscreen
  updateFullscreenButtonVisibility(screenName);

  // Traccia il cambio di schermata con Plausible
  trackEvent("screen_view", {
    screen_name: screenName,
  });

  // Scorri alla sezione mostrata
  scrollToSection(screenName);

  // Azioni specifiche per schermata
  if (screenName === "stats") {
    updateStatsUI();
  } else if (screenName === "questionSelect") {
    loadQuestionSelector();
  }
}

// Funzione per scorrere fluidamente a una sezione specifica
function scrollToSection(screenName) {
  const screen = screens[screenName];
  if (screen) {
    // Scorri alla sezione con animazione fluida
    screen.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

// Carica le statistiche dal localStorage
function loadStats() {
  const savedStats = localStorage.getItem("egidQuizStats");

  if (savedStats) {
    try {
      appState.stats = JSON.parse(savedStats);
    } catch (e) {
      console.error("Errore nel parsing delle statistiche salvate:", e);
      // Inizializza con valori predefiniti in caso di errore
      resetAllStats();
    }
  }
}

// Salva le statistiche nel localStorage
function saveStats() {
  localStorage.setItem("egidQuizStats", JSON.stringify(appState.stats));
}

// Funzione helper per tracciare gli eventi con Plausible
function trackEvent(eventName, props = {}) {
  if (window.plausible) {
    window.plausible(eventName, { props });
    //console.log(`Evento tracciato: ${eventName}`, props);
  }
}

// Gestisce il cambio di orientamento del dispositivo
window.addEventListener("orientationchange", function () {
  // Attendi che il cambio di orientamento sia completo
  setTimeout(() => {
    // Rigenera il grafico se è presente
    if (
      appState.stats.quizHistory.length > 0 &&
      document.getElementById("stats-screen").classList.contains("active")
    ) {
      generatePerformanceChart();
    }
  }, 300);
});

// Funzione per gestire la modalità fullscreen
function toggleFullscreen() {
  const fullscreenBtn = document.getElementById("fullscreenBtn");
  const icon = fullscreenBtn.querySelector("i");

  if (
    !document.fullscreenElement &&
    !document.webkitFullscreenElement &&
    !document.mozFullScreenElement &&
    !document.msFullscreenElement
  ) {
    // Entra in fullscreen
    const element = document.documentElement;

    if (element.requestFullscreen) {
      element.requestFullscreen();
    } else if (element.webkitRequestFullscreen) {
      element.webkitRequestFullscreen();
    } else if (element.mozRequestFullScreen) {
      element.mozRequestFullScreen();
    } else if (element.msRequestFullscreen) {
      element.msRequestFullscreen();
    }

    icon.className = "fas fa-compress";
    fullscreenBtn.title = "Esci dalla modalità schermo intero";
  } else {
    // Esci da fullscreen
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    } else if (document.mozCancelFullScreen) {
      document.mozCancelFullScreen();
    } else if (document.msExitFullscreen) {
      document.msExitFullscreen();
    }

    icon.className = "fas fa-expand";
    fullscreenBtn.title = "Modalità schermo intero";
  }
}

// Gestisci eventi fullscreen
document.addEventListener("fullscreenchange", handleFullscreenChange);
document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
document.addEventListener("mozfullscreenchange", handleFullscreenChange);
document.addEventListener("MSFullscreenChange", handleFullscreenChange);

function handleFullscreenChange() {
  const fullscreenBtn = document.getElementById("fullscreenBtn");
  const icon = fullscreenBtn.querySelector("i");

  if (
    document.fullscreenElement ||
    document.webkitFullscreenElement ||
    document.mozFullScreenElement ||
    document.msFullscreenElement
  ) {
    // In fullscreen
    icon.className = "fas fa-compress";
    fullscreenBtn.title = "Esci dalla modalità schermo intero";
  } else {
    // Non in fullscreen
    icon.className = "fas fa-expand";
    fullscreenBtn.title = "Modalità schermo intero";
  }
}

// Mostra/nasconde il pulsante fullscreen solo durante il quiz
function updateFullscreenButtonVisibility(screenName) {
  const fullscreenBtn = document.getElementById("fullscreenBtn");
  if (screenName === "quiz") {
    fullscreenBtn.classList.remove("hidden");
  } else {
    fullscreenBtn.classList.add("hidden");
  }
}

// Aggiorna le informazioni sul tipo di quiz nella UI
function updateQuizTypeInfo() {
  const quizTypeElement = document.getElementById("quizTypeInfo");
  let quizTypeText = "";

  switch (appState.quizType) {
    case "random":
      quizTypeText = `🎲 Quiz Casuale (${appState.currentQuestions.length} domande)`;
      break;
    case "topic":
      quizTypeText = `📚 ${appState.selectedCategory} (${appState.currentQuestions.length} domande)`;
      break;
    case "all":
      quizTypeText = `🌟 Tutti i Quiz (${appState.currentQuestions.length} domande)`;
      break;
    case "from_question":
      quizTypeText = `▶️ Da Domanda ${appState.startQuestionNumber} (${appState.currentQuestions.length} domande)`;
      break;
    default:
      quizTypeText = `Quiz (${appState.currentQuestions.length} domande)`;
  }

  quizTypeElement.textContent = quizTypeText;
}

// Gestione modal delle fonti
function toggleSourcesModal() {
  const modal = document.getElementById("sourcesInfoModal");
  if (modal.classList.contains("show")) {
    hideSourcesModal();
  } else {
    showSourcesModal();
  }
}

function showSourcesModal() {
  const modal = document.getElementById("sourcesInfoModal");
  modal.classList.add("show");

  // Chiudi il modal cliccando fuori
  setTimeout(() => {
    document.addEventListener("click", handleOutsideClick);
  }, 100);
}

function hideSourcesModal() {
  const modal = document.getElementById("sourcesInfoModal");
  modal.classList.remove("show");
  document.removeEventListener("click", handleOutsideClick);
}

function handleOutsideClick(event) {
  const modal = document.getElementById("sourcesInfoModal");
  const sourcesBtn = document.getElementById("sourcesInfoBtn");

  if (!modal.contains(event.target) && !sourcesBtn.contains(event.target)) {
    hideSourcesModal();
  }
}
