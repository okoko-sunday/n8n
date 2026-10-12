/* ==========================================================================
   Shared behaviour for every page: mobile nav, active link, footer year.
   ========================================================================== */
(() => {
  "use strict";

  const header = document.querySelector(".site-header");
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.getElementById("site-nav");

  // ---- Mobile navigation ----
  const setMenuOpen = (open) => {
    header.classList.toggle("nav-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  };

  if (header && toggle && nav) {
    toggle.addEventListener("click", () => {
      setMenuOpen(toggle.getAttribute("aria-expanded") !== "true");
    });

    // Close when a link is chosen
    nav.addEventListener("click", (event) => {
      if (event.target.closest("a")) setMenuOpen(false);
    });

    // Close on Escape and return focus to the button
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && header.classList.contains("nav-open")) {
        setMenuOpen(false);
        toggle.focus();
      }
    });

    // Close when tapping outside the header
    document.addEventListener("click", (event) => {
      if (header.classList.contains("nav-open") && !header.contains(event.target)) {
        setMenuOpen(false);
      }
    });

    // Reset when resizing up to the desktop layout
    const desktop = window.matchMedia("(min-width: 960px)");
    desktop.addEventListener("change", (event) => {
      if (event.matches) setMenuOpen(false);
    });
  }

  // ---- Highlight the current page's link ----
  let current = window.location.pathname.split("/").pop() || "index.html";
  if (!current.includes(".")) current += ".html"; // supports "pretty" URLs like /request

  document.querySelectorAll(".site-nav a, .footer-links a").forEach((link) => {
    const target = (link.getAttribute("href") || "").split(/[?#]/)[0];
    if (target === current) link.setAttribute("aria-current", "page");
  });

  // ---- Footer year ----
  const year = String(new Date().getFullYear());
  document.querySelectorAll("[data-year]").forEach((el) => {
    el.textContent = year;
  });

  // ---- Header shadow once the page is scrolled ----
  if (header) {
    const onScroll = () => header.classList.toggle("is-scrolled", window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  // ---- Gentle fade-up for content below the fold ----
  // Runs after DOMContentLoaded so cards built by other scripts (team.js) are included.
  // Content already on screen is never hidden, so nothing flickers on load.
  const REVEAL_SELECTOR =
    ".section-head, .stats, .service-card, .mini-steps li, .flow-step, .compare-card, .failsafe, .cta-band, .team-card";

  const initReveal = () => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion || !("IntersectionObserver" in window)) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("reveal-in");
        entry.target.classList.remove("reveal-pending");
        observer.unobserve(entry.target);
        // Drop the stagger delay afterwards so hover effects stay instant
        setTimeout(() => {
          entry.target.style.transitionDelay = "";
          entry.target.classList.remove("reveal-in");
        }, 1000);
      });
    }, { rootMargin: "0px 0px -8% 0px" });

    document.querySelectorAll(REVEAL_SELECTOR).forEach((el) => {
      if (el.getBoundingClientRect().top < window.innerHeight) return;
      const siblings = Array.from(el.parentElement.children).filter((c) => c.matches(REVEAL_SELECTOR));
      el.style.transitionDelay = `${Math.min(siblings.indexOf(el), 3) * 80}ms`;
      el.classList.add("reveal-pending");
      observer.observe(el);
    });
  };

  // Deferred scripts run while readyState is "interactive", before DOMContentLoaded
  if (document.readyState === "complete") {
    initReveal();
  } else {
    document.addEventListener("DOMContentLoaded", initReveal);
  }
})();
