# GitHub Actions Configuration

This directory contains GitHub Actions workflows for automated testing, building, and releasing.

## Workflows

### 1. CI (`ci.yml`)
- **Purpose**: Continuous Integration for all commits and pull requests
- **Triggers**: Push to `main`/`develop` branches, all pull requests
- **Matrix Testing**: Node.js 18.x and 20.x
- **Steps**:
  - Type checking
  - Linting
  - Unit tests
  - Test coverage
  - Build verification

### 2. Release (`release.yml`)
- **Purpose**: Automated releases with quality gates
- **Triggers**: Version tags (v*)
- **Requirements**: All tests must pass
- **Outputs**: 
  - GitHub release
  - Extension ZIP file for Chrome Web Store

### 3. Branch Protection (`branch-protection.yml`)
- **Purpose**: Enforce quality standards on pull requests
- **Triggers**: Pull requests to main branch
- **Requirements**: All quality checks must pass

## Repository Settings

To make the tests required for releases, configure these branch protection rules in your GitHub repository:

### Branch Protection for `main`:
1. Go to Settings → Branches
2. Add rule for `main` branch
3. Enable:
   - ✅ Require a pull request before merging
   - ✅ Require status checks to pass before merging
   - ✅ Require branches to be up to date before merging
   - Select these status checks:
     - `test (18.x)` - CI tests on Node 18
     - `test (20.x)` - CI tests on Node 20
     - `enforce-quality` - Branch protection workflow

### Required Secrets:
- `GITHUB_TOKEN` - Automatically provided by GitHub
- `CODECOV_TOKEN` - Optional, for code coverage reporting

## Release Process

1. **Development**: Work on feature branches
2. **Pull Request**: Create PR to `main` - triggers CI
3. **Review**: All checks must pass before merge
4. **Release**: Create version tag - triggers release workflow
5. **Verification**: Release only created if all tests pass

This ensures that:
- No broken code reaches main branch
- All releases are thoroughly tested
- Quality standards are maintained automatically
