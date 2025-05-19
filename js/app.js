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
        quizHistory: []
    }
};

// Elementi DOM
const screens = {
    welcome: document.getElementById('welcome-screen'),
    topicSelect: document.getElementById('topic-select-screen'),
    quiz: document.getElementById('quiz-screen'),
    result: document.getElementById('result-screen'),
    review: document.getElementById('review-screen'),
    stats: document.getElementById('stats-screen')
};

// Carica le domande e inizializza l'app
window.addEventListener('DOMContentLoaded', async () => {
    // Carica le statistiche salvate
    loadStats();
    
    // Carica tutte le domande
    appState.questions = await loadAllQuestions();
    
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
    document.getElementById('startRandomBtn').addEventListener('click', startRandomQuiz);
    document.getElementById('startTopicBtn').addEventListener('click', () => showScreen('topicSelect'));
    document.getElementById('backFromTopicsBtn').addEventListener('click', () => showScreen('welcome'));
    document.getElementById('statsBtn').addEventListener('click', () => showScreen('stats'));
    document.getElementById('closeStatsBtn').addEventListener('click', () => showScreen('welcome'));
    
    // Quiz
    document.getElementById('nextQuestionBtn').addEventListener('click', nextQuestion);
    document.getElementById('quitQuizBtn').addEventListener('click', () => showScreen('welcome'));
    
    // Risultati
    document.getElementById('reviewBtn').addEventListener('click', reviewAnswers);
    document.getElementById('newQuizBtn').addEventListener('click', () => showScreen('welcome'));
    
    // Revisione
    document.getElementById('backToResultsBtn').addEventListener('click', () => showScreen('result'));
    document.getElementById('newQuizFromReviewBtn').addEventListener('click', () => showScreen('welcome'));
    
    // Reset
    document.getElementById('resetBtn').addEventListener('click', showResetConfirmation);
    document.getElementById('confirmResetBtn').addEventListener('click', resetAllStats);
    document.getElementById('cancelResetBtn').addEventListener('click', hideModal);
}

// Carica le categorie nella schermata di selezione degli argomenti
function loadTopics() {
    const topics = getAllCategories(appState.questions);
    const topicsContainer = document.getElementById('topicsContainer');
    
    topicsContainer.innerHTML = '';
    
    topics.forEach(topic => {
        const topicCard = document.createElement('div');
        topicCard.className = 'topic-card';
        topicCard.setAttribute('data-topic', topic);
        
        // Calcola statistiche per il topic
        const topicQuestions = appState.questions.filter(q => q.category === topic).length;
        const topicStats = appState.stats.categoryStats[topic] || { 
            correct: 0, 
            incorrect: 0, 
            total: 0 
        };
        
        const completionPercentage = topicQuestions > 0 
            ? Math.round((topicStats.total / topicQuestions) * 100) 
            : 0;
            
        const successRate = topicStats.total > 0 
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
        
        topicCard.addEventListener('click', () => {
            startTopicQuiz(topic);
        });
        
        topicsContainer.appendChild(topicCard);
    });
}

// Avvia un quiz con domande casuali
function startRandomQuiz() {
    // Prendi 10 domande casuali (o meno se non ce ne sono abbastanza)
    const shuffled = shuffleArray(appState.questions);
    const numQuestions = Math.min(10, shuffled.length);
    appState.currentQuestions = shuffled.slice(0, numQuestions);
    
    // Mescola anche le risposte di ogni domanda
    appState.currentQuestions = appState.currentQuestions.map(q => shuffleAnswers(q));
    
    // Inizia il quiz
    startQuiz();
}

// Avvia un quiz con domande di una specifica categoria
function startTopicQuiz(topic) {
    // Filtra le domande per categoria
    const topicQuestions = appState.questions.filter(q => q.category === topic);
    
    // Mescola e prendi fino a 10 domande
    const shuffled = shuffleArray(topicQuestions);
    const numQuestions = Math.min(10, shuffled.length);
    
    appState.currentQuestions = shuffled.slice(0, numQuestions);
    appState.selectedCategory = topic;
    
    // Mescola anche le risposte di ogni domanda
    appState.currentQuestions = appState.currentQuestions.map(q => shuffleAnswers(q));
    
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
    
    // Aggiorna UI
    updateQuizUI();
    
    // Mostra schermata quiz
    showScreen('quiz');
}

// Passa alla prossima domanda o termina il quiz
function nextQuestion() {
    // Se non è stata selezionata una risposta, non fare nulla
    if (appState.selectedAnswerIndex === null) return;
    
    // Controlla se la risposta è corretta
    const currentQuestion = appState.currentQuestions[appState.currentQuestionIndex];
    const isCorrect = appState.selectedAnswerIndex === currentQuestion.correctIndex;
    
    // Salva la risposta dell'utente
    appState.userAnswers[appState.currentQuestionIndex] = appState.selectedAnswerIndex;
    
    // Aggiorna le statistiche
    if (isCorrect) {
        appState.correctAnswers++;
    } else {
        appState.incorrectAnswers++;
    }
    
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
    const formattedTime = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    
    // Calcola percentuale successo
    const totalQuestions = appState.currentQuestions.length;
    const correctPercentage = totalQuestions > 0 
        ? Math.round((appState.correctAnswers / totalQuestions) * 100) 
        : 0;
    
    // Aggiorna interfaccia risultati
    document.getElementById('finalScore').textContent = `${correctPercentage}%`;
    document.getElementById('finalCorrect').textContent = appState.correctAnswers;
    document.getElementById('finalIncorrect').textContent = appState.incorrectAnswers;
    document.getElementById('quizTime').textContent = formattedTime;
    
    // Salva risultati nella cronologia
    appState.stats.quizHistory.push({
        date: new Date().toISOString(),
        category: appState.selectedCategory || 'Random',
        correct: appState.correctAnswers,
        incorrect: appState.incorrectAnswers,
        total: totalQuestions,
        time: timeElapsed,
        // Salviamo anche le domande e le risposte per la revisione
        questions: appState.currentQuestions,
        userAnswers: appState.userAnswers || []
    });
    
    // Salva nella local storage
    saveStats();
    
    // Mostra schermata risultati
    showScreen('result');
}

// Aggiorna l'interfaccia del quiz con la domanda corrente
function updateQuizUI() {
    const currentQuestion = appState.currentQuestions[appState.currentQuestionIndex];
    const totalQuestions = appState.currentQuestions.length;
    
    // Aggiorna indicatori di progresso
    document.getElementById('currentQuestionNumber').textContent = appState.currentQuestionIndex + 1;
    document.getElementById('totalQuestions').textContent = totalQuestions;
    document.getElementById('progressFill').style.width = `${((appState.currentQuestionIndex + 1) / totalQuestions) * 100}%`;
    
    // Aggiorna contatori risposte
    document.getElementById('correctCount').textContent = appState.correctAnswers;
    document.getElementById('incorrectCount').textContent = appState.incorrectAnswers;
    
    // Aggiorna la domanda
    document.getElementById('questionText').textContent = currentQuestion.text;
    
    // Aggiorna le risposte
    const answersContainer = document.getElementById('answersContainer');
    answersContainer.innerHTML = '';
    
    currentQuestion.answers.forEach((answer, index) => {
        const answerElement = document.createElement('div');
        answerElement.className = 'answer-option';
        answerElement.innerHTML = `
            <div class="answer-indicator">${String.fromCharCode(65 + index)}</div>
            <div class="answer-text">${answer}</div>
        `;
        
        // Aggiungi event listener per selezionare la risposta
        answerElement.addEventListener('click', () => {
            selectAnswer(index, answersContainer);
        });
        
        answersContainer.appendChild(answerElement);
    });
    
    // Disabilita pulsante prossima domanda finché non viene selezionata una risposta
    document.getElementById('nextQuestionBtn').disabled = true;
}

// Gestisce la selezione di una risposta
function selectAnswer(index, container) {
    // Se è già stata selezionata una risposta, ignora
    if (appState.selectedAnswerIndex !== null) return;
    
    // Aggiorna lo stato
    appState.selectedAnswerIndex = index;
    
    // Aggiorna UI
    const answerElements = container.querySelectorAll('.answer-option');
    
    answerElements.forEach((el, i) => {
        // Rimuovi classi precedenti
        el.classList.remove('selected', 'correct', 'incorrect');
        
        // Aggiungi classe appropriata
        if (i === index) {
            el.classList.add('selected');
            
            const currentQuestion = appState.currentQuestions[appState.currentQuestionIndex];
            if (i === currentQuestion.correctIndex) {
                el.classList.add('correct');
            } else {
                el.classList.add('incorrect');
                
                // Mostra la risposta corretta
                answerElements[currentQuestion.correctIndex].classList.add('correct');
            }
        }
    });
    
    // Abilita pulsante prossima domanda
    document.getElementById('nextQuestionBtn').disabled = false;
    
    // Passa automaticamente alla prossima domanda dopo 1.5 secondi
    setTimeout(() => {
        nextQuestion();
    }, 1500);
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
            incorrect: 0
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
    document.getElementById('statsTotalQuestions').textContent = appState.stats.totalQuestions;
    document.getElementById('statsTotalCorrect').textContent = appState.stats.totalCorrect;
    document.getElementById('statsTotalIncorrect').textContent = appState.stats.totalIncorrect;
    
    // Calcola e aggiorna il tasso di successo
    const successRate = appState.stats.totalQuestions > 0 
        ? Math.round((appState.stats.totalCorrect / appState.stats.totalQuestions) * 100) 
        : 0;
    document.getElementById('statsSuccessRate').textContent = `${successRate}%`;
    
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
    const elements = document.querySelectorAll('.stats-counter');
    elements.forEach(el => {
        // Aggiungi classi per animazione
        el.classList.add('animated-counter');
        setTimeout(() => {
            el.classList.add('counter-visible');
        }, 100);
    });
}

// Genera la lista degli argomenti meno conosciuti
function generateLeastKnownTopicsList() {
    const leastKnownTopicsContainer = document.getElementById('leastKnownTopics');
    leastKnownTopicsContainer.innerHTML = '';
    
    // Calcola il tasso di successo per ogni categoria
    const categoryRates = Object.entries(appState.stats.categoryStats)
        .map(([category, stats]) => {
            const successRate = stats.total > 0 
                ? Math.round((stats.correct / stats.total) * 100) 
                : 0;
            return { category, successRate, total: stats.total };
        })
        // Filtra le categorie con almeno 3 domande risposte
        .filter(item => item.total >= 3)
        // Ordina per tasso di successo crescente
        .sort((a, b) => a.successRate - b.successRate);
    
    // Prendi i 5 argomenti peggiori
    const worstTopics = categoryRates.slice(0, 5);
    
    if (worstTopics.length === 0) {
        leastKnownTopicsContainer.innerHTML = '<p>Non ci sono ancora abbastanza dati per questo calcolo.</p>';
        return;
    }
    
    // Aggiungi alla lista
    worstTopics.forEach(topic => {
        const listItem = document.createElement('li');
        listItem.innerHTML = `
            <span>${topic.category}</span>
            <span>${topic.successRate}% corretto (${topic.total} domande)</span>
        `;
        leastKnownTopicsContainer.appendChild(listItem);
    });
}

// Genera il grafico delle performance
function generatePerformanceChart() {
    const ctx = document.getElementById('performanceChart').getContext('2d');
    
    // Prendi gli ultimi 10 quiz
    const recentQuizzes = [...appState.stats.quizHistory]
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 10)
        .reverse();
    
    // Prepara i dati
    const labels = recentQuizzes.map((q, i) => {
        const date = new Date(q.date);
        const formattedDate = `${date.getDate()}/${date.getMonth() + 1}`;
        return `Quiz ${i+1}\n${formattedDate}`;
    });
    const correctData = recentQuizzes.map(q => q.correct);
    const incorrectData = recentQuizzes.map(q => q.incorrect);
    const percentages = recentQuizzes.map(q => {
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
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Risposte corrette',
                    data: correctData,
                    backgroundColor: '#37b24d',
                    borderColor: '#2b8a3e',
                    borderWidth: 1
                },
                {
                    label: 'Risposte errate',
                    data: incorrectData,
                    backgroundColor: '#e03131',
                    borderColor: '#c92a2a',
                    borderWidth: 1
                }
            ]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Numero di risposte'
                    },
                    stacked: true
                },
                x: {
                    title: {
                        display: true,
                        text: 'Quiz recenti'
                    }
                }
            },
            plugins: {
                legend: {
                    position: 'top',
                },
                title: {
                    display: true,
                    text: 'Performance negli ultimi quiz',
                    font: {
                        size: 16,
                        weight: 'bold'
                    },
                    padding: {
                        bottom: 15
                    }
                },
                tooltip: {
                    callbacks: {
                        afterBody: function(context) {
                            const index = context[0].dataIndex;
                            return `Percentuale di successo: ${percentages[index]}%`;
                        }
                    }
                },
                datalabels: {
                    display: function(context) {
                        return context.dataset.label === 'Risposte corrette';
                    },
                    align: 'top',
                    anchor: 'end',
                    formatter: function(value, context) {
                        const index = context.dataIndex;
                        return percentages[index] + '%';
                    },
                    color: '#333',
                    font: {
                        weight: 'bold'
                    }
                }
            },
            responsive: true,
            maintainAspectRatio: false
        }
    });
}

// Funzione per rivedere le risposte dell'ultimo quiz
function reviewAnswers() {
    // Aggiorna contatori nella schermata di revisione
    document.getElementById('reviewCorrect').textContent = appState.correctAnswers;
    document.getElementById('reviewIncorrect').textContent = appState.incorrectAnswers;
    
    // Ottieni il contenitore per le domande
    const reviewContainer = document.getElementById('reviewContainer');
    reviewContainer.innerHTML = '';
    
    // Per ogni domanda del quiz
    appState.currentQuestions.forEach((question, index) => {
        // Crea un elemento per la domanda
        const questionElement = document.createElement('div');
        questionElement.className = 'review-question-item';
        
        // Determina se la risposta dell'utente era corretta
        const userAnswerIndex = getUserAnswerForQuestion(index);
        const isCorrect = userAnswerIndex === question.correctIndex;

        // Determina se la risposta dell'utente è quella corretta
        const userAnswer = question.answers[userAnswerIndex];
        const correctAnswer = question.answers[question.correctIndex];
        const isUserAnswerCorrect = userAnswerIndex === question.correctIndex;
        
        // Aggiungi la classe appropriata
        questionElement.classList.add(isCorrect ? 'correct' : 'incorrect');
        
        // Contenuto HTML della domanda e risposte
        questionElement.innerHTML = `
            <div class="review-question-header">
                <div class="review-question-number">Domanda ${index + 1}</div>
                <div class="review-question-result ${isCorrect ? 'correct' : 'incorrect'}">
                    ${isCorrect ? '<i class="fas fa-check"></i> Corretta' : '<i class="fas fa-times"></i> Errata'}
                </div>
            </div>
            <div class="review-question-text">${question.text}</div>
            <div class="review-answers-container">
                ${question.answers.map((answer, answerIndex) => `
                    <div class="review-answer ${answerIndex === question.correctIndex ? 'correct' : ''} ${answerIndex === userAnswerIndex && answerIndex !== question.correctIndex ? 'incorrect' : ''}">
                        <div class="answer-indicator">${String.fromCharCode(65 + answerIndex)}</div>
                        <div class="answer-text">${answer}</div>
                        ${answerIndex === question.correctIndex && answerIndex !== userAnswerIndex ? '<div class="answer-tag correct"><i class="fas fa-check"></i> Corretta</div>' : ''}
                        ${answerIndex === userAnswerIndex && answerIndex !== question.correctIndex ? '<div class="answer-tag incorrect"><i class="fas fa-times"></i> La tua risposta</div>' : ''}
                        ${answerIndex === userAnswerIndex && answerIndex === question.correctIndex ? '<div class="answer-tag correct"><i class="fas fa-check"></i> La tua risposta</div>' : ''}
                    </div>
                `).join('')}
            </div>
        `;
        
        // Aggiungi la domanda al contenitore
        reviewContainer.appendChild(questionElement);
    });
    
    // Mostra la schermata di revisione
    showScreen('review');
}

// Funzione di supporto per ottenere la risposta dell'utente a una specifica domanda
function getUserAnswerForQuestion(questionIndex) {
    // Ottieni la risposta dall'array userAnswers
    if (appState.userAnswers && appState.userAnswers[questionIndex] !== undefined) {
        return appState.userAnswers[questionIndex];
    }
    
    // Fallback nel caso non ci sia una risposta salvata
    return null;
}

// Mostra il modale di conferma reset
function showResetConfirmation() {
    const modal = document.getElementById('resetConfirmModal');
    modal.classList.add('show');
}

// Nasconde tutti i modali
function hideModal() {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => modal.classList.remove('show'));
}

// Resetta tutte le statistiche
function resetAllStats() {
    // Reset dello stato
    appState.stats = {
        totalQuestions: 0,
        totalCorrect: 0,
        totalIncorrect: 0,
        categoryStats: {},
        quizHistory: []
    };
    
    // Salva stato vuoto
    saveStats();
    
    // Aggiorna UI
    loadTopics();
    updateStatsUI();
    
    // Nascondi modale
    hideModal();
    
    // Torna alla home
    showScreen('welcome');
}

// Cambia la schermata visibile
function showScreen(screenName) {
    // Nascondi tutte le schermate
    Object.values(screens).forEach(screen => screen.classList.remove('active'));
    
    // Mostra la schermata richiesta
    screens[screenName].classList.add('active');
    
    // Scorri alla sezione mostrata
    scrollToSection(screenName);
    
    // Azioni specifiche per schermata
    if (screenName === 'stats') {
        updateStatsUI();
    }
}

// Funzione per scorrere fluidamente a una sezione specifica
function scrollToSection(screenName) {
    const screen = screens[screenName];
    if (screen) {
        // Scorri alla sezione con animazione fluida
        screen.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

// Carica le statistiche dal localStorage
function loadStats() {
    const savedStats = localStorage.getItem('egidQuizStats');
    
    if (savedStats) {
        try {
            appState.stats = JSON.parse(savedStats);
        } catch (e) {
            console.error('Errore nel parsing delle statistiche salvate:', e);
            // Inizializza con valori predefiniti in caso di errore
            resetAllStats();
        }
    }
}

// Salva le statistiche nel localStorage
function saveStats() {
    localStorage.setItem('egidQuizStats', JSON.stringify(appState.stats));
}
