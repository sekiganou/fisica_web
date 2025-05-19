# Quiz EGID - Economia e Gestione d'Impresa

![Quiz EGID Banner](img/meme.jpg)

[![GitHub stars](https://img.shields.io/github/stars/mrdionesalvi/egid_web)](https://github.com/mrdionesalvi/egid_web/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/mrdionesalvi/egid_web)](https://github.com/mrdionesalvi/egid_web/network)
[![GitHub issues](https://img.shields.io/github/issues/mrdionesalvi/egid_web)](https://github.com/mrdionesalvi/egid_web/issues)
[![Website](https://img.shields.io/website?url=https%3A%2F%2Fmrdionesalvi.github.io%2Fegid_web%2F)](https://mrdionesalvi.github.io/egid_web/)

Applicazione web interattiva per gli studenti di UniTo che si preparano all'esame di Economia e Gestione d'Impresa. Questa webapp permette di esercitarsi con domande d'esame reali attraverso un'interfaccia moderna, intuitiva e funzionale.

**Prova subito l'app:** [https://mrdionesalvi.github.io/egid_web/](https://mrdionesalvi.github.io/egid_web/)

## 📋 Caratteristiche

- 📝 Quiz con **domande d'esame reali**
- 🗂️ Selezione di quiz per argomento specifico o domande casuali
- 📊 Salvataggio delle statistiche nel browser (domande completate, risposte corrette)
- 📈 Analisi dettagliata delle performance e degli argomenti da migliorare
- 🔄 Possibilità di rivedere le risposte fornite
- 📱 Interfaccia responsive ottimizzata per dispositivi mobili e desktop
- 🎯 Visualizzazione immediata delle risposte corrette/errate
- ⏱️ Tracciamento del tempo impiegato

## 🚀 Come utilizzare l'applicazione

1. Visita il sito web dell'applicazione: [https://mrdionesalvi.github.io/egid_web/](https://mrdionesalvi.github.io/egid_web/)
2. Scegli la modalità di quiz:
   - **Domande Casuali**: per un'esperienza d'esame realistica
   - **Scegli Argomento**: per concentrarti su aree specifiche
3. Rispondi alle domande e ricevi feedback immediato
4. Al termine del quiz, consulta i risultati e revisiona le risposte
5. Visualizza le tue statistiche per tracciare i progressi nel tempo

## 💻 Tecnologie utilizzate

- **HTML5**: struttura del documento
- **CSS3**: design responsivo e animazioni
- **JavaScript (ES6+)**: logica applicativa e interattività
- **Chart.js**: visualizzazione grafica delle statistiche
- **Local Storage API**: persistenza dei dati lato client
- **Plausible Analytics**: tracciamento anonimo dell'utilizzo

## 📂 Struttura del progetto

```
egid_web/
├── index.html              # Struttura HTML principale
├── css/
│   └── style.css          # Stili CSS
├── js/
│   ├── app.js             # Logica principale dell'applicazione
│   └── questions.js       # Gestione delle domande e categorie
├── img/
│   └── meme.jpg           # Immagini utilizzate nell'applicazione
└── input.txt              # Database delle domande d'esame
```

## 🧪 Test dell'applicazione in locale

Per testare l'applicazione in locale:

1. Clona il repository:
   ```bash
   git clone https://github.com/mrdionesalvi/egid_web.git
   cd egid_web
   ```

2. Avvia un server web locale. Ad esempio, con Python:
   ```bash
   # Con Python 3
   python -m http.server
   # Oppure con Python 2
   python -m SimpleHTTPServer
   ```

3. Apri il browser e visita `http://localhost:8000`

## 🚀 Come deployare su GitHub Pages

1. Creare un nuovo repository su GitHub
2. Clonare il repository in locale
3. Copiare tutti i file di questo progetto nella directory del repository
4. Effettuare commit e push dei file su GitHub
5. Nelle impostazioni del repository, abilitare GitHub Pages dalla sezione "Pages"
6. Selezionare il branch "main" come sorgente e salvare
7. Il sito sarà ora disponibile all'URL `https://<username>.github.io/<nome-repository>/`

## Aggiungere o modificare domande

Le domande sono contenute nel file `input.txt` e seguono questo formato:

```
Q: Testo della domanda
V: Risposta corretta
F: Risposta errata 1
F: Risposta errata 2
```

È possibile modificare questo file per aggiungere, rimuovere o modificare le domande.

## Licenza

Questo progetto è distribuito con licenza MIT. Si prega di consultare il file LICENSE per ulteriori dettagli.

---

Creato per gli studenti di Informatida di UniTo - Mede with <3 by Dione