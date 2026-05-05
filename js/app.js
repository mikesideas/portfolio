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
    const list = document.getElementById('projects-list');

    if (!projects.length) {
      list.innerHTML = '<p style="color:#4a4a4a;padding:48px 0;">No projects yet — add entries to data/projects.json</p>';
      return;
    }

    list.innerHTML = projects.map((p, i) => `
      <div class="project-item" data-cover="${p.cover}" data-url="project.html?id=${p.id}">
        <span class="project-index">0${i + 1}</span>
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

    /* Bind events */
    document.querySelectorAll('.project-item').forEach(item => {
      const cover = item.dataset.cover;
      const url   = item.dataset.url;

      /* Hover — show preview */
      item.addEventListener('mouseenter', () => {
        if (cover) {
          preview.src = cover;
          preview.classList.add('visible');
        }
      });

      item.addEventListener('mouseleave', () => {
        preview.classList.remove('visible');
      });

      /* Click — navigate */
      item.addEventListener('click', () => navigateTo(url));
    });

    /* Entrance animation */
    requestAnimationFrame(() => {
      document.querySelectorAll('.project-item').forEach((el, i) => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(16px)';
        el.style.transition = `opacity 0.5s ease ${i * 0.07}s, transform 0.5s ease ${i * 0.07}s`;
        requestAnimationFrame(() => {
          el.style.opacity = '1';
          el.style.transform = 'translateY(0)';
        });
      });
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
