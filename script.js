/* =========================================================================
   VETOR MATEMÁTICA — script.js
   1. Menu mobile
   2. Indicador animado da navegação (segue o link ativo / hover)
   3. Destaque da seção visível ao rolar a página
   4. Abas de conteúdo (1º / 2º / 3º ano)
   5. Formulário de contato
   ========================================================================= */
(function () {
  "use strict";

  document.addEventListener("DOMContentLoaded", init);

  function init() {
    setupMobileNav();
    setupNavIndicator();
    setupScrollSpy();
    setupTabs();
    setupContactForm();
    document.getElementById("year").textContent = new Date().getFullYear();
  }

  /* ---------- 1. Menu mobile ---------- */
  function setupMobileNav() {
    const toggle = document.querySelector(".nav-toggle");
    const nav = document.querySelector(".main-nav");
    if (!toggle || !nav) return;

    toggle.addEventListener("click", () => {
      const isOpen = nav.classList.toggle("is-open");
      toggle.classList.toggle("is-open", isOpen);
      toggle.setAttribute("aria-expanded", String(isOpen));
    });

    nav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        nav.classList.remove("is-open");
        toggle.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ---------- 2. Indicador animado da navegação ---------- */
  function setupNavIndicator() {
    const nav = document.querySelector(".main-nav ul");
    const indicator = document.querySelector(".nav-indicator");
    const links = document.querySelectorAll(".main-nav a");
    if (!nav || !indicator || !links.length) return;

    function moveIndicatorTo(el) {
      if (!el) { indicator.style.width = "0px"; return; }
      const navRect = nav.getBoundingClientRect();
      const rect = el.getBoundingClientRect();
      indicator.style.left = rect.left - navRect.left + "px";
      indicator.style.width = rect.width + "px";
    }

    const activeLink = () => document.querySelector(".main-nav a.is-active");

    links.forEach((link) => {
      link.addEventListener("mouseenter", () => moveIndicatorTo(link));
    });
    nav.addEventListener("mouseleave", () => moveIndicatorTo(activeLink()));

    window.addEventListener("resize", () => moveIndicatorTo(activeLink()));

    // guarda a função no escopo global do módulo para o scroll-spy reutilizar
    window.__moveNavIndicator = moveIndicatorTo;
    setTimeout(() => moveIndicatorTo(activeLink()), 50);
  }

  /* ---------- 3. Destaque da seção visível ---------- */
  function setupScrollSpy() {
    const sections = document.querySelectorAll("main section[id]");
    const links = document.querySelectorAll(".main-nav a");
    if (!sections.length || !links.length) return;

    const linkFor = (id) =>
      document.querySelector('.main-nav a[href="#' + id + '"]');

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            links.forEach((l) => l.classList.remove("is-active"));
            const link = linkFor(entry.target.id);
            if (link) {
              link.classList.add("is-active");
              if (window.__moveNavIndicator) window.__moveNavIndicator(link);
            }
          }
        });
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
    );

    sections.forEach((section) => observer.observe(section));
  }

  /* ---------- 4. Abas de conteúdo ---------- */
  function setupTabs() {
    const tabsBar = document.querySelector(".tabs-bar");
    if (!tabsBar) return;

    const buttons = Array.from(tabsBar.querySelectorAll(".tab-btn"));
    const indicator = tabsBar.querySelector(".tab-indicator");
    const panels = document.querySelectorAll(".tab-panel");

    function moveIndicator(btn) {
      const barRect = tabsBar.getBoundingClientRect();
      const rect = btn.getBoundingClientRect();
      indicator.style.left = rect.left - barRect.left + "px";
      indicator.style.width = rect.width + "px";
    }

    function activate(targetId, btn) {
      buttons.forEach((b) => b.classList.toggle("is-active", b === btn));
      panels.forEach((p) => p.classList.toggle("is-active", p.id === targetId));
      moveIndicator(btn);
    }

    buttons.forEach((btn) => {
      btn.addEventListener("click", () => activate(btn.dataset.tab, btn));
    });

    const initial = buttons.find((b) => b.classList.contains("is-active")) || buttons[0];
    if (initial) {
      requestAnimationFrame(() => activate(initial.dataset.tab, initial));
    }
    window.addEventListener("resize", () => {
      const current = buttons.find((b) => b.classList.contains("is-active"));
      if (current) moveIndicator(current);
    });
  }

  /* ---------- 5. Formulário de contato ---------- */
  function setupContactForm() {
    const form = document.getElementById("contact-form");
    const msg = document.getElementById("form-msg");
    if (!form || !msg) return;

    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const nome = form.nome.value.trim();
      const contatoValor = form.contato.value.trim();

      if (!nome || !contatoValor) {
        msg.textContent = "Preencha nome e uma forma de contato antes de enviar.";
        msg.classList.remove("ok");
        msg.classList.add("is-visible");
        return;
      }

      const submitBtn = form.querySelector('button[type="submit"]');
      if (submitBtn) submitBtn.disabled = true;

      fetch(form.action, {
        method: "POST",
        body: new FormData(form),
        headers: { Accept: "application/json" },
      })
        .then((response) => {
          if (response.ok) {
            msg.textContent =
              "Mensagem recebida, " + nome.split(" ")[0] + ". Retorno em breve pelo contato informado.";
            msg.classList.add("ok", "is-visible");
            form.reset();
          } else {
            throw new Error("Falha no envio");
          }
        })
        .catch(() => {
          msg.textContent =
            "Não consegui enviar agora. Tente novamente ou chame direto no WhatsApp.";
          msg.classList.remove("ok");
          msg.classList.add("is-visible");
        })
        .finally(() => {
          if (submitBtn) submitBtn.disabled = false;
        });
    });
  }
})();
