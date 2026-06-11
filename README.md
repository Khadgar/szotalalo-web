# Szótaláló

Hungarian / English Boggle solver and game. Built with Vite + React + TypeScript + Mantine + Zustand + React Router + react-i18next.

## Modes

- **Solver**: enter a grid, get every dictionary word reachable by 8-direction swipes. Click a word to animate its path on the board.
- **Game**: configure player count (1–8), grid size (3–8), time (2/3/4/5 min or unlimited) and dictionary (Hungarian or English). Each player swipes for words on the same randomly generated grid. After the last player a leaderboard is shown with classic Boggle scoring.

## URLs

The app uses `HashRouter` (works on GitHub Pages without server config):

- `#/solver?dict=hu` — solver with Hungarian dictionary
- `#/solver?dict=en` — solver with English dictionary
- `#/game?dict=en` — game setup
- `#/game/play` — current game in progress
- `#/game/finished` — leaderboard

## Language & theme

- UI language auto-detected from the browser (query `?lang=` → localStorage → `navigator`). Switch via the **EN / HU** segmented control in the header.
- Theme: auto (system) / light / dark, toggled via the icon in the header. Persisted in localStorage.

## Letters

Cells store single Unicode characters only. Hungarian: a–z plus á, é, í, ó, ö, ő, ú, ü, ű. English: a–z. Hungarian words requiring digraphs (Cs, Sz, …) that cannot be formed from single cells are unreachable.

## Installable (PWA)

The app is a Progressive Web App: on Chrome/Edge/Android you'll see an "Install" prompt; on iOS Safari use *Share → Add to Home Screen*. After install it launches standalone (no browser chrome) using `logo192.png` / `logo512.png`. Dictionaries are cached on first use so the app works offline once both languages have been opened at least once.

## Scripts

```
npm install
npm run dev       # local dev server
npm run build     # production build to dist/
npm run preview   # preview the build
npm test          # run unit tests (Vitest)
npm run gen:dict  # regenerate public/dict_en.txt (one-time)
npm run deploy    # build + publish dist/ to gh-pages
```

## Deployment

Deployed to GitHub Pages at `https://khadgar.github.io/szotalalo-web/`. The Vite `base` is set in `vite.config.ts`.
