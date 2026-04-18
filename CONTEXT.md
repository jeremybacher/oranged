# CONTEXT.md — Oranged! Project State

_Update this file before finishing any task. It is read at the start of every session._

---

## Current state

- Project is stable on `main` branch
- MUI v5 fully replaced with shadcn/ui + Radix primitives + Tailwind CSS

## Active work

_None currently._

## Recent decisions

- **shadcn/ui** chosen for UI components (Radix primitives + Tailwind CSS variables)
- MUI v5 (`@mui/material`, `@mui/icons-material`, `@emotion/*`) fully removed
- Dark/light mode now via `dark` class on `<html>` (Tailwind `darkMode: 'class'`)
- CSS variables in `src/index.css` drive all theme colors (light + dark)
- `sonner` replaces MUI Snackbar/Alert for toast notifications
- `lucide-react` replaces `@mui/icons-material`
- UI primitives live in `src/components/ui/` (button, dialog, input, textarea, label, tabs, checkbox, tooltip)
- `src/lib/utils.ts` exports `cn()` (clsx + tailwind-merge)
- React DnD for drag-and-drop task reordering
- Chrome `storage.sync` API used via `useStorage` hook for persistence
- Webpack (not Vite/CRA) as bundler — required for Chrome extension manifest compatibility
- Tab storage key `activeTab` now stores `"tasks"` / `"notes"` strings (was numeric 0/1)

## Known issues / tech debt

_None currently recorded._

## Recent changes

- **Sort order toggle** (`tasks/index.tsx`, `TaskList.tsx`, `DraggableItem.tsx`): A sort button in the task list header cycles through three modes — Manual order (default, drag-and-drop enabled) → Active first (uncompleted tasks first) → Done first (completed tasks first). Drag-and-drop and grip handle are disabled while a sort is active. Sort is view-only and does not mutate the stored task order.

## Recent changes

- `DialogTask.tsx`: UX-refreshed dialog. Visible `InputLabel` for each field (Title required *, Description optional). Close (X) `IconButton` in title bar. Dividers above/below content. Buttons: "Cancel" (outlined) / "Save changes" or "Create task" (contained). Counter uses `tabular-nums` and `text.disabled` baseline color, turns `error.main` at ≥90/≥290. Description field 4 rows. `aria-labelledby` on Dialog. Title max 100, description max 300.
- `utils/renderWithLinks.tsx`: Shared utility that splits text on URLs (http/https + bare domains) and renders them as `<a target="_blank">` links.
- `DraggableItem.tsx`: Task description rendered via `renderWithLinks` — URLs are clickable.
- `Notes.tsx`: View/edit toggle — view mode renders note text with clickable links; clicking switches to textarea edit mode; blur returns to view mode.
- `README.md`: Release ZIP install instructions were moved before the tech stack and rewritten as a clearer quick-install path, including guidance to load the extracted `dist/` folder in Chrome.

## Architecture notes

- `TasksContext` is the single source of truth for task state; it reads/writes Chrome storage directly
- `useStorage` hook abstracts Chrome storage get/set with a React state interface
- Tab switching (Tasks / Notes) is managed in `App.tsx` via `Tab` type
- `DialogTask` handles both create and edit flows via `DialogTaskData` type
- `ErrorBoundary` wraps the app for graceful failure

## Testing notes

- Integration tests live in `context/__tests__/` alongside unit tests
- Chrome storage is mocked in `setupTests.ts`
- Coverage command: `yarn test:coverage`

---

_Last updated: 2026-04-18 — README quick-install section moved earlier and improved_
