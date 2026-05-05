/* =========================================================
   MIKE'S IDEAS — Homepage (index.html only)
   Renders: category grid + featured recent work
   ========================================================= */

/* ── Category config (display names + descriptions) ── */
/* UPDATE: Edit labels and descriptions here to match your work */
const CAT_CONFIG = {
  'concert-flyers':    { label: 'Concert Flyers',    emoji: '🎵', desc: 'Posters & promotional flyers for concerts and shows.' },
  'flyers':            { label: 'Concert Flyers',    emoji: '🎵', desc: 'Posters & promotional flyers for concerts and shows.' },
  'logos':             { label: 'Logos & Branding',  emoji: '✦',  desc: 'Brand identities, logo systems & visual language.' },
  'branding':          { label: 'Logos & Branding',  emoji: '✦',  desc: 'Brand identities, logo systems & visual language.' },
  'websites':          { label: 'Websites',          emoji: '⌨',  desc: 'Web design & digital experiences.' },
  'merch':             { label: 'T-Shirts & Merch',  emoji: '👕',  desc: 'Apparel graphics & wearable design.' },
  'dispensary-labels': { label: 'Dispensary Labels', emoji: '🌿', desc: 'Cannabis packaging & dispensary label design.' },
  'event-graphics':    { label: 'Event Graphics',    emoji: '★',  desc: 'Visual assets for events & activations.' },
  'product-design':    { label: 'Product Design',    emoji: '◈',  desc: 'Product visuals & concepts.' },
  'mech-design':       { label: 'Mech Design',       emoji: '⚙',  desc: 'Mechanical & technical design work.' },
  'lighting-design':   { label: 'Lighting Design',   emoji: '💡', desc: 'Lighting concepts & visual setups.' },
  'everything-else':   { label: 'Other Work',        emoji: '+',  desc: 'Everything that doesn't fit a box.' },
};

function getCatInfo(slug) {
  return CAT_CONFIG[slug] || { label: slug.replace(/-/g, ' '), emoji: '✦', desc: '' };
}

/* ── Render category cards ── */
async function renderHomepage() {
  const projects = await loadProjects();
  renderCatGrid(projects);
  renderFeatured(projects);
}

function renderCatGrid(projects) {
  const catGrid = document.getElementById('catGrid');
  if (!catGrid) return;

  /* Group projects by category */
  const catMap = {};
  projects.forEach(p => {
    const cat = p.categories[0];
    if (!catMap[cat]) catMap[cat] = [];
    catMap[cat].push(p);
  });

  /* Priority order for display */
  const order = ['flyers','concert-flyers','logos','branding','websites','merch','dispensary-labels','event-graphics','product-design','lighting-design','mech-design','everything-else'];
  const cats  = [...new Set([...order, ...Object.keys(catMap)])].filter(c => catMap[c]);

  if (!cats.length) { catGrid.innerHTML = ''; return; }

  catGrid.innerHTML = cats.map((cat, i) => {
    const items = catMap[cat];
    const cover = items[0]?.cover || '';
    const info  = getCatInfo(cat);

    return `
      <a class="cat-card reveal${i === 0 ? '' : ` reveal-delay-${Math.min(i, 3)}`}" 
         href="work.html?cat=${cat}">
        ${cover
          ? `<img class="cat-card-img" src="${cover}" alt="${info.label}" loading="lazy" />`
          : `<div class="cat-card-placeholder"><span>${info.emoji}</span></div>`}
        <div class="cat-card-info">
          <div class="cat-card-label">${items.length} project${items.length !== 1 ? 's' : ''}</div>
          <div class="cat-card-name">${info.label}</div>
          <div class="cat-card-desc">${info.desc}</div>
        </div>
      </a>
    `;
  }).join('');

  /* Observe reveals */
  catGrid.querySelectorAll('.reveal').forEach(el => {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); } });
    }, { threshold: 0.1 });
    obs.observe(el);
  });

  /* Load images */
  catGrid.querySelectorAll('img').forEach(img => {
    if (img.complete) img.classList.add('loaded');
    else img.addEventListener('load', () => img.classList.add('loaded'));
  });
}

function renderFeatured(projects) {
  const featGrid = document.getElementById('featuredGrid');
  if (!featGrid) return;

  const featured = projects.slice(0, 6);

  if (!featured.length) { featGrid.innerHTML = ''; return; }

  featGrid.innerHTML = featured.map((p, i) => `
    <a class="featured-item reveal reveal-delay-${i % 3}" href="work.html">
      <img src="${p.cover}" alt="${p.title}" loading="lazy" />
      <div class="featured-overlay">
        <div class="featured-text">
          <div class="featured-title">${p.title}</div>
          <div class="featured-cat">${p.categoryLabel || p.categories[0]}</div>
        </div>
      </div>
    </a>
  `).join('');

  featGrid.querySelectorAll('.reveal').forEach(el => {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); } });
    }, { threshold: 0.1 });
    obs.observe(el);
  });

  featGrid.querySelectorAll('img').forEach(img => {
    if (img.complete) img.classList.add('loaded');
    else img.addEventListener('load', () => img.classList.add('loaded'));
  });
}

/* ── Handle work.html ?cat= filter from homepage category links ── */
function handleCatFilter() {
  if (!document.getElementById('filterInner')) return;
  const params = new URLSearchParams(window.location.search);
  const cat = params.get('cat');
  if (!cat) return;

  /* Wait for filters to be built, then click the right one */
  const attempt = () => {
    const btn = document.querySelector(`[data-cat="${cat}"]`);
    if (btn) { btn.click(); return; }
    setTimeout(attempt, 100);
  };
  attempt();
}

/* ── loadProjects is defined in app.js ── */
document.addEventListener('DOMContentLoaded', () => {
  renderHomepage();
  handleCatFilter();
});
