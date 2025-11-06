/* Minimal JS with default dark theme and simple rendering */
const PROFILE = {
  email: "whateverkaicodes@gmail.com",
  github: "https://github.com/whateverkaicodes",
  itch: "https://whatkaiwants.itch.io/",
  linkedin: "https://www.linkedin.com/in/mykola-kozoriz-86a937250/",
  x: "https://x.com/"
};

const PROJECTS = [
  { title: "Trickster Trove — UI/UX Systems", year: "2023-2025", stack: ["UE5","C++","UMG","State Machines"], description: "Complex settings widget, radial menus, character selection flows, polished transitions. Much of in-game features and interaction mechanics", href: "https://store.steampowered.com/app/3077850/Trickster_Trove/", repo: "#", mediaType: "image", mediaSrc: "assets/TTPreview.jpg" },
];

// Dark mode: default to dark if not set
const root = document.documentElement;
function isDark() {
  const v = localStorage.getItem("theme");
  if (v === null) { localStorage.setItem("theme", "dark"); return true; }
  return v === "dark";
}
function applyTheme() { if (isDark()) root.classList.add("dark"); else root.classList.remove("dark"); }
function toggleTheme() { localStorage.setItem("theme", isDark() ? "light" : "dark"); applyTheme(); }
applyTheme();

document.getElementById("themeToggle").addEventListener("click", toggleTheme);
document.getElementById("themeToggleMobile").addEventListener("click", toggleTheme);

// Mobile drawer
const drawer = document.getElementById("drawer");
const menuToggle = document.getElementById("menuToggle");
menuToggle.addEventListener("click", () => {
  const open = drawer.classList.toggle("open");
  drawer.setAttribute("aria-hidden", open ? "false" : "true");
});
drawer.querySelectorAll("a,button").forEach(el => el.addEventListener("click", () => {
  drawer.classList.remove("open"); drawer.setAttribute("aria-hidden", "true");
}));

// Footer year
document.getElementById("y").textContent = new Date().getFullYear();

// Links from PROFILE
document.getElementById("githubLink").href = PROFILE.github;
document.getElementById("itchLink").href = PROFILE.itch;
document.getElementById("githubLinkFooter").href = PROFILE.github;

// Render projects
const grid = document.getElementById("projectsGrid");
PROJECTS.forEach((p) => {
  const card = document.createElement("article"); card.className = "card proj";
  const media = document.createElement("div"); media.className = "proj-media";

  const badgeRow = document.createElement("div"); badgeRow.className = "badge-row";
  const y = document.createElement("span"); y.className = "badge-chip"; y.textContent = p.year;
  const s = document.createElement("span"); s.className = "badge-chip light"; s.textContent = (p.stack.slice(0,2)).join(" • ");
  badgeRow.appendChild(y); badgeRow.appendChild(s); media.appendChild(badgeRow);

  if (p.mediaType === "image") { const img = document.createElement("img"); img.src = p.mediaSrc; img.alt = p.title; media.appendChild(img); }
  else { const vid = document.createElement("video"); vid.src = p.mediaSrc; vid.muted = true; vid.autoplay = true; vid.loop = true; vid.playsInline = true; media.appendChild(vid); }

  const body = document.createElement("div"); body.className = "proj-body";
  const stack = document.createElement("div"); stack.className = "stack";
  p.stack.forEach(t => { const chip = document.createElement("span"); chip.textContent = t; stack.appendChild(chip); });
  const h3 = document.createElement("h3"); h3.textContent = p.title;
  const desc = document.createElement("p"); desc.textContent = p.description;

  const links = document.createElement("div"); links.className = "links";
  const live = document.createElement("a"); live.className = "btn-ghost"; live.href = p.href; live.target = "_blank"; live.rel = "noopener"; live.textContent = "Live";
  const code = document.createElement("a");
  code.className = "btn-ghost";

  if (p.repo && p.repo !== "#" && p.repo.trim() !== "") {
    code.href = p.repo;
    code.target = "_blank";
    code.rel = "noopener";
  } else {
    const q = new URLSearchParams({ project: p.title, type: "code" }).toString();
    code.href = "unavailable.html?" + q;
    code.target = "_self";
  }

  code.textContent = "Code";
  links.appendChild(live); links.appendChild(code);

  body.appendChild(stack); body.appendChild(h3); body.appendChild(desc); body.appendChild(links);
  card.appendChild(media); card.appendChild(body); grid.appendChild(card);
});
const emailEl = document.getElementById("emailText");
const copyBtn  = document.getElementById("copyBtn");
const copyNote = document.getElementById("copyNote");

if (emailEl && copyBtn && copyNote) {
  emailEl.textContent = PROFILE.email;

  async function doCopy() {
    try {
      await navigator.clipboard.writeText(PROFILE.email);
    } catch {
      // Fallback for older browsers
      const r = document.createRange();
      r.selectNodeContents(emailEl);
      const s = window.getSelection();
      s.removeAllRanges(); s.addRange(r);
      try { document.execCommand("copy"); } catch(_) {}
      s.removeAllRanges();
    }
    copyBtn.textContent = "Copied";
    copyNote.hidden = false;
    setTimeout(() => { copyBtn.textContent = "Copy"; copyNote.hidden = true; }, 1500);
  }

  copyBtn.addEventListener("click", doCopy);
  emailEl.addEventListener("click", doCopy); // ← клікаєш по чіпу — теж копіює
}

