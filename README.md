# Mike's Ideas — Portfolio

A minimal, cinematic graphic design portfolio that auto-deploys to GitHub Pages.

## 🚀 Setup (one time)

### 1. Create the GitHub repo

1. Go to [github.com/new](https://github.com/new)
2. Name it `mikesideas` (or anything you like)
3. Make it **Public**
4. Don't initialize with README (you'll push this folder)

### 2. Push this folder to GitHub

```bash
cd mikesideas-portfolio
git init
git add .
git commit -m "Initial portfolio"
git branch -M main
git remote add origin https://github.com/mikesideas/mikesideas.git
git push -u origin main
```

### 3. Enable GitHub Pages

1. Go to your repo → **Settings** → **Pages**
2. Under **Source**, select **GitHub Actions**
3. Save — that's it. The site deploys automatically on every push.

### 4. Point your domain (mikesideas.com)

In your domain registrar (Namecheap, GoDaddy, etc.), add these DNS records:

| Type  | Name | Value               |
|-------|------|---------------------|
| A     | @    | 185.199.108.153     |
| A     | @    | 185.199.109.153     |
| A     | @    | 185.199.110.153     |
| A     | @    | 185.199.111.153     |
| CNAME | www  | mikesideas.github.io |

DNS takes up to 24 hours to propagate. GitHub handles the SSL cert automatically.

---

## ✏️ Adding a New Project

### 1. Create a folder under `projects/`

```
projects/
  my-new-project/
    cover.jpg       ← shown in the list hover + project hero
    01.jpg
    02.jpg
    03.jpg
```

- **cover.jpg** — ~1600×1000px, JPG, under 500KB
- Other images — any size, portrait or landscape both work

### 2. Add an entry to `data/projects.json`

```json
{
  "id": "my-new-project",
  "title": "My New Project",
  "categories": ["branding", "identity"],
  "year": "2025",
  "description": "Short description of the project. One or two sentences.",
  "cover": "projects/my-new-project/cover.jpg",
  "images": [
    "projects/my-new-project/01.jpg",
    "projects/my-new-project/02.jpg",
    "projects/my-new-project/03.jpg"
  ]
}
```

Add it to the **top** of the array to show it first.

### 3. Push

```bash
git add .
git commit -m "Add: My New Project"
git push
```

→ GitHub Actions deploys in ~30 seconds. Done.

---

## 🎨 Customization

| What               | Where                          |
|--------------------|-------------------------------|
| Name in header     | `index.html` line 27 + footer  |
| Hero tagline       | `index.html` `.hero` section   |
| About text         | `about.html`                   |
| Email address      | All three HTML files           |
| Social links       | Footer in `index.html`         |
| Colors / fonts     | `css/style.css` `:root` block  |

---

## 📁 Structure

```
mikesideas-portfolio/
├── index.html              ← Homepage (project list)
├── project.html            ← Project detail (dynamic, reads URL ?id=)
├── about.html              ← About page
├── CNAME                   ← Custom domain
├── css/
│   └── style.css
├── js/
│   └── app.js
├── data/
│   └── projects.json       ← Your project manifest
├── projects/               ← Your image folders go here
│   └── sample-project/
└── .github/
    └── workflows/
        └── deploy.yml      ← Auto-deploy on push
```
