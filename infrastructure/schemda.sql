PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS utenti (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    ruolo TEXT NOT NULL DEFAULT 'user' CHECK (ruolo IN ('admin', 'user'))
);

CREATE TABLE IF NOT EXISTS oggetti_smarriti (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    descrizione TEXT NOT NULL,
    luogo TEXT NOT NULL,
    id_utente INTEGER NOT NULL,
    stato TEXT NOT NULL DEFAULT 'trovato' CHECK (stato IN ('trovato', 'restituito')),
    data_ritrovamento TEXT NOT NULL,
    FOREIGN KEY (id_utente) REFERENCES utenti(id)
);

CREATE TABLE IF NOT EXISTS post (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    titolo TEXT NOT NULL,
    descrizione TEXT NOT NULL,
    categoria TEXT NOT NULL CHECK (categoria IN ('evento', 'oggetto')),
    id_autore INTEGER NOT NULL,
    id_oggetto INTEGER,
    data_pubblicazione TEXT NOT NULL,
    FOREIGN KEY (id_autore) REFERENCES utenti(id),
    FOREIGN KEY (id_oggetto) REFERENCES oggetti_smarriti(id)
);