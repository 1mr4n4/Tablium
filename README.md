# Tablium

Tablium is a responsive timetable workspace for students and teams. Build a schedule from scratch, adjust every period and break, move sessions visually, and keep related tools close without cluttering the calendar.

## Open Tablium

For everyday use, open the hosted app at [https://1mr4n4.github.io/Tablium/](https://1mr4n4.github.io/Tablium/). No Node.js, npm, terminal, or local server is required for users. Open the link once, then install it from the browser as an app or add it to the phone home screen.

## Highlights

- Desktop weekly grid with drag-and-drop session movement.
- Mobile day view with swipe navigation.
- Editable timetable start, end, periods, and breaks.
- Session editor with rooms, professors, groups, colors, notes, tasks, and attendance.
- Live class and next-class indicators.
- Group filtering and Saturday visibility controls.
- Light, dark, ocean, forest, sunset, rose, slate, and custom themes.
- Calculator, notes, paint pad, and mini-game apps in optional floating windows.
- Per-app window placement, vertical stacking, pinning, and persistent notes/drawings.
- JSON backup/import and recurring `.ics` calendar export.
- Image timetable import through a configurable vision provider.
- Local persistence with rolling timetable backups and safe restore.
- Installable PWA with offline caching after the first load.

## Installation From Scratch

Tablium is a web application. You do not need a database, account, Node.js, npm, or separate backend to use the hosted app.

### 1. Install Node.js and npm

npm is installed together with Node.js. Tablium uses Vite 7, which requires:

- Node.js `20.19.0` or newer in the 20.x line, or Node.js `22.12.0` or newer.
- npm, included with Node.js.
- Git, only if you want to clone the repository from GitHub.

Download the **LTS** version of Node.js from [nodejs.org](https://nodejs.org/). During installation, keep the option to add Node.js to your system PATH enabled. Restart your terminal after installation.

Confirm the installation:

```bash
node --version
npm --version
```

On Windows, you can also install Node.js with:

```powershell
winget install OpenJS.NodeJS.LTS
```

On macOS with Homebrew:

```bash
brew install node
```

On Debian or Ubuntu, use the current Node.js LTS installer from [nodejs.org](https://nodejs.org/) or a Node version manager such as `nvm`. Avoid relying on an old distribution Node.js package because it may be below Tablium's required version.

### 2. Get the project

With Git installed:

```bash
git clone https://github.com/1mr4n4/Tablium.git
cd Tablium/Tablium-build
```

Alternatively, select **Code > Download ZIP** on GitHub, extract the ZIP, open a terminal in the extracted folder, and enter its `Tablium-build` directory.

### 3. Install dependencies

Run this inside `Tablium-build`:

```bash
npm install
```

This reads `package.json` and `package-lock.json` and installs the exact project dependencies. Do not use `npm install --force` or `--legacy-peer-deps` unless you are deliberately troubleshooting a local environment.

### 4. Start the development app

```bash
npm run dev
```

Open the `Local` URL printed by Vite, usually `http://localhost:5173`. Keep the terminal running while developing. Press `Ctrl+C` to stop the server.

To test the app from a phone connected to the same Wi-Fi network, start Vite with a network host:

```bash
npm run dev -- --host 0.0.0.0
```

Open the `Network` URL printed by Vite on the phone.

### 5. Build and preview the production app

```bash
npm run build
npm run preview
```

Open the preview URL printed by Vite. The build output is placed in `Tablium-build/dist` and can be deployed to any static web host.

### Troubleshooting installation

If `npm` or `node` is not recognized, close and reopen the terminal after installing Node.js. If the version is too old, install the latest Node.js LTS and check again with `node --version`.

If dependencies are corrupted, close running Vite terminals and run:

```bash
rm -rf node_modules
npm install
```

On Windows PowerShell, use:

```powershell
Remove-Item -Recurse -Force node_modules
npm install
```

If `npm run dev` says `vite` is not recognized, `npm install` did not finish successfully. Resolve the first `npm` error, run `npm install` again, and then retry the dev command.

## Mobile And Desktop Installation

Tablium is distributed as a responsive PWA, so users do not need an APK or an EXE to use the application. The repository automatically deploys the production build to GitHub Pages whenever `main` changes. Open the hosted URL above in a supported browser and install it from the browser menu.

### Android

1. Open the deployed HTTPS Tablium URL in Chrome.
2. Open the browser menu.
3. Choose **Install app** or **Add to Home screen**.
4. Launch Tablium from the new home-screen icon.

### iPhone and iPad

1. Open the deployed HTTPS Tablium URL in Safari.
2. Tap **Share**.
3. Choose **Add to Home Screen**.
4. Open Tablium from the home screen for the standalone app experience.

iOS does not use Android APK files. The PWA is the recommended mobile format for this release and keeps the same timetable data in that browser profile.

### Windows, macOS, and Linux

Open the deployed URL in Chrome or Edge and use the install icon in the address bar, or choose **Install Tablium** from the browser menu. The installed PWA opens in its own window and does not require Node.js.

### APK and EXE plans

An APK or desktop EXE is not included in v1.0.0. A native wrapper can be added later with Capacitor for Android/iOS or Tauri for Windows/macOS/Linux, but it would require platform signing, packaging workflows, update delivery, and additional testing. The PWA avoids that overhead while already supporting mobile, desktop, offline caching, and installation.

## Data And Privacy

Tablium has no required backend. Timetables, preferences, workspace notes, drawings, and custom themes are stored in the browser's local storage. Use **Settings > Data > Export JSON** for a portable backup. Before starting over or replacing a timetable, Tablium keeps rolling local backups that can be restored from Settings.

Vision import is optional. If enabled, the API key is kept in the browser and the image is sent directly to the selected provider. Do not use a provider key on a shared or untrusted device.

## Auto Git

This repository includes an optional Auto Git setup in `.autogit/autogit.json`:

- Starts when the workspace opens.
- Commits every five minutes.
- Uses the current date and time as the commit message.
- Keeps generated Auto Git logs out of version control.

Make sure Git identity and authentication are configured before enabling automatic pushes.

## Project Stack

- React 18
- TypeScript
- Vite
- Tailwind CSS
- Framer Motion
- Lucide React
- vite-plugin-pwa

## Release

This repository's first release is **v1.0.0**. The project is intentionally local-first: there is no account system or server requirement, making it suitable for browser, installed PWA, and desktop-style local use.
