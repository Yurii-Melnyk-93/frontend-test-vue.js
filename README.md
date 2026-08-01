# Project and Task Management (SPA)

🔗 **Live version:** https://frontend-test-vue-js.vercel.app/

An SPA for managing projects and the tasks inside them.
Vue 3 (Composition API) + TypeScript + Pinia + Axios + SCSS. Works entirely
without a backend — all data flows through a genuine Axios layer with a mock
adapter that reads/writes `localStorage`.

## 🚀 Running locally

```bash
npm install
npm run dev
```

Then open the address printed by Vite (by default http://127.0.0.1:5173/).

Other commands:

```bash
npm run build        # production build (runs vue-tsc --noEmit first for type checking)
npm run preview      # preview the production build locally
npm run type-check   # type checking only
```

Requires Node.js 20+.

## 🧱 Tech stack

| Category    | Technology                          |
| ----------- | ----------------------------------- |
| Framework   | Vue 3 (Composition API, `<script setup>`) |
| Language    | TypeScript (strict, **no `any`**)   |
| State       | Pinia                               |
| HTTP        | Axios (with a custom mock adapter)  |
| Styles      | SCSS + CSS variables (theme tokens) |
| DnD         | vuedraggable (SortableJS)           |
| Validation  | vee-validate + zod                  |
| Routing     | Vue Router                          |
| Chart       | chart.js + vue-chartjs (bonus)      |
| Data        | `localStorage` + mock adapter       |

## 📁 Project structure

```
src/
├── api/                 # HTTP request layer
│   ├── http.ts          # Axios instance + error normalization into ApiError
│   ├── mockAdapter.ts   # Intercepts requests → localStorage (backend simulation)
│   ├── storage.ts       # Typed localStorage wrapper + seed data
│   ├── projects.api.ts  # Generically-typed project endpoints
│   └── tasks.api.ts     # Generically-typed task endpoints
├── stores/              # Pinia modules
│   ├── projects.ts
│   └── tasks.ts
├── composables/         # Custom hooks (all non-trivial logic lives here)
│   ├── useTableSort.ts      # Generic table sorting
│   ├── useColumnResize.ts   # Column width resizing
│   ├── useTaskDrag.ts       # DnD: kanban + table
│   ├── useToast.ts          # Toast notifications
│   └── useLocalStorage.ts   # Reactive ref ↔ localStorage
├── types/               # All data models in one place
│   ├── enums.ts         # ProjectStatus, TaskStatus + labels
│   ├── project.ts       # Project, DTO
│   ├── task.ts          # Task, DTO
│   └── api.ts           # ApiError, SortState
├── validation/
│   └── schemas.ts       # zod form schemas
├── components/
│   ├── common/          # BaseModal, BaseButton, FormField, StatusBadge, ToastContainer
│   ├── projects/        # ProjectTable, ProjectFilters, ProjectFormModal, TasksStatusChart
│   └── tasks/           # TaskTable, TaskKanban, KanbanColumn, TaskCard, TaskFilters, TaskFormModal
├── views/
│   ├── ProjectsView.vue # Home page: projects table
│   └── ProjectView.vue  # Project page: table / kanban
├── router/
├── constants/           # Team directory (assignees)
└── styles/              # Global tokens + mixins
```

## 🏗 Architecture decisions

**Layered architecture (view → store → api → storage).** Each layer has a
single responsibility and doesn't leak into its neighbor:

- **API layer** (`src/api`) — the single place that talks to Axios. Endpoints
  are generically typed (`http.get<Project[]>(...)`), and all error handling
  is concentrated here: a normalized `ApiError` is always what flows outward,
  so components and stores don't depend on Axios's internal error structure.
- **Pinia stores** — separate modules for projects and tasks. The tasks store
  is the **single source of truth** for both modes (table and kanban), so a
  status change in one place is instantly reflected in the other. The
  project's task count is computed in the tasks store (reactively), avoiding
  data duplication.
- **Composables** — all non-trivial logic is extracted from components into
  reusable hooks: sorting (`useTableSort` — generic), column resizing
  (`useColumnResize`), drag-and-drop (`useTaskDrag`), notifications
  (`useToast`), persistence (`useLocalStorage`). This keeps components "thin",
  with no God components.
- **Components by responsibility** — `common/` (reusable primitives),
  `projects/` and `tasks/` (domain-specific). Tables, kanban, forms, and cards
  are separate components; none of them holds all the page's logic.

**Typing.** `strict: true`, `noImplicitAny`, `Project`/`Task` interfaces and
DTOs in `src/types`, `enum` for statuses, generics in the API layer and in
`useTableSort`. **`any` is not used anywhere** — no justification needed.

## 🔌 How the mock adapter works (instead of a backend)

There is no real backend, but Axios is used for real. In `src/api/http.ts` a
custom **adapter** (`src/api/mockAdapter.ts`) is plugged into the Axios
instance:

1. A component/store calls, e.g., `http.get<Project[]>('/projects')`.
2. The request doesn't reach the network — it reaches `mockAdapter`, which:
   - seeds `localStorage` with demo data on first run (`storage.ensureSeeded`);
   - **simulates a 150–300ms network delay**;
   - parses the method and path (`/projects`, `/projects/:id`,
     `/tasks?projectId=…`), reads/writes `localStorage`, and returns the
     response in `AxiosResponse` format;
   - on error cases (e.g., a non-existent id) throws an `ApiError` with a 404
     status.
3. The store receives a normal typed response — the application code doesn't
   know the backend is "fake".

Thanks to this, switching to a real server comes down to removing the
`adapter` field in `http.ts` — the rest of the code stays unchanged.

Implemented endpoints (mock): `GET/POST /projects`, `PUT/DELETE /projects/:id`,
`GET /tasks?projectId=`, `POST /tasks`, `PUT/DELETE /tasks/:id`.

## ✨ Features

**Home page**

- Projects table: ID, name, reactive task count, status, creation date.
- Sorting by any column, text search by name + status filter.
- Column width resizing by dragging.
- "Add Project" modal with validation (name 2–100), adding without a reload.
- Clicking a row → project page.

**Project page**

- **Table / Kanban** switch; the chosen mode is persisted in `localStorage`.
- Both modes work with the same store data and stay in sync in real time.
- Table: sorting by due date and status, filters by assignee and status,
  DnD row reordering, column width resizing.
- Kanban: three status columns; dragging within a column changes the order,
  between columns — the status and position. Changes are immediately visible
  in the table, and vice versa.
- Task create/edit form with validation (vee-validate + zod), errors shown
  under fields on `blur` and on submit.

**Bonus**

- Toast notifications for actions.
- Task distribution by status chart on the home page.
- Persisted sorting and filter settings across reloads.
- Mode switching and card drag animations.

## ☁️ Deployment

The project is a static SPA, so any static hosting works.

- **Vercel** — the repository is imported as is; build `npm run build`,
  output directory `dist`. SPA routing is configured in `vercel.json`.
- **Netlify** — build `npm run build`, publish `dist`; SPA redirects in
  `public/_redirects`.
- **GitHub Pages** — run `npm run build` and publish the `dist` directory. If
  the site is served from a subpath (`/repo/`), set `base: '/repo/'` in
  `vite.config.ts`.
