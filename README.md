# Silsilah App — Keluarga Besar Mbah Kaslan

Family tree web app for tracing and managing the Mbah Kaslan extended family.

Built with **Vue 3 + Vite**, **Firebase** (Auth + Firestore + Hosting), **Tailwind CSS**, **Vue Flow**, and **Fuse.js**.

## Quick start

```bash
npm install
npm run dev        # → http://localhost:5173
npm run build      # → dist/
npm run preview    # preview production build
```

Requires a `.env` with `VITE_FIREBASE_*` vars.

## Structure

| Path | Purpose |
|------|---------|
| `src/main.js` | App entry — mounts Vue with Pinia + Router |
| `src/router/` | Lazy-loaded routes |
| `src/stores/` | Pinia stores: auth, people, families |
| `src/services/` | Firebase Firestore CRUD |
| `src/views/` | Route components |
| `src/components/` | Reusable UI (PersonForm, FamilyManager, TreeMap, etc.) |

## Data model

- **people**: `name`, `gender`, `birthYear`, `deathYear`, `birthPlace`, `photoUrl`, `isRoot`
- **families**: `husbandId`, `wifeId`, `childIds[]`
- **settings/app**: `adminUids[]`

Public read; admin-only write.

## Deployment

Push to `master` → auto-deploys to [mbah-kaslan.web.app](https://mbah-kaslan.web.app) via GitHub Actions. PRs get a preview channel.
