/* =========================================================
   Tahineh & Falafel — site script
   - Language toggle (Arabic <-> English), incl. RTL/LTR + font
   - Theme is locked to dark mode (no toggle by design)
   - Language preference saved in localStorage
   - Mobile nav + scroll reveal animation
   ========================================================= */

(function () {
  "use strict";

  const html = document.documentElement;
  const body = document.body;

  const langToggle = document.getElementById("langToggle");
  const navToggle = document.getElementById("navToggle");
  const mainNav = document.getElementById("mainNav");

  const STORAGE_LANG = "site-lang";

  /* ---------------- Language ---------------- */

  function applyLanguage(lang) {
    const isAr = lang === "ar";

    html.setAttribute("lang", isAr ? "ar" : "en");
    html.setAttribute("dir", isAr ? "rtl" : "ltr");
    body.classList.toggle("lang-ar", isAr);
    body.classList.toggle("lang-en", !isAr);

    // Swap all text nodes that carry both translations
    document.querySelectorAll("[data-ar][data-en]").forEach((el) => {
      const value = isAr ? el.getAttribute("data-ar") : el.getAttribute("data-en");
      el.innerHTML = value;
    });

    // Swap image alt text where a translated alt is provided
    document.querySelectorAll("[data-alt-ar][data-alt-en]").forEach((el) => {
      el.setAttribute("alt", isAr ? el.getAttribute("data-alt-ar") : el.getAttribute("data-alt-en"));
    });

    // The toggle button itself shows the language you can SWITCH TO
    if (langToggle) {
      const span = langToggle.querySelector("span");
      if (span) span.textContent = isAr ? "English" : "العربية";
    }

    localStorage.setItem(STORAGE_LANG, lang);
  }

  function getSavedLang() {
    return localStorage.getItem(STORAGE_LANG) || "ar";
  }

  if (langToggle) {
    langToggle.addEventListener("click", () => {
      const current = html.getAttribute("lang") === "ar" ? "ar" : "en";
      applyLanguage(current === "ar" ? "en" : "ar");
    });
  }

  /* ---------------- Theme ----------------
     Dark mode only, on purpose — there's no toggle button in the markup.
     The <html> tag already ships with data-theme="dark" as a static
     attribute (so it's correct even before this script runs), and this
     line just guarantees it stays that way for every visitor regardless
     of their OS/browser light-mode setting or anything saved from an
     earlier version of the site that still had a toggle. */
  html.setAttribute("data-theme", "dark");

  /* ---------------- Init on load ---------------- */

  applyLanguage(getSavedLang());

  /* ---------------- Mobile nav ---------------- */

  if (navToggle && mainNav) {
    navToggle.addEventListener("click", () => {
      const isOpen = mainNav.classList.toggle("open");
      navToggle.setAttribute("aria-expanded", String(isOpen));
    });

    // close mobile nav after tapping a link
    mainNav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        mainNav.classList.remove("open");
        navToggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ---------------- Scroll reveal (fail-safe) ----------------
     Content is visible by default in the CSS. Here we OPT elements INTO
     a hidden starting state, then reveal them as they scroll into view.
     A safety timeout also force-reveals everything after a few seconds
     no matter what, so a slow/missed observer callback can never leave
     part of the page permanently blank. */

  const revealEls = document.querySelectorAll(".reveal");

  if ("IntersectionObserver" in window && revealEls.length) {
    revealEls.forEach((el) => el.classList.add("pre-reveal"));

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.remove("pre-reveal");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
    );
    revealEls.forEach((el) => observer.observe(el));

    // Safety net: whatever hasn't revealed itself yet, reveal after 2.5s
    window.setTimeout(() => {
      revealEls.forEach((el) => el.classList.remove("pre-reveal"));
    }, 2500);
  }
  // If IntersectionObserver isn't supported, elements were never hidden
  // in the first place (no "pre-reveal" class added), so no action needed.
})();
