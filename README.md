# Silsilah App — Keluarga Besar Mbah Kaslan

Interactive family tree web app for tracing and managing the Mbah Kaslan extended family. Includes a tree visualization, person search, and a data revision workflow.

## Tech stack

| Tech | Role |
|------|------|
| Vue 3 (Composition API) | UI framework with reactive components |
| Pinia | State management across auth, people, and families stores |
| Vue Router | Lazy-loaded routes with navigation guards |
| Firebase Auth | Email/password sign-in |
| Cloud Firestore | Denormalized data model with persistent local cache and multi-tab sync |
| Vue Flow | Interactive tree graph with custom node types |
| Tailwind CSS | Utility-first styling |
| Fuse.js | Fuzzy person search across the tree |
| Vite | Development server and production bundling |
| GitHub Actions → Firebase Hosting | PR preview channels and auto-deploy on push to master |

## Architecture

**Auth** — Admin route access is controlled by a Vue Router `beforeEach` guard that checks the auth store. Since there is a single administrator, the store treats any logged-in user as admin — no external role configuration is needed. Unauthenticated users accessing admin routes are redirected to a login page; non-admin users are redirected home.

**Tree layout** — The family tree visualization uses a custom Reingold-Tilford-style layout computed client-side. Generations are assigned by BFS from the root person, then subtrees are recursively positioned to center parents over their children while respecting spouse grouping and vertical generation spacing. Nodes are rendered as custom Vue components (`PersonNode`) with gender-coded styling, root highlighting, and an emerald ring animation for search results.

**Data model** — People and families live in separate Firestore collections. Each family document references a husband, wife, and children by person ID. Ancestor traversal (used for the highlighted lineage path in the map view) walks parent references upward from any person to the root, computed as a derived data structure from the family relationships. The model is intentionally denormalized for read efficiency — most views need only a few queries to render a complete tree.

**Offline & UX** — Firestore's persistent cache with multi-tab support keeps the app functional after reload and across browser tabs. Route transitions use an animated slide-fade effect, destructive actions require confirmation dialogs, and a full-screen loading spinner is shown while Firebase Auth initializes. The viewport is locked to prevent mobile browser chrome expansion during scroll.

**Revision workflow** — Data changes submitted through the app are stored as pending revisions in a dedicated Firestore collection. Each revision records the submitter, the affected person or family, the old and new values, and a status (pending / approved / rejected). An admin reviews revisions through a dedicated interface and approves or rejects them before they are applied to the main collections.

## Features

- **Tree map** — Interactive pan-and-zoom tree with spouse and parent-child edges, minimap, and fit-to-view controls
- **Search** — Fuzzy search across all people with keyboard-navigable results; selecting a person highlights their lineage path to the root
- **Simple mode** — A picker-based interface for viewing the tree without the graph visualization
- **Person detail** — Profile page showing name, dates, birth place, photo, and family connections
- **Admin dashboard** — CRUD for people and families, revision approval queue

## Quick start

```bash
npm install
npm run dev        # → http://localhost:5173
npm run build      # → dist/
npm run preview    # preview production build
```

Requires a `.env` file with `VITE_FIREBASE_*` variables — see `.env.example`.

## Project structure

| Path | Purpose |
|------|---------|
| `src/main.js` | App entry — mounts Vue with Pinia + Router |
| `src/router/` | Lazy-loaded routes with admin guard |
| `src/stores/` | Pinia stores: auth, people, families |
| `src/services/` | Firebase initialization and Firestore CRUD |
| `src/views/` | Route components |
| `src/components/` | Reusable UI (TreeMap, PersonNode, FamilyManager, ConfirmDialog, etc.) |

## Deployment

Push to `master` → auto-deploys to [mbah-kaslan.web.app](https://mbah-kaslan.web.app) via GitHub Actions. Pull requests get a Firebase Hosting preview channel.
