# CLAUDE.md — efrei-projet-fil-rouge-cicd-frontend

Poker web app — React 17 + TypeScript frontend, served via nginx in Docker, deployed to Azure VM via Jenkins CI/CD.

## Stack

- React 17 + TypeScript 4
- react-router-dom v6
- CSS modules (per-component CSS files in `src/styles/`)
- Tailwind installed but largely unused — prefer existing CSS pattern
- Dockerfile: multi-stage (node builder → nginx runtime)
- CI: `Jenkinsfile` → build Docker image → push to `registry.spokayhub.top` → deploy via SSH to Azure VM
- Tests: `@testing-library/react` + jest, run with `react-scripts test`

## Structure

```
src/
  components/   # Shared UI: App, Login, Register, Nav, UserCard
  pages/        # Route-level: Home, Profile, Tables, Game, EndGame
  services/     # api.ts — API_BASE_URL + fetchData helper
  types/        # index.ts — shared interfaces (use this, don't redeclare)
  utils/        # helpers.ts — formatDate, calculateSum
  styles/       # One CSS file per component
  tests/unitaire/
```

## API

`API_BASE_URL` is defined in `src/services/api.ts` from `process.env.REACT_APP_API_BASE_URL`.
**Always import and use `API_BASE_URL`** for all fetch calls — never hardcode `localhost:3000`.

## Known Bad Practices (to fix)

### Critical
- `Login.tsx`, `Game.tsx`, `Tables.tsx` hardcode `http://localhost:3000` — must use `API_BASE_URL`
- `BACKEND_URL` in `.env` is wrong name — CRA requires `REACT_APP_` prefix → should be `REACT_APP_API_BASE_URL`
- `login.test.tsx` assertion URL mismatch with actual component URL

### Code Quality
- `console.log` left in `Login.tsx:30` and `Profile.tsx:39`
- `alert()` used in Nav, Tables, Game, Register — replace with state-based UI feedback
- `window.location.href` in `Nav.tsx` — use `useNavigate` instead
- Large commented-out dead code blocks in `Game.tsx` (lines 43-74) and `Profile.tsx` (lines 41-48)
- `isMounted` pattern in `handleStartGame` / `handleAction` is broken — the cleanup returned from a regular async function is never called; only valid inside `useEffect`

### Types
- `Table` interface duplicated in `Game.tsx` and `Tables.tsx` — move to `src/types/index.ts`
- `User` interface declared separately in `UserCard.tsx`, `Profile.tsx`, and `types/index.ts` with conflicting shapes — unify in `types/index.ts`
- `any` overused: `river: any[]`, `players: any[]`, `gameLog: any[]`, `actionData: any`, `catch (err: any)` — type properly

### Dependencies
- `cors` in `dependencies` — backend-only package, remove
- `axios ^0.21.1` — very outdated (security issues), update or remove (fetch is used everywhere anyway)
- `react-scripts 4.0.3` — outdated, requires `--openssl-legacy-provider` workaround
- `@types/react-router-dom ^5.3.3` — wrong version for react-router-dom v6

### Security
- JWT token stored in `localStorage` — XSS-vulnerable; ideally use HttpOnly cookies
- No protected routes — `/profile`, `/tables`, `/game/:id` accessible without auth check

## Commands

```bash
npm start        # dev server (port 3000)
npm run build    # production build
npm test         # run tests
```

## Env

Copy `.env.example` (to create) → `.env` locally. Required:
```
REACT_APP_API_BASE_URL=http://localhost:3000
```
`.env` is gitignored. Injected at build time by Jenkins via `fil-rouge-cicd-frontend-env` credential.
