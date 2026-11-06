// Recupero password dimostrativo: nessuna email viene inviata (il progetto non ha un server).
const form = document.getElementById("rec-form");
const email = document.getElementById("email");
const errore = document.getElementById("email-err");
const ok = document.getElementById("ok-msg");

form.addEventListener("submit", (evento) => {
  evento.preventDefault();
  const valore = email.value.trim();
  const valida = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valore);
  errore.textContent = valida ? "" : "Inserisci un’email valida, per esempio nome@esempio.it.";
  email.setAttribute("aria-invalid", valida ? "false" : "true");
  ok.hidden = true;
  if (!valida) return;
  ok.textContent = `Se ${valore} è registrata, riceverai le istruzioni per reimpostare la password.`;
  ok.hidden = false;
});