/**
 * Questo file contiene tutte le domande del quiz EGID
 * Struttura dati: Ogni domanda ha un testo, una lista di risposte,
 * l'indice della risposta corretta e una categoria/argomento
 */

// Funzione per processare il testo delle domande e risposte dal file di input
function processQuestionsFromText(text) {
  const lines = text.split("\n");
  const questions = [];

  let currentQuestion = null;
  let currentQuestionImage = null; // Per immagini associate alle domande
  let answers = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    if (line.startsWith("Q:")) {
      // Se abbiamo già una domanda in corso, salviamo quella precedente
      if (currentQuestion) {
        questions.push({
          text: currentQuestion,
          answers: answers,
          correctIndex: 0, // La prima risposta è sempre quella corretta
          category: detectCategory(currentQuestion),
          image: currentQuestionImage || null, // Associa l'immagine se esiste
        });
      }

      // Iniziamo una nuova domanda
      currentQuestion = line.substring(2).trim();
      answers = [];
    } else if (line.startsWith("I:")) {
      // Immagine associata alla domanda
      currentQuestionImage = line.substring(2).trim();
    } else if (line.startsWith("V:")) {
      // Risposta corretta - va sempre per prima
      answers.unshift(line.substring(2).trim());
    } else if (line.startsWith("F:")) {
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
      category: detectCategory(currentQuestion),
      image: currentQuestionImage || null, // Associa l'immagine se esiste
    });
  }

  return questions;
}

// Funzione per rilevare la categoria della domanda in base al suo contenuto
function detectCategory(questionText) {
  const lowerCaseText = questionText.toLowerCase();

  // Definiamo alcune parole chiave per le categorie
  const categories = {
    "Campo magnetico": [
      "campo magnetico",
      "magnetic",
      "magnetismo",
      "forza magnetica",
      "linee di forza",
    ],
    "Forze e campi": [
      "forze",
      "campo elettrico",
      "forza elettrica",
      "interazione",
      "legge di coulomb",
    ],
    "Circuiti elettrici": [
      "circuito elettrico",
      "resistenza",
      "tensione",
      "corrente elettrica",
      "legge di ohm",
      "serie e parallelo",
    ],
    "Energia e potenza": [
      "energia elettrica",
      "potenza elettrica",
      "lavoro elettrico",
      "efficienza energetica",
      "conversione energetica",
    ],
    Elettromagnetismo: [
      "elettromagnetismo",
      "induzione elettromagnetica",
      "legge di faraday",
      "legge di lenz",
      "campo elettromagnetico",
    ],
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

// Il testo delle domande (sincronizzato con il file input.txt)
const rawQuestions = `Q: La scuola di Harvard [...] riduce la possibilità di ottenere profitti superiori alla media: 
V: Alla struttura del settore
F: Alla capacità dell'impresa nel selezionare i mercati 
F: Alla presenza di barriere all'entrata del mercato
Q: Dagli anni '70 l'impostazione "struttura-comportamenti-risultati" riduce la possibilità di ottenere profitti superiori alla media:
V: al paradigma delle cinque forze competitive 
F: alla diversità di risorse e competenze
F: alla relazione tra elevate barriere d'entrata e profittabilità del settore
Q: a partire dagli anni '80 la "resource-based view" riduce la possibilità di ottenere profitti superiori alla media:
V:al superiore posizionamento dei profitti e al possesso di risorse scarse 
F: alla diversità di risorse e competenze
F: alla relazione tra elevate barriere d'entrata e profittabilità del settore
Q: L'Industrial Organization, che opera negli anni '50, riduce la possibilità di ottenere profitti superiori alla media:
V: alla relazione tra elevate barriere d'entrata e profittabilità del settore 
F: al paradigma delle 5 forze competitive
F: alla struttura del settore
Q: Quale di queste correnti di studio pone enfasi sulle "competenze innovative" dell'impresa: 
V: la resource-based view of the firm
F: l'industrial Organization (I.O.). 
F: la scuola di Harvard
Q: La catena del valore è:
V: la rappresentazione sintetica delle attività di una singola area d'affari di un'impresa o dell'intera attività di un'impresa specializzata o in un monoprodotto
F: la rappresentazione sintetica delle attività delle aree d'affari di un'impresa
F: la rappresentazione sintetica dei rapporti che legano l'impresa con gli altri partner, a monte e a valle dalla filiera produttiva
Q: Le imprese appartenenti al medesimo settore:
V: possono avere catene del valore simili
F: è probabile che possano avere la stessa catena del valore 
F: è impossibile che abbiano catene del valore simili
Q: secondo lo schema della catena del valore, il "margine" corrisponde a:
V: il valore creato dalla combinazione delle attività al netto degli oneri e dei costi 
F: il valore creato dalla combinazione delle attività dell'impresa
F: il valore cumulativo creato dalla combinazione delle imprese della filiera produttiva
Q: Quale di queste fasi non fa parte del processo di costruzione della catena del valore? 
V: Definizione della catena del valore del principale competitor nel settore.
F: Identificazione delle attività che generano valore.
F: Definizione della catena del valore per il particolare settore in cui opera l'impresa.
Q: Quale di queste attività non fa parte dell'insieme delle attività primarie della catena del valore ?
V: Gestione delle risorse umane. 
F: Marketing.
F: Logistica in entrata.`;

// Processiamo il testo nel formato corretto
const ALL_QUESTIONS = processQuestionsFromText(rawQuestions);

// Funzione per caricare più domande dal file input.txt (verrà chiamata in app.js)
async function loadAllQuestionsAndImages() {
  try {
    console.log("Tentativo di caricamento del file input.txt...");
    const response = await fetch("input.txt");
    if (!response.ok) {
      throw new Error(
        `Errore HTTP ${response.status}: Impossibile caricare il file delle domande`
      );
    }
    const text = await response.text();
    console.log("File caricato con successo, lunghezza testo:", text.length);
    const questions = processQuestionsFromText(text);
    console.log("Domande processate:", questions.length);
    console.log(
      "Prima domanda caricata:",
      questions[0]?.text.substring(0, 100) + "..."
    );

    // Verifica che le domande caricate siano diverse da quelle embedded
    const embeddedQuestions = processQuestionsFromText(rawQuestions);
    if (questions[0]?.text === embeddedQuestions[0]?.text) {
      console.log(
        "✓ Le domande caricate corrispondono a quelle embedded (buono)"
      );
    } else {
      console.warn(
        "⚠️ ATTENZIONE: Le domande caricate sono diverse da quelle embedded!"
      );
      console.log(
        "Prima domanda embedded:",
        embeddedQuestions[0]?.text.substring(0, 100) + "..."
      );
    }

    return questions;
  } catch (error) {
    console.error("Errore nel caricamento delle domande:", error);
    console.warn("Utilizzo delle domande predefinite embedded nel codice");
    const fallbackQuestions = processQuestionsFromText(rawQuestions);
    console.log(
      "Prima domanda predefinita:",
      fallbackQuestions[0]?.text.substring(0, 100) + "..."
    );
    return fallbackQuestions;
  }
}

// Funzione per ottenere tutte le categorie uniche
function getAllCategories(questions) {
  return [...new Set(questions.map((q) => q.category))];
}

// Funzione per mescolare le risposte di una domanda
function shuffleAnswers(question) {
  const shuffled = { ...question };

  // Salva la risposta corretta
  const correctAnswer = shuffled.answers[shuffled.correctIndex];

  // Crea un array di oggetti con indice originale per tracciare la risposta corretta
  const answersWithIndex = shuffled.answers.map((answer, index) => ({
    text: answer,
    wasCorrect: index === shuffled.correctIndex,
  }));

  // Mescola l'array degli oggetti
  for (let i = answersWithIndex.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [answersWithIndex[i], answersWithIndex[j]] = [
      answersWithIndex[j],
      answersWithIndex[i],
    ];
  }

  // Estrai le risposte mescolate e trova il nuovo indice della risposta corretta
  shuffled.answers = answersWithIndex.map((item) => item.text);
  shuffled.correctIndex = answersWithIndex.findIndex((item) => item.wasCorrect);

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
