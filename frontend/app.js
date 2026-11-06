// Dashboard interattiva: parte già piena (dati.js) e si aggiorna a ogni azione.
// Le modifiche fatte nel browser restano salvate in localStorage; "Ripristina dati" torna a dati.js.
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
const CHIAVE = "smart-community-oggetti";
const DATI = window.DATI || { oggetti: [], attivita: [] };

let oggetti = caricaOggetti();
let tabAttiva = "tutti";

function el(tag, testo, classe) {
  const nodo = document.createElement(tag);
  if (testo !== undefined) nodo.textContent = testo;
  if (classe) nodo.className = classe;
  return nodo;
}
const copia = (x) => JSON.parse(JSON.stringify(x));
const stato = (o) => String(o.Stato).trim().toLowerCase();

function caricaOggetti() {
  try {
    const salvato = JSON.parse(localStorage.getItem(CHIAVE));
    if (Array.isArray(salvato)) return salvato;
  } catch (errore) { /* storage vuoto o non disponibile */ }
  return copia(DATI.oggetti);
}
function salva() {
  try { localStorage.setItem(CHIAVE, JSON.stringify(oggetti)); } catch (errore) { /* si lavora in memoria */ }
}
function calcola() {
  const restituiti = oggetti.filter((o) => stato(o) === "restituito").length;
  const perLuogo = {};
  for (const o of oggetti) if (stato(o) !== "restituito") perLuogo[o.Luogo] = (perLuogo[o.Luogo] || 0) + 1;
  return {
    totale: oggetti.length, restituiti, daRestituire: oggetti.length - restituiti, perLuogo,
    pct: oggetti.length ? Math.round(100 * restituiti / oggetti.length) : 0,
  };
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
    if (m.link) { azione = el("a", m.etichetta, "btn"); azione.href = m.link; }
    else azione = el("span", "Non ancora disponibile", "btn off");
    card.append(el("div", m.icona, "card-icon"), el("small", "Modulo", "muted"), el("h3", m.nome),
      el("p", m.testo), el("small", "Stato", "muted"), el("span", m.stato, "badge " + m.classe), riga, azione);
    box.append(card);
  }
  if (!box.children.length) box.append(el("p", "Nessun modulo in questa categoria.", "muted"));
}

function mostraRiepilogo() {
  const c = calcola();
  document.getElementById("donut").style.setProperty("--pct", c.pct);
  document.getElementById("donut-label").textContent = c.pct + "%";
  document.getElementById("donut-caption").textContent =
    `${c.restituiti} restituiti su ${c.totale} · ${c.daRestituire} ancora da restituire`;

  const lista = document.getElementById("bars");
  lista.replaceChildren();
  const voci = Object.entries(c.perLuogo);
  if (!voci.length) { lista.append(el("li", "Nessun oggetto da restituire.")); return; }
  const max = Math.max(1, ...voci.map(([, n]) => n));
  for (const [luogo, n] of voci) {
    const nome = el("button", luogo, "bar-btn");
    nome.type = "button";
    nome.title = "Mostra gli oggetti di questo luogo";
    nome.addEventListener("click", () => {
      document.getElementById("search").value = luogo;
      mostraTabella();
      document.getElementById("lostfound").scrollIntoView({ behavior: "smooth" });
    });
    const barra = el("div", undefined, "bar");
    const riempi = el("div");
    riempi.style.width = (n / max * 100) + "%";
    barra.append(riempi);
    const riga = el("li");
    riga.append(nome, barra, el("span", String(n)));
    lista.append(riga);
  }
}

function mostraAttivita() {
  const lista = document.getElementById("activities");
  lista.replaceChildren();
  if (!Array.isArray(DATI.attivita) || !DATI.attivita.length) {
    lista.append(el("li", "Nessuna attività nei prossimi 30 giorni."));
    return;
  }
  for (const a of DATI.attivita) {
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
  const filtro = document.getElementById("filter-stato").value;
  const corpo = document.getElementById("table-body");
  corpo.replaceChildren();
  const righe = oggetti.filter((o) =>
    (!filtro || stato(o) === filtro) && (!q || `${o.Oggetto} ${o.Luogo}`.toLowerCase().includes(q)));

  if (!righe.length) {
    const cella = el("td", "Nessun oggetto trovato. Cambia la ricerca o il filtro.");
    cella.colSpan = 5;
    const riga = el("tr");
    riga.append(cella);
    corpo.append(riga);
    return;
  }
  for (const o of righe) {
    const restituito = stato(o) === "restituito";
    const cellaAzione = el("td");
    if (!restituito) {
      const b = el("button", "Segna restituito", "row-btn");
      b.type = "button";
      b.addEventListener("click", () => {
        o.Stato = "restituito";
        salva();
        aggiorna(`«${o.Oggetto}» segnato come restituito.`);
      });
      cellaAzione.append(b);
    } else cellaAzione.textContent = "—";
    const riga = el("tr");
    riga.append(el("td", o.Oggetto), el("td", o.Luogo),
      el("td", restituito ? "Restituito" : "Da restituire"), el("td", o.Data || "—"), cellaAzione);
    corpo.append(riga);
  }
}

function aggiorna(avviso) {
  mostraRiepilogo();
  mostraTabella();
  document.getElementById("message").textContent =
    (avviso ? avviso + " " : "") + `Dati di partenza da dati.js; le modifiche restano salvate in questo browser (${oggetti.length} oggetti).`;
}

// registrazione di un nuovo oggetto
const form = document.getElementById("add-form");
const dataOggi = () => new Date().toLocaleDateString("sv-SE");
document.getElementById("f-data").value = dataOggi();

function segnala(id, messaggio) {
  document.getElementById("e-" + id).textContent = messaggio;
  document.getElementById("f-" + id).setAttribute("aria-invalid", messaggio ? "true" : "false");
  return !messaggio;
}
form.addEventListener("submit", (evento) => {
  evento.preventDefault();
  const nome = document.getElementById("f-oggetto").value.trim();
  const luogo = document.getElementById("f-luogo").value.trim();
  const data = document.getElementById("f-data").value;
  const ok = [
    segnala("oggetto", nome ? "" : "Scrivi che oggetto hai trovato."),
    segnala("luogo", luogo ? "" : "Scrivi dove l’hai trovato."),
    segnala("data", /^\d{4}-\d{2}-\d{2}$/.test(data) ? "" : "Scegli la data del ritrovamento."),
  ];
  if (ok.includes(false)) return;
  const id = Math.max(0, ...oggetti.map((o) => Number(o.id) || 0)) + 1;
  oggetti.push({ id, Oggetto: nome, Luogo: luogo, Stato: "trovato", Data: data });
  salva();
  form.reset();
  document.getElementById("f-data").value = dataOggi();
  aggiorna(`«${nome}» registrato.`);
});

document.getElementById("search").addEventListener("input", mostraTabella);
document.getElementById("filter-stato").addEventListener("change", mostraTabella);
document.getElementById("reset").addEventListener("click", () => {
  if (!window.confirm("Ripristinare i dati di partenza? Le modifiche fatte in questo browser andranno perse.")) return;
  try { localStorage.removeItem(CHIAVE); } catch (errore) { /* niente da rimuovere */ }
  oggetti = copia(DATI.oggetti);
  aggiorna("Dati ripristinati.");
});

// avvio: la pagina si apre già piena
document.getElementById("today").textContent =
  new Date().toLocaleDateString("it-IT", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
document.getElementById("banner-date").textContent =
  new Date().toLocaleDateString("it-IT", { day: "numeric", month: "long", year: "numeric" });
mostraTabs();
mostraModuli();
mostraAttivita();
aggiorna();

// accesso dimostrativo: nome salvato dal login e "Esci"
try {
  const nomeUtente = sessionStorage.getItem("utente");
  if (nomeUtente) document.getElementById("user-name").textContent = nomeUtente;
  document.getElementById("logout").addEventListener("click", () => sessionStorage.removeItem("utente"));
} catch (errore) { /* storage non disponibile: la dashboard funziona comunque */ }