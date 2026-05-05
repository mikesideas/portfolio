/* =========================================================
   MIKE'S IDEAS — Core App (Gallery + Lightbox + Nav)
   Used on: work.html (gallery), about.html, contact.html
   ========================================================= */

/* ── Year ── */
document.querySelectorAll('#year').forEach(el => el.textContent = new Date().getFullYear());

/* ── Mobile Nav ── */
const hamburger = document.getElementById('hamburger');
const navMobile = document.getElementById('navMobile');

if (hamburger && navMobile) {
  hamburger.addEventListener('click', () => {
    navMobile.classList.toggle('open');
  });
  navMobile.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => navMobile.classList.remove('open'));
  });
}

/* ── Scroll Reveal ── */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); revealObserver.unobserve(e.target); } });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));


/* ── Load projects.json ── */
async function loadProjects() {
  try {
    const r = await fetch('data/projects.json?v=' + Date.now());
    if (!r.ok) throw new Error();
    return await r.json();
  } catch { return []; }
}

/* ── Lazy image observer ── */
function observeImages(container) {
  const imgs = container.querySelectorAll('img[loading="lazy"], img');
  imgs.forEach(img => {
    if (img.complete) img.classList.add('loaded');
    else {
      img.addEventListener('load',  () => img.classList.add('loaded'));
      img.addEventListener('error', () => { if (img.closest('.gallery-item')) img.closest('.gallery-item').style.display = 'none'; });
    }
  });
}


/* =========================================================
   GALLERY PAGE (work.html)
   ========================================================= */

const galleryEl  = document.getElementById('gallery');
const filterEl   = document.getElementById('filterInner');
const countEl    = document.getElementById('galleryCount');

if (galleryEl) {
  let all      = [];
  let filtered = [];
  let lbIdx    = 0;

  /* Render gallery */
  function renderGallery(projects) {
    if (!projects.length) {
      galleryEl.innerHTML = '<p class="gallery-empty">No projects yet — upload images to a category folder on GitHub.</p>';
      if (countEl) countEl.textContent = '';
      return;
    }

    if (countEl) countEl.textContent = `${projects.length} project${projects.length !== 1 ? 's' : ''}`;

    galleryEl.innerHTML = projects.map((p, i) => `
      <div class="gallery-item reveal" data-i="${i}" tabindex="0" role="button" aria-label="View ${p.title}">
        <img src="${p.cover}" alt="${p.title}" loading="lazy" />
        <div class="gallery-overlay">
          <div class="gallery-item-title">${p.title}</div>
          <div class="gallery-item-cat">${p.categoryLabel || p.categories[0]}</div>
        </div>
      </div>
    `).join('');

    observeImages(galleryEl);

    /* Scroll reveal for gallery items */
    galleryEl.querySelectorAll('.gallery-item').forEach(el => revealObserver.observe(el));

    /* Click → lightbox */
    galleryEl.querySelectorAll('.gallery-item').forEach(el => {
      const open = () => openLightbox(parseInt(el.dataset.i, 10));
      el.addEventListener('click', open);
      el.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') open(); });
    });
  }

  /* Build filter buttons */
  function buildFilters(projects) {
    if (!filterEl) return;
    const cats = [...new Set(projects.map(p => p.categories[0]))].sort();

    filterEl.querySelectorAll('[data-dynamic]').forEach(b => b.remove());

    cats.forEach(cat => {
      const btn = document.createElement('button');
      btn.className = 'filter-btn';
      btn.dataset.cat = cat;
      btn.dataset.dynamic = '1';
      /* Use display label from project data if available */
      const sample = projects.find(p => p.categories[0] === cat);
      btn.textContent = sample?.categoryLabel || cat.replace(/-/g, ' ');
      filterEl.appendChild(btn);
    });

    filterEl.addEventListener('click', e => {
      const btn = e.target.closest('.filter-btn');
      if (!btn) return;
      filterEl.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const cat = btn.dataset.cat;
      filtered = cat === 'all' ? all : all.filter(p => p.categories.includes(cat));
      renderGallery(filtered);
    });
  }

  /* Init gallery */
  (async () => {
    all = await loadProjects();
    filtered = all;
    buildFilters(all);
    renderGallery(filtered);
  })();


  /* ── Lightbox ── */
  const lightbox = document.getElementById('lightbox');
  const lbImg    = document.getElementById('lbImg');
  const lbTitle  = document.getElementById('lbTitle');
  const lbCat    = document.getElementById('lbCat');
  const lbClose  = document.getElementById('lbClose');
  const lbPrev   = document.getElementById('lbPrev');
  const lbNext   = document.getElementById('lbNext');
  const lbCounter = document.getElementById('lbCounter');

  function openLightbox(i) {
    lbIdx = i;
    showLbItem(i);
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
  }

  function showLbItem(i) {
    const p = filtered[i];
    if (!p) return;
    lbImg.style.opacity = '0';
    lbImg.src = p.cover;
    lbImg.alt = p.title;
    lbTitle.textContent = p.title;
    lbCat.textContent = p.categoryLabel || p.categories.join(' · ');
    if (lbCounter) lbCounter.textContent = `${i + 1} / ${filtered.length}`;
    lbImg.onload = () => lbImg.style.opacity = '1';
    if (lbPrev) lbPrev.style.visibility = i > 0 ? 'visible' : 'hidden';
    if (lbNext) lbNext.style.visibility = i < filtered.length - 1 ? 'visible' : 'hidden';
  }

  if (lbClose) lbClose.addEventListener('click', closeLightbox);
  if (lbPrev)  lbPrev.addEventListener('click', e => { e.stopPropagation(); if (lbIdx > 0) showLbItem(--lbIdx); });
  if (lbNext)  lbNext.addEventListener('click', e => { e.stopPropagation(); if (lbIdx < filtered.length - 1) showLbItem(++lbIdx); });
  if (lightbox) lightbox.addEventListener('click', e => { if (e.target === lightbox) closeLightbox(); });

  document.addEventListener('keydown', e => {
    if (!lightbox?.classList.contains('open')) return;
    if (e.key === 'Escape')     closeLightbox();
    if (e.key === 'ArrowLeft'  && lbIdx > 0)                    showLbItem(--lbIdx);
    if (e.key === 'ArrowRight' && lbIdx < filtered.length - 1)  showLbItem(++lbIdx);
  });

  /* Touch swipe */
  let tx = 0;
  if (lightbox) {
    lightbox.addEventListener('touchstart', e => tx = e.touches[0].clientX, { passive: true });
    lightbox.addEventListener('touchend',   e => {
      const d = e.changedTouches[0].clientX - tx;
      if (d < -50 && lbIdx < filtered.length - 1) showLbItem(++lbIdx);
      if (d >  50 && lbIdx > 0)                   showLbItem(--lbIdx);
    });
  }
}
