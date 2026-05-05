/* ─────────────────────────────────────────
   Mike's Ideas — Masonry Portfolio + Lightbox
   ───────────────────────────────────────── */

const PROJECTS_URL = 'data/projects.json';

let allProjects  = [];
let filtered     = [];
let lightboxIndex = 0;

/* ── DOM refs ── */
const grid        = document.getElementById('masonryGrid');
const emptyState  = document.getElementById('emptyState');
const filterNav   = document.getElementById('filterNav');
const lightbox    = document.getElementById('lightbox');
const lbImg       = document.getElementById('lightboxImg');
const lbTitle     = document.getElementById('lightboxTitle');
const lbDesc      = document.getElementById('lightboxDesc');
const lbCategory  = document.getElementById('lightboxCategory');
const lbClose     = document.getElementById('lightboxClose');
const lbPrev      = document.getElementById('lightboxPrev');
const lbNext      = document.getElementById('lightboxNext');

/* ── Year ── */
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

/* ── Load projects ── */
async function loadProjects() {
  try {
    const res = await fetch(PROJECTS_URL + '?t=' + Date.now());
    if (!res.ok) throw new Error();
    return await res.json();
  } catch {
    return [];
  }
}

/* ── Render masonry grid ── */
function renderGrid(projects) {
  if (!projects.length) {
    grid.innerHTML = '';
    emptyState.style.display = 'block';
    return;
  }
  emptyState.style.display = 'none';

  grid.innerHTML = projects.map((p, i) => `
    <div class="grid-item" data-index="${i}">
      <img
        src="${p.cover}"
        alt="${p.title}"
        loading="lazy"
      />
      <div class="grid-item-overlay">
        <div class="grid-item-title">${p.title}</div>
        <div class="grid-item-cat">${p.categories.join(' · ')}</div>
      </div>
    </div>
  `).join('');

  /* Lazy load + fade in */
  grid.querySelectorAll('img').forEach(img => {
    if (img.complete) {
      img.classList.add('loaded');
    } else {
      img.addEventListener('load', () => img.classList.add('loaded'));
      img.addEventListener('error', () => {
        img.closest('.grid-item').style.display = 'none';
      });
    }
  });

  /* Click → lightbox */
  grid.querySelectorAll('.grid-item').forEach(item => {
    item.addEventListener('click', () => {
      const idx = parseInt(item.dataset.index, 10);
      openLightbox(idx);
    });
  });
}

/* ── Category filters ── */
function buildFilters(projects) {
  const cats = ['all', ...new Set(projects.flatMap(p => p.categories))].sort();

  /* Remove old dynamic buttons (keep "All Work") */
  filterNav.querySelectorAll('[data-dynamic]').forEach(b => b.remove());

  cats.filter(c => c !== 'all').forEach(cat => {
    const btn = document.createElement('button');
    btn.className = 'filter-btn';
    btn.dataset.cat = cat;
    btn.dataset.dynamic = '1';
    btn.textContent = cat.replace(/-/g, ' ');
    filterNav.appendChild(btn);
  });

  filterNav.addEventListener('click', e => {
    const btn = e.target.closest('.filter-btn');
    if (!btn) return;
    filterNav.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const cat = btn.dataset.cat;
    filtered = cat === 'all' ? allProjects : allProjects.filter(p => p.categories.includes(cat));
    renderGrid(filtered);
  });
}


/* ════════════════════════════════
   LIGHTBOX
   ════════════════════════════════ */

function openLightbox(index) {
  lightboxIndex = index;
  showLightboxItem(lightboxIndex);
  lightbox.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  lightbox.classList.remove('open');
  document.body.style.overflow = '';
}

function showLightboxItem(index) {
  const p = filtered[index];
  if (!p) return;
  lbImg.style.opacity = '0';
  lbImg.src = p.cover;
  lbTitle.textContent = p.title;
  lbCategory.textContent = p.categories.join(' · ');
  lbDesc.textContent = p.description || '';
  lbImg.onload = () => { lbImg.style.opacity = '1'; };

  /* Show/hide arrows */
  lbPrev.style.visibility = index > 0 ? 'visible' : 'hidden';
  lbNext.style.visibility = index < filtered.length - 1 ? 'visible' : 'hidden';
}

lbClose.addEventListener('click', closeLightbox);

lbPrev.addEventListener('click', e => {
  e.stopPropagation();
  if (lightboxIndex > 0) showLightboxItem(--lightboxIndex);
});

lbNext.addEventListener('click', e => {
  e.stopPropagation();
  if (lightboxIndex < filtered.length - 1) showLightboxItem(++lightboxIndex);
});

/* Click backdrop to close */
lightbox.addEventListener('click', e => {
  if (e.target === lightbox) closeLightbox();
});

/* Keyboard navigation */
document.addEventListener('keydown', e => {
  if (!lightbox.classList.contains('open')) return;
  if (e.key === 'Escape') closeLightbox();
  if (e.key === 'ArrowLeft' && lightboxIndex > 0) showLightboxItem(--lightboxIndex);
  if (e.key === 'ArrowRight' && lightboxIndex < filtered.length - 1) showLightboxItem(++lightboxIndex);
});

/* Touch swipe */
let touchStartX = 0;
lightbox.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
lightbox.addEventListener('touchend', e => {
  const dx = e.changedTouches[0].clientX - touchStartX;
  if (dx < -50 && lightboxIndex < filtered.length - 1) showLightboxItem(++lightboxIndex);
  if (dx > 50 && lightboxIndex > 0) showLightboxItem(--lightboxIndex);
});


/* ════════════════════════════════
   MOBILE MENU
   ════════════════════════════════ */

const sidebar    = document.getElementById('sidebar');
const menuToggle = document.getElementById('menuToggle');

if (menuToggle) {
  menuToggle.addEventListener('click', () => {
    sidebar.classList.toggle('open');
  });

  /* Close sidebar when filter selected on mobile */
  filterNav.addEventListener('click', () => {
    if (window.innerWidth <= 768) sidebar.classList.remove('open');
  });
}


/* ════════════════════════════════
   INIT
   ════════════════════════════════ */

(async () => {
  allProjects = await loadProjects();
  filtered    = allProjects;
  buildFilters(allProjects);
  renderGrid(filtered);
})();
