# AGENTS.md — Oranged! Chrome Extension

## Before doing anything

**Always read `CONTEXT.md` first.** It contains current project state, active work, known issues, and decisions. Do not skip this step.

```
Read CONTEXT.md before starting any task.
```

## Before finishing any task

**Always update `CONTEXT.md`** with any relevant changes: decisions made, issues discovered, patterns introduced, or state changes. Keep it current so the next session starts with accurate context.

## Project overview

**Oranged!** is a Google Chrome extension that replaces the new tab page with a task manager and note-taking interface.

- **Stack**: React 18 + TypeScript, MUI v5, React DnD, Tailwind CSS, Webpack
- **Storage**: Chrome storage API (persistent across tabs)
- **Testing**: Jest + React Testing Library
- **Entry point**: `src/index.tsx`
- **Build**: `yarn build` (prod), `yarn dev` (watch mode)

## Key source structure

```
src/
  App.tsx                          # Root component, theme + tab switching
  components/
    tasks/                         # Task list, drag-drop, dialog
    context/TasksContext.tsx        # Global task state via Chrome storage
    context/SnackContext.tsx        # Snackbar notifications
    hooks/useStorage.ts            # Chrome storage read/write hook
    Notes.tsx                      # Notes panel
    ToggleThemeMode.tsx             # Light/dark toggle
    themes/customTheme.tsx          # MUI theme config
    types/                         # Task, Tab, DialogTaskData types
```

## Development commands

```bash
yarn dev              # Webpack watch (load unpacked in Chrome)
yarn build            # Production build → dist/
yarn test             # Jest
yarn test:coverage    # Coverage report
yarn lint             # ESLint
yarn type-check       # tsc --noEmit
```
