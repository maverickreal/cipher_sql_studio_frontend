# M SQL Studio — Agent Guide

## Quick commands

| Command | What it runs |
|---|---|
| `npm run dev` | Vite dev server (port 3000, or `PORT` env) |
| `npm run build` | `tsc -b && vite build` (typecheck first, then bundle) |
| `npm run health:check` | `biome check .` |
| `npm run health:fix` | `biome check --write --unsafe .` |
| `npm test` | `vitest run` (jsdom; hooks + editor helper tests) |

No CI pipelines.

## Dev server

- Proxies `/api` → `VITE_API_BASE_URL` (default `http://localhost:8000`). See `vite.config.ts`.
- Auth client hits `http://127.0.0.1:8000/api/auth` (hardcoded in `src/services/authClient.ts`).

## Toolchain

- **Biome 2.5** = linter + formatter (no ESLint/Prettier). Config in `biome.json`.
  - `tab` indent, double quotes, `organizeImports` on save.
- **Tailwind CSS 4** via `@tailwindcss/vite` plugin. Uses `@import "tailwindcss"` (no PostCSS config needed, no `@tailwind` directives). `@theme` in `src/index.css` maps `brand-*` / `surface-*` / functional colors to Dracula (dark, default) and Alucard (light) CSS variables. Toggle lives in the navbar (`src/theme/`).
- **TypeScript** strict mode with `noUnusedLocals` and `noUnusedParameters`. Path alias `@/*` → `./src/*`.

## Architecture

- React 19 + React Router 7 + Redux Toolkit (RTK Query).
- `src/main.tsx` entry: wraps `<Provider store={store}>` + `<ThemeProvider>` + `<RouterProvider router={router}>`.
- Routes are **lazily loaded** via react-router `lazy` in `src/app/router.tsx`.
- **Redux store** (`src/store/index.ts`): `auth` slice, `execution` slice, `api` (RTK Query).
- **RTK Query** base URL from `import.meta.env.VITE_API_BASE_URL`; credentials `"include"` for cookie-based auth.
- SQL execution is **EventSource-first**: POST → `taskId` → `useJobStatusStream` opens `EventSource` on `/status/:taskId/stream` (`withCredentials: true`) for `job-status` completed/failed events; on `onerror` (or no EventSource) it falls back to RTK `useGetJobStatusQuery` polling every 1s. The `jobStatus` endpoint uses `keepUnusedDataFor: 0`.
- Last-SQL restore: `AssignmentDetailPage` passes `initialSql={lastSql?.userSql ?? null}` into `SqlEditor`, resolved via `initialDoc()` helper (`src/features/sql-editor/initialDoc.ts`).
- Auth via **better-auth** client. `useAuth` hook in `src/hooks/useAuth.ts` dispatches `setUser`/`clearSession`. Called in `RootLayout` and `AssignmentDetailPage`.
- UI primitives in `src/components/ui/` (`Button`, `Input`, `Textarea`, `Badge`, `Table`). `Button` accepts `loading` prop (shows spinner).
- Error extraction utility `getErrorMessage` handles RTK Query error shapes.

### Key types

See `src/types/index.ts`: `Assignment`, `AssignmentDetail`, `SqlExecutionRequest`, `SqlExecutionResult`, `JobStatus`, `CreateAssignmentPayload`.

## Build & deploy

- `vite.config.ts` is source; `vite.config.js` and `vite.config.d.ts` are gitignored build artifacts.
- Production Docker: `Dockerfile` (multi-stage `node:22-alpine` build → `nginx:alpine` serve). Nginx proxies `/api/` to `http://api-gateway:8000`. `NGINX_SERVER_NAME` ARG substituted at runtime via `envsubst`.
- Dev Docker: `Dockerfile.dev` runs `npm run dev -- --host` for Vite HMR. `client-dev` service in `docker-compose.yml` uses bind mounts + `CHOKIDAR_USEPOLLING=1` for file watching on macOS.
- Environment variables must be prefixed `VITE_` for Vite exposure (see `.env.example`).

## Conventions

- **Imports**: relative paths (no `@/` alias used in current code). Redux hooks from `react-redux` directly (typed dispatch via `useDispatch<AppDispatch>()`; `store/hooks.ts` only re-exports types).
- **Formatting/linting**: run `npm run health:check` before committing.
- **Tailwind**: utility classes with `clsx`/`cn` pattern allowed (configured in biome `useSortedClasses` nursery rule).
