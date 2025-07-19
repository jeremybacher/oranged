# Oranged!

Oranged! is a Google Chrome extension that helps you be more organized and productive. It's a simple to-do list and Note pad within reach of a new tab.

## Features

### Add, edit, delete and mark as done your tasks.

![Tasks](assets/images/tasks.png)
![Example Tasks](assets/images/tasks_with_examples.png)
![Creating Task](assets/images/tasks_creating.png)
![Editing Task](assets/images/tasks_editing.png)
![Done Task.png](assets/images/tasks_done.png)

### Take and save notes.

![Notes](assets/images/notes.png)

### Light theme for tasks and notes.

![Light Tasks](assets/images/tasks_light.png)
![Light Notes](assets/images/notes_light.png)

## Installation

1. Download the last version from the [release](https://github.com/jeremybacher/oranged/releases) page.
2. Unzip the file.
3. Open Google Chrome and go to `chrome://extensions/`.
4. Enable the developer mode.
5. Click on `Load unpacked` and select the unzipped folder: `oranged`.
6. Just open a new tab and enjoy!

## Suggestions

If you have any suggestions, please let me know by creating a new issue.

## Development

### Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/jeremybacher/oranged.git
   cd oranged
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run tests:
   ```bash
   npm test
   ```

4. Build the project:
   ```bash
   npm run build
   ```

### GitHub Actions & CI/CD

This project uses GitHub Actions for continuous integration and deployment:

#### CI Workflow (`.github/workflows/ci.yml`)
- **Triggers**: On every push and pull request to `main` and `develop` branches
- **Tests**: Node.js 18.x and 20.x
- **Checks**: 
  - Type checking (`npm run type-check`)
  - Linting (`npm run lint`)
  - Unit tests (`npm test`)
  - Test coverage (`npm run test:coverage`)
  - Build verification (`npm run build`)

#### Release Workflow (`.github/workflows/release.yml`)
- **Triggers**: On version tags (e.g., `v1.0.0`, `v1.1.0`)
- **Requirements**: All tests must pass before creating a release
- **Process**:
  1. Runs complete test suite
  2. Builds the extension
  3. Creates a ZIP file for the Chrome Web Store
  4. Creates a GitHub release with the build artifacts

#### Branch Protection
- **Requirements**: All CI checks must pass before merging to `main`
- **Enforced**: Type checking, linting, and tests must pass

### Creating a Release

To create a new release:

1. Update the version in `package.json`
2. Commit your changes:
   ```bash
   git add .
   git commit -m "chore: bump version to x.x.x"
   ```
3. Create and push a version tag:
   ```bash
   git tag v1.0.0
   git push origin v1.0.0
   ```
4. The GitHub Action will automatically:
   - Run all tests
   - Build the extension
   - Create a release with downloadable ZIP file

**Note**: Releases will only be created if all tests pass, ensuring quality control
