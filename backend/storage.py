import sqlite3
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
SCHEMA_PATH = BASE_DIR / "infrastructure" / "schema.sql"
DB_PATH = BASE_DIR / "smart_community.db"


def get_connection() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn


def init_db() -> None:
    schema = SCHEMA_PATH.read_text(encoding="utf-8")
    with get_connection() as conn:
        conn.executescript(schema)