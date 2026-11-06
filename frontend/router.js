// Router a hash: mostra una sola pagina alla volta in base a location.hash
(function () {
  const pages = document.querySelectorAll("[data-page]");
  const links = document.querySelectorAll("[data-link]");
  const title = document.querySelector(".topbar h1");
  const titles = {
    "dashboard": "Dashboard della comunità",
    "lost-found": "Lost & Found",
    "impostazioni": "Impostazioni",
  };

  function router() {
    let page = location.hash.slice(1);
    if (!titles[page]) page = "dashboard";

    pages.forEach((p) => { p.hidden = p.dataset.page !== page; });
    links.forEach((l) => {
      l.classList.toggle("active", l.getAttribute("href") === "#" + page);
    });
    title.textContent = titles[page];
    document.title = titles[page];
    document.querySelector(".content").scrollTo(0, 0);
  }

  window.addEventListener("hashchange", router);
  router();
})();