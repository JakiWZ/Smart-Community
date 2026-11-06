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

const TIPI_NOTI = [
  [/ombrello|giacca|sciarpa|cappello|felpa|maglia|maglietta/, "Abbigliamento"],
  [/zaino|borsa|tracolla/, "Borse"],
  [/cuffie|telefono|computer|caricatore|mouse|tablet/, "Elettronica"],
  [/quaderno|libro|penna|matita|astuccio/, "Cancelleria"],
  [/chiav/, "Chiavi"],
  [/borraccia|bottiglia|tazza|bicchiere/, "Contenitori"],
  [/portafoglio|documento|tessera|badge/, "Documenti"],
];
const tipoDi = (o) => {
  if (o.Tipo) return o.Tipo;
  const nome = normalizza(o.Oggetto);
  const trovato = TIPI_NOTI.find(([regola]) => regola.test(nome));
  return trovato ? trovato[1] : "Altro";
};
const paroleDi = (o) => {
  const scritte = Array.isArray(o.Parole) ? o.Parole : [];
  const dalNome = String(o.Oggetto || "").split(/\s+/);
  const ignora = new Set(["con", "del", "della", "dei", "degli", "delle", "per", "una", "uno", "gli", "che"]);
  const viste = new Set();
  const lista = [];
  for (const raw of [...scritte, ...dalNome]) {
    const parola = String(raw || "").trim();
    const chiave = normalizza(parola);
    if (chiave.length < 3 || ignora.has(chiave) || viste.has(chiave)) continue;
    viste.add(chiave);
    lista.push(parola);
  }
  return lista;
};
let paroleAttive = new Set();

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
  if (o.Foto) {
    const foto = document.createElement("img");
    foto.src = o.Foto;
    foto.alt = "";
    foto.className = "card-photo";
    card.append(foto);
  } else {
    card.append(el("div", "▣", "card-icon"));
  }
  card.append(el("h3", o.Oggetto), el("p", "Trovato in: " + o.Luogo), el("p", tipoDi(o), "muted"));
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

function raccogliParole() {
  const conteggio = new Map();
  const aggiungi = (parola) => {
    const chiave = normalizza(parola);
    if (chiave.length < 3) return;
    const voce = conteggio.get(chiave) || { label: String(parola).trim(), n: 0 };
    voce.n += 1;
    conteggio.set(chiave, voce);
  };
  for (const o of oggetti) {
    const scritte = Array.isArray(o.Parole) ? o.Parole.filter((p) => String(p).trim()) : [];
    if (scritte.length) scritte.forEach(aggiungi);
    else if (paroleDi(o)[0]) aggiungi(paroleDi(o)[0]);
  }
  return [...conteggio.values()]
    .sort((a, b) => b.n - a.n || a.label.localeCompare(b.label, "it"))
    .slice(0, 16);
}

function mostraParole() {
  const box = document.getElementById("keyword-chips");
  const lista = raccogliParole();
  box.replaceChildren();
  box.hidden = lista.length === 0;
  for (const voce of lista) {
    const chiave = normalizza(voce.label);
    const chip = el("button", voce.label, "chip" + (paroleAttive.has(chiave) ? " active" : ""));
    chip.type = "button";
    chip.setAttribute("aria-pressed", paroleAttive.has(chiave) ? "true" : "false");
    chip.addEventListener("click", () => {
      if (paroleAttive.has(chiave)) paroleAttive.delete(chiave);
      else paroleAttive.add(chiave);
      mostraParole();
      mostraBacheca();
    });
    box.append(chip);
  }
}

// bacheca Lost & Found: testo libero, tipo, stato e parole chiave
function mostraBacheca() {
  const parole = normalizza(document.getElementById("search").value).split(/\s+/).filter(Boolean);
  const filtro = document.getElementById("filter-stato").value;
  const tipo = document.getElementById("filter-tipo").value;
  const box = document.getElementById("board");
  box.replaceChildren();

  const trovati = oggetti
    .filter((o) => {
      if (filtro && stato(o) !== filtro) return false;
      if (tipo && tipoDi(o) !== tipo) return false;
      const chiavi = paroleDi(o).map(normalizza);
      if (paroleAttive.size && ![...paroleAttive].some((p) => chiavi.includes(p))) return false;
      const testo = normalizza(`${o.Oggetto} ${o.Luogo} ${o.Descrizione || ""} ${tipoDi(o)} ${chiavi.join(" ")}`);
      return parole.every((p) => testo.includes(p));
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
  const corpo = document.createDocumentFragment();
  if (o.Foto) {
    const foto = document.createElement("img");
    foto.src = o.Foto;
    foto.alt = "Foto di " + o.Oggetto;
    foto.className = "detail-photo";
    corpo.append(foto);
  }
  riga("Stato", el("span", restituito ? "Restituito" : "Da restituire", "badge " + (restituito ? "disponibile" : "lavorazione")));
  riga("Tipo", tipoDi(o));
  riga("Luogo", o.Luogo);
  riga("Data", formattaData(o.Data));
  const scritte = Array.isArray(o.Parole) ? o.Parole.map((p) => String(p).trim()).filter(Boolean) : [];
  riga("Parole chiave", (scritte.length ? scritte : paroleDi(o)).join(", ") || "Nessuna.");
  riga("Descrizione", o.Descrizione || "Nessuna descrizione.");
  riga("Codice", "#" + o.id);
  corpo.append(dl);
  document.getElementById("detail-body").replaceChildren(corpo);

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
  mostraParole();
  mostraBacheca();
  document.getElementById("message").textContent =
    (avviso ? avviso + " " : "") + `Dati di partenza da ${fonteDati}; le modifiche restano salvate in questo browser (${oggetti.length} oggetti).`;
}

// registrazione di un nuovo oggetto, aperta dal "+" sulla bacheca
const form = document.getElementById("add-form");
const aggiungi = document.getElementById("add-dialog");
const dataOggi = () => new Date().toLocaleDateString("sv-SE");
document.getElementById("f-data").value = dataOggi();

function segnala(id, messaggio) {
  document.getElementById("e-" + id).textContent = messaggio;
  document.getElementById("f-" + id).setAttribute("aria-invalid", messaggio ? "true" : "false");
  return !messaggio;
}

function leggiFoto(file) {
  return new Promise((resolve, reject) => {
    if (!file) return resolve("");
    if (!file.type.startsWith("image/")) return reject(new Error("Scegli un file immagine."));
    if (file.size > 8 * 1024 * 1024) return reject(new Error("La foto supera 8 MB."));
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const lato = 900;
      const scala = Math.min(1, lato / Math.max(img.width, img.height));
      const tela = document.createElement("canvas");
      tela.width = Math.max(1, Math.round(img.width * scala));
      tela.height = Math.max(1, Math.round(img.height * scala));
      tela.getContext("2d").drawImage(img, 0, 0, tela.width, tela.height);
      URL.revokeObjectURL(url);
      resolve(tela.toDataURL("image/jpeg", 0.72));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Non riesco a leggere questa foto."));
    };
    img.src = url;
  });
}

const anteprima = document.getElementById("foto-preview");
document.getElementById("f-foto").addEventListener("change", async () => {
  const file = document.getElementById("f-foto").files[0];
  anteprima.hidden = true;
  anteprima.removeAttribute("src");
  if (!file) {
    segnala("foto", "");
    return;
  }
  try {
    anteprima.src = await leggiFoto(file);
    anteprima.hidden = false;
    segnala("foto", "");
  } catch (errore) {
    segnala("foto", errore.message);
  }
});

form.addEventListener("submit", async (evento) => {
  evento.preventDefault();
  const nome = document.getElementById("f-oggetto").value.trim();
  const luogo = document.getElementById("f-luogo").value.trim();
  const data = document.getElementById("f-data").value;
  const tipo = document.getElementById("f-tipo").value;
  const descrizione = document.getElementById("f-descrizione").value.trim();
  const parole = document.getElementById("f-parole").value.split(/[,;]+/).map((p) => p.trim()).filter(Boolean);
  const ok = [
    segnala("oggetto", nome ? "" : "Scrivi che oggetto hai trovato."),
    segnala("luogo", luogo ? "" : "Scrivi dove l’hai trovato."),
    segnala("data", /^\d{4}-\d{2}-\d{2}$/.test(data) ? "" : "Scegli la data del ritrovamento."),
    segnala("tipo", tipo ? "" : "Scegli il tipo di oggetto."),
  ];
  if (ok.includes(false)) return;
  let foto = "";
  const file = document.getElementById("f-foto").files[0];
  if (file) {
    try {
      foto = await leggiFoto(file);
      segnala("foto", "");
    } catch (errore) {
      segnala("foto", errore.message);
      return;
    }
  } else {
    segnala("foto", "");
  }
  const id = Math.max(0, ...oggetti.map((o) => Number(o.id) || 0)) + 1;
  oggetti.push({ id, Oggetto: nome, Luogo: luogo, Stato: "trovato", Data: data, Descrizione: descrizione, Tipo: tipo, Parole: parole, Foto: foto });
  salva();
  form.reset();
  anteprima.hidden = true;
  anteprima.removeAttribute("src");
  document.getElementById("f-data").value = dataOggi();
  document.getElementById("search").value = "";
  document.getElementById("filter-stato").value = "";
  document.getElementById("filter-tipo").value = "";
  paroleAttive = new Set();
  aggiungi.close();
  aggiorna(`«${nome}» registrato.`);
});

document.getElementById("open-add").addEventListener("click", () => {
  aggiungi.showModal();
  document.getElementById("f-oggetto").focus();
});
document.getElementById("add-close").addEventListener("click", () => aggiungi.close());
aggiungi.addEventListener("click", (e) => { if (e.target === aggiungi) aggiungi.close(); });

document.getElementById("search").addEventListener("input", mostraBacheca);
document.getElementById("filter-stato").addEventListener("change", mostraBacheca);
document.getElementById("filter-tipo").addEventListener("change", mostraBacheca);
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
  if (nomeUtente) {
    document.getElementById("user-name").textContent = nomeUtente;
    document.getElementById("profile-name").textContent = nomeUtente;
  }
  document.getElementById("logout").addEventListener("click", () => sessionStorage.removeItem("utente"));
} catch (errore) { /* storage non disponibile: la dashboard funziona comunque */ }