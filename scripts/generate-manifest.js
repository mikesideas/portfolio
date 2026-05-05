/**
 * Auto-generates data/projects.json by scanning the projects/ folder.
 * 
 * HOW IT WORKS:
 *   - Each subfolder inside projects/ = a category
 *   - Image files directly in a category folder = individual portfolio items
 *   - Sub-subfolders = multi-image projects (put cover.jpg inside for the preview)
 *   - Optional meta.json in any folder = custom title, description, year
 * 
 * HOW TO ADD A PROJECT:
 *   1. Upload image(s) to projects/CATEGORY/
 *   2. Push to GitHub — this script runs automatically via GitHub Actions
 */

const fs   = require('fs');
const path = require('path');

const PROJECTS_DIR = path.join(__dirname, '../projects');
const OUTPUT_FILE  = path.join(__dirname, '../data/projects.json');
const CONFIG_FILE  = path.join(__dirname, '../data/config.json');
const IMG_EXTS     = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif']);
const IGNORE       = new Set(['.gitkeep', '.DS_Store', 'Thumbs.db', 'meta.json', 'config.json']);

// Load site config for category display names
let categoryConfig = {};
try {
  const cfg = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
  categoryConfig = cfg.categories || {};
} catch {}

function toTitle(str) {
  return str
    .replace(/\.[^.]+$/, '')
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());
}

function isImage(f) {
  return IMG_EXTS.has(path.extname(f).toLowerCase());
}

function getMtime(p) {
  try { return fs.statSync(p).mtimeMs; }
  catch { return 0; }
}

function readMeta(dir) {
  try { return JSON.parse(fs.readFileSync(path.join(dir, 'meta.json'), 'utf8')); }
  catch { return {}; }
}

function getCategoryLabel(slug) {
  return categoryConfig[slug]?.label || toTitle(slug);
}

const projects = [];

const categories = fs.readdirSync(PROJECTS_DIR)
  .filter(n => fs.statSync(path.join(PROJECTS_DIR, n)).isDirectory())
  .sort();

for (const cat of categories) {
  const catPath = path.join(PROJECTS_DIR, cat);
  const items   = fs.readdirSync(catPath).filter(f => !IGNORE.has(f)).sort();
  const catLabel = getCategoryLabel(cat);

  for (const item of items) {
    const itemPath = path.join(catPath, item);
    const stat     = fs.statSync(itemPath);

    if (stat.isDirectory()) {
      const images = fs.readdirSync(itemPath).filter(f => isImage(f) && !IGNORE.has(f)).sort();
      if (!images.length) continue;
      const cover = images.find(f => /^cover\./i.test(f)) || images[0];
      const meta  = readMeta(itemPath);

      projects.push({
        id:          `${cat}--${item}`,
        title:       meta.title || toTitle(item),
        categories:  [cat],
        categoryLabel: catLabel,
        year:        meta.year || new Date(getMtime(path.join(itemPath, cover))).getFullYear().toString(),
        description: meta.description || categoryConfig[cat]?.description || '',
        cover:       `projects/${cat}/${item}/${cover}`,
        images:      images.map(img => `projects/${cat}/${item}/${img}`),
        _mtime:      getMtime(path.join(itemPath, cover)),
      });

    } else if (isImage(item)) {
      projects.push({
        id:          `${cat}--${path.basename(item, path.extname(item))}`,
        title:       toTitle(item),
        categories:  [cat],
        categoryLabel: catLabel,
        year:        new Date(getMtime(itemPath)).getFullYear().toString(),
        description: categoryConfig[cat]?.description || '',
        cover:       `projects/${cat}/${item}`,
        images:      [`projects/${cat}/${item}`],
        _mtime:      getMtime(itemPath),
      });
    }
  }
}

projects.sort((a, b) => b._mtime - a._mtime);
const output = projects.map(({ _mtime, ...p }) => p);

fs.mkdirSync(path.dirname(OUTPUT_FILE), { recursive: true });
fs.writeFileSync(OUTPUT_FILE, JSON.stringify(output, null, 2));
console.log(`✓ Generated ${output.length} project(s) across ${categories.length} categories.`);
