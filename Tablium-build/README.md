ScheduleCraft
A cross-platform, responsive Timetable Enhancer PWA for university/school schedules (built with the typical Moroccan/French university layout — Cours / TD / TP, professors, rooms, and group codes like S1/S2 — in mind). Turns a static timetable into an interactive, animated dashboard.
Stack: Vite + React 18 + TypeScript + Tailwind CSS + Framer Motion + Lucide React + `vite-plugin-pwa`.
Getting started
```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # production build in dist/
npm run preview   # preview the production build
```
The app installs as a PWA (look for the install icon in your browser's address bar, or "Add to Home Screen" on mobile) and works offline once loaded, thanks to `vite-plugin-pwa`'s generated service worker.
What's implemented
Dual-view timetable — a time-scaled weekly matrix on desktop (`DesktopGrid`, with proper overlap handling so two groups in the same slot sit side-by-side) and a swipeable day-by-day view on mobile (`MobileTimetable`, swipe or tap the day pills).
Live indicator — a pulsing pill in the header shows the class in progress with a countdown and progress bar, or the next upcoming class with a "dans X min" countdown. A matching live line sweeps across today's column on the desktop grid.
Group filtering — set an "active group" in Settings to hide sessions belonging to other groups (e.g. only show `TD Marketing (S1)`, not `(S2)`). Sessions with no group always show.
Interactive session panel — clicking any session opens an animated drawer (bottom-sheet on mobile, side-panel on desktop, one shared `Panel` component with device-aware spring physics) with:
full field editing (subject, type badge, day/time, professor, room, group, colour tag)
a per-session task/reminder checklist
attendance quick actions (Présent / Absent / Annulé / Réinitialiser)
free-text notes
duplicate and delete
Manual builder — double-click any empty spot on the desktop grid, or use the "+" buttons on mobile/desktop, to create a session pre-filled with that day/time. Drag a session card and drop it elsewhere on the desktop grid to move it (duration is preserved).
Image-to-timetable import — in Settings, pick a vision provider (OpenAI GPT-4o, Anthropic Claude, or Google Gemini), paste an API key (kept only in `localStorage`, sent directly from the browser to that provider), and upload a photo of a timetable. The model is prompted to return structured JSON matching the app's schema, which is parsed and appended to your sessions.
JSON import/export — full round-trip backup/restore of the `TimetableConfig` as a `.json` file.
Export to calendar — generates a weekly-recurring `.ics` file (one `VEVENT` with `RRULE:FREQ=WEEKLY` per session) that imports cleanly into Google Calendar or Apple Calendar.
Dark/light mode with a persisted preference, respecting the OS setting on first load.
Local persistence — timetable, theme, and vision settings all persist to `localStorage`, no backend required.
Design system
Type: Fraunces (display italic) for the wordmark and panel titles — the one deliberate typographic flourish — and Inter everywhere else for density and legibility in a data-heavy grid.
Colour: a slate/ink base (`#0F1115` dark, `#F7F7F5` paper light) with an amber "live" accent reserved for the current-class indicator, and a distinct hue per session type (Cours/TD/TP/Examen/Autre) used consistently across badges, grid bars, and cards — colour encodes information, not decoration.
Surfaces are hairline-bordered translucent glass rather than stacked drop-shadow cards, matching the "compact, Linear/Notion-inspired" brief.
Known simplifications / good next steps
Drag-and-drop on the desktop grid moves a session to a new day/time but doesn't yet support resizing by dragging an edge.
The vision-import prompt asks the model to return JSON directly; very cluttered or handwritten timetables may need a manual touch-up afterwards.
There's a single timetable (`TimetableConfig`) rather than multiple saved timetables/semesters — swapping in a list + "active timetable id" would be a natural extension.
No automated tests yet; `DesktopGrid`'s overlap-layout function (`layoutDay`) and the ICS export are the two most worth covering first.
Icons in `public/` are placeholders — swap in real branded PWA icons before shipping.