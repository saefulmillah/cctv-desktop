# cctv-desktop

Electron desktop app for viewing CCTV streams by branch with paging and quick keyboard controls.

## Requirements

- Node.js 18+ (LTS recommended)
- npm
- Backend API running at `http://localhost:3000`

## Install

```bash
npm install
```

## Run in Development

```bash
npm start
```

## Build

```bash
npm run package
npm run make
```

Windows wizard installer (custom install path + API_BASE_URL page):

```bash
npm run make:wizard
```

## Available Scripts

- `npm start`: Start Electron app in development mode.
- `npm run package`: Package the app without creating installers.
- `npm run make`: Build platform installer/artifacts.
- `npm run make:wizard`: Build Windows wizard installer using Inno Setup.
- `npm run publish`: Publish artifacts (if configured).

## Features

- Load branches from backend API.
- Display CCTV streams for selected branch.
- Branch camera pagination.
- Stream status indicator (online/offline).
- Retry logic for unstable HLS streams.
- Fullscreen toggle per camera cell.

## Keyboard Shortcuts

- `Shift+L`: Open branch picker.
- `Shift+K`: Open API config modal.
- `Shift+X`: Show close confirmation dialog.

## API Notes

Default API base URL is:

- `http://localhost:3002`

You can change it from:

- in-app modal (`Shift+K`)
- installer wizard page (if using `make:wizard`)

The value is persisted in local config (`app-config.json`) under Electron `userData` path.

## Project Structure

- `src/index.js`: Electron main process and IPC handlers.
- `src/preload.js`: Secure bridge from renderer to main process.
- `src/renderer.js`: UI behavior and stream playback logic.
- `src/services/cameraService.js`: API client.

## License

MIT
