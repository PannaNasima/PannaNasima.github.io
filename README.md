# Nasima Akter — Cloud Bookkeeper

A static, five-page marketing site. No framework, no build step, no dependencies.
Edit the HTML, push, and GitHub Pages serves it.

---

## Before it goes live — 2 required steps

### 1. Connect the contact form (5 minutes)

GitHub Pages has no backend, so the form posts to **Web3Forms** (free, no account tie-in).

1. Go to <https://web3forms.com>, enter `pannasima@gmail.com`, and they email you an access key.
2. Open [`contact.html`](contact.html), find this line (~line 195):
   ```html
   <input type="hidden" name="access_key" value="YOUR-WEB3FORMS-ACCESS-KEY">
   ```
3. Replace `YOUR-WEB3FORMS-ACCESS-KEY` with the key.

Until this is done the form shows a clear message telling visitors to email directly —
it will not fail silently.

### 2. Domain — already set

GitHub account: **PannaNasima**. Canonical URLs, Open Graph tags, JSON-LD,
[`sitemap.xml`](sitemap.xml) and [`robots.txt`](robots.txt) all point at
**`https://pannanasima.github.io/`**.

Note the lowercase: GitHub Pages serves user sites from a lowercase hostname regardless of
how the username is capitalised. `PannaNasima.github.io` and `pannanasima.github.io` reach
the same place, but the canonical tags use lowercase, which is what search engines index.

If a custom domain is bought later, find-and-replace `pannanasima.github.io` across all
`.html` files plus `sitemap.xml` and `robots.txt`.

---

## Deploying to GitHub Pages

**Do this once.** The repo name must match the username exactly for a user site.

1. Create a new repo named **`PannaNasima.github.io`** — public, and do **not** add a README,
   .gitignore or licence (this folder already has what it needs).
2. From `D:\PA_WEB`, run the commands below.
3. Settings → Pages → Source: **Deploy from a branch**, branch `main`, folder **`/ (root)`**.
4. Tick **Enforce HTTPS** (may take a few minutes to become available).
5. Live at **<https://pannanasima.github.io>**, usually within 1–2 minutes of the push.

```bash
cd /d D:\PA_WEB
git init
git add .
git commit -m "Launch site"
git branch -M main
git remote add origin https://github.com/PannaNasima/PannaNasima.github.io.git
git push -u origin main
```

If the push asks for a password, use a **personal access token**, not the account password —
GitHub → Settings → Developer settings → Personal access tokens → Fine-grained tokens, with
"Contents: Read and write" on that repo.

**Publishing later changes:**

```bash
git add .
git commit -m "Update copy"
git push
```

**Note on `information/`** — that folder holds the source CV screenshots and the brief. It is
*not* needed by the site, and pushing it would publish her documents at a public URL. Either
delete it before the first commit, or add a `.gitignore` containing `information/`.

**Alternative — project site** (`github.com/PannaNasima/<repo>` → `/<repo>/`)
Works unchanged: internal links and asset paths are all relative. The only exception is
[`404.html`](404.html), which uses root-absolute paths (`/assets/...`) because GitHub serves
it from arbitrary URLs. On a project site those become `/<repo>/assets/...`, and the
canonical URLs would need the `/<repo>/` prefix too.

**Custom domain** — add a `CNAME` file containing just the domain, point DNS at GitHub,
then re-tick Enforce HTTPS. Free TLS either way, which covers the SSL requirement in the brief.

`.nojekyll` is already present so GitHub does not run Jekyll over the files.

---

## Editing content

Everything is plain HTML — no templating. The trade-off of a build-free site is that the
header and footer are duplicated across the five pages, so **a nav or footer change must be
made in all five**: `index.html`, `about.html`, `services.html`, `contact.html`, `404.html`.

| To change | Edit |
|---|---|
| Colours, spacing, type scale | `assets/css/tokens.css` — everything derives from these |
| Header, footer, buttons, cards, forms | `assets/css/components.css` |
| Page sections (hero, timeline, services…) | `assets/css/pages.css` |
| Behaviour (nav, theme, accordion, clock) | `assets/js/main.js` |
| Scroll reveals, stat count-up | `assets/js/reveal.js` |
| Form validation and sending | `assets/js/contact.js` |

**Booking link** — `https://calendly.com/pannasima/free-consultation-call` appears in the
header, hero, footer and CTA bands of every page. Find-and-replace to change it.

**Stat numbers** — `<span data-count="8">8</span>`. The attribute is the value it counts up
to; the text inside is the fallback if JavaScript is off. Change both.

---

## Design notes worth knowing

**The portrait always sits on a light plate — in both themes.** Her hijab and abaya are
almost exactly the value of the dark background, so on dark the silhouette dissolves and the
face appears to float. `--plate-from` / `--plate-to` are deliberately *not* redefined in the
dark blocks. Don't "fix" that.

**Source photo is 450×600**, already compressed by WhatsApp. It renders at ≤300px CSS width
to stay sharp on 2× screens. If a higher-resolution original turns up, re-run
`assets/img/` generation and the hero can go larger.

**Gold has two tokens.** `--gold` is decorative only (rules, borders, bullets).
`--gold-ink` is for gold *text and icons* — the bright gold fails WCAG contrast on the
gold tint background, so anything readable uses `--gold-ink`.

**Animations and `transform`.** Several elements run a looping `float-y` animation. A CSS
animation's `transform` overrides any `transform` set in a rule, so never centre those
elements with `translateX(-50%)` — use `left:0; right:0; margin-inline:auto` instead.
This bit twice during the build.

**Light is the default theme for everyone**, whatever their computer is set to. Dark is
opt-in via the header toggle and is then remembered in `localStorage`. There is intentionally
**no `prefers-color-scheme: dark` rule in the CSS** — the only way to reach dark is
`data-theme="dark"` on `<html>`, which only the toggle sets. If you ever want the site to
follow the visitor's OS again, re-add a `@media (prefers-color-scheme: dark)` block in
`tokens.css` mirroring the `:root[data-theme='dark']` values; until then, don't add one by
accident, because it would silently override the light default.

**Motion is fully disabled** under `prefers-reduced-motion: reduce`, and all content is
visible without JavaScript (`.no-js` fallback).

---

## Accessibility & performance

- WCAG 2.2 AA contrast verified by computation for every foreground/background pair in
  **both** themes.
- Semantic landmarks, skip link, visible focus rings, keyboard-operable nav / accordion /
  filters, labelled form fields with `aria-live` error slots.
- Self-hosted fonts (no Google Fonts request), preloaded, `font-display: swap`.
- Total JS under 25 KB, unminified. Calendly's widget loads lazily on scroll so it doesn't
  affect first paint.
- Images are WebP with PNG fallback, explicit `width`/`height` to avoid layout shift.

---

## Still outstanding

1. **Calendly availability vs. the target market.** Availability is weekdays 09:00–17:00
   Bangladesh time (UTC+6). Against the US/UK audience the site targets, that is
   23:00–07:00 US Eastern — no bookable overlap at all — and only a 3-hour window for the UK.
   Adding an evening block (19:00–22:00 Dhaka = 09:00–12:00 US Eastern) would open the entire
   US East Coast. Until this is settled, `contact.html` carries a `TODO` where the
   availability sentence goes, and **no timezone-overlap claim appears anywhere on the site**.
2. **Pricing** — currently "quoted after the discovery call". Swap in real figures if wanted.
3. **Testimonials** — none exist yet, and none were invented. The proof section uses the real
   LinkedIn endorsement counts and the Xero credential. Replace when real quotes arrive.
4. **Xero credential URL** — the About page can link "View credential" once the verification
   link is available.
5. **MBA dates** — LinkedIn shows 2003–2010, an unusually long span. Worth confirming before
   this is quoted anywhere.
