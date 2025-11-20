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

    // Media block
    let mediaHTML = "";
    if (data.gallery && data.gallery.length) {
      const g0 = data.gallery[0];
      mediaHTML = g0.type === "video"
        ? `<video src="${g0.src}" autoplay muted loop playsinline></video>`
        : `<img src="${g0.src}" alt="${g0.alt || data.title}">`;
    } else {
      mediaHTML = data.mediaType === "video"
        ? `<video src="${data.mediaSrc}" autoplay muted loop playsinline></video>`
        : `<img src="${data.mediaSrc}" alt="${data.title}">`;
    }

    // Stack chips
    const stack = (data.stack || []).map(t => `<span class="chip">${t}</span>`).join("");

    // Build multi-paragraph HTML from longDescription/description
    const rawDesc = (data.longDescription || data.description || "").trim();
    const descHTML = rawDesc
      ? rawDesc.split(/\n\s*\n/).map(p => `<p>${p}</p>`).join("")
      : "";

    // Optional highlights
    const highs = (data.highlights || []).map(li => `<li>${li}</li>`).join("");

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

      ${
        data.gallery && data.gallery.length > 1
        ? `<section><div class="section-head"><div class="kicker">Gallery</div></div>
            <div class="grid">
            ${data.gallery.slice(1).map(it =>
              it.type === "video"
                ? `<div class="card"><video src="${it.src}" autoplay muted loop playsinline style="border-radius:12px;"></video></div>`
                : `<div class="card"><img src="${it.src}" alt="${it.alt || ""}" style="border-radius:12px; width:100%; display:block;"></div>`
            ).join("")}
            </div></section>`
        : ""
      }
    `;
  });
})();
