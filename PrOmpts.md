# Prompts.md — How I Used AI as a Strict Mentor (CineStream Project)

## My Approach

While building **CineStream** — a Netflix-style movie discovery SPA (React + Vite, TMDB API, Groq AI Mood Matcher) — I made a deliberate choice about how to use AI:

> **I did not let AI write my code for me, and I did not copy-paste any solutions directly.**

Instead, I used AI the way I'd use a **strict mentor or senior engineer** during a real internship:

1. AI only explains **key concepts, core logic, and the "why" behind a technique** — never full working code.
2. I write the implementation **myself**, based on that explanation.
3. I bring my own code back to AI for **review** — AI checks correctness, points out bugs or bad patterns, and explains *why* something is wrong.
4. AI does not rewrite my broken code — it explains the concept behind the bug, and I fix it myself.
5. When I hit real errors (build failures, console errors, API issues), AI helped me **understand the error conceptually** first, before jumping to the exact fix — so I understood *why* it happened, not just *what* to type.

This mirrors how a strict mentor would operate: guide the thinking, check the output, but never do the work for you.

---

## Example Prompts I Used

### 1. Setting the ground rules upfront
> "This is my project [Cine-Stream Media Explorer sprint spec]. I want you to be my mentor — help me complete this project by telling me the key and core concepts, explain what this project is actually about, and suggest YouTube resources. Don't give me code."

### 2. Asking for concepts before implementation
> "I want to add infinite scroll instead of pagination. Don't give me the code — just explain the concept of IntersectionObserver and why it's better than manual 'Load More' buttons here."

### 3. Asking for the reasoning behind a pattern, not the pattern itself
> "Explain input debouncing — why can't I just call the API on every keystroke in my search bar? What's the actual problem it solves?"

### 4. Asking AI to suggest learning resources instead of writing code
> "Can you suggest some YouTube videos to understand this properly — like from CodeWithHarry or Apna College — instead of just giving me the implementation?"

### 5. Submitting my own code for a check, not a rewrite
> "Here's the favorites toggle logic I wrote myself using useState and localStorage. Check if it's correct — don't rewrite it, just tell me what's wrong."

### 6. Understanding a real build error conceptually first
> "My Vercel build failed with `[UNRESOLVED_IMPORT] Could not resolve './Favorites'`. Before telling me the exact fix, explain what kind of mistake conceptually causes this in a React + Vite project."

### 7. Understanding deployment/runtime errors instead of being handed a patch
> "My deployed site shows a 401 error from the TMDB API and a 'cannot read properties of undefined (reading filter)' error in the console. Explain conceptually why an API that works locally could fail only after deployment."

### 8. Asking for the "why" behind an AI-integration design decision
> "For the Mood Matcher feature, why should I not trust the LLM to return poster/rating data directly, and instead only use it to generate a movie title that I then look up on TMDB myself?"

---

## Real Hardships I Faced (and used AI to understand, not skip)

- **Reused an old Groq API key**: I initially tried using a Groq key left over from a previous AI cover-letter project. It didn't behave as expected in this context, which pushed me to understand that API keys are tied to usage/scope and shouldn't just be recycled across unrelated projects without checking.
- **TMDB and Groq APIs not fetching in production**: Both worked locally but failed after deployment. I had to understand the concept of environment variables and how `.env` files are gitignored by default — Vercel never received my keys because they were never pushed. This wasn't a code bug; it was a **configuration/environment mismatch**.
- **`UNRESOLVED_IMPORT` build failure on Vercel**: My import said `./Favorites` (capital F) but the actual committed file was `favorites.jsx` (lowercase). Locally it worked because Windows filesystems are case-insensitive; Vercel's Linux build environment is case-sensitive. I had to learn *why* something can work on my machine and break in production before applying the fix (`git mv` to correct the casing).
- **Console runtime errors post-deploy**: `Failed to load resource ... status 401` and `Cannot read properties of undefined (reading 'filter')` — these were connected: once the TMDB request failed with a 401 (unauthorized), my own code tried to `.filter()` on `undefined` data. Understanding this chain (bad API response → broken assumption in my own code) mattered more than just patching the crash.
- **Vercel dashboard confusion**: I initially tried adding environment variables in the wrong place (the Team-level "Shared" settings page instead of the actual Project settings), which taught me the difference between account-wide and project-scoped configuration on deployment platforms.
- **Repo mishap**: At one point I deleted my entire GitHub repo by mistake and had to re-initialize git, create a fresh repo via GitHub CLI, and push everything again — which also forced me to properly understand `git remote`, `git push -u`, and how local vs. remote history connect.

---

## Design Reference & Learning Resources

- Used **Netflix's UI** as the visual and UX reference point for the movie grid, hero section, and overall dark theme.
- Used **CodeWithHarry** and **Apna College** YouTube channels (suggested during my mentor-style prompting) to understand React fundamentals, hooks, and API integration patterns before implementing them myself.
- Used Claude to point me toward relevant YouTube content and official docs (TMDB API docs, MDN for IntersectionObserver) rather than supplying finished code.

---

## Why I Followed This Method

- To genuinely **understand** every concept (state, hooks, debouncing, deployment, environment variables) instead of shipping code I couldn't explain.
- To build real **debugging skills** — reading build logs, console errors, and reasoning about root causes instead of pattern-matching to a fix.
- To be fully able to **explain and defend my own project** in interviews or reviews, since every line was written and understood by me.

---

## Key Concepts I Learned This Way (concepts only, never handed as code)

- `useState` and `useEffect` for state management and side effects
- Custom hooks (`useDebounce`) and why debouncing prevents API spam
- `IntersectionObserver` for infinite scroll instead of manual pagination
- `localStorage` persistence patterns for favorites
- Environment variables in Vite (`import.meta.env`) and why `.env` files aren't committed to git
- Case sensitivity differences between Windows (local dev) and Linux (Vercel production)
- Reading and interpreting build logs (Rolldown/Vite errors) and browser console errors
- API chaining design: using an LLM only for the parts it's good at (natural language), and a trusted source (TMDB) for factual data
- The difference between project-level and team-level configuration on deployment platforms like Vercel
- Git fundamentals: `git init`, `git remote`, `git push -u`, and recovering from a deleted repo
