# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.


# CineStream — Development Journal & AI-Assisted Learning Log

This document records how CineStream was built, the real debugging problems encountered along the way, and the resources used during development. It's kept alongside the code as part of the engineering residency's practice of documenting process, not just output.

---

## Project Summary

CineStream is a Netflix-style movie discovery Single Page Application built with React and Vite, consuming the TMDB (The Movie Database) API. The sprint was scoped in three phases:

- **Phase 1 (P0):** TMDB API integration, a Popular Movies grid, and search
- **Phase 2 (P1):** Infinite scroll, debounced search, and a localStorage-backed Favorites system
- **Phase 3 (P2):** Lazy-loaded images and an AI-powered "Mood Matcher" that recommends movies based on a described mood

All three phases were completed, along with a full visual redesign (dark theme, gradient branding, hero section, skeleton loaders, responsive layout) that went beyond the original scope.

---

## Features

**Discovery & Search**
- Live Popular Movies grid from TMDB
- Debounced search (500ms) plus an explicit Search button
- Poster, title, release year, and star-rating display, with a placeholder fallback for movies missing a poster

**Performance**
- Infinite scroll using the native `IntersectionObserver` API — no pagination buttons
- Duplicate-entry filtering across paginated fetches
- Native `loading="lazy"` on all poster images
- Skeleton loading cards instead of a plain "Loading..." message

**Personalization**
- Favorites stored in `localStorage`, surviving page refresh
- A dedicated `/favorites` route (React Router) with a designed empty state
- Live favorites count shown in the nav

**AI Integration**
- A "Mood Matcher" input that sends a free-text mood description to an LLM (Groq), which returns a single movie title
- That title is fed into a TMDB search, so the final displayed data (poster, rating) always comes from TMDB rather than being invented by the model

**Design**
- Custom dark theme with a consistent blue-to-purple gradient identity (chosen deliberately over Netflix's red, so the project reads as an original design rather than a direct clone)
- Hero section highlighting one featured movie
- Fully responsive layout for mobile and desktop

---

## Design Reference

Netflix's own site (netflix.com/in) was used as a **structural reference only** — specifically the layout idea of a hero banner above a "Trending Now" row and clearly labeled sections. The actual visual identity (color palette, gradient branding, typography, wording) was deliberately built to be distinct from Netflix's own red/black branding, to avoid the project reading as a direct clone rather than an original build.

---

## Learning Resources Used

- **CodeWithHarry** (YouTube) — used as a primary reference for React fundamentals and API-consumption patterns throughout the residency.
- **Apna College** (YouTube) — used for supplementary explanations on JavaScript async patterns (`fetch`, `.then()`, `async`/`await`) and React hooks.
- **Claude AI** — used as a step-by-step mentor throughout the build: explaining concepts before implementation, reviewing pasted code, and pointing to specific lines to edit rather than providing full solutions, in line with a "understand before you copy" approach to using AI in learning.

---

## Real Problems Encountered (and How They Were Solved)

This project surfaced a number of real debugging situations, several of which mirror problems encountered in professional development environments:

### 1. TMDB domain blocked at the network/DNS level
Early in the project, `themoviedb.org` failed to load entirely, despite other sites working fine. Investigation pointed to intermittent ISP/DNS-level blocking of TMDB in India. This was resolved by switching the network adapter's DNS servers to `1.1.1.1` / `8.8.8.8`, after which the TMDB signup and dashboard loaded normally. No VPN was ultimately needed.

### 2. `.env` variable read as `undefined`
The TMDB API key came back as `undefined` in the browser console, causing a `401 Unauthorized` response. Two separate mistakes were responsible:
- The `.env` file had originally been created inside `src/`, but Vite only reads `.env` files from the **project root**.
- The file also contained a stray space between the `=` and the key value (`VITE_TMDB_API_KEY=  abc123` instead of `VITE_TMDB_API_KEY=abc123`), which broke parsing.

### 3. React 18 duplicate-key console warnings
After implementing infinite scroll, the console showed repeated "Encountered two children with the same key" warnings. This was traced to React 18's development-mode behavior of intentionally double-invoking `useEffect` on mount (Strict Mode), which caused the same page of movies to be appended to state twice. Fixed by filtering incoming results against already-loaded movie IDs before appending, rather than relying on `useEffect` firing exactly once.

### 4. Groq API key expired mid-project
The Mood Matcher feature initially reused an existing Groq API key from a previous project (an AI Cover Letter Generator built earlier in the residency), rather than generating a new one. That key had since expired, which produced a `401` error and a follow-on `TypeError: Cannot read properties of undefined (reading '0')` when the code tried to read a successful response shape from what was actually an error object. Diagnosed by testing the key directly via `curl`, which returned an explicit `"code":"expired_api_key"` message. Resolved by generating a fresh Groq API key and updating `.env`.

### 5. Groq model deprecation
While debugging the above, it also came to light that the specific model originally used (`llama-3.1-8b-instant`) had been deprecated by Groq in mid-2026. The Mood Matcher was rebuilt against Groq's currently recommended replacement model instead of the deprecated one.

### 6. Deployment failure on Vercel — case sensitivity
The project ran without issue locally on Windows but failed to build on Vercel with `[UNRESOLVED_IMPORT] Could not resolve './Favorites' in src/App.jsx`. The root cause: the actual file on disk was named `favorites.jsx` (lowercase), while the import statement referenced `./Favorites` (capital F). Windows' filesystem is case-insensitive, so the mismatch never surfaced locally — but Vercel's Linux-based build environment is case-sensitive, so the import genuinely failed to resolve. Fixed by renaming the file to match the import's capitalization exactly.

### 7. CSS specificity bugs during the visual redesign
Two separate CSS conflicts came up while restyling the app:
- A merged CSS rule accidentally set `display: grid` and `display: block` on the same selector; since CSS resolves duplicate properties by using whichever is declared last, the grid layout silently collapsed to a single column until the rules were split apart.
- A duplicate `nav a` rule (one light-colored, left over from an early draft; one white, added later) coexisted in the stylesheet. The correct one happened to win by cascade order, but the dead rule was later removed for clarity.

---

## Tech Stack

| Layer | Technology |
|---|---|
| UI | React 18, Vite |
| Routing | React Router v6 |
| Styling | Custom CSS (CSS custom properties, Grid, Flexbox, media queries) |
| Icons | Lucide React |
| Data | TMDB API |
| AI | Groq API |
| Version Control | Git, GitHub CLI |
| Deployment | Vercel |

--
