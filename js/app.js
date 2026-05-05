/* ─────────────────────────────────────────
   Mike's Ideas — Portfolio App
   ───────────────────────────────────────── */

const PROJECTS_URL = 'data/projects.json';

/* ── Page detection ── */
const isIndex   = document.getElementById('projects-list') !== null;
const isProject = document.getElementById('project-content') !== null;

/* ── Load projects data ── */
async function loadProjects() {
  try {
    const res = await fetch(PROJECTS_URL);
    if (!res.ok) throw new Error('Failed to load projects.json');
    return await res.json();
  } catch (err) {
    console.error(err);
    return [];
  }
}

/* ════════════════════════════════
   INDEX PAGE
   ════════════════════════════════ */
if (isIndex) {

  /* Year in footer */
  document.getElementById('year').textContent = new Date().getFullYear();

  /* Cursor preview */
  const preview  = document.getElementById('cursor-preview');
  let mouseX = 0, mouseY = 0;
  let currentX = 0, currentY = 0;
  let raf;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  function animatePreview() {
    currentX += (mouseX - currentX) * 0.12;
    currentY += (mouseY - currentY) * 0.12;
    preview.style.left = currentX + 'px';
    preview.style.top  = currentY + 'px';
    raf = requestAnimationFrame(animatePreview);
  }
  animatePreview();

  /* Page transition helper */
  const overlay = document.getElementById('pageTransition');

  function navigateTo(url) {
    overlay.classList.add('active');
    setTimeout(() => { window.location.href = url; }, 480);
  }

  /* Render project list */
  async function renderIndex() {
    const projects = await loadProjects();
    const list     = document.getElementById('projects-list');
    const filterBar = document.getElementById('filterBar');

    if (!projects.length) {
      list.innerHTML = '<p style="color:#4a4a4a;padding:48px 0;">No projects yet — add entries to data/projects.json</p>';
      return;
    }

    /* Build category list from all projects */
    const allCategories = ['all', ...new Set(projects.flatMap(p => p.categories))];
    let activeFilter = 'all';

    /* Render filter buttons */
    filterBar.innerHTML = allCategories.map(cat => `
      <button class="filter-btn${cat === 'all' ? ' active' : ''}" data-cat="${cat}">
        ${cat === 'all' ? 'All' : cat}
      </button>
    `).join('');

    /* Render all project items */
    function renderItems(filter) {
      const filtered = filter === 'all'
        ? projects
        : projects.filter(p => p.categories.includes(filter));

      list.innerHTML = filtered.map((p, i) => `
        <div class="project-item" data-cover="${p.cover}" data-url="project.html?id=${p.id}" data-categories="${p.categories.join(',')}"
             style="opacity:0;transform:translateY(12px);transition:opacity 0.4s ease ${i * 0.06}s,transform 0.4s ease ${i * 0.06}s">
          <span class="project-index">${String(i + 1).padStart(2, '0')}</span>
          <div class="project-main">
            <span class="project-title">${p.title}</span>
            <div class="project-meta">
              <div class="project-categories">
                ${p.categories.map(c => `<span class="project-category">${c}</span>`).join('')}
              </div>
              <span class="project-year">${p.year}</span>
            </div>
          </div>
          <span class="project-arrow">→</span>
        </div>
      `).join('');

      /* Animate in */
      requestAnimationFrame(() => {
        document.querySelectorAll('.project-item').forEach(el => {
          requestAnimationFrame(() => {
            el.style.opacity = '1';
            el.style.transform = 'translateY(0)';
          });
        });
      });

      /* Bind hover + click */
      document.querySelectorAll('.project-item').forEach(item => {
        const cover = item.dataset.cover;
        const url   = item.dataset.url;

        item.addEventListener('mouseenter', () => {
          if (cover) { preview.src = cover; preview.classList.add('visible'); }
        });
        item.addEventListener('mouseleave', () => preview.classList.remove('visible'));
        item.addEventListener('click', () => navigateTo(url));
      });
    }

    renderItems('all');

    /* Filter button clicks */
    filterBar.addEventListener('click', (e) => {
      const btn = e.target.closest('.filter-btn');
      if (!btn) return;
      activeFilter = btn.dataset.cat;
      filterBar.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderItems(activeFilter);
    });
  }

  renderIndex();
}


/* ════════════════════════════════
   PROJECT DETAIL PAGE
   ════════════════════════════════ */
if (isProject) {

  const overlay = document.getElementById('pageTransition');

  /* Animate in */
  requestAnimationFrame(() => {
    overlay.style.transition = 'transform 0.5s cubic-bezier(0.76, 0, 0.24, 1)';
    overlay.classList.remove('active');
  });

  /* Intercept back button for smooth transition */
  const backLink = document.getElementById('backLink');
  backLink.addEventListener('click', (e) => {
    e.preventDefault();
    overlay.classList.add('active');
    setTimeout(() => { window.location.href = backLink.href; }, 480);
  });

  /* Get project id from URL */
  const params = new URLSearchParams(window.location.search);
  const projectId = params.get('id');

  async function renderProject() {
    const projects = await loadProjects();
    const project  = projects.find(p => p.id === projectId);
    const content  = document.getElementById('project-content');

    if (!project) {
      content.innerHTML = `
        <div class="error-state">
          <h2>Project not found.</h2>
          <p>Check that the id in the URL matches an entry in projects.json.</p>
        </div>`;
      return;
    }

    /* Update page title */
    document.title = `${project.title} — Mike's Ideas`;

    /* Render */
    content.innerHTML = `
      <div class="project-hero">
        <img src="${project.cover}" alt="${project.title}" loading="eager" />
      </div>

      <div class="project-info">
        <div class="project-info-categories">
          ${project.categories.map(c => `<span class="project-info-category">${c}</span>`).join('')}
        </div>
        <h1>${project.title}</h1>
        <p class="project-info-meta">${project.year}</p>
        <p>${project.description}</p>
      </div>

      <div class="project-images" id="projectImages">
        ${project.images.map(src => `
          <img src="${src}" alt="" loading="lazy" />
        `).join('')}
      </div>
    `;

    /* Scroll-triggered reveal for images */
    const images = document.querySelectorAll('#projectImages img');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    images.forEach(img => observer.observe(img));
  }

  renderProject();
}
