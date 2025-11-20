/* projects.js — Project details renderer (reads from PROJECTS) */
(function () {
  // Footer year
  const yEl = document.getElementById("y");
  if (yEl) yEl.textContent = new Date().getFullYear();

  const root = document.getElementById("root");
  if (!root) return;

  // Read query param
  function qs(name) {
    const u = new URLSearchParams(location.search);
    return u.get(name) || "";
  }

  const slug = qs("slug");
  if (!slug) {
    root.innerHTML = `
      <div class="card">
        <h2>Not found</h2>
        <p class="muted-p">Missing slug in URL. Expected <code>?slug=trickster-trove</code>.</p>
        <div class="toolbar"><a class="btn" href="index.html#projects">Back</a></div>
      </div>`;
    return;
  }

  // Wait until PROJECTS is attached (handles script order/caching)
  let attempts = 0;
  function ensureProjectsReady(fn) {
    const src = (typeof window.PROJECTS !== "undefined" && Array.isArray(window.PROJECTS))
      ? window.PROJECTS
      : (typeof PROJECTS !== "undefined" && Array.isArray(PROJECTS))
        ? PROJECTS
        : null;

    if (src) return fn(src);

    if (++attempts > 30) { // ~1.5s
      root.innerHTML = `
        <div class="card">
          <h2>Oops</h2>
          <p class="muted-p">Projects data didn't load. Try hard reload (Cmd/Ctrl+Shift+R).</p>
          <div class="toolbar"><a class="btn" href="index.html#projects">Back</a></div>
        </div>`;
      return;
    }
    setTimeout(() => ensureProjectsReady(fn), 50);
  }

  ensureProjectsReady((PROJECTS) => {
    const data = PROJECTS.find(p => p.slug === slug);

    if (!data) {
      root.innerHTML = `
        <div class="card">
          <h2>Not found</h2>
          <p class="muted-p">We couldn't find this project by slug: <code>${slug}</code>.</p>
          <div class="toolbar"><a class="btn" href="index.html#projects">Back</a></div>
        </div>`;
      return;
    }

    // --- HERO media (prefer image so index card never turns into a video) ---
    let hero;
    if (Array.isArray(data.gallery) && data.gallery.length) {
      hero = data.gallery.find(it => it.type === "image") || data.gallery[0];
    }
    if (!hero) {
      hero = data.mediaType === "video"
        ? { type: "video", src: data.mediaSrc, alt: data.title }
        : { type: "image", src: data.mediaSrc, alt: data.title };
    }

    const mediaHTML = hero.type === "video"
      ? `<video src="${hero.src}" autoplay muted loop playsinline></video>`
      : `<img src="${hero.src}" alt="${hero.alt || data.title}">`;

    // Stack chips
    const stack = (data.stack || []).map(t => `<span class="chip">${t}</span>`).join("");

    // Long multi-paragraph description → paragraphs
    const rawDesc = (data.longDescription || data.description || "").trim();
    const descHTML = rawDesc
      ? rawDesc.split(/\n\s*\n/).map(p => `<p>${p}</p>`).join("")
      : "";

    // Optional highlights
    const highs = (data.highlights || []).map(li => `<li>${li}</li>`).join("");

    // --- Gallery block (thumbs; video opens lightbox) ---
    const gallery = Array.isArray(data.gallery) ? data.gallery : [];
    const galleryHTML = gallery.length ? `
      <section>
        <div class="section-head"><div class="kicker">Gallery</div></div>
        <div class="grid">
          ${gallery.map((it, idx) => {
            if (it.type === "video") {
              // маленький превʼю з відео; кліком відкриваємо лайтбокс
              return `
                <div class="card gallery-item" data-kind="video" data-src="${it.src}">
                  <div style="position:relative;border-radius:12px;overflow:hidden">
                    <video src="${it.src}" muted loop playsinline
                           style="display:block;width:100%;max-height:260px;object-fit:cover"></video>
                    <span style="
                      position:absolute;right:8px;bottom:8px;padding:4px 8px;border-radius:999px;
                      background:rgba(0,0,0,.6);color:#fff;font-size:12px;">Play</span>
                  </div>
                </div>`;
            } else {
              return `
                <div class="card gallery-item" data-kind="image" data-src="${it.src}">
                  <img src="${it.src}" alt="${it.alt || ""}"
                       style="border-radius:12px;width:100%;display:block;object-fit:cover">
                </div>`;
            }
          }).join("")}
        </div>
      </section>
    ` : "";

    // Render page
    root.innerHTML = `
      <section class="detail-head">
        <div class="meta">${stack}</div>
        <h1 class="detail-title">${data.title}</h1>
      </section>

      <section class="detail-media card" style="min-height:240px">
        ${mediaHTML}
      </section>

      <section class="cols">
        <div class="prose">
          ${descHTML ? `
            <h3>Summary</h3>
            ${descHTML}
          ` : ""}

          ${highs ? `
            <h3 style="margin-top:18px;">Highlights</h3>
            <ul class="bul">${highs}</ul>
          ` : ""}
        </div>

        <aside class="card" style="display:grid;gap:12px;align-content:start;">
          ${data.role ? `<div><span class="muted">Role:</span> ${data.role}</div>` : ""}
          ${data.year ? `<div><span class="muted">Years:</span> ${data.year}</div>` : ""}
          <div class="toolbar">
            ${data.href ? `<a class="btn" href="${data.href}" target="_blank" rel="noopener">Live</a>` : ""}
            ${data.demo ? `<a class="btn-demo" href="${data.demo}" target="_blank" rel="noopener">Gameplay</a>` : ""}
            ${
              data.repo && data.repo !== "#"
                ? `<a class="btn-ghost" href="${data.repo}" target="_blank" rel="noopener">Code</a>`
                : `<a class="btn-ghost" href="unavailable.html?project=${encodeURIComponent(data.title)}&type=code">Code</a>`
            }
            <a class="btn-ghost" href="index.html#projects">Back</a>
          </div>
        </aside>
      </section>

      ${galleryHTML}
    `;

    // --- Lightbox styles (injected once) ---
    if (!document.getElementById("lb-styles")) {
      const st = document.createElement("style");
      st.id = "lb-styles";
      st.textContent = `
        .lb-backdrop{position:fixed;inset:0;background:rgba(0,0,0,.75);display:flex;
          align-items:center;justify-content:center;z-index:9999;padding:20px;}
        .lb-sheet{background:#0b0f1a;border:1px solid var(--border,#1f2937);border-radius:16px;
          max-width: min(1100px, 96vw); width:100%; padding:12px; box-shadow:0 10px 30px rgba(0,0,0,.6);}
        .lb-media{position:relative; overflow:hidden; border-radius:12px;}
        .lb-media video,.lb-media img{display:block;width:100%;height:auto;outline:none}
        .lb-topbar{display:flex;justify-content:flex-end;gap:8px;margin-bottom:8px}
        .lb-btn{background:#111827;border:1px solid var(--border,#1f2937);padding:6px 12px;border-radius:10px;color:#e5e7eb}
        .lb-btn:hover{filter:brightness(1.1)}
      `;
      document.head.appendChild(st);
    }

    // --- Lightbox creator ---
    function openLightbox(kind, src) {
      const backdrop = document.createElement("div");
      backdrop.className = "lb-backdrop";
      backdrop.setAttribute("role", "dialog");
      backdrop.setAttribute("aria-modal", "true");

      const sheet = document.createElement("div");
      sheet.className = "lb-sheet";

      const top = document.createElement("div");
      top.className = "lb-topbar";

      const dl = document.createElement("a");
      dl.className = "lb-btn";
      dl.textContent = "Open in new tab";
      dl.href = src;
      dl.target = "_blank";
      dl.rel = "noopener";

      const close = document.createElement("button");
      close.className = "lb-btn";
      close.textContent = "Close";
      close.addEventListener("click", () => backdrop.remove());

      top.appendChild(dl);
      top.appendChild(close);

      const media = document.createElement("div");
      media.className = "lb-media";

      if (kind === "video") {
        const v = document.createElement("video");
        v.src = src;
        v.controls = true;
        v.autoplay = true;
        v.playsInline = true;
        media.appendChild(v);
      } else {
        const img = document.createElement("img");
        img.src = src;
        img.alt = "";
        media.appendChild(img);
      }

      sheet.appendChild(top);
      sheet.appendChild(media);
      backdrop.appendChild(sheet);

      // close on backdrop click / Esc
      backdrop.addEventListener("click", (e) => {
        if (e.target === backdrop) backdrop.remove();
      });
      document.addEventListener("keydown", function onEsc(ev){
        if (ev.key === "Escape") { backdrop.remove(); document.removeEventListener("keydown", onEsc); }
      });

      document.body.appendChild(backdrop);
    }

    // Wire gallery click → lightbox
    document.querySelectorAll(".gallery-item").forEach(el => {
      el.addEventListener("click", () => {
        const kind = el.getAttribute("data-kind");
        const src  = el.getAttribute("data-src");
        if (src) openLightbox(kind, src);
      });
    });
  });
})();
