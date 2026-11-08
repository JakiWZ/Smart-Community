from pathlib import Path

from flask import Flask, jsonify, request, send_from_directory

import logic
import storage

FRONTEND_DIR = Path(__file__).resolve().parent.parent / "frontend"

# static_folder=None: le pagine del frontend le serviamo noi, qui sotto
app = Flask(__name__, static_folder=None)


# ---------- gestione errori ----------

@app.errorhandler(logic.ErroreLogica)
def errore_logica(e):
    return jsonify({"errore": str(e)}), 400


def dati_json() -> dict:
    return request.get_json(silent=True) or {}


# ---------- utenti ----------

@app.post("/api/registrati")
def api_registrati():
    d = dati_json()
    utente = logic.registra_utente(d.get("username"), d.get("password"))
    return jsonify(utente), 201


@app.post("/api/login")
def api_login():
    d = dati_json()
    return jsonify(logic.login(d.get("username"), d.get("password")))


# ---------- oggetti (lettura libera) ----------

@app.get("/api/oggetti")
def api_oggetti():
    return jsonify(logic.cerca_oggetti(
        testo=request.args.get("q", ""),
        luogo=request.args.get("luogo", ""),
        stato=request.args.get("stato", ""),
    ))


@app.get("/api/aperti")
def api_aperti():
    return jsonify({"aperti": logic.conta_aperti()})


@app.get("/api/riepilogo")
def api_riepilogo():
    return jsonify(logic.riepilogo_per_luogo())


# ---------- oggetti (scrittura: serve id_utente) ----------

@app.post("/api/oggetti")
def api_registra_oggetto():
    d = dati_json()
    oggetto = logic.registra_oggetto(
        d.get("descrizione"), d.get("luogo"), d.get("id_utente"), d.get("data_ritrovamento"),
    )
    return jsonify(oggetto), 201


@app.post("/api/oggetti/<int:id_oggetto>/restituisci")
def api_restituisci(id_oggetto):
    d = dati_json()
    return jsonify(logic.restituisci_oggetto(id_oggetto, d.get("id_utente")))


# ---------- post ----------

@app.get("/api/post")
def api_elenco_post():
    return jsonify(logic.elenco_post(request.args.get("categoria", "")))


@app.post("/api/post")
def api_crea_post():
    d = dati_json()
    post = logic.crea_post(
        d.get("titolo"), d.get("descrizione"), d.get("categoria"),
        d.get("id_autore"), d.get("id_oggetto"),
    )
    return jsonify(post), 201


# ---------- pagine del frontend ----------

@app.get("/")
def home():
    return send_from_directory(FRONTEND_DIR, "index.html")


@app.get("/<path:nome>")
def file_frontend(nome):
    return send_from_directory(FRONTEND_DIR, nome)


if __name__ == "__main__":
    storage.init_db()
    app.run(debug=True)

