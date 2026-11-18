/* ===== CONFIGURACIÓN — EDITAR ===== */
const CONFIG = {
  // Número de WhatsApp en formato internacional, sin +, espacios ni guiones.
  // EDITAR: confirmar que 011 3270-8325 (Soldado de la Independencia) tiene WhatsApp.
  whatsapp: "5491132708325",

  // Horario de Soldado de la Independencia y La Pampa (según Google Maps).
  // 0 = domingo … 6 = sábado. [apertura, cierre] en horas (10.5 = 10:30). null = cerrado.
  hours: { 0: null, 1: [10, 20], 2: [10, 20], 3: [10, 20], 4: [10, 20], 5: [10, 20], 6: [10, 20] },
};

document.documentElement.classList.add("js");

const $ = (s, root = document) => root.querySelector(s);
const $$ = (s, root = document) => [...root.querySelectorAll(s)];

/* ---------- Textos ---------- */
const TEXTS = {
  "nav.open": "Abrir menú",
  "nav.close": "Cerrar menú",
  "wa.hello": "Hola!",
  "wa.book": "Hola! Quiero reservar un turno en Barceló.",
  "wa.prices": "Hola! Quería consultar precios y horarios disponibles.",
  "wa.b1": "Hola! Quiero reservar un turno en Barceló de Soldado de la Independencia.",
  "wa.b2": "Hola! Quiero reservar un turno en Barceló de La Pampa.",
  "wa.b3": "Hola! Quiero reservar un turno en Barceló de Sucre.",
  "status.open": "Abierto ahora · cierra a las {t}",
  "status.closed": "Cerrado ahora · escribinos y te respondemos",
};
const t = (key) => TEXTS[key] ?? "";

/* ---------- WhatsApp ---------- */
function updateWhatsApp() {
  $$(".js-wa").forEach((el) => {
    const msg = t(el.dataset.msgKey || "wa.hello");
    el.href = `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(msg)}`;
    el.target = "_blank";
    el.rel = "noopener";
  });
}

/* ---------- Menú mobile ---------- */
const toggle = $(".nav__toggle");
const menu = $("#nav-menu");
function updateMenuLabel() {
  if (!toggle) return;
  const open = toggle.getAttribute("aria-expanded") === "true";
  toggle.setAttribute("aria-label", t(open ? "nav.close" : "nav.open"));
}
function setMenu(open) {
  toggle.setAttribute("aria-expanded", String(open));
  menu.classList.toggle("is-open", open);
  updateMenuLabel();
}
if (toggle && menu) {
  toggle.addEventListener("click", () => setMenu(toggle.getAttribute("aria-expanded") !== "true"));
  menu.addEventListener("click", (e) => { if (e.target.closest("a")) setMenu(false); });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && menu.classList.contains("is-open")) { setMenu(false); toggle.focus(); }
  });
}

/* ---------- Header + botón flotante ---------- */
const header = $(".header");
const waFloat = $(".wa-float");
const cta = $(".cta");
let ctaVisible = false;
function onScroll() {
  header?.classList.toggle("is-scrolled", window.scrollY > 8);
  waFloat?.classList.toggle("is-hidden", window.scrollY < 300 || ctaVisible);
}
window.addEventListener("scroll", onScroll, { passive: true });

/* ---------- Animación de aparición ---------- */
if ("IntersectionObserver" in window) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) { entry.target.classList.add("is-visible"); io.unobserve(entry.target); }
    });
  }, { rootMargin: "0px 0px -8% 0px" });
  $$(".reveal").forEach((el) => io.observe(el));
  if (cta) new IntersectionObserver(([e]) => { ctaVisible = e.isIntersecting; onScroll(); }).observe(cta);
} else {
  $$(".reveal").forEach((el) => el.classList.add("is-visible"));
}

/* ---------- Abierto ahora + día actual ---------- */
function updateOpenStatus() {
  const now = new Date();
  const day = now.getDay();
  const time = now.getHours() + now.getMinutes() / 60;
  const today = CONFIG.hours[day];
  const fmt = (h) => `${String(Math.floor(h)).padStart(2, "0")}:${String(Math.round((h % 1) * 60)).padStart(2, "0")}`;
  const isOpen = today && time >= today[0] && time < today[1];

  $$(".js-status").forEach((el) => {
    el.textContent = isOpen ? t("status.open").replace("{t}", fmt(today[1])) : t("status.closed");
    el.className = `open-status js-status ${isOpen ? "is-open" : "is-closed"}`;
  });
  $$("tr[data-days]").forEach((tr) => tr.classList.toggle("is-today", tr.dataset.days.split(",").includes(String(day))));
}

/* ---------- Galería: filtros + visor ---------- */
const filterBtns = $$(".filters button");
filterBtns.forEach((btn) => btn.addEventListener("click", () => {
  const f = btn.dataset.filter;
  filterBtns.forEach((b) => b.setAttribute("aria-pressed", String(b === btn)));
  $$(".gallery__item").forEach((item) => { item.hidden = f !== "all" && item.dataset.cat !== f; });
}));

const lightbox = $("#lightbox");
if (lightbox && typeof lightbox.showModal === "function") {
  const lbImg = $("img", lightbox);
  const lbCap = $(".lightbox__caption", lightbox);
  let list = [];
  let idx = 0;
  let opener = null;

  const show = (i) => {
    idx = (i + list.length) % list.length;
    const btn = list[idx];
    const img = $("img", btn);
    lbImg.src = btn.dataset.full;
    lbImg.alt = img.alt;
    lbCap.textContent = `${$("figcaption", btn).textContent} · ${idx + 1}/${list.length}`;
  };

  $$(".gallery__btn").forEach((btn) => btn.addEventListener("click", () => {
    list = $$(".gallery__item:not([hidden]) .gallery__btn");
    opener = btn;
    show(list.indexOf(btn));
    lightbox.showModal();
  }));
  $(".lightbox__close", lightbox).addEventListener("click", () => lightbox.close());
  $(".lightbox__prev", lightbox).addEventListener("click", () => show(idx - 1));
  $(".lightbox__next", lightbox).addEventListener("click", () => show(idx + 1));
  lightbox.addEventListener("click", (e) => { if (e.target === lightbox || e.target.classList.contains("lightbox__inner")) lightbox.close(); });
  lightbox.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") show(idx - 1);
    if (e.key === "ArrowRight") show(idx + 1);
  });
  lightbox.addEventListener("close", () => opener?.focus());
}

/* ---------- Año ---------- */
$$(".js-year").forEach((el) => { el.textContent = new Date().getFullYear(); });

/* ---------- Inicio ---------- */
updateWhatsApp();
updateMenuLabel();
updateOpenStatus();
onScroll();
