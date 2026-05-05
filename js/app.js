/* ─────────────────────────────────────────
   Mike's Ideas — Portfolio App
   ───────────────────────────────────────── */

let allProjects  = [];
let filtered     = [];
let lbIndex      = 0;

/* ── DOM ── */
const gridEl      = document.getElementById('grid');
const emptyEl     = document.getElementById('emptyState');
const filtersEl   = document.getElementById('filtersInner');
const lightbox    = document.getElementById('lightbox');
const lbImg       = document.getElementById('lbImg');
const lbTitle     = document.getElementById('lbTitle');
const lbDesc      = document.getElementById('lbDesc');
const lbCat       = document.getElementById('lbCat');
const lbClose     = document.getElementById('lbClose');
const lbPrev      = document.getElementById('lbPrev');
const lbNext      = document.getElementById('lbNext');
const yearEl      = document.getElementById('year');

if (yearEl) yearEl.textContent = new Date().getFullYear();

/* ── Fetch projects ── */
async function loadProjects() {
  try {
    const r = await fetch('data/projects.json?v=' + Date.now());
    if (!r.ok) throw new Error();
    return await r.json();
  } catch { return []; }
}

/* ── Render grid ── */
function renderGrid(projects) {
  if (!projects.length) {
    gridEl.innerHTML = '';
    emptyEl.style.display = 'block';
    return;
  }
  emptyEl.style.display = 'none';

  gridEl.innerHTML = projects.map((p, i) => `
    <div class="grid-item" data-i="${i}" role="button" tabindex="0" aria-label="${p.title}">
      <img src="${p.cover}" alt="${p.title}" loading="lazy" />
      <div class="grid-overlay">
        <div class="grid-overlay-text">
          <div class="grid-item-title">${p.title}</div>
          <div class="grid-item-cat">${p.categories.map(c => c.replace(/-/g,' ')).join(' · ')}</div>
        </div>
      </div>
    </div>
  `).join('');

  gridEl.querySelectorAll('img').forEach(img => {
    if (img.complete) img.classList.add('loaded');
    else {
      img.addEventListener('load',  () => img.classList.add('loaded'));
      img.addEventListener('error', () => img.closest('.grid-item').style.display = 'none');
    }
  });

  gridEl.querySelectorAll('.grid-item').forEach(el => {
    const open = () => openLightbox(parseInt(el.dataset.i, 10));
    el.addEventListener('click', open);
    el.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') open(); });
  });
}

/* ── Build filter chips ── */
function buildFilters(projects) {
  const cats = [...new Set(projects.flatMap(p => p.categories))].sort();

  filtersEl.querySelectorAll('[data-dynamic]').forEach(b => b.remove());

  cats.forEach(cat => {
    const btn = document.createElement('button');
    btn.className = 'filter-chip';
    btn.dataset.cat = cat;
    btn.dataset.dynamic = '1';
    btn.textContent = cat.replace(/-/g, ' ');
    filtersEl.appendChild(btn);
  });

  filtersEl.addEventListener('click', e => {
    const btn = e.target.closest('.filter-chip');
    if (!btn) return;
    filtersEl.querySelectorAll('.filter-chip').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const cat = btn.dataset.cat;
    filtered = cat === 'all' ? allProjects : allProjects.filter(p => p.categories.includes(cat));
    renderGrid(filtered);
  });
}


/* ════════════════════════════════
   LIGHTBOX
   ════════════════════════════════ */

function openLightbox(i) {
  lbIndex = i;
  showItem(i);
  lightbox.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  lightbox.classList.remove('open');
  document.body.style.overflow = '';
}

function showItem(i) {
  const p = filtered[i];
  if (!p) return;
  lbImg.style.opacity = '0';
  lbImg.src = p.cover;
  lbImg.alt = p.title;
  lbTitle.textContent = p.title;
  lbCat.textContent = p.categories.map(c => c.replace(/-/g,' ')).join(' · ');
  lbDesc.textContent = p.description || '';
  lbImg.onload = () => lbImg.style.opacity = '1';
  lbPrev.style.visibility = i > 0 ? 'visible' : 'hidden';
  lbNext.style.visibility = i < filtered.length - 1 ? 'visible' : 'hidden';
}

lbClose.addEventListener('click', closeLightbox);
lbPrev.addEventListener('click', e => { e.stopPropagation(); if (lbIndex > 0) showItem(--lbIndex); });
lbNext.addEventListener('click', e => { e.stopPropagation(); if (lbIndex < filtered.length - 1) showItem(++lbIndex); });
lightbox.addEventListener('click', e => { if (e.target === lightbox || e.target === document.getElementById('lbStage')) closeLightbox(); });

document.addEventListener('keydown', e => {
  if (!lightbox.classList.contains('open')) return;
  if (e.key === 'Escape') closeLightbox();
  if (e.key === 'ArrowLeft'  && lbIndex > 0) showItem(--lbIndex);
  if (e.key === 'ArrowRight' && lbIndex < filtered.length - 1) showItem(++lbIndex);
});

let tx = 0;
lightbox.addEventListener('touchstart', e => tx = e.touches[0].clientX, { passive: true });
lightbox.addEventListener('touchend', e => {
  const d = e.changedTouches[0].clientX - tx;
  if (d < -50 && lbIndex < filtered.length - 1) showItem(++lbIndex);
  if (d >  50 && lbIndex > 0) showItem(--lbIndex);
});


/* ════════════════════════════════
   INIT
   ════════════════════════════════ */

(async () => {
  allProjects = await loadProjects();
  filtered    = allProjects;
  buildFilters(allProjects);
  renderGrid(filtered);
})();
