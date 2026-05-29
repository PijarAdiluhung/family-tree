# Family Tree — AGENTS.md

## Dev commands

| Command | Purpose |
|---------|---------|
| `npm run dev` | Vite dev server |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Preview production build |

No lint, typecheck, or test commands exist. CI uses `npm ci && npm run build`.

## Stack

Vue 3 + Vite, Pinia, Vue Router, Tailwind CSS, Firebase (Auth + Firestore + Hosting), Vue Flow, Fuse.js.

## Architecture

- Entry: `src/main.js` — mounts Vue app with Pinia + Router
- Routes: lazy-loaded views in `src/views/`
- State: Pinia stores in `src/stores/` — `auth`, `people`, `families`
- Firebase services: `src/services/firebase.js` (init), `src/services/people.js`, `src/services/families.js`
- Path alias `@/` maps to `/src` (configured in `vite.config.js`)

## Firestore data model

- `people/{id}`: `name`, `gender` (male|female), `birthYear`, `deathYear`, `birthPlace`, `photoUrl`, `isRoot` (boolean)
- `families/{id}`: `husbandId`, `wifeId`, `childIds` (array of person IDs)
- `settings/app`: `adminUids` (array of Firebase UIDs)

## Auth

- Email/password via Firebase Auth
- Admin access: user UID must be in `settings/app.adminUids`
- Admin routes (`/admin*`) guarded by `router.beforeEach` — redirects to `/login` if not logged in, `/` if not admin
- Firestore rules: public read, admin-only write

## Firebase Hosting

- SPA rewrites: all paths → `/index.html`
- Production: `https://mbah-kaslan.web.app`
- Deployed via GitHub Actions:
  - PR → preview channel
  - Push to `master` → live channel
  - Build requires all `VITE_FIREBASE_*` env vars as CI secrets

## Gotchas

- `.firebaserc` is gitignored — local Firebase project config not tracked
- Firestore uses persistent local cache with multi-tab support (`src/services/firebase.js:15-17`)
- `dagre` in `package.json` is unused (no import in any source file)
- No test framework or lint/typecheck setup exists
