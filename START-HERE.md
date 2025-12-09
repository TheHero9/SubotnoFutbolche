# 🚀 Football Wrapped 2025 - Start Here

Welcome to the Football Wrapped 2025 project! This is an AI-driven development project.

## 📁 Project Structure

```
SubotnoFutbolche/
├── .claude/                    # Claude configuration
│   └── CLAUDE.md              # Project-specific instructions
├── todo/                       # Step-by-step development instructions
│   ├── README.md              # Overview of all steps
│   ├── 00-setup.md            # Project initialization
│   ├── 01-data-structure.md   # Data and utilities
│   ├── 02-base-layout.md      # App structure
│   ├── 03-i18n.md             # Internationalization
│   ├── 04-player-selection.md # Landing page
│   ├── 05-loading-animation.md # Loading screen
│   ├── 06-story-section.md    # Story cards
│   ├── 07-scroll-section.md   # Scrollable stats
│   ├── 08-charts.md           # Charts
│   ├── 09-summary-card.md     # Summary card
│   ├── 10-styling-animations.md # Polish
│   └── 11-deployment.md       # Netlify deployment
├── football-wrapped-requirements.md # Original requirements
└── START-HERE.md              # This file
```

## 🎯 What to Build

A Spotify Wrapped-style web app for displaying football season statistics:
- **Tech**: React + Vite, Tailwind CSS, Framer Motion, i18next, Chart.js
- **Features**: Player selection, animated stories, charts, shareable cards
- **Languages**: Bulgarian (default) + English
- **Deployment**: Netlify

## 🤖 For Claude: How to Start

### Step 1: Read the Requirements
```
Read: football-wrapped-requirements.md
```

### Step 2: Follow Todo Steps Sequentially
Start with `todo/00-setup.md` and work through each file in order (00 → 11).

Each file contains:
- ✅ Clear objectives
- ✅ Complete code snippets
- ✅ Installation commands
- ✅ Expected outcomes

### Step 3: Verify Each Step
After completing each step, verify the expected outcome before moving to the next.

### Step 4: Deploy
The final step (11-deployment.md) covers Netlify deployment.

## 📝 Key Information

- **Total Steps**: 12 (00 through 11)
- **Development Time**: ~2-3 hours for Claude
- **Testing**: Test after each major step
- **Data Source**: JSON file (will be exported from Google Sheets)
- **Target Users**: ~40-50 football players

## 🎨 Design Style

- Dark theme (Spotify-inspired)
- Green/Gold accent colors
- Mobile-first responsive
- Smooth animations throughout
- Fun, celebratory feel

## 🌍 Languages

- **Bulgarian** (default) - bg
- **English** - en

All text must be translatable via i18next.

## 📊 Data Structure

Player data includes:
- Monthly games (2024 & 2025)
- Total games per year
- Rank (2024 & 2025)
- Dates played

## 🎬 User Flow

1. Landing page → Select player
2. Loading animation (2-3 seconds)
3. Story cards (tap through 4 cards)
4. Scroll section (monthly stats, charts, achievements)
5. Summary card (screenshot & share)

## ✨ Ready to Build?

Start with: `todo/00-setup.md`

**Command to begin:**
```bash
# Claude should read and execute todo/00-setup.md
```

---

**Note**: This is a fully AI-driven project. All code is complete and ready to implement. No human developer intervention needed.
