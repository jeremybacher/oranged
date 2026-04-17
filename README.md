# Oranged!

Oranged! is a Chrome extension that replaces the default new tab page with a combined task manager and note-taking workspace. The current codebase is built with React 18, TypeScript, Tailwind CSS, local Radix-based UI primitives, and Webpack, with persistence handled through `chrome.storage.sync`.

## Current Status

- The UI migration away from MUI is complete. The app now uses local UI primitives in `src/components/ui/` built on Radix primitives and Tailwind utilities.
- Task management currently supports create, edit, duplicate, delete, complete/incomplete, bulk selection, bulk delete, drag-and-drop manual ordering, and two alternate view-only sort modes: `Active first` and `Done first`.
- Notes autosave to Chrome storage and support lightweight markdown-style formatting shortcuts for bold, italic, strikethrough, inline code, blockquotes, and links.
- Theme mode and the active tab are persisted between sessions.
- CI and release automation lives in `.github/workflows/main.yml`.

## Features

- Replaces Chrome's new tab page with a focused `Tasks` / `Notes` interface.
- Stores tasks, notes, theme mode, and active tab in `chrome.storage.sync`.
- Renders clickable links in task descriptions and notes.
- Shows incomplete task counts in the Tasks tab and in the document title.
- Uses toast notifications and an error boundary for error handling.

## Tech Stack

- React 18
- TypeScript
- Tailwind CSS
- Radix UI primitives via local components in `src/components/ui/`
- React DnD
- Sonner
- Webpack 5
- Chrome Extension Manifest V3
- Jest and React Testing Library
- ESLint

## Project Structure

```text
oranged/
├── .github/workflows/main.yml
├── public/
│   ├── background.js
│   ├── favicon.ico
│   └── manifest.json
├── src/
│   ├── components/
│   │   ├── context/
│   │   ├── hooks/
│   │   ├── tasks/
│   │   ├── ui/
│   │   ├── utils/
│   │   ├── ErrorBoundary.tsx
│   │   ├── General.tsx
│   │   ├── Notes.tsx
│   │   └── ToggleThemeMode.tsx
│   ├── lib/
│   ├── App.tsx
│   ├── index.css
│   ├── index.html
│   ├── index.tsx
│   └── setupTests.ts
├── CONTEXT.md
├── package.json
├── tailwind.config.js
├── webpack.config.js
├── webpack.dev.js
└── webpack.prod.js
```

## Development

### Prerequisites

- Node.js 18 or 20
- Yarn
- Google Chrome

### Setup

```bash
git clone git@github.com:jeremybacher/oranged.git
cd oranged
yarn install
```

If you are working from an older local checkout from before the UI migration, rerun `yarn install` to sync the newer Radix, `lucide-react`, `sonner`, `tailwind-merge`, and `class-variance-authority` dependencies.

### Run In Development

```bash
yarn dev
```

This runs Webpack in watch mode and writes the extension build to `dist/`.

To load the extension in Chrome:

1. Open `chrome://extensions/`.
2. Enable `Developer mode`.
3. Click `Load unpacked`.
4. Select the `dist/` directory.
5. Reload the extension in Chrome after rebuilds when you change the source.

### Build For Production

```bash
yarn build
```

## Available Scripts

| Command | Description |
| --- | --- |
| `yarn dev` | Webpack watch build for development |
| `yarn build` | Production build into `dist/` |
| `yarn test` | Run Jest tests |
| `yarn test:watch` | Run Jest in watch mode |
| `yarn test:coverage` | Generate Jest coverage output |
| `yarn lint` | Run ESLint on `src/` |
| `yarn lint:fix` | Auto-fix ESLint issues where possible |
| `yarn type-check` | Run `tsc --noEmit` |

## Testing And Quality

- Tests live alongside source files under `src/components/**/__tests__/` and `src/components/hooks/__tests__/`.
- Chrome APIs are mocked in `src/setupTests.ts`.
- Recommended local validation flow:

```bash
yarn type-check
yarn lint
yarn test --ci --runInBand
```

## CI And Releases

The repository uses a single GitHub Actions workflow at `.github/workflows/main.yml`.

- Pushes to `main` and pull requests targeting `main` run type-checking, linting, unit tests, coverage, and a production build.
- Tags matching `v*` trigger the release job, which zips the built `dist/` output and publishes a GitHub release artifact.

## Storage And Architecture Notes

- `src/components/context/TasksContext.tsx` is the main source of truth for task state.
- `src/components/hooks/useStorage.ts` and `useJSONStorage()` wrap `chrome.storage.sync`.
- `src/components/General.tsx` manages the `Tasks` / `Notes` tab state.
- `public/background.js` disables the toolbar action and opens the extension page when the extension is installed.
