# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/),
and this project adheres to [Semantic Versioning](https://semver.org/).

## [1.0.3] - 2026-05-29

### Added
- ESLint + Prettier with pre-commit hooks (husky + lint-staged)
- GitHub Actions workflows (lint, test matrix, release)
- Dependabot for npm and GitHub Actions updates
- PR template
- `.editorconfig`, `.nvmrc`
- MIT LICENSE
- README badges (lint, test, license, node version, PRs welcome)

### Changed
- License from ISC to MIT
- Minimum Node.js version from 14 to 18
- All source files formatted with Prettier

### Fixed
- Removed unused `relativeSource` variable in `copyArtifact`

## [1.0.2] - 2026-05-29

### Fixed
- CLI no longer overrides config file values with yargs defaults

## [1.0.1] - 2026-05-29

### Added
- Initial public release
- Artifact organization into versioned directories
- Manifest generation per directory
- Config file support (`release.config.js`)
- CLI with glob pattern matching
