# Football Wrapped 2025 - Claude Project Instructions

## Project Overview

A Spotify Wrapped-style single-page React app for displaying football season statistics for ~40-50 players.

## Key Requirements

- **Tech Stack**: React + Vite, Tailwind CSS, Framer Motion, i18next, Chart.js
- **Style**: Dark theme (Spotify-inspired), mobile-first
- **Features**: Player selection, animated story cards, scroll-based stats, charts, shareable summary card
- **Languages**: Bulgarian (default) + English
- **Data**: Embedded JSON (no backend)
- **Deployment**: Netlify

## Development Approach

- Follow the numbered todo files in `/todo` folder sequentially (00-setup.md → 11-deployment.md)
- Each file contains specific tasks for Claude to execute
- Complete each step before moving to the next file
- No human developer involvement - fully AI-driven
- Each step may contain some code, you can make changes to the code provided during the run of the task

## Code Style

- Use TypeScript for type safety
- Functional components with hooks
- Tailwind for all styling
- Framer Motion for all animations
- Keep components small and focused

## Important Notes

- All text must be in both Bulgarian and English (use i18next)
- Dark mode only (no light mode)
- Mobile-first responsive design
- No backend - all data in JSON file
- Screenshot-friendly summary card at the end

## Bonus info

After finishing a task, don't start the next one except cases when it's specified.
