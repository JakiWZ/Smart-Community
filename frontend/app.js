// Il frontend presenta valori già calcolati da Python (riepilogo.json).
// Le card dei moduli sono solo presentazione.
const MODULI = [
  { nome: "Lost & Found", icona: "▣", testo: "Registra, cerca e restituisci gli oggetti trovati.", stato: "Disponibile", chiave: "disponibili", classe: "disponibile", avanzamento: 100, link: "#lostfound", etichetta: "Apri Lost & Found" },
  { nome: "Segnalazioni", icona: "⚠", testo: "Ogni segnalazione ha uno stato che si aggiorna.", stato: "In lavorazione", chiave: "lavorazione", classe: "lavorazione", avanzamento: 40 },
  { nome: "Attività", icona: "☆", testo: "Bacheca di iniziative ed eventi della comunità.", stato: "In arrivo", chiave: "arrivo", classe: "arrivo", avanzamento: 0 },
];
const TABS = [
  { chiave: "tutti", etichetta: "Tutti" },
  { chiave: "disponibili", etichetta: "Disponibili" },
  { chiave: "lavorazione", etichetta: "In lavorazione" },
  { chiave: "arrivo", etichetta: "In arrivo" },
];
const MESI = ["gen", "feb", "mar", "apr", "mag", "giu", "lug", "ago", "set", "ott", "nov", "dic"];

let oggettiCorrenti = [];
let tabAttiva = "tutti";

function el(tag, testo, classe) {
  const nodo = document.createElement(tag);
  if (testo !== undefined) nodo.textContent = testo;
  if (classe) nodo.className = classe;
  return nodo;
}

function schemaValido(d) {
  return d !== null && typeof d === "object" && !Array.isArray(d)
    && Number.isFinite(d.totale)
    && Number.isFinite(d.percentuale_restituiti)
    && d.da_restituire_per_luogo !== null
    && typeof d.da_restituire_per_luogo === "object"
    && Array.isArray(d.oggetti);
}

function mostraData() {
  const oggi = new Date().toLocaleDateString("it-IT", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  document.getElementById("today").textContent = oggi + " · dati di esempio";
  document.getElementById("banner-date").textContent = new Date().toLocaleDateString("it-IT", { day: "numeric", month: "long", year: "numeric" });
}

function mostraTabs() {
  const box = document.getElementById("tabs");
  box.replaceChildren();
  for (const t of TABS) {
    const b = el("button", t.etichetta);
    b.type = "button";
    b.setAttribute("aria-pressed", String(t.chiave === tabAttiva));
    b.addEventListener("click", () => { tabAttiva = t.chiave; mostraTabs(); mostraModuli(); });
    box.append(b);
  }
}

function mostraModuli() {
  const box = document.getElementById("modules");
  box.replaceChildren();
  for (const m of MODULI) {
    if (tabAttiva !== "tutti" && m.chiave !== tabAttiva) continue;
    const card = el("article", undefined, "card");
    const barra = el("div", undefined, "progress");
    const riempi = el("div");
    riempi.style.width = m.avanzamento + "%";
    barra.append(riempi);
    const riga = el("div", undefined, "progress-row");
    riga.append(barra, el("span", m.avanzamento + "%"));

    let azione;
    if (m.link) {
      azione = el("a", m.etichetta, "btn");
      azione.href = m.link;
    } else {
      azione = el("span", "Non ancora disponibile", "btn off");
    }
    card.append(el("div", m.icona, "card-icon"), el("small", "Modulo", "muted"), el("h3", m.nome),
      el("p", m.testo), el("small", "Stato", "muted"), el("span", m.stato, "badge " + m.classe), riga, azione);
    box.append(card);
  }
  if (!box.children.length) box.append(el("p", "Nessun modulo in questa categoria.", "muted"));
}

function mostraRiepilogo(d) {
  const pct = Math.max(0, Math.min(100, d.percentuale_restituiti));
  document.getElementById("donut").style.setProperty("--pct", pct);
  document.getElementById("donut-label").textContent = pct + "%";
  document.getElementById("donut-caption").textContent =
    `${d.restituiti} restituiti su ${d.totale} · ${d.da_restituire} ancora da restituire`;

  const lista = document.getElementById("bars");
  lista.replaceChildren();
  const voci = Object.entries(d.da_restituire_per_luogo);
  if (!voci.length) { lista.append(el("li", "Nessun oggetto da restituire.")); return; }
  const max = Math.max(1, ...voci.map(([, n]) => n));
  for (const [luogo, n] of voci) {
    const barra = el("div", undefined, "bar");
    const riempi = el("div");
    riempi.style.width = (n / max * 100) + "%";
    barra.append(riempi);
    const riga = el("li");
    riga.append(el("span", luogo), barra, el("span", String(n)));
    lista.append(riga);
  }
}

function mostraAttivita(attivita) {
  const lista = document.getElementById("activities");
  lista.replaceChildren();
  if (!Array.isArray(attivita) || !attivita.length) {
    lista.append(el("li", "Nessuna attività nei prossimi 30 giorni."));
    return;
  }
  for (const a of attivita) {
    const [, mese, giorno] = String(a.data).split("-");
    const box = el("div", String(Number(giorno)), "date-box");
    box.append(el("small", MESI[Number(mese) - 1] ?? ""));
    const testo = el("div");
    testo.append(el("strong", a.titolo), el("small", a.dettaglio ?? "", "muted"));
    const riga = el("li");
    riga.append(box, testo, el("span", "in arrivo", "badge arrivo"));
    lista.append(riga);
  }
}

function mostraTabella() {
  const q = document.getElementById("search").value.trim().toLowerCase();
  const stato = document.getElementById("filter-stato").value;
  const corpo = document.getElementById("table-body");
  corpo.replaceChildren();

  const righe = oggettiCorrenti.filter((o) => {
    const s = String(o.Stato).trim().toLowerCase();
    const testo = `${o.Oggetto} ${o.Luogo}`.toLowerCase();
    return (!stato || s === stato) && (!q || testo.includes(q));
  });

  if (!righe.length) {
    const cella = el("td", "Nessun oggetto trovato. Cambia la ricerca o il filtro.");
    cella.colSpan = 4;
    const riga = el("tr");
    riga.append(cella);
    corpo.append(riga);
    return;
  }
  for (const o of righe) {
    const restituito = String(o.Stato).trim().toLowerCase() === "restituito";
    const riga = el("tr");
    riga.append(el("td", o.Oggetto), el("td", o.Luogo),
      el("td", restituito ? "Restituito" : "Da restituire"), el("td", o.Data || "—"));
    corpo.append(riga);
  }
}

document.getElementById("search").addEventListener("input", mostraTabella);
document.getElementById("filter-stato").addEventListener("change", mostraTabella);

document.getElementById("file-input").addEventListener("change", async (evento) => {
  const messaggio = document.getElementById("message");
  const risultati = document.getElementById("results");
  const file = evento.target.files[0];
  if (!file) return;

  let dati;
  try {
    dati = JSON.parse(await file.text());
  } catch (errore) {
    risultati.hidden = true;
    messaggio.textContent = "Il file non è un JSON valido. Carica il riepilogo.json generato da Python.";
    return;
  }
  if (!schemaValido(dati)) {
    risultati.hidden = true;
    messaggio.textContent = "Schema non riconosciuto: servono totale, percentuale_restituiti, da_restituire_per_luogo e oggetti.";
    return;
  }

  oggettiCorrenti = dati.oggetti;
  messaggio.textContent = `File caricato: ${file.name}`;
  mostraData();
  mostraTabs();
  mostraModuli();
  mostraRiepilogo(dati);
  mostraAttivita(dati.attivita);
  mostraTabella();
  risultati.hidden = false;
});

// Accesso dimostrativo: mostra il nome salvato dal login e gestisce "Esci".
try {
  const nome = sessionStorage.getItem("utente");
  if (nome) document.getElementById("user-name").textContent = nome;
  document.getElementById("logout").addEventListener("click", () => sessionStorage.removeItem("utente"));
} catch (errore) { /* storage non disponibile: la dashboard funziona comunque */ }