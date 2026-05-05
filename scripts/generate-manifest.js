/**
 * Auto-generates data/projects.json by scanning the projects/ folder.
 * Each category folder (logos, flyers, etc.) is scanned for:
 *   - Direct image files → each image = one portfolio item
 *   - Subfolders → each subfolder = one multi-image project
 *       (put a cover.jpg in the subfolder for the preview image)
 */

const fs   = require('fs');
const path = require('path');

const PROJECTS_DIR = path.join(__dirname, '../projects');
const OUTPUT_FILE  = path.join(__dirname, '../data/projects.json');
const IMG_EXTS     = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif']);
const IGNORE       = new Set(['.gitkeep', '.DS_Store', 'Thumbs.db']);

function toTitle(str) {
  return str
    .replace(/\.[^.]+$/, '')          // strip extension
    .replace(/[-_]/g, ' ')            // dashes/underscores → spaces
    .replace(/\b\w/g, c => c.toUpperCase()); // Title Case
}

function isImage(filename) {
  return IMG_EXTS.has(path.extname(filename).toLowerCase());
}

function getMtime(filePath) {
  try { return fs.statSync(filePath).mtimeMs; }
  catch { return 0; }
}

const projects = [];

// Category folders
const categories = fs.readdirSync(PROJECTS_DIR)
  .filter(name => {
    const p = path.join(PROJECTS_DIR, name);
    return fs.statSync(p).isDirectory();
  })
  .sort();

for (const category of categories) {
  const catPath = path.join(PROJECTS_DIR, category);
  const items   = fs.readdirSync(catPath).filter(f => !IGNORE.has(f)).sort();

  for (const item of items) {
    const itemPath = path.join(catPath, item);
    const stat     = fs.statSync(itemPath);

    if (stat.isDirectory()) {
      /* ── Multi-image project folder ── */
      const images = fs.readdirSync(itemPath)
        .filter(f => isImage(f) && !IGNORE.has(f))
        .sort();

      if (!images.length) continue;

      // prefer cover.jpg, otherwise first image alphabetically
      const cover = images.find(f => /^cover\./i.test(f)) || images[0];

      projects.push({
        id:          `${category}--${item}`,
        title:       toTitle(item),
        categories:  [category],
        year:        new Date(getMtime(path.join(itemPath, cover))).getFullYear().toString(),
        description: '',
        cover:       `projects/${category}/${item}/${cover}`,
        images:      images.map(img => `projects/${category}/${item}/${img}`),
        _mtime:      getMtime(path.join(itemPath, cover)),
      });

    } else if (isImage(item)) {
      /* ── Single image ── */
      projects.push({
        id:          `${category}--${path.basename(item, path.extname(item))}`,
        title:       toTitle(item),
        categories:  [category],
        year:        new Date(getMtime(itemPath)).getFullYear().toString(),
        description: '',
        cover:       `projects/${category}/${item}`,
        images:      [`projects/${category}/${item}`],
        _mtime:      getMtime(itemPath),
      });
    }
  }
}

// Sort newest first
projects.sort((a, b) => b._mtime - a._mtime);

// Strip internal _mtime field
const output = projects.map(({ _mtime, ...p }) => p);

fs.mkdirSync(path.dirname(OUTPUT_FILE), { recursive: true });
fs.writeFileSync(OUTPUT_FILE, JSON.stringify(output, null, 2));
console.log(`✓ Generated ${output.length} project(s) across ${categories.length} categories.`);
