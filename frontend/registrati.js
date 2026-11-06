// Registrazione dimostrativa: nessun dato viene salvato (il progetto non ha un server).
const form = document.getElementById("reg-form");
const campi = {
  nome: [document.getElementById("nome"), document.getElementById("nome-err")],
  email: [document.getElementById("email"), document.getElementById("email-err")],
  password: [document.getElementById("password"), document.getElementById("pw-err")],
  conferma: [document.getElementById("conferma"), document.getElementById("conf-err")],
};

function segnala([campo, nodo], messaggio) {
  nodo.textContent = messaggio;
  campo.setAttribute("aria-invalid", messaggio ? "true" : "false");
  return !messaggio;
}

form.addEventListener("submit", (evento) => {
  evento.preventDefault();
  const nome = campi.nome[0].value.trim();
  const pw = campi.password[0].value;
  const risultati = [
    segnala(campi.nome, nome ? "" : "Inserisci il tuo nome."),
    segnala(campi.email, /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(campi.email[0].value.trim())
      ? "" : "Inserisci un’email valida, per esempio nome@esempio.it."),
    segnala(campi.password, pw.length >= 6 ? "" : "La password deve avere almeno 6 caratteri."),
    segnala(campi.conferma, campi.conferma[0].value === pw ? "" : "Le due password non coincidono."),
  ];
  if (risultati.includes(false)) return;

  try { sessionStorage.setItem("utente", nome); } catch (errore) { /* si entra comunque */ }
  window.location.href = "dashboard.html";
});