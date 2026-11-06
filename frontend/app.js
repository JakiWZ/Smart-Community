// Dashboard interattiva: i dati di partenza arrivano da dati.json (o da dati.js come ripiego).
// Le modifiche fatte nel browser restano salvate in localStorage; "Ripristina dati" torna ai dati di partenza.
const NUM_ANNUNCI = 3; // quanti annunci mostrare nell'anteprima della home
const CHIAVE = "smart-community-oggetti";

let DATI = { oggetti: [] };   // dati di partenza (da dati.json, o da dati.js come ripiego)
let fonteDati = "";           // da dove arrivano, solo per il messaggio in pagina
let oggetti = [];

// Carica i dati di partenza. In futuro basterà cambiare l'indirizzo con quello dell'API del database.
async function caricaDati() {
  try {
    const risposta = await fetch("dati.json");
    if (!risposta.ok) throw new Error("HTTP " + risposta.status);
    fonteDati = "dati.json";
    return await risposta.json();
  } catch (errore) {
    // succede aprendo il file con doppio clic (file://): il browser blocca fetch
    console.warn("dati.json non caricato, uso dati.js:", errore);
    fonteDati = "dati.js (ripiego: apri il sito con un server locale per leggere dati.json)";
    return window.DATI || { oggetti: [] };
  }
}

async function avvia() {
  DATI = await caricaDati();
  oggetti = caricaOggetti();
  aggiorna();
}

function el(tag, testo, classe) {
  const nodo = document.createElement(tag);
  if (testo !== undefined) nodo.textContent = testo;
  if (classe) nodo.className = classe;
  return nodo;
}
const copia = (x) => JSON.parse(JSON.stringify(x));
const stato = (o) => String(o.Stato).trim().toLowerCase();
// minuscolo e senza accenti, così "caffè" e "caffe" si trovano a vicenda
const normalizza = (t) => String(t ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
// dal più recente al meno recente; a parità di data prima l'ultimo registrato
const piuRecenti = (a, b) =>
  String(b.Data || "").localeCompare(String(a.Data || "")) || (Number(b.id) || 0) - (Number(a.id) || 0);

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

function formattaData(data) {
  const d = new Date(data + "T00:00:00");
  return isNaN(d) ? "—" : d.toLocaleDateString("it-IT", { day: "numeric", month: "short", year: "numeric" });
}

// card di un oggetto: usata sia nell'anteprima della home sia nella bacheca
function creaCard(o) {
  const restituito = stato(o) === "restituito";
  const card = el("article", undefined, "card");
  const apri = el("button", "Visualizza", "row-btn");
  apri.type = "button";
  apri.addEventListener("click", () => apriDettaglio(o));
  card.append(el("div", "▣", "card-icon"), el("h3", o.Oggetto), el("p", "Trovato in: " + o.Luogo));
  if (o.Descrizione) card.append(el("p", o.Descrizione, "desc"));
  card.append(
    el("small", formattaData(o.Data), "muted"),
    el("span", restituito ? "Restituito" : "Da restituire", "badge " + (restituito ? "disponibile" : "lavorazione")),
    apri
  );
  return card;
}

// anteprima degli ultimi annunci (home)
function mostraAnnunci() {
  const box = document.getElementById("latest");
  box.replaceChildren();
  const ultimi = [...oggetti].sort(piuRecenti).slice(0, NUM_ANNUNCI);
  if (!ultimi.length) {
    box.append(el("p", "Nessun annuncio pubblicato.", "muted"));
    return;
  }
  for (const o of ultimi) box.append(creaCard(o));
}

// bacheca Lost & Found: ricerca per parole chiave + filtro per stato
function mostraBacheca() {
  const parole = normalizza(document.getElementById("search").value).split(/\s+/).filter(Boolean);
  const filtro = document.getElementById("filter-stato").value;
  const box = document.getElementById("board");
  box.replaceChildren();

  const trovati = oggetti
    .filter((o) => {
      if (filtro && stato(o) !== filtro) return false;
      const testo = normalizza(`${o.Oggetto} ${o.Luogo} ${o.Descrizione || ""}`);
      return parole.every((p) => testo.includes(p)); // tutte le parole devono comparire
    })
    .sort(piuRecenti);

  document.getElementById("count").textContent =
    trovati.length === 1 ? "1 oggetto trovato" : `${trovati.length} oggetti trovati`;

  if (!trovati.length) {
    box.append(el("p", "Nessun oggetto trovato. Prova con meno parole o cambia il filtro.", "muted"));
    return;
  }
  for (const o of trovati) box.append(creaCard(o));
}

// finestra con i dettagli di un oggetto
const dettaglio = document.getElementById("detail");
function apriDettaglio(o) {
  const restituito = stato(o) === "restituito";
  document.getElementById("detail-title").textContent = o.Oggetto;

  const dl = el("dl");
  const riga = (nome, valore) => {
    const dd = el("dd");
    dd.append(valore);          // accetta testo oppure un elemento
    dl.append(el("dt", nome), dd);
  };
  riga("Stato", el("span", restituito ? "Restituito" : "Da restituire", "badge " + (restituito ? "disponibile" : "lavorazione")));
  riga("Luogo", o.Luogo);
  riga("Data", formattaData(o.Data));
  riga("Descrizione", o.Descrizione || "Nessuna descrizione.");
  riga("Codice", "#" + o.id);
  document.getElementById("detail-body").replaceChildren(dl);

  const azioni = document.getElementById("detail-actions");
  azioni.replaceChildren();
  if (!restituito) {
    const b = el("button", "Segna restituito", "btn btn-inline");
    b.type = "button";
    b.addEventListener("click", () => {
      o.Stato = "restituito";
      salva();
      dettaglio.close();
      aggiorna(`«${o.Oggetto}» segnato come restituito.`);
    });
    azioni.append(b);
  }
  const chiudi = el("button", "Chiudi", "btn btn-inline outline");
  chiudi.type = "button";
  chiudi.addEventListener("click", () => dettaglio.close());
  azioni.append(chiudi);

  dettaglio.showModal();
}
document.getElementById("detail-close").addEventListener("click", () => dettaglio.close());
// clic sullo sfondo scuro = chiudi
dettaglio.addEventListener("click", (e) => { if (e.target === dettaglio) dettaglio.close(); });

function aggiorna(avviso) {
  mostraAnnunci();
  mostraBacheca();
  document.getElementById("message").textContent =
    (avviso ? avviso + " " : "") + `Dati di partenza da ${fonteDati}; le modifiche restano salvate in questo browser (${oggetti.length} oggetti).`;
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
  const descrizione = document.getElementById("f-descrizione").value.trim();
  const ok = [
    segnala("oggetto", nome ? "" : "Scrivi che oggetto hai trovato."),
    segnala("luogo", luogo ? "" : "Scrivi dove l’hai trovato."),
    segnala("data", /^\d{4}-\d{2}-\d{2}$/.test(data) ? "" : "Scegli la data del ritrovamento."),
  ];
  if (ok.includes(false)) return;
  const id = Math.max(0, ...oggetti.map((o) => Number(o.id) || 0)) + 1;
  oggetti.push({ id, Oggetto: nome, Luogo: luogo, Stato: "trovato", Data: data, Descrizione: descrizione });
  salva();
  form.reset();
  document.getElementById("f-data").value = dataOggi();
  // azzera ricerca e filtro così il nuovo annuncio si vede subito, poi richiudi il modulo
  document.getElementById("search").value = "";
  document.getElementById("filter-stato").value = "";
  document.getElementById("add-details").open = false;
  aggiorna(`«${nome}» registrato.`);
});

document.getElementById("search").addEventListener("input", mostraBacheca);
document.getElementById("filter-stato").addEventListener("change", mostraBacheca);
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
avvia();

// accesso dimostrativo: nome salvato dal login e "Esci"
try {
  const nomeUtente = sessionStorage.getItem("utente");
  if (nomeUtente) document.getElementById("user-name").textContent = nomeUtente;
  document.getElementById("logout").addEventListener("click", () => sessionStorage.removeItem("utente"));
} catch (errore) { /* storage non disponibile: la dashboard funziona comunque */ }