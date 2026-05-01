# Greater Latrobe Hockey Club — Website

Modern rebuild of greaterlatrobehockey.com with a built-in admin dashboard for the secretary.

## What's here

- **Public site** — Home, About, Contact, Calendar, Forms, Schedules, Rosters
- **Admin dashboard** at `/admin` — single shared password, edit any page's text and photos, no developer needed
- **Content as JSON files** in `src/content/` — every page is one editable file
- **Image uploads** — uploaded photos go to `/public/uploads/` (or are committed to GitHub in production)

## Tech

- [Astro](https://astro.build/) with the Netlify adapter
- Tailwind CSS for styling
- HMAC-signed cookie sessions for admin auth
- GitHub Contents API to commit edits in production (so Netlify auto-redeploys)
- Repo: [W-M-T-R/Latrobe-Hockey](https://github.com/W-M-T-R/Latrobe-Hockey)

---

## Run locally

```bash
cd site
npm install
cp .env.example .env
# edit .env and set ADMIN_PASSWORD to whatever you want
npm run dev
```

Open http://localhost:4321/ — site is live.
Open http://localhost:4321/admin — log in with the password from `.env`.

> If you don't create a `.env`, the default password is `wildcats`. **Change it** before going live.

## How editing works

1. The secretary visits **`/admin`** and types the shared password.
2. The dashboard lists every page on the site as a card.
3. **Edit** opens a friendly form built from that page's content. Every field is editable. There's also a **Raw JSON** view for power users.
4. **📷 Insert image** opens a small uploader — pick a photo, copy the returned URL, paste into any image field.
5. Click **Save changes**. In dev, the file is written locally. In production, the change is committed to GitHub and the host redeploys automatically (typically 30–60s).

## Deploy to Netlify (free)

The site uses the Netlify adapter — `/admin` save endpoints run as Netlify Functions. The included `netlify.toml` (in the repo root, one level up from `site/`) tells Netlify how to build.

### Step 1 — Push the code to GitHub

The contents of this `site/` folder become the root of the GitHub repo.

```bash
cd site
git init
git remote add origin https://github.com/W-M-T-R/Latrobe-Hockey.git
git add .
git commit -m "initial Latrobe Hockey site"
git branch -M main
git push -u origin main
```

### Step 2 — Create a fine-grained GitHub Personal Access Token

This is the token the admin dashboard uses to commit edits.

1. Go to <https://github.com/settings/personal-access-tokens/new>
2. **Resource owner** → `W-M-T-R`
3. **Repository access** → **Only select repositories** → `Latrobe-Hockey`
4. **Repository permissions** → **Contents: Read and write**
5. Generate the token. Copy it (starts with `github_pat_`).

### Step 3 — Deploy on Netlify

1. Sign in at <https://app.netlify.com> with GitHub.
2. **Add new site → Import an existing project → GitHub** → pick `Latrobe-Hockey`.
3. The build settings auto-fill from `netlify.toml`. **Don't change them.**
4. Click **Show advanced** → **New variable** and add these one by one:
   - `ADMIN_PASSWORD` — what the secretary types in (pick something good)
   - `ADMIN_SESSION_SECRET` — long random string (use a password manager to generate one)
   - `GITHUB_TOKEN` — the token from Step 2
   - `GITHUB_OWNER` — `W-M-T-R`
   - `GITHUB_REPO` — `Latrobe-Hockey`
   - `GITHUB_BRANCH` — `main`
   - `GITHUB_PATH_PREFIX` — leave empty (since the site is at the repo root)
5. **Deploy site**. After ~2 minutes Netlify gives you a `*.netlify.app` URL. Visit `/admin`, log in — the status pill should say **Saving to GitHub (live deploy)**.

### Step 4 — Point greaterlatrobehockey.com at Netlify

1. In Netlify: **Domain management → Add custom domain** → `greaterlatrobehockey.com`.
2. Netlify shows you DNS records (an `A` for the apex and a `CNAME` for `www`). Add them at whatever registrar holds the domain.
3. Wait for DNS to propagate (anywhere from 10 min to 24 hrs). Netlify auto-provisions HTTPS.

---

## File map

```
site/
├── src/
│   ├── content/            ← every page's editable content (JSON)
│   ├── pages/              ← public pages + /admin + /api routes
│   ├── components/         ← Nav, Footer, PageHero
│   ├── layouts/            ← BaseLayout (public), AdminLayout
│   ├── lib/
│   │   ├── content.ts      ← read/write content files
│   │   ├── auth.ts         ← shared-password session cookie
│   │   └── persist.ts      ← write to disk + commit to GitHub
│   └── middleware.ts       ← protects /admin/*
├── public/
│   ├── images/             ← logos and championship banners
│   ├── media/              ← team photos and videos
│   └── uploads/            ← (auto) admin-uploaded photos
├── astro.config.mjs
├── tailwind.config.mjs
└── package.json
```

## Adding new pages later

1. Create `src/content/<key>.json` with the page's content.
2. Add `<key>` to the `PAGES` array in `src/lib/content.ts`.
3. Create `src/pages/<key>.astro` that imports the content and renders it.
4. Add the page to the dashboard list in `src/pages/admin/dashboard.astro`.

## Security notes

- The single shared password is fine for a small club, but anyone who has it can edit everything. If you want to revoke access, change `ADMIN_PASSWORD` in your host's env vars and redeploy.
- The session cookie is HMAC-signed with `ADMIN_SESSION_SECRET`. Set it to something long and random.
- `/admin` and `/admin/*` are marked `noindex,nofollow` so they won't show up in Google.
- The GitHub token is **scoped to one repo with contents permission only** — even if leaked, it can't touch other repos.
