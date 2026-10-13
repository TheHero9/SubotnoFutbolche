# Football Wrapped 2025

A Spotify Wrapped-style yearly recap for "Съботно Футболче", our Saturday football group in Sofia (48 players).
Pick your name and get your season as story cards, a quiz and a shareable summary card.

<!-- TODO: add a screenshot or GIF of the story cards -->
![Football Wrapped screenshot](docs/screenshot.png)

## What's interesting

- **Football buddies by lift, not raw counts.** Counting shared games puts the regulars on everyone's list.
  Buddies are ranked by affinity (actual overlap / expected overlap by chance), weighted by games played together.
  Write-up in [`FOOTBALL_BUDDIES.md`](src/utils/FOOTBALL_BUDDIES.md).
- **Every stat comes from raw dates.** `players.json` only stores the dates each player showed up. Totals, ranks,
  monthly and seasonal breakdowns, longest streaks and the change from last year are computed in the browser
  ([`calculations.ts`](src/utils/calculations.ts), [`playerStats.ts`](src/utils/playerStats.ts)).
- **The quiz is generated from the data.** Questions like "who had the longest streak" or "what was your rank" are
  built from the same stats, so the answers stay correct when the data changes
  ([`quizCalculations.ts`](src/utils/quizCalculations.ts)).
- The summary card exports to a PNG with `html-to-image`. Bulgarian and English via i18next.

## Stack

React 18, TypeScript, Vite, Tailwind CSS 4, Framer Motion, Chart.js, i18next. Static site on Netlify, no backend.

## Run locally

```bash
npm install
npm run dev
```

The data lives in `src/data/` (`players.json`, `communityStats.json`).
