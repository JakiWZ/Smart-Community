from dataclasses import dataclass, field
from datetime import date, datetime
from enum import Enum
 
 
class Ruolo(Enum):
    ADMIN = "admin"
    USER = "user"
 
 
class Categoria(Enum):
    EVENTO = "evento"
    OGGETTO = "oggetto"
 
 
class StatoOggetto(Enum):
    TROVATO = "trovato"
    RESTITUITO = "restituito"
 
 
@dataclass
class Utente:
    id: int
    username: str
    password: str = field(repr=False)
    ruolo: Ruolo = Ruolo.USER
 
    def is_admin(self) -> bool:
        return self.ruolo == Ruolo.ADMIN
 
 
@dataclass
class OggettoSmarrito:
    id: int
    descrizione: str
    luogo: str
    id_utente: int  # utente che ha registrato l'oggetto
    stato: StatoOggetto = StatoOggetto.TROVATO
    data_ritrovamento: date = field(default_factory=date.today)
 
 
@dataclass
class Post:
    id: int
    titolo: str
    descrizione: str
    categoria: Categoria
    id_autore: int  # utente che ha pubblicato l'annuncio
    id_oggetto: int | None = None # id oggetto in caso di annuncio di un oggetto smarrito
    data_pubblicazione: datetime = field(default_factory=datetime.now)