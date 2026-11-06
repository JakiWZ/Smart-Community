# Project Brief e piano

## 1. Gruppo e ruoli

| Nome del gruppo | Progetto | Challenge |
|---|---|---|
| CodeMasters | StudyTrack | Organizzare e monitorare le attività di studio |

| Componente | Ruolo |
|---|---|
| Marco | Logica Python |
| Luca | Dati e test |
| Giulia | Frontend |
| Andrea | Coordinamento e documentazione |

## 2. Problema e target

| Problema | Target |
|---|---|
| Gli studenti hanno difficoltà a organizzare i compiti, ricordare le scadenze e monitorare le attività completate. | Studenti delle scuole superiori e universitari |

**Domanda guida:** Come potremmo aiutare gli studenti a organizzare e monitorare le attività di studio attraverso una semplice applicazione web sviluppata in Python?

| Aiutare chi | A fare cosa | Attraverso cosa |
|---|---|---|
| Studenti | Registrare compiti, controllare le scadenze e segnare le attività completate | Applicazione web con backend Python |

| Cosa escludiamo |
|---|
| Registrazione e autenticazione degli utenti |
| Notifiche tramite email |
| Applicazione mobile nativa |
| Funzionalità di intelligenza artificiale |

## 3. Obiettivi

| ID | Obiettivo | Prova |
|---|---|---|
| O1 | L'utente può aggiungere una nuova attività di studio | Inserisco "Studiare Python" con scadenza 15/11/2026 e verifico che venga salvata |
| O2 | L'utente può visualizzare tutte le attività registrate | Aggiungo tre attività e verifico che siano tutte presenti nell'elenco |
| O3 | L'utente può contrassegnare un'attività come completata | Seleziono "Studiare Python", premo "Completa" e verifico che lo stato cambi |

## 4. MVP: le tre operazioni

| Operazione | Input | Risultato |
|---|---|---|
| 1. Aggiungere attività | Titolo, materia, scadenza | Attività salvata nel file JSON |
| 2. Visualizzare attività | Richiesta di visualizzazione | Elenco delle attività registrate |
| 3. Completare attività | ID dell'attività | Stato aggiornato a "completata" |

## 5. Dati

| Voce | Risposta |
|---|---|
| File di input e formato | `attivita.json` — formato JSON |
| Record di esempio in input | `{"id": 1, "titolo": "Studiare Python", "materia": "Informatica", "scadenza": "2026-11-15", "completata": false}` |
| File di output | `attivita.json` aggiornato |
| Un record di esempio in output | `{"id": 1, "titolo": "Studiare Python", "materia": "Informatica", "scadenza": "2026-11-15", "completata": true}` |

## 6. Piano delle attività

| ID | Attività | Priorità | Responsabile |
|---|---|---|---|
| A1 | Creare la struttura del progetto Python | Must | Marco |
| A2 | Implementare il salvataggio e la lettura dei dati JSON | Must | Luca |
| A3 | Sviluppare la logica per aggiungere e completare attività | Must | Marco |
| A4 | Realizzare l'interfaccia web | Must | Giulia |
| A5 | Scrivere test automatici e verificare gli obiettivi | Should | Luca |
| A6 | Preparare README, documentazione e presentazione | Should | Andrea |

**Feature freeze:** dopo il CP3 solo correzioni, test e documentazione.

## Pronto per CP1?

- [x] Nomi e ruoli sono scritti
- [x] Problema, target e domanda guida sono completi
- [x] Tre obiettivi con prova e tre operazioni con input e risultato
- [x] Dati e piano delle attività con priorità e responsabili
- [x] Nessun campo da compilare è rimasto nel file
