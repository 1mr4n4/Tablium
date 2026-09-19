# Tablium v1.0.0

## First Release

Tablium v1.0.0 is the first public release of a local-first, responsive timetable workspace for students and teams. It turns a weekly schedule into an editable desktop grid, a mobile day view, and a set of optional productivity tools.

## Features

### Timetable

- Create a timetable from scratch with no seeded programs or sessions.
- Desktop weekly grid with editable days and time periods.
- Mobile timetable with day tabs and swipe navigation.
- Configure the timetable start and end time.
- Edit each period's start and end time, including custom breaks.
- Add, edit, duplicate, move, and delete sessions.
- Drag sessions to another day and time while preserving duration.
- Live class indicator with progress and next-class countdown.
- Group/program filtering.
- Optional Saturday visibility.
- Compact desktop row mode.

### Sessions

- Subject, session type, day, start/end time, professor, room, group, color, and notes.
- Per-session tasks and reminders.
- Attendance states: scheduled, attended, missed, and cancelled.
- Session-specific visual type colors.

### Themes And Languages

- Light, dark, ocean, forest, sunset, rose, and slate themes.
- Custom theme colors for background, text, brand, and accent colors.
- English, French, German, and Spanish translations.
- Responsive layouts for desktop, tablet, mobile web, and installed PWA use.

### Optional Workspace Apps

The workspace launcher beside the Tablium wordmark opens optional floating apps:

- Calculator.
- Persistent notes.
- Persistent paint pad.
- Tic-tac-toe mini-game.
- Independent app windows with left/right placement.
- Vertical stacking for apps on the same side.
- Per-app close, pin, and position controls.
- Touch-friendly controls and safe-area support on mobile devices.

### Import, Export, And Persistence

- JSON timetable export and import.
- Recurring `.ics` calendar export.
- Optional image timetable import through OpenAI, Anthropic, or Google Gemini vision providers.
- Local browser persistence without a required backend.
- Rolling timetable backups before resets or replacements.
- Restore the latest local backup from Settings.
- Installable PWA with offline caching after the first load.

## Known Bugs And Limitations

These are known risks for the first release, not guarantees that every device will reproduce them:

- Timetable data is stored per browser and per device. Clearing browser storage or using a private window can remove access to local data.
- JSON export is the safest portable backup; automatic local backups cannot be restored from another browser or device.
- Vision imports depend on the selected provider, API availability, image quality, and the provider's returned structure. Imported sessions may need manual correction.
- Desktop session dragging uses the browser drag-and-drop API and may feel different across browsers or with touch-enabled laptops.
- Mobile uses a day-by-day view rather than the full desktop matrix, so cross-day movement is handled through session editing rather than mobile drag-and-drop.
- Paint drawings are stored as one browser-local canvas image and do not yet support layers, undo history, resizing, or image export.
- Calculator expressions are intentionally limited to basic arithmetic operators.
- The mini-game uses a simple random computer move rather than a strategic game AI.
- There is currently one active timetable rather than separate semesters or multiple schedule profiles.
- The project does not yet have automated unit, integration, or end-to-end test coverage.
- Auto Git is a local VS Code workflow. It is not part of the web application and requires Git authentication to be configured correctly.

## TODO

### High Priority

- Add automated tests for timetable persistence, backup restore, time-slot editing, session movement, and ICS export.
- Add a dedicated storage migration/versioning layer for future schema changes.
- Add a visible storage health indicator and a guided export reminder.
- Add mobile session move controls and touch-friendly timetable editing.
- Add collision validation for overlapping or invalid session times.
- Add a reliable error boundary and user-facing recovery state for unexpected app errors.

### Medium Priority

- Support multiple timetables, semesters, and saved profiles.
- Add session resizing by dragging the start or end edge.
- Add undo/redo for timetable edits.
- Add recurring session creation and bulk editing.
- Add paint undo, redo, eraser size, export, and multiple canvases.
- Improve calculator history and keyboard support.
- Replace the random mini-game opponent with selectable difficulty levels.
- Add keyboard shortcuts and improved screen-reader announcements.

### Future

- Optional encrypted cloud sync with explicit user consent.
- Shareable read-only timetable links.
- Calendar sync instead of export-only integration.
- More workspace apps such as a focus timer, checklist, and markdown editor.
- Automated browser testing across desktop and mobile viewport sizes.
- Branded PWA icons and screenshots for app-store style installation flows.

## Verification

The v1.0.0 release was verified with:

```bash
cd Tablium-build
npm run build
```

The production build completes successfully with the current Vite, TypeScript, React, Tailwind CSS, Framer Motion, and PWA configuration.
