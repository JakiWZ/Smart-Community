// Dati di partenza della dashboard. In futuro li rigenera Python (storage.py),
// così la pagina si apre già piena anche senza server (niente fetch).
window.DATI = {
  oggetti: [
    {"id": 1, "Oggetto": "Zaino viola", "Luogo": "Biblioteca", "Stato": "Trovato", "Data": ""},
    {"id": 2, "Oggetto": "Giacca nera", "Luogo": "Aula 3", "Stato": "trovato", "Data": "2026-11-05"},
    {"id": 3, "Oggetto": "Borraccia verde", "Luogo": "Palestra", "Stato": "restituito", "Data": "2026-11-04"},
    {"id": 4, "Oggetto": "Chiavi con portachiavi rosso", "Luogo": "Ingresso", "Stato": "trovato", "Data": "2026-11-04"},
    {"id": 5, "Oggetto": "Quaderno a quadretti", "Luogo": "Aula 5", "Stato": "restituito", "Data": "2026-11-02"}
  ],
  attivita: [
    {"data": "2026-11-14", "titolo": "Pulizia del cortile", "dettaglio": "Sabato, ore 10:00"},
    {"data": "2026-11-25", "titolo": "Incontro della comunità", "dettaglio": "Mercoledì, ore 18:00"}
  ]
};