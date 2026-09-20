const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const header = document.getElementById("header");
const progress = document.getElementById("progress");
const backToTop = document.getElementById("back-to-top");
const navLinks = [...document.querySelectorAll(".nav-link")];

/* ---------- hero equalizer bars ---------- */

const eq = document.getElementById("hero-eq");
if (eq) {
  const count = Math.max(24, Math.min(64, Math.round(window.innerWidth / 24)));
  for (let i = 0; i < count; i++) {
    const bar = document.createElement("span");
    bar.style.animationDuration = `${0.7 + Math.random() * 1.1}s`;
    bar.style.animationDelay = `${-Math.random() * 2}s`;
    eq.appendChild(bar);
  }
}

/* ---------- scroll: progress bar, header, back-to-top, active nav link ---------- */

function onScroll() {
  const y = window.scrollY;
  const max = document.documentElement.scrollHeight - window.innerHeight;

  progress.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
  header.classList.toggle("scrolled", y > 40);
  backToTop.classList.toggle("visible", y > 500);

  // the last linked section whose top has passed just under the header wins
  const offset = header.offsetHeight + 40;
  let current = null;
  for (const link of navLinks) {
    const target = document.querySelector(link.getAttribute("href"));
    if (target && target.getBoundingClientRect().top <= offset) current = link;
  }
  navLinks.forEach((link) => link.classList.toggle("active", link === current));
}

window.addEventListener("scroll", onScroll, { passive: true });
window.addEventListener("resize", onScroll);
onScroll();

/* ---------- scroll reveal ---------- */

if (!reduceMotion && "IntersectionObserver" in window) {
  const revealTargets = document.querySelectorAll(
    "section > h2, .feature, .step, .product-card, .table-wrap, .testimonial, .faq-list details, #video, #signup > p, #form"
  );

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const el = entry.target;
        el.classList.add("in");
        observer.unobserve(el);

        // drop the reveal classes when the entrance finishes so hover transitions work normally
        const delay = 700 + (parseInt(el.style.getPropertyValue("--i"), 10) || 0) * 90 + 60;
        setTimeout(() => el.classList.remove("reveal", "in"), delay);
      }
    },
    { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
  );

  revealTargets.forEach((el) => {
    // stagger siblings inside the same row
    const index = [...el.parentElement.children].indexOf(el);
    el.style.setProperty("--i", el.matches("section > h2") ? 0 : index % 4);
    el.classList.add("reveal");
    observer.observe(el);
  });
}

/* ---------- cursor glow on cards ---------- */

document.querySelectorAll(".feature, .product-card").forEach((card) => {
  card.addEventListener("pointermove", (e) => {
    const rect = card.getBoundingClientRect();
    card.style.setProperty("--mx", `${e.clientX - rect.left}px`);
    card.style.setProperty("--my", `${e.clientY - rect.top}px`);
  });
});

/* ---------- dark / light theme ---------- */

const root = document.documentElement;
const themeToggle = document.getElementById("theme-toggle");

function syncThemeLabel() {
  const dark = root.getAttribute("data-theme") === "dark";
  themeToggle.setAttribute("aria-label", dark ? "Switch to light mode" : "Switch to dark mode");
}

themeToggle.addEventListener("click", () => {
  const dark = root.getAttribute("data-theme") !== "dark";
  if (dark) root.setAttribute("data-theme", "dark");
  else root.removeAttribute("data-theme");
  try {
    localStorage.setItem("theme", dark ? "dark" : "light");
  } catch (e) {
    /* storage blocked: the choice just won't be remembered */
  }
  syncThemeLabel();
});
syncThemeLabel();

/* ---------- signup form ---------- */

// The form's action is still the freeCodeCamp placeholder, so nothing is stored yet.
// To collect real emails, point the form's action at a form service and POST with fetch() here.
const form = document.getElementById("form");
const formMessage = document.getElementById("form-message");

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const email = document.getElementById("email");
  formMessage.classList.remove("error");

  if (!email.checkValidity()) {
    formMessage.classList.add("error");
    formMessage.textContent = "Please enter a valid email address.";
    return;
  }

  formMessage.textContent = "Thanks! You're on the list.";
  form.reset();
});

/* ---------- back links: portfolio, or the studio if we came from the room ---------- */

if (new URLSearchParams(window.location.search).get("from") === "room") {
  const roomUrl = "https://patreekare.github.io/world.html?open=coursework&project=product";
  document.querySelectorAll(".nav-back, .footer-back a").forEach((link) => {
    link.href = roomUrl;
    link.innerHTML = link.classList.contains("nav-back")
      ? "&larr; Studio"
      : "&larr; Back to the studio";
  });
}
