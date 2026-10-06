// ===== Prijzen: overgenomen van salonkee.be/salon/kappr (6 okt 2026) =====
const BOOKING_URL = "https://salonkee.be/salon/kappr";
const MENU = [
  { cat: "Dames — knippen & brushing", items: [["Knippen & brushing", 55, true], ["Brushing", 35, true]] },
  { cat: "Balayage", items: [
    ["Balayage & brushing", 90, true], ["Balayage + knippen & brushing", 110, true],
    ["Balayage met zilverpapier & brushing", 100, true], ["Balayage met zilverpapier + knippen & brushing", 120, true],
    ["Balayage met toner & brushing", 130, true], ["Balayage met toner + knippen & brushing", 150, true],
    ["Balayage zilverpapier & toner & brushing", 140, true], ["Balayage zilverpapier & toner + knippen & brushing", 160, true],
  ] },
  { cat: "Kleuring", items: [
    ["Kleuring & brushing", 85, true], ["Kleuring + knippen & brushing", 105, true],
    ["Toner & brushing", 75, true], ["Toner + knippen & brushing", 95, true],
    ["Kleurshampoo & brushing", 85, true], ["Kleurshampoo + knippen & brushing", 105, true],
  ] },
  { cat: "Heren", items: [["Heren knippen", 35, true], ["Tondeuse", 25, false]] },
  { cat: "Kinderen", items: [["Meisjes", 30, true], ["Jongens", 30, true], ["Kleine trim (max. 10 min)", 25, false]] },
  { cat: "Opsteekkapsel", items: [["Opsteek- of trouwkapsel", 70, false]] },
  { cat: "Permanent", items: [["Permanent & brushing", 85, true], ["Permanent + knippen & brushing", 105, true]] },
  { cat: "Extensions", items: [["Adviesgesprek extensions", 0, false]] },
];

// 0 = zondag … 6 = zaterdag. null = gesloten.
const HOURS = { 0: null, 1: null, 2: ["09:00", "18:00"], 3: ["09:00", "18:00"], 4: ["09:00", "18:00"], 5: ["09:00", "18:00"], 6: ["08:00", "16:00"] };
const DAY_NAMES = ["Zondag", "Maandag", "Dinsdag", "Woensdag", "Donderdag", "Vrijdag", "Zaterdag"];

// Boekingslinks
document.querySelectorAll("[data-book]").forEach(a => { a.href = BOOKING_URL; a.target = "_blank"; a.rel = "noopener"; });

// Harmonica-menu
const fmt = (p, from) => p === 0 ? "gratis" : `${from ? "<small>vanaf</small>" : ""}€${p}`;
const acc = document.getElementById("priceMenu");
acc.innerHTML = MENU.map((g, i) => {
  const min = Math.min(...g.items.map(x => x[1]));
  return `<div class="acc__item${i === 0 ? " is-open" : ""}">
    <button class="acc__btn" aria-expanded="${i === 0}" aria-controls="p${i}" id="b${i}">
      <span class="acc__icon" aria-hidden="true"></span>${g.cat}<small>${min === 0 ? "gratis advies" : "vanaf €" + min}</small>
    </button>
    <div class="acc__panel" id="p${i}" role="region" aria-labelledby="b${i}"><div>
      ${g.items.map(([n, p, from]) => `<div class="acc__row"><span>${n}</span><i></i><b>${fmt(p, from)}</b></div>`).join("")}
    </div></div>
  </div>`;
}).join("");
acc.querySelectorAll(".acc__btn").forEach(btn => btn.addEventListener("click", () => {
  const item = btn.parentElement;
  const open = !item.classList.contains("is-open");
  item.classList.toggle("is-open", open);
  btn.setAttribute("aria-expanded", open);
}));

// Openingsuren + live status (Belgische tijd)
function brusselsNow() {
  const parts = new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Brussels", weekday: "short", hour: "2-digit", minute: "2-digit", hour12: false }).formatToParts(new Date());
  const get = t => parts.find(p => p.type === t).value;
  return { day: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(get("weekday")), mins: (+get("hour") % 24) * 60 + +get("minute") };
}
const toMins = s => { const [h, m] = s.split(":").map(Number); return h * 60 + m; };
function renderHours() {
  const { day, mins } = brusselsNow();
  document.getElementById("hours").innerHTML = [1, 2, 3, 4, 5, 6, 0].map(d => {
    const h = HOURS[d];
    return `<tr class="${d === day ? "is-today" : ""}"><td>${DAY_NAMES[d]}</td><td>${h ? `${h[0]} – ${h[1]}` : "Gesloten"}</td></tr>`;
  }).join("");
  const today = HOURS[day];
  const isOpen = !!today && mins >= toMins(today[0]) && mins < toMins(today[1]);
  let text;
  if (isOpen) text = `Nu open tot ${today[1]}`;
  else if (today && mins < toMins(today[0])) text = `Gesloten · vandaag vanaf ${today[0]}`;
  else {
    let n = 1;
    while (n < 8 && !HOURS[(day + n) % 7]) n++;
    const d = (day + n) % 7;
    text = `Gesloten · ${n === 1 ? "morgen" : DAY_NAMES[d].toLowerCase()} vanaf ${HOURS[d][0]}`;
  }
  document.querySelector("[data-status-text]").textContent = text;
  document.querySelector("[data-status-box]").classList.toggle("is-open", isOpen);
  const s = document.querySelector("[data-status]");
  s.classList.toggle("is-open", isOpen);
  s.textContent = isOpen ? `Nu open tot ${today[1]} · Tervuursepoort` : "Tervuursesteenweg 2a · Leuven";
}
renderHours();
setInterval(renderHours, 60_000);

// Nav
const nav = document.getElementById("nav");
const toggle = document.getElementById("navToggle");
const onScroll = () => nav.classList.toggle("is-scrolled", window.scrollY > 20);
window.addEventListener("scroll", onScroll, { passive: true });
onScroll();
toggle.addEventListener("click", () => toggle.setAttribute("aria-expanded", nav.classList.toggle("is-open")));
document.querySelectorAll("#navLinks a").forEach(a => a.addEventListener("click", () => {
  nav.classList.remove("is-open");
  toggle.setAttribute("aria-expanded", "false");
}));

// Reveal
const io = new IntersectionObserver(entries => entries.forEach(e => {
  if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); }
}), { threshold: 0.1 });
document.querySelectorAll(".reveal").forEach((el, i) => { el.style.transitionDelay = `${(i % 3) * 110}ms`; io.observe(el); });

document.getElementById("year").textContent = new Date().getFullYear();
