/**
 * Questo file contiene tutte le domande del quiz EGID
 * Struttura dati: Ogni domanda ha un testo, una lista di risposte,
 * l'indice della risposta corretta e una categoria/argomento
 */

// Funzione per processare il testo delle domande e risposte dal file di input
function processQuestionsFromText(text) {
    const lines = text.split('\n');
    const questions = [];
    
    let currentQuestion = null;
    let answers = [];

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        
        if (line.startsWith('Q:')) {
            // Se abbiamo già una domanda in corso, salviamo quella precedente
            if (currentQuestion) {
                questions.push({
                    text: currentQuestion,
                    answers: answers,
                    correctIndex: 0, // La prima risposta è sempre quella corretta
                    category: detectCategory(currentQuestion)
                });
            }
            
            // Iniziamo una nuova domanda
            currentQuestion = line.substring(2).trim();
            answers = [];
        } else if (line.startsWith('V:')) {
            // Risposta corretta - va sempre per prima
            answers.unshift(line.substring(2).trim());
        } else if (line.startsWith('F:')) {
            // Risposta errata
            answers.push(line.substring(2).trim());
        }
    }
    
    // Aggiungiamo l'ultima domanda se esiste
    if (currentQuestion) {
        questions.push({
            text: currentQuestion,
            answers: answers,
            correctIndex: 0,
            category: detectCategory(currentQuestion)
        });
    }
    
    return questions;
}

// Funzione per rilevare la categoria della domanda in base al suo contenuto
function detectCategory(questionText) {
    const lowerCaseText = questionText.toLowerCase();
    
    // Definiamo alcune parole chiave per le categorie
    const categories = {
        "Marketing": ["marketing", "consumat", "promozion", "segment", "brand", "acquisto", "posizionamento"],
        "Innovazione": ["innova", "r&s", "ricerca e sviluppo", "ricerca", "tecnolog", "brevett"],
        "Finanza": ["finanzia", "roi", "van", "tir", "cash flow", "rendimento", "capitale", "dividendi", "struttura finanziaria"],
        "Organizzazione": ["organizzat", "risorse umane", "gestione del personale", "taylorismo", "team", "ford"],
        "Produzione": ["produzion", "just in time", "lean", "kanban", "kaizen", "logistic", "scorte", "qualità"],
        "Strategia": ["strategi", "vantaggio competitivo", "pianificazione", "objective", "mission", "vision"],
        "Management": ["management", "controllo", "decision", "obiettivi"],
        "Supply Chain": ["supply chain", "forni", "acquist", "approvvigionament", "outsourcing"],
        "Reti d'impresa": ["rete", "network", "cooperazion", "alleanz", "joint venture", "franchising"]
    };
    
    // Controlliamo se il testo della domanda contiene parole chiave delle categorie
    for (const [category, keywords] of Object.entries(categories)) {
        for (const keyword of keywords) {
            if (lowerCaseText.includes(keyword)) {
                return category;
            }
        }
    }
    
    // Categoria di default
    return "Generale";
}

// Il testo delle domande (verrà caricato dal file di input)
const rawQuestions = `
// filepath: /Users/paolodionesalvi/Documents/Uni/EGID/input.txt
Q: In quale stadio del comportamento d'acquisto il consumatore effettua il confronto fra le caratteristiche possedute dai vari produttori disponibili sul mercato capaci di soddisfare il medesimo bisogno?
V: valutazione delle alternative. 
F: ricerca di informazioni.
F: decisione d'acquisto.
Q: In quale stadio del comportamento d'acquisto il consumatore matura il concetto di soddisfazione o, in alternativa, di insoddisfazione?
V: Impressioni del dopo acquisto. 
F: Valutazione delle alternative. 
F: Decisione d'acquisto.
Q: In chiave di analisi del comportamento di consumo il coinvolgimento misura il livello di attenzione rivolta all'atto di acquisto, attenzione a sua volta legata al rischio percepito a esso associato. Quali tipi di rischio sono rilevanti per il consumatore?
V: Entrambi.
F: Rischio fisico. 
F: Rischio sociale.
Q: Quali caratteristiche deve presentare un segmento affinché la stessa procedura di segmentazione sia utile ed efficace?
V: Accessibilità. 
F: Praticabilità. 
F: Anzianità.
Q: Vi sono svariati criteri che vengono comunemente chiamati in causa quali metri di giudizio dell'efficacia e profittabilità di un processo di segmentazione. Uno di questi è relativo alla rapidità e sistematicità con cui il segmento reagisce agli stimoli di marketing messi a punto dall'impresa e indirizzati in modo specifico al segmento stesso. Qual è il nome di questo criterio?
V: Reattività. 
F: Rilevanza. 
F: Stabilità.
Q: Le "basi di segmentazione" identificano l'insieme di variabili rispetto alle quali è possibile od opportuno misurare il grado di eterogeneità nelle funzioni di domanda dei consumatori. La frequenza di utilizzo di un prodotto rappresenta una base della segmentazione di quale tipo?
V: Osservabile e specifica. 
F: Osservabile e generale.
F: Non osservabile e generale.
Q: Quale di queste caratteristiche è suscettibile di aumentare la credibilità di una fonte di comunicazione?
V: Esperienza. 
F: Humor.
F: Bellezza.
Q: Un forte contributo al progresso della teoria e della prassi del comportamento di consumo è associabile all'approfondimento, condotto con strumenti comunque rigorosi sul piano scientifico, degli aspetti per così dire estetici, e certamente più intangibili e soggettivi, del processo di acquisto ed uso di un prodotto. Questa dimensione del fenomeno, che si affianca senza contrapporsi alla più tradizionale visione utilitaristica, è nota come:
V: Consumo edenico. 
F: Consumo affluente. 
F: Consumo intangibile.
Q: Le innovazioni modulari comportano
V: cambiamenti sostanziali della tecnologia del prodotto, ma nessun cambiamento dell'architettura del prodotto
F: cambiamenti sostanziali dell'architettura del prodotto, ma nessun cambiamento sostanziale della tecnologia del prodotto
F: cambiamenti sostanziali sia dell'architettura, sia della tecnologia del prodotto
`;

// Processiamo il testo nel formato corretto
const ALL_QUESTIONS = processQuestionsFromText(rawQuestions);

// Funzione per caricare più domande dal file input.txt (verrà chiamata in app.js)
async function loadAllQuestions() {
    try {
        const response = await fetch('input.txt');
        if (!response.ok) {
            throw new Error('Impossibile caricare il file delle domande');
        }
        const text = await response.text();
        return processQuestionsFromText(text);
    } catch (error) {
        console.error('Errore nel caricamento delle domande:', error);
        return ALL_QUESTIONS; // Ritorna le domande predefinite in caso di errore
    }
}

// Funzione per ottenere tutte le categorie uniche
function getAllCategories(questions) {
    return [...new Set(questions.map(q => q.category))];
}

// Funzione per mescolare le risposte di una domanda
function shuffleAnswers(question) {
    const shuffled = { ...question };
    
    // Salva la risposta corretta
    const correctAnswer = shuffled.answers[shuffled.correctIndex];
    
    // Mescola tutte le risposte
    for (let i = shuffled.answers.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled.answers[i], shuffled.answers[j]] = [shuffled.answers[j], shuffled.answers[i]];
    }
    
    // Aggiorna l'indice della risposta corretta
    shuffled.correctIndex = shuffled.answers.findIndex(a => a === correctAnswer);
    
    return shuffled;
}

// Funzione per mescolare un array (usata per ottenere domande in ordine casuale)
function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}
