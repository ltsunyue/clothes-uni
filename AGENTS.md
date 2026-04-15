# Repository Guidelines

## Project Structure & Module Organization

This is a UniApp/Vue 3 mini app for clothing and outfit management. Source files live under `src/`. App bootstrap code is in `src/main.js` and global app shell behavior belongs in `src/App.vue`. Page routing and tab configuration are defined in `src/pages.json`; app metadata and platform settings are in `src/manifest.json`.

Feature pages are organized by route in `src/pages/`, for example `src/pages/wardrobe/index.vue`, `src/pages/outfit/index.vue`, and `src/pages/plans/index.vue`. Shared client-side storage helpers and category data live in `src/utils/storage.js`. Static assets should go in `src/static/`. Generated output is written to `dist/` and should not be edited by hand.

## Build, Test, and Development Commands

- `npm install`: install dependencies from `package-lock.json`.
- `npm run dev:mp-weixin`: run UniApp in WeChat mini program development mode.
- `npm run build:mp-weixin`: build the WeChat mini program into `dist/build/mp-weixin/`.
- `npm run dev:h5`: run the H5 development build.
- `npm run build:h5`: create a production H5 build.

Use the WeChat Developer Tools to inspect and validate the `mp-weixin` build output when changing mini program behavior.

## Coding Style & Naming Conventions

Use Vue single-file components with `<script setup>` for page logic. Keep imports at the top, followed by refs/computed state, lifecycle hooks, and functions. Match the existing JavaScript style: two-space indentation, single quotes, no semicolons, and descriptive camelCase names for functions and variables.

Use kebab-case or semantic class names in templates and scoped styles, such as `form-panel`, `empty-state`, and `cloth-card`. Prefer UniApp components (`view`, `text`, `image`, `picker`, `button`) and `rpx` units for mini program layouts.

## Testing Guidelines

No automated test framework is currently configured. For now, verify changes manually with `npm run dev:mp-weixin` or `npm run dev:h5`. For storage-related changes, test creating, listing, and deleting wardrobe items and outfit plans. If tests are added later, colocate page tests near the relevant page or add a top-level `tests/` directory, and document the new command here.

## Commit & Pull Request Guidelines

This checkout has no Git history, so there are no repository-specific commit conventions to preserve. Use concise imperative commit messages such as `Add outfit plan deletion` or `Fix wardrobe image persistence`.

Pull requests should include a short summary, manual test notes, affected pages or platforms, and screenshots or screen recordings for UI changes. Link related issues when available, and call out any changes to `manifest.json`, storage keys, or generated platform output.
