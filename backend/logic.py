""" Regole dell'applicazione: controlli, stati, riepiloghi """
from datetime import date, datetime

import storage
from models import Categoria, Ruolo, StatoOggetto


class ErroreLogica(Exception):
    """Errore di dominio con un messaggio leggibile dall'utente."""


STATI = {s.value for s in StatoOggetto}
CATEGORIE = {c.value for c in Categoria}


# ---------- utenti ----------

def registra_utente(username: str, password: str) -> dict:
    username = (username or "").strip()
    if not username or not password:
        raise ErroreLogica("Username e password sono obbligatori.")
    id_utente = storage.inserisci_utente(username, password, Ruolo.USER.value)
    if id_utente is None:
        raise ErroreLogica("Username già in uso.")
    return {"id": id_utente, "username": username, "ruolo": Ruolo.USER.value}


def login(username: str, password: str) -> dict:
    utente = storage.trova_utente_per_credenziali((username or "").strip(), password or "")
    if utente is None:
        raise ErroreLogica("Username o password errati.")
    return utente


def _verifica_utente(id_utente) -> None:
    if not storage.esiste_utente(id_utente):
        raise ErroreLogica("Utente non valido: effettua il login.")


# ---------- oggetti smarriti ----------

def registra_oggetto(descrizione: str, luogo: str, id_utente: int,
                     data_ritrovamento: str | None = None) -> dict:
    _verifica_utente(id_utente)
    descrizione = (descrizione or "").strip()
    luogo = (luogo or "").strip()
    if not descrizione or not luogo:
        raise ErroreLogica("Descrizione e luogo sono obbligatori.")
    data_ritrovamento = data_ritrovamento or date.today().isoformat()
    try:
        date.fromisoformat(data_ritrovamento)
    except ValueError:
        raise ErroreLogica("Data non valida: usa il formato AAAA-MM-GG.")
    id_oggetto = storage.inserisci_oggetto(
        descrizione, luogo, id_utente, StatoOggetto.TROVATO.value, data_ritrovamento
    )
    return storage.leggi_oggetto(id_oggetto)


def cerca_oggetti(testo: str = "", luogo: str = "", stato: str = "") -> list[dict]:
    """Cerca per parole nella descrizione e nel luogo. I filtri vuoti vengono ignorati."""
    stato = (stato or "").strip().lower()
    if stato and stato not in STATI:
        raise ErroreLogica("Stato non valido.")
    return storage.cerca_oggetti(
        (testo or "").split(),
        (luogo or "").strip() or None,
        stato or None,
    )


def restituisci_oggetto(id_oggetto: int, id_utente: int) -> dict:
    """Segna l'oggetto come restituito. Non cancella nulla: resta tracciato."""
    _verifica_utente(id_utente)
    oggetto = storage.leggi_oggetto(id_oggetto)
    if oggetto is None:
        raise ErroreLogica("Oggetto non trovato.")
    if oggetto["stato"] == StatoOggetto.RESTITUITO.value:
        raise ErroreLogica("L'oggetto risulta già restituito.")
    storage.aggiorna_stato_oggetto(id_oggetto, StatoOggetto.RESTITUITO.value)
    return storage.leggi_oggetto(id_oggetto)


def conta_aperti() -> int:
    return storage.conta_oggetti_per_stato(StatoOggetto.TROVATO.value)


def riepilogo_per_luogo() -> list[dict]:
    """Per ogni luogo: quanti oggetti sono da restituire e quanti restituiti."""
    per_luogo: dict[str, dict] = {}
    for riga in storage.conta_oggetti_per_luogo_e_stato():
        voce = per_luogo.setdefault(
            riga["luogo"], {"luogo": riga["luogo"], "da_restituire": 0, "restituiti": 0}
        )
        if riga["stato"] == StatoOggetto.TROVATO.value:
            voce["da_restituire"] += riga["n"]
        elif riga["stato"] == StatoOggetto.RESTITUITO.value:
            voce["restituiti"] += riga["n"]
    return list(per_luogo.values())


# ---------- post ----------

def crea_post(titolo: str, descrizione: str, categoria: str, id_autore: int,
              id_oggetto: int | None = None) -> dict:
    _verifica_utente(id_autore)
    titolo = (titolo or "").strip()
    descrizione = (descrizione or "").strip()
    if not titolo or not descrizione:
        raise ErroreLogica("Titolo e descrizione sono obbligatori.")
    if categoria not in CATEGORIE:
        raise ErroreLogica("Categoria non valida.")
    if id_oggetto is not None and storage.leggi_oggetto(id_oggetto) is None:
        raise ErroreLogica("Oggetto non trovato.")
    id_post = storage.inserisci_post(
        titolo, descrizione, categoria, id_autore, id_oggetto,
        datetime.now().isoformat(timespec="seconds"),
    )
    return storage.leggi_post(id_post)


def elenco_post(categoria: str = "") -> list[dict]:
    categoria = (categoria or "").strip().lower()
    if categoria and categoria not in CATEGORIE:
        raise ErroreLogica("Categoria non valida.")
    return storage.elenco_post(categoria or None)


def main():
    storage.init_db()


if __name__ == "__main__":
    main()