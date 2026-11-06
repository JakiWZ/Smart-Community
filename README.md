# Smart Community

Progetto per la challenge Smart Community: una piccola applicazione per condividere eventi e gestire segnalazioni di oggetti smarriti. La repository contiene un prototipo frontend e una prima definizione dei modelli Python.

## Stato del progetto

Il progetto è in sviluppo. La dashboard presenta dati dimostrativi e permette di interagire con essi nel browser. Le modifiche sono conservate nel `localStorage` del browser, quando disponibile; il pulsante di ripristino riporta i dati iniziali. Il nome dell'utente nella sessione è conservato nel `sessionStorage`.

**Login, registrazione e recupero password sono solo dimostrativi:** non verificano credenziali su un server, non creano account persistenti e non inviano email. Non usare password reali. Il backend non è ancora collegato al frontend: `main.py`, `logic.py` e `storage.py` sono vuoti; `models.py` definisce i modelli iniziali. SQLite e lo scambio JSON/CSV tra backend e frontend sono previsti, ma non ancora integrati.

## Requisiti

- Un browser moderno con JavaScript abilitato per il prototipo. Non è indicata una versione minima specifica.
- Python **3.10 o successivo** per interpretare i modelli, che usano la sintassi dei tipi `int | None`. La versione minima non è ancora dichiarata in una configurazione di progetto né verificata tramite una suite di test.
- Non sono dichiarate dipendenze Python o JavaScript da installare. Per controllare la propria versione: `python3 --version`.

## Avvio del prototipo

1. Clona la repository e apri la cartella del progetto.
2. Apri `frontend/index.html` nel browser e naviga alle pagine disponibili; in alternativa apri direttamente `frontend/dashboard.html`.
3. Esplora la dashboard con i dati di esempio. I dati modificati nel browser sono locali al dispositivo e al profilo utilizzato.

Non è ancora disponibile un'applicazione Python avviabile con menu: `backend/main.py` è vuoto. Non esiste attualmente un comando di installazione, avvio del server o test automatici documentato.

## Struttura

```text
backend/          Modelli Python e file riservati a logica, storage e avvio
frontend/         Pagine HTML, stili, script e dati dimostrativi
infrastructure/   Dati e risorse per l'infrastruttura
docs/             Materiali e requisiti del progetto
.github/          Configurazioni GitHub
```

## Obiettivi e requisiti del corso

Il percorso richiesto prevede un programma Python avviabile da terminale, almeno tre operazioni significative, lettura e salvataggio di dati JSON o CSV, elaborazione ed esportazione di un risultato separato. Il frontend dovrà consentire il caricamento manuale del file esportato e mostrare dati e messaggi di errore leggibili. Login e inserimento dal browser richiederanno inoltre un collegamento al backend, ancora da definire.

Per requisiti e criteri di verifica consultare `docs/REQUISITI.md`; per indicazioni tecniche, `docs/GUIDA_TECNICA.md`. Il brief e i casi di prova devono essere completati dal gruppo. Lo stato attuale non soddisfa ancora l'intero flusso richiesto.

## Organizzazione del lavoro

Le attività sono disponibili nella [board pubblica Smart Community](https://github.com/users/JakiWZ/projects/1). Il branch di integrazione è `develop`; concordare con il gruppo le modifiche tramite branch dedicati e pull request.
