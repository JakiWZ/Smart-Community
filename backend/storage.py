"""Accesso al database SQLite: solo query, nessuna regola di dominio"""

import sqlite3
from contextlib import contextmanager
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
SCHEMA_PATH = BASE_DIR / "infrastructure" / "schema.sql"
DB_PATH = BASE_DIR / "smart_community.db"


def get_connection() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn


@contextmanager
def _connessione():
    """Apre la connessione, salva le modifiche a fine blocco e la chiude."""
    conn = get_connection()
    try:
        with conn:
            yield conn
    finally:
        conn.close()


def init_db() -> None:
    schema = SCHEMA_PATH.read_text(encoding="utf-8")
    with _connessione() as conn:
        conn.executescript(schema)


# ---------- utenti ----------

def inserisci_utente(username: str, password: str, ruolo: str) -> int | None:
    """Restituisce l'id del nuovo utente, oppure None se lo username esiste già."""
    try:
        with _connessione() as conn:
            cur = conn.execute(
                "INSERT INTO utenti (username, password, ruolo) VALUES (?, ?, ?)",
                (username, password, ruolo),
            )
            return cur.lastrowid
    except sqlite3.IntegrityError:
        return None


def trova_utente_per_credenziali(username: str, password: str) -> dict | None:
    with _connessione() as conn:
        riga = conn.execute(
            "SELECT id, username, ruolo FROM utenti WHERE username = ? AND password = ?",
            (username, password),
        ).fetchone()
    return dict(riga) if riga else None


def esiste_utente(id_utente) -> bool:
    with _connessione() as conn:
        riga = conn.execute("SELECT 1 FROM utenti WHERE id = ?", (id_utente,)).fetchone()
    return riga is not None


# ---------- oggetti smarriti ----------

def inserisci_oggetto(descrizione: str, luogo: str, id_utente: int,
                      stato: str, data_ritrovamento: str) -> int:
    with _connessione() as conn:
        cur = conn.execute(
            "INSERT INTO oggetti_smarriti (descrizione, luogo, id_utente, stato, data_ritrovamento) "
            "VALUES (?, ?, ?, ?, ?)",
            (descrizione, luogo, id_utente, stato, data_ritrovamento),
        )
        return cur.lastrowid


def leggi_oggetto(id_oggetto: int) -> dict | None:
    with _connessione() as conn:
        riga = conn.execute(
            "SELECT * FROM oggetti_smarriti WHERE id = ?", (id_oggetto,)
        ).fetchone()
    return dict(riga) if riga else None


def cerca_oggetti(parole: list[str], luogo: str | None, stato: str | None) -> list[dict]:
    """Ogni parola deve comparire nella descrizione o nel luogo. luogo e stato sono filtri esatti."""
    condizioni, parametri = [], []
    for parola in parole:
        condizioni.append("(LOWER(descrizione) LIKE ? OR LOWER(luogo) LIKE ?)")
        parametri += [f"%{parola.lower()}%"] * 2
    if luogo:
        condizioni.append("LOWER(luogo) = ?")
        parametri.append(luogo.lower())
    if stato:
        condizioni.append("stato = ?")
        parametri.append(stato)
    where = "WHERE " + " AND ".join(condizioni) if condizioni else ""
    with _connessione() as conn:
        righe = conn.execute(
            f"SELECT * FROM oggetti_smarriti {where} ORDER BY data_ritrovamento DESC, id DESC",
            parametri,
        ).fetchall()
    return [dict(r) for r in righe]


def aggiorna_stato_oggetto(id_oggetto: int, stato: str) -> None:
    with _connessione() as conn:
        conn.execute("UPDATE oggetti_smarriti SET stato = ? WHERE id = ?", (stato, id_oggetto))


def conta_oggetti_per_stato(stato: str) -> int:
    with _connessione() as conn:
        return conn.execute(
            "SELECT COUNT(*) FROM oggetti_smarriti WHERE stato = ?", (stato,)
        ).fetchone()[0]


def conta_oggetti_per_luogo_e_stato() -> list[dict]:
    """Una riga per luogo con il numero di oggetti per ogni stato."""
    with _connessione() as conn:
        righe = conn.execute(
            "SELECT luogo, stato, COUNT(*) AS n FROM oggetti_smarriti "
            "GROUP BY luogo, stato ORDER BY luogo"
        ).fetchall()
    return [dict(r) for r in righe]


# ---------- post ----------

def inserisci_post(titolo: str, descrizione: str, categoria: str, id_autore: int,
                   id_oggetto: int | None, data_pubblicazione: str) -> int:
    with _connessione() as conn:
        cur = conn.execute(
            "INSERT INTO post (titolo, descrizione, categoria, id_autore, id_oggetto, data_pubblicazione) "
            "VALUES (?, ?, ?, ?, ?, ?)",
            (titolo, descrizione, categoria, id_autore, id_oggetto, data_pubblicazione),
        )
        return cur.lastrowid


def leggi_post(id_post: int) -> dict | None:
    with _connessione() as conn:
        riga = conn.execute("SELECT * FROM post WHERE id = ?", (id_post,)).fetchone()
    return dict(riga) if riga else None


def elenco_post(categoria: str | None = None) -> list[dict]:
    with _connessione() as conn:
        if categoria:
            righe = conn.execute(
                "SELECT * FROM post WHERE categoria = ? ORDER BY data_pubblicazione DESC, id DESC",
                (categoria,),
            ).fetchall()
        else:
            righe = conn.execute(
                "SELECT * FROM post ORDER BY data_pubblicazione DESC, id DESC"
            ).fetchall()
    return [dict(r) for r in righe]