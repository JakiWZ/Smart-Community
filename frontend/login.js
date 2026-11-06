// Login dimostrativo: nessuna autenticazione reale (il progetto non ha un server).
const form = document.getElementById("login-form");
const email = document.getElementById("email");
const password = document.getElementById("password");
const emailErr = document.getElementById("email-err");
const pwErr = document.getElementById("pw-err");
const toggle = document.getElementById("toggle-pw");

function segnala(campo, nodoErrore, messaggio) {
  nodoErrore.textContent = messaggio;
  campo.setAttribute("aria-invalid", messaggio ? "true" : "false");
  return !messaggio;
}

toggle.addEventListener("click", () => {
  const mostra = password.type === "password";
  password.type = mostra ? "text" : "password";
  toggle.textContent = mostra ? "Nascondi" : "Mostra";
  toggle.setAttribute("aria-pressed", String(mostra));
});

form.addEventListener("submit", (evento) => {
  evento.preventDefault();
  const valore = email.value.trim();
  const emailOk = segnala(email, emailErr,
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valore) ? "" : "Inserisci un’email valida, per esempio nome@esempio.it.");
  const pwOk = segnala(password, pwErr,
    password.value.length >= 6 ? "" : "La password deve avere almeno 6 caratteri.");
  if (!emailOk || !pwOk) return;

  try {
    sessionStorage.setItem("utente", valore.split("@")[0]);
  } catch (errore) { /* storage non disponibile: si entra comunque */ }
  window.location.href = "dashboard.html";
});