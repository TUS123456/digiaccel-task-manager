# Codebase Architecture & File Behavior Guide

This document explains how every directory and file in **`digiaccel-task-manager`** behaves, how the frontend and backend communicate, and how the **MVC + Repository** architecture handles data persistence across local development and **Vercel** serverless deployment.

---

## 1. High-Level Request & Data Flow

```text
┌─────────────────────────────────────────────────────────────────────────┐
│                          FRONTEND (React + Vite)                        │
│  App.tsx (Screen State & Optimistic UI)                                 │
│   ├── OnboardingScreen.tsx  ──► "Get Started" ──► HomeScreen.tsx        │
│   ├── HomeScreen.tsx        ──► Day Strip / Summary Cards / Progress    │
│   ├── TaskModal.tsx         ──► Create / Edit Task (Bottom Sheet)       │
│   ├── SearchScreen.tsx      ──► Live Keyword Search                     │
│   └── WeeklyOverviewModal.tsx ► Expandable Monday–Sunday Week Cards     │
│                                                                         │
│  src/api.ts  ──► fetch("/api/*")                                        │
└───────────────────────────────────┬─────────────────────────────────────┘
                                    │
          ┌─────────────────────────┴─────────────────────────┐
          ▼ (Local Dev)                                       ▼ (Vercel Prod)
   Vite /api Proxy                                    vercel.json Rewrites
   http://localhost:5000                              /api/* ──► api/index.ts
          │                                                   │
          └─────────────────────────┬─────────────────────────┘
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    BACKEND (Express MVC + Repository)                   │
│                                                                         │
│  backend/src/app.ts  ──► CORS, express.json(), connectDB(), /api/health │
│   └── routes/taskRoutes.ts ──► Maps HTTP verbs to Controller functions  │
│        └── controllers/taskController.ts ──► Validates input & calls    │
│             └── repositories/index.ts (getTaskRepository)               │
│                  │                                                      │
│                  ├── [db_used=true & connected]                         │
│                  │      ──► dbTaskRepository.ts ──► models/Task.ts      │
│                  │                                  (MongoDB Atlas)     │
│                  │                                                      │
│                  └── [db_used=false OR DB unreachable fallback]         │
│                         ──► fileTaskRepository.ts ──► data/tasks.json   │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Root & Deployment Layer

| File / Folder | How It Behaves |
| :--- | :--- |
| **`package.json`** | Root orchestrator. Uses `concurrently` so a single `npm run dev` command launches both the Express backend and Vite frontend together in one terminal. |
| **`.env` / `.env.example`** | Holds runtime flags (`db_used`, `MONGODB_URI`, `PORT`, `NODE_ENV`). Loaded at startup via `dotenv.config()`. |
| **`vercel.json`** | Configures Vercel edge routing: `/api/(.*)` rewrites to `/api` (serverless Express handler), and all other routes `/(.*)` fall back to `/index.html` for React SPA navigation. |
| **`api/index.ts`** | Vercel Serverless Function entry point. Imports the configured Express `app` from `backend/src/app.ts` and exports it as the default handler—no `.listen()` call needed on Vercel. |

---

## 3. Frontend Architecture (`frontend/`)

### Entry & Configuration
| File | Behavior & Responsibility |
| :--- | :--- |
| **`frontend/index.html`** | HTML shell mounting `<div id="root">` and loading `/src/main.tsx`. |
| **`frontend/src/main.tsx`** | Bootstraps React 19 (`createRoot`) and imports global Tailwind CSS (`index.css`). |
| **`frontend/src/index.css`** | Imports Tailwind CSS v4 (`@import "tailwindcss";`) for utility-first styling. |
| **`frontend/vite.config.ts`** | Configures Vite + React + Tailwind plugins and proxies `/api` requests to `http://localhost:5000` during local development so frontend and backend avoid CORS issues. |

### Core Application Logic
| File | Behavior & Responsibility |
| :--- | :--- |
| **`frontend/src/types.ts`** | Defines shared TypeScript interfaces: `Task`, `Priority` (`Low \| Medium \| High`), `TaskStatus` (`In Progress \| Completed`), `WeekSummary`, and `TaskStats`. |
| **`frontend/src/api.ts`** | Typed REST client wrapping `fetch('/api/...')` for `fetchTasks`, `createTask`, `updateTask`, `toggleTaskStatus`, `deleteTask`, `fetchWeeklySummaries`, and `fetchStats`. Parses server JSON errors and throws descriptive messages to the UI. |
| **`frontend/src/utils/dateUtils.ts`** | Enforces **Monday–Sunday** calendar math (`getMondayOfWeek`, `getSundayOfWeek`, `getDaysOfWeek`), formats ISO keys (`YYYY-MM-DD`), and renders display strings like `"Friday 14, January"`. |
| **`frontend/src/App.tsx`** | Central state container: tracks active screen (`'onboarding' \| 'home' \| 'search'`), `selectedDate`, `tasks`, `weeks`, `stats`, and modal states. Performs **optimistic UI updates** on toggle/delete before refreshing truth from `/api`. |

### UI Components (`frontend/src/components/`)
| Component | Behavior & Responsibility |
| :--- | :--- |
| **`OnboardingScreen.tsx`** | Initial screen (*"Manage What To Do"*). Renders the royal blue graphic header and *"Get Started"* CTA that transitions `App.tsx` to the `'home'` screen. |
| **`HomeScreen.tsx`** | Main dashboard: renders the search trigger bar, 7-day Monday–Sunday calendar strip with prev/next week navigation, **Task Complete** & **Task Pending** summary cards, animated **Weekly Progress** bar, flat task list with **swipe-left-to-delete** (`motion.div`), and the floating `+` button. |
| **`TaskModal.tsx`** | Bottom-sheet modal used for both **Create Task** and **Edit Task**. Pre-populates fields when editing, validates mandatory `title` and `date`, allows selecting `Start`/`Ends` time and `Priority`, and submits to `onSave`. |
| **`SearchScreen.tsx`** | Full-screen keyword filter view. Searches task titles and descriptions in real time and lets users toggle completion, edit, or delete directly from search results. |
| **`WeeklyOverviewModal.tsx`** | Displays expandable **Monday–Sunday** week summary cards showing `openTasks` vs `completedTasks`. Clicking any week expands its task list, and clicking *"Go to day"* jumps `HomeScreen` to that task's date. |

---

## 4. Backend Architecture (`backend/`) — MVC + Repository Pattern

The backend strictly separates **Server Bootstrapping**, **Configuration**, **Routing**, **Controller Logic**, **Data Models**, and **Storage Repositories**.

### Express Setup: `app.ts` vs `server.ts`
| File | Behavior & Responsibility |
| :--- | :--- |
| **`backend/src/app.ts`** | Initializes Express, attaches `cors()` and `express.json()`, calls `connectDB()`, defines `GET /api/health` (reporting current `storageMode`), and mounts `taskRoutes` at `/api`. **Does not call `app.listen()`** so it can be reused by both local Node and Vercel Serverless (`api/index.ts`). |
| **`backend/src/server.ts`** | Local entry point. Imports `app` from `app.ts` and starts the HTTP server on `process.env.PORT || 5000`. |

### Configuration & Models
| File | Behavior & Responsibility |
| :--- | :--- |
| **`backend/src/config/db.ts`** | Reads `db_used` (`process.env.db_used === 'true'`). Validates `MONGODB_URI` (`cleanMongoUri` strips accidental quotes, `isValidMongoUri` rejects placeholders). Connects to MongoDB with a 4-second timeout (`serverSelectionTimeoutMS: 4000`) and exposes `isDbConnected()`. If connection fails or URI is invalid, logs a warning and falls back gracefully without crashing. |
| **`backend/src/models/Task.ts`** | Defines the Mongoose `TaskSchema` (`title`, `description`, `date`, `startTime`, `endTime`, `priority`, `status`, timestamps). Sets **`bufferCommands: false`** so queries never hang for 10 seconds if MongoDB disconnects, and transforms `_id` → `id` in JSON output. |
| **`backend/src/utils/dateUtils.ts`** | Server-side Monday–Sunday week calculations (`getMondayOfWeek`, `getSundayOfWeek`, `formatWeekLabel`) used to group tasks into weekly cards and compute statistics. |

### Routes & Controllers
| File | Behavior & Responsibility |
| :--- | :--- |
| **`backend/src/routes/taskRoutes.ts`** | Maps REST endpoints (`/tasks`, `/tasks/:id`, `/tasks/:id/toggle`, `/weeks`, `/stats`, `/seed`) to controller handlers. |
| **`backend/src/controllers/taskController.ts`** | Handles HTTP request/response lifecycles: validates mandatory fields (`title`, `date` on `POST`), passes query filters (`date`, `search`, `weekStart`, `weekEnd`, `status`) to the repository, and returns proper HTTP codes (`200`, `201`, `400`, `404`, `500`). |

### Repository Layer (`backend/src/repositories/`)
| File | Behavior & Responsibility |
| :--- | :--- |
| **`ITaskRepository.ts`** | Defines the storage-agnostic TypeScript interface (`getAll`, `getById`, `create`, `update`, `toggle`, `delete`, `getWeeklySummaries`, `getStats`, `seed`) that both storage engines implement. |
| **`index.ts`** | Dynamic storage factory (`getTaskRepository()`). Checks `db_used` and `isDbConnected()`: returns `DbTaskRepository` when `db_used=true` and MongoDB is connected; otherwise returns `FileTaskRepository` so CRUD never fails. |
| **`dbTaskRepository.ts`** | Executes CRUD, regex search, weekly grouping, and stats against **MongoDB** via `TaskModel`. Includes per-method safety fallback to `FileTaskRepository` if a runtime DB error occurs. |
| **`fileTaskRepository.ts`** | Executes CRUD, keyword filtering, sorting, weekly grouping, and stats against **`backend/src/data/tasks.json`** using Node.js `fs/promises`. Auto-seeds sample tasks if `tasks.json` does not exist yet. |
| **`backend/src/data/tasks.json`** | Persistent JSON file acting as the local File Directory database when `db_used=false`. |

---

## 5. How Key Flows Behave End-to-End

1. **Dynamic Storage Switching (`db_used`)**:
   - At boot, `connectDB()` inspects `process.env.db_used`.
   - If `db_used=false`: Skips MongoDB entirely; `FileTaskRepository` reads/writes `tasks.json`.
   - If `db_used=true`: Connects to MongoDB Atlas using `MONGODB_URI`; `DbTaskRepository` performs all queries on the `tasks` collection. If the cluster IP is blocked or unreachable, it safely falls back to `FileTaskRepository` instead of timing out.

2. **Creating & Updating a Task**:
   - `TaskModal` validates `title` and `date` → calls `createTask()` in `api.ts` → `POST /api/tasks` → `taskController.createTask` validates body → `repo.create()` persists to MongoDB or `tasks.json` → `App.tsx` calls `loadData()` to refresh tasks, weekly cards (`/api/weeks`), and weekly progress (`/api/stats`).

3. **Weekly Progress & Grouping (Monday–Sunday)**:
   - Every task stores an ISO `date` (`YYYY-MM-DD`).
   - Both `getStats` and `getWeeklySummaries` calculate the Monday start and Sunday end of each task's week, counting `Completed` vs `In Progress` tasks so the **Task Complete**, **Task Pending**, and **Weekly Progress** bar stay synchronized automatically.
