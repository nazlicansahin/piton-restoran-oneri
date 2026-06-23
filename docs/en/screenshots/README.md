# Annotated screenshots

PDF **§4 README — Screenshots**: **annotated** images of the application’s main screens.

---

## 1. Home — light theme

![Home — light theme](./home-light.png)

| Area | Description |
|------|-------------|
| **Top bar** | Logo, Favorites / Groups links, theme and language (TR/EN) toggles, sign-in |
| **Left — Preferences** | Cuisine selection, max distance slider, save (requires sign-in) |
| **Left — Best Picks** | Top 10 venues by recommendation score; **Match: N%** badge |
| **Left — Other Nearby** | Distance-sorted list excluding Best Picks; pagination (10/page) |
| **Right — Map** | OpenStreetMap; user/search center marker; venue pins |
| **Bottom right — Chat** | AI assistant panel (with OpenAI key) |

**Test scenario:** Grant location → venues appear → change cuisine filter → Best Picks reorder.

---

## 2. Home — dark theme, English

![Home — dark theme, English](./home-dark-en.png)

| Area | Description |
|------|-------------|
| **Theme** | Dark mode via `next-themes` |
| **Language** | EN toggle; UI strings from English dictionary |
| **Best Picks** | Same as TR “Senin İçin En Uygun Mekanlar”; score as **Match: N%** |

**Bonus coverage:** PDF §3 — dark/light theme + i18n.

---

## 3. Sign-in screen

![Sign-in screen](./login-dark-en.png)

| Area | Description |
|------|-------------|
| **Sign in with Google** | Firebase OAuth popup |
| **Email / password** | Firebase Email/Password |
| **Register link** | `/register` — new account |

After sign-in, preferences persist to Postgres; favorites are tied to the user.

---

## Optional additional captures

| Screen | Suggestion |
|--------|------------|
| Favorites by city | `favorites-by-city.png` |
| Group detail | `group-detail.png` |
| Preferences close-up | `preferences-closeup.png` |

When adding images, update this file and the root [README.md](../../README.md) section.

Türkçe: [docs/tr/screenshots/README.md](../../tr/screenshots/README.md)
