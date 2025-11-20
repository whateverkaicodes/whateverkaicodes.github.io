/* Minimal JS with default dark theme and simple rendering */

// -------- Profile & Data --------
const PROFILE = {
  email: "whateverkaicodes@gmail.com",
  github: "https://github.com/whateverkaicodes",
  itch: "https://whatkaiwants.itch.io/",
  linkedin: "https://www.linkedin.com/in/mykola-kozoriz-86a937250/",
  x: "https://x.com/"
};

window.PROFILE = PROFILE;

const PROJECTS = [
  {
    slug: "trickster-trove",
    title: "Trickster Trove - UI/UX Systems",
    year: "2023-2025",
    stack: ["UE5","C++","UMG","State Machines"],
    description: "UI/UX systems + interaction: settings, character select with Feats, radial menu, localization, intro, travel & regular gameplay features.",
    longDescription: `
I handled a big chunk of the game’s UI/UX and also the glue between systems. Settings were built properly in C++/UMG, audio and input with presets and granular overrides-and wired to save/restore so players don’t lose anything. I also set up a clean localization path so every widget/prompt pulls the right string without hacks.

Character selection was a larger feature (first attached media below). We have Feats (perk-style, Dead by Daylight vibe), and I made the whole flow data-driven: a designer drops a character ID into a table and it just appears in the selection with the right UI state and rules - no hand wiring. On top of that I added a radial menu for quick actions and reworked input on Enhanced Input so the selection feels tight and predictable.

Interaction is a standalone gameplay system, not just UI hooks. I built usable actors, prompts and gating rules, trace/overlap checks, cool-downs, and simple state to keep actions deterministic. One example that uses the same core interaction is the “boat between dungeons”: it connects the hub and dungeons via a short travel flow, drives a few world events, and hands off cleanly to loading/teleport logic-while still feeling like a single system to maintain.

Beyond UI, I shipped a lot of regular gameplay features: small world mechanics tied to interaction or for example, radial menu - context actions, lightweight progression flags, and a few helper pieces around save/restore and level transitions. Where needed I touched GAS to expose ability/state to gameplay or UI in a consistent way, but kept it minimal and practical for the scope.

Performance and polish mattered. I removed heavy widget bindings, pushed assets to async loads, cut unnecessary ticks and trimmed allocations. Animations and micro-transitions were tuned so the game feels snappy-cursor affordances, sound/anim sync, and clean state machines for multi-step screens. We shipped a Steam demo, gathered a lot of feedback, and iterated without breaking pacing or readability.
    `.trim(),
    href: "https://store.steampowered.com/app/3077850/Trickster_Trove/",
    repo: "#",
    demo: "https://www.youtube.com/watch?v=Gf5EdOaBERM",
    mediaType: "image",
    mediaSrc: "assets/TTPreview.jpg",
    role: "Unreal Engine Developer (C++/Blueprints)",
    contributions: [],
    highlights: [
      "Data-driven UI: add IDs, get screens - fast iteration for designers.",
      "Snappy feel: cursor affordances, sound/anim sync, tight transitions.",
      "Clean state machines for multi-step flows (selection, travel, settings).",
      "Stable performance: fewer ticks, less binding overhead, async assets."
    ],
    gallery: [
      { type: "video", src: "assets/characterselect.mp4", alt: "Gameplay preview" },
      { type: "image", src: "assets/TTPreview.jpg", alt: "Settings widget" },
      { type: "image", src: "assets/TTPreview2.jpg", alt: "Settings widget" },
    ]
  }
];

window.PROJECTS = PROJECTS;

// -------- Theme (default dark) --------
const root = document.documentElement;
function isDark() {
  const v = localStorage.getItem("theme");
  if (v === null) { localStorage.setItem("theme", "dark"); return true; }
  return v === "dark";
}
function applyTheme() {
  if (isDark()) root.classList.add("dark"); else root.classList.remove("dark");
}
function toggleTheme() {
  localStorage.setItem("theme", isDark() ? "light" : "dark");
  applyTheme();
}
applyTheme();

// Header theme toggles (guarded)
const themeToggle = document.getElementById("themeToggle");
const themeToggleMobile = document.getElementById("themeToggleMobile");
themeToggle && themeToggle.addEventListener("click", toggleTheme);
themeToggleMobile && themeToggleMobile.addEventListener("click", toggleTheme);

// -------- Mobile drawer (guarded for pages without drawer) --------
const drawer = document.getElementById("drawer");
const menuToggle = document.getElementById("menuToggle");
if (drawer && menuToggle) {
  menuToggle.addEventListener("click", () => {
    const open = drawer.classList.toggle("open");
    drawer.setAttribute("aria-hidden", open ? "false" : "true");
  });
  drawer.querySelectorAll("a,button").forEach(el => el.addEventListener("click", () => {
    drawer.classList.remove("open"); drawer.setAttribute("aria-hidden", "true");
  }));
}

// -------- Footer year --------
const yearEl = document.getElementById("y");
yearEl && (yearEl.textContent = new Date().getFullYear());

// -------- Links from PROFILE (guarded for pages that don't have them) --------
const gh = document.getElementById("githubLink");
const itch = document.getElementById("itchLink");
const ghFooter = document.getElementById("githubLinkFooter");
gh && (gh.href = PROFILE.github);
itch && (itch.href = PROFILE.itch);
ghFooter && (ghFooter.href = PROFILE.github);

// -------- Render projects on index page --------
const grid = document.getElementById("projectsGrid");
if (grid) {
  PROJECTS.forEach((p) => {
    const card = document.createElement("article"); card.className = "card proj";
    const media = document.createElement("div"); media.className = "proj-media";

    // Badges
    const badgeRow = document.createElement("div"); badgeRow.className = "badge-row";
    const y = document.createElement("span"); y.className = "badge-chip"; y.textContent = p.year;
    const s = document.createElement("span"); s.className = "badge-chip light"; s.textContent = (p.stack.slice(0,2)).join(" • ");
    badgeRow.appendChild(y); badgeRow.appendChild(s); media.appendChild(badgeRow);

    // Link to details page
    const detailHref = `project.html?slug=${encodeURIComponent(p.slug)}`;

    // Media wrapped in <a>
    const mediaLink = document.createElement("a");
    mediaLink.href = detailHref;
    mediaLink.className = "media-link";

    if (p.mediaType === "image") {
      const img = document.createElement("img");
      img.src = p.mediaSrc;
      img.alt = p.title;
      mediaLink.appendChild(img);
    } else {
      const vid = document.createElement("video");
      vid.src = p.mediaSrc;
      vid.muted = true; vid.autoplay = true; vid.loop = true; vid.playsInline = true;
      mediaLink.appendChild(vid);
    }
    media.appendChild(mediaLink);

    // Body
    const body = document.createElement("div"); body.className = "proj-body";

    // Stack chips
    const stack = document.createElement("div"); stack.className = "stack";
    p.stack.forEach(t => { const chip = document.createElement("span"); chip.textContent = t; stack.appendChild(chip); });

    // Title as link
    const h3 = document.createElement("h3");
    const titleLink = document.createElement("a");
    titleLink.href = detailHref;
    titleLink.textContent = p.title;
    titleLink.style.textDecoration = "none";
    titleLink.style.color = "inherit";
    h3.appendChild(titleLink);

    // Description
    const desc = document.createElement("p"); desc.textContent = p.description;

    // Links row (Live / Code)
    const links = document.createElement("div"); links.className = "links";

    const live = document.createElement("a");
    live.className = "btn-ghost";
    live.href = p.href || "#";
    live.target = "_blank";
    live.rel = "noopener";
    live.textContent = "Live";

    const code = document.createElement("a");
    code.className = "btn-ghost";
    if (p.repo && p.repo !== "#" && p.repo.trim() !== "") {
      code.href = p.repo; code.target = "_blank"; code.rel = "noopener";
    } else {
      const q = new URLSearchParams({ project: p.title, type: "code" }).toString();
      code.href = "unavailable.html?" + q; code.target = "_self";
    }
    code.textContent = "Code";

    links.appendChild(live); links.appendChild(code);

    body.appendChild(stack); body.appendChild(h3); body.appendChild(desc); body.appendChild(links);
    card.appendChild(media); card.appendChild(body); grid.appendChild(card);
  });
}

// -------- Copy-to-clipboard email (works on index page) --------
(function () {
  const emailEl = document.getElementById("emailText");
  const copyBtn  = document.getElementById("copyBtn");
  const copyNote = document.getElementById("copyNote");
  if (!emailEl || !copyBtn || !copyNote) return;

  const EMAIL = PROFILE.email;
  emailEl.textContent = EMAIL;

  async function copyWithFallback(text) {
    try {
      if (window.isSecureContext && navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
        return true;
      }
      throw new Error("Clipboard API not available");
    } catch {
      try {
        const ta = document.createElement("textarea");
        ta.value = text;
        ta.setAttribute("readonly", "");
        ta.style.position = "fixed"; ta.style.inset = "0 auto auto 0"; ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        const ok = document.execCommand("copy");
        document.body.removeChild(ta);
        if (!ok) throw new Error("execCommand(copy) failed");
        return true;
      } catch {
        return false;
      }
    }
  }

  async function handleCopy() {
    const ok = await copyWithFallback(EMAIL);
    if (ok) {
      copyBtn.textContent = "Copied";
      copyNote.hidden = false;
      setTimeout(() => { copyBtn.textContent = "Copy"; copyNote.hidden = true; }, 1500);
    } else {
      const r = document.createRange();
      r.selectNodeContents(emailEl);
      const s = window.getSelection();
      s.removeAllRanges(); s.addRange(r);
      alert("Couldn't copy automatically. Press ⌘/Ctrl+C to copy.");
    }
  }

  copyBtn.addEventListener("click", handleCopy);
  emailEl.addEventListener("click", handleCopy);
})();
