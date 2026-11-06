# Requisiti comuni e livelli

## BASE — Obbligatorio

| ID | Requisito | Evidenza di completamento |
|---|---|---|
| F1 | Avvio con `python main.py` | Da cartella del progetto il menu compare senza errori |
| F2 | Menu con uscita | Scelta `0` termina; scelta sconosciuta mostra un messaggio |
| F3 | Almeno tre operazioni significative | Ogni operazione risponde a un bisogno del target; «aiuto» e «esci» non contano |
| F4 | Logica Python effettiva | Funzioni con parametri/return, condizioni, cicli, liste e/o dizionari |
| F5 | Persistenza CSV o JSON | Si legge un dataset e si salva almeno una modifica o un nuovo risultato |
| F6 | Elaborazione | Una selezione, un conteggio, una statistica o un punteggio calcolato in Python |
| F7 | Esportazione | Un CSV/JSON di risultati riproducibile, distinto dall'input |
| F8 | Frontend HTML/CSS/JS | Caricamento manuale del file con File API, tabella e/o indicatori leggibili e messaggio chiaro se il file non è valido (filtri e grafici sono facoltativi) |
| F9 | Gestione errori previsti | Quantità/testi errati, scelta non valida, file assente o formato errato gestiti senza perdita dei dati |
| F10 | Istruzioni e test | README di avvio e casi con risultati attesi e osservati |

Tre operazioni possibili: registrare un dato, ricercare/aggiornare uno stato, generare un riepilogo. Non basta che tre voci del menu stampino lo stesso elenco. I singoli progetti possono usare JSON **oppure** CSV come persistenza principale; non sono obbligati a implementare entrambi i formati. La demo mostra entrambi come riferimento.

## Requisiti di progettazione

Compilate problema, motivazione, destinatari, obiettivi, MVP, risultato atteso, attività/responsabili, monitoraggio, test, risultati e miglioramenti. Ogni obiettivo deve avere almeno una prova osservabile. Registrate il contributo dei componenti e l'eventuale AI utilizzata. I modelli sono in `02_studenti/`.

## INTERMEDIO — Facoltativo

A MVP completato potete aggiungere filtri più ricchi, più statistiche, una seconda esportazione, ordinamenti o altre visualizzazioni. Le funzioni aggiunte devono avere uno scopo, istruzioni e test. Non sacrificate la completezza del livello base.

## AVANZATO — Facoltativo

Potete sperimentare generazione automatica di un report HTML o automazioni locali. Tecnologie ulteriori restano un esperimento separato, non una condizione per concludere il progetto. Il percorso obbligatorio non richiede HTTP, API REST, framework web, GUI Python, database o servizi esterni.

## Confini dell'architettura

Python riceve input dal terminale, valida, applica regole, elabora e legge/scrive file. JavaScript carica risultati già esportati e li presenta (filtri e ordinamenti sono facoltativi). Non spostate in JavaScript la funzione Python principale per costruire una dashboard apparentemente funzionante.

Aprire un HTML con `file://` non autorizza `fetch()` a leggere file locali arbitrari: usate un controllo `<input type="file">`, `File.text()` e il parser del formato. Non servono Live Server, server locali o dipendenze CDN. Mostrate i dati con `textContent`, non interpretandoli come HTML.

## Valutazione equa

Un livello BASE completo, robusto, documentato e compreso da tutto il gruppo può ottenere **100/100**. Complessità, numero di righe, tecnologie aggiuntive o uso di AI non danno bonus automatici. Si valutano bisogno, qualità, correttezza, prove e comprensione. Le estensioni non compensano un flusso principale non funzionante.
