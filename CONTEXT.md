# CONTEXT.md — Oranged! Project State

_Update this file before finishing any task. It is read at the start of every session._

---

## Current state

- Project is stable on `main` branch
- Latest commits: improved tests & styles (#1), updated README (#3)
- No active feature branches

## Active work

_None currently._

## Recent decisions

- MUI v5 chosen for UI components (accessible, theming support)
- React DnD for drag-and-drop task reordering
- Chrome `storage.sync` API used via `useStorage` hook for persistence
- Tailwind used alongside MUI (utility classes for layout)
- Webpack (not Vite/CRA) as bundler — required for Chrome extension manifest compatibility

## Known issues / tech debt

_None currently recorded._

## Recent changes

- `DialogTask.tsx`: UX-refreshed dialog. Visible `InputLabel` for each field (Title required *, Description optional). Close (X) `IconButton` in title bar. Dividers above/below content. Buttons: "Cancel" (outlined) / "Save changes" or "Create task" (contained). Counter uses `tabular-nums` and `text.disabled` baseline color, turns `error.main` at ≥90/≥290. Description field 4 rows. `aria-labelledby` on Dialog. Title max 100, description max 300.
- `utils/renderWithLinks.tsx`: Shared utility that splits text on URLs (http/https + bare domains) and renders them as `<a target="_blank">` links.
- `DraggableItem.tsx`: Task description rendered via `renderWithLinks` — URLs are clickable.
- `Notes.tsx`: View/edit toggle — view mode renders note text with clickable links; clicking switches to textarea edit mode; blur returns to view mode.

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

_Last updated: 2026-04-17 — initial CONTEXT.md creation_
