# Quiz EGID - Economia e Gestione d'Impresa

Questa applicazione web permette agli studenti di esercitarsi con domande d'esame di Economia e Gestione d'Impresa attraverso un'interfaccia moderna e interattiva.

## Caratteristiche

- Quiz con domande d'esame reali
- Selezione di quiz per argomento specifico o domande casuali
- Salvataggio delle statistiche (domande completate, risposte corrette, ecc.)
- Tracciamento delle performance e degli argomenti da migliorare
- Interfaccia responsive e user-friendly
- Supporto per dispositivi mobili e desktop

## Come utilizzare l'applicazione

1. Visita il sito web dell'applicazione
2. Scegli la modalità di quiz (domande casuali o per argomento)
3. Rispondi alle domande e verifica immediatamente le risposte
4. Visualizza i tuoi risultati e le statistiche di performance

## Tecnologie utilizzate

- HTML5
- CSS3
- JavaScript (ES6+)
- Chart.js per i grafici
- Local Storage per il salvataggio dei dati

## Struttura del progetto

```
Quiz-EGID/
├── index.html             # Struttura HTML principale
├── css/
│   └── style.css         # Stili CSS
├── js/
│   ├── app.js            # Logica principale dell'applicazione
│   └── questions.js      # Gestione delle domande e categorie
└── input.txt             # File con tutte le domande d'esame
```

## Come deployare su GitHub Pages

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

Creato per gli studenti di Economia e Gestione d'Impresa © 2025
