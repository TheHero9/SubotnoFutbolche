# Съботно Футболче 2025 Wrapped

## Project Overview

A single-page React web application that displays personalized football season statistics for players in a fun, interactive "Wrapped" style (inspired by Spotify Wrapped). The app will be hosted on Netlify and shared with ~40-50 players to view their 2025 season stats.

---

## Core Features

### 1. Player Selection

- Landing page with a dropdown/search input containing all player names (~40-50 players)
- On selection, trigger a fun "loading/thinking" animation before revealing stats
- Animation should feel like it's "generating" the personalized wrapped experience

### 2. Wrapped Experience Flow (Mix of Stories + Scroll)

The reveal should combine:

- **Initial Story-style reveals**: First few key stats appear one at a time with click/tap to continue
- **Then scroll-based**: Remaining stats revealed with scroll animations

#### Stats to Display (in order of reveal):

**Story Section (click through):**

1. Welcome screen with player name + year "2025"
2. Total games played in 2025 (big animated number)
3. Rank position among all players (e.g., "You're #10 out of 41 players!")
4. Rank change from 2024 (with ⬆️/⬇️/🟰 and fun message)

**Scroll Section:** 5. Monthly breakdown chart (games per month for 2025) 6. Comparison with 2024 (side-by-side or overlay chart) 7. Best months to play (most games) 8. Worst months to play (least games) 9. Best season (Winter/Spring/Summer/Autumn) 10. Worst season 11. Fun comparisons & achievements 12. Final shareable summary card

### 3. Fun Stats & Comparisons

Include playful statistics such as:

- "You played more than X% of all players"
- "If you keep this up, in 10 years you'll have X games!"
- "Your favorite month is [month] - you never miss it!"
- "You played X more/fewer games than last year"
- Streak stats if calculable from dates

### 4. Player Titles (Based on Rank)

Assign fun titles based on 2025 rank:
| Rank | Title (BG) | Description (BG) |
|------|------------|------------------|
| 1 | Легендата | Ако погледнеш нагоре, няма други
| 2-5 | Голяма машина | В златната петорка на футбола, носите положението всяка седмица
| 6-10 | Много сериозен | От най-сериозните участници, с по-малко личен живот можеше и в петицата
| 11-20 |Редовен играч | Идвате на вълни, но винаги спасявате положението
| 21-30 | Любител на играта | От време на време идвате да се видите с приятели, понякога се включвате и в мачовете
| 31+ | Заета личност | Твърде много ангажименти никога не са на добре, особенно, ако футболчето страда заради това

_These can be modified later_

### 5. Shareable Summary Card

Final section should display a condensed, screenshot-friendly card containing:

- Player name
- Fun title (based on rank)
- Total games 2025
- Rank position (e.g., #10/41)
- Rank change from 2024 (⬆️5 / ⬇️3 / 🟰)
- Total games change vs 2024
- "Съботно Футболче 2025" branding

Include a visual indicator or button suggesting "Screenshot & Share!"

### 6. Internationalization (i18n)

- Support two languages: **Bulgarian** (default) and **English**
- Language toggle in the header/corner
- All text, titles, and fun messages should be translatable

---

## Technical Stack

### Framework & Libraries

- **React** (Vite for fast builds)
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **i18next** for internationalization
- **Chart.js** for data visualization
- **html-to-image** or similar for screenshot functionality

### Design Style

- **Dark mode** base (Spotify-style)
- **Bright accent colors**: Greens (football), possibly gold/yellow for highlights
- Smooth animations and transitions
- Mobile-first responsive design
- Fun, celebratory feel with confetti/particles on achievements

### Hosting

- **Netlify** (free tier)
- Static site, no backend needed
- Data embedded as JSON in the app

---

## Data Structure

### Player Data JSON Format

```json
{
  "players": [
    {
      "name": "Калата",
      "games2024": {
        "january": 1,
        "february": 0,
        "march": 0,
        "april": 0,
        "may": 1,
        "june": 0,
        "july": 2,
        "august": 2,
        "september": 2,
        "october": 2,
        "november": 1,
        "december": 4
      },
      "games2025": {
        "january": 4,
        "february": 4,
        "march": 2,
        "april": 2,
        "may": 3,
        "june": 4,
        "july": 3,
        "august": 1,
        "september": 2,
        "october": 0,
        "november": 0,
        "december": 0
      },
      "total2024": 15,
      "total2025": 25,
      "rank2024": 14,
      "rank2025": 10,
      "dates2024": ["15/01", "20/05", "..."],
      "dates2025": ["04/01", "11/01", "..."]
    }
  ],
  "totalPlayers": 41,
  "seasonName": "Съботно Футболче 2025"
}
```

### How to Export Data from Google Sheets

#### Step 1: Prepare Your Data

Ensure your Google Sheet has these columns in your "Total Players" sheet:

- Column A: Player Name (Име)
- Column B: 2024 Total Games
- Column C: 2025 Total Games
- Column D: Difference
- Column E: Total (all time)

And in your 2024/2025 sheets:

- Column H: Player Name (Име)
- Column I: Dates (format: "06/12, 29/11, 22/11, 15/11, 08/11")
- Column J: Total Games (Идвания)

#### Step 2: Create Export Script

1. In Google Sheets, go to **Extensions → Apps Script**
2. Paste this script:

```javascript
function exportToJSON() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  // Get sheets
  const sheet2024 = ss.getSheetByName("2024");
  const sheet2025 = ss.getSheetByName("2025");
  const totalSheet = ss.getSheetByName("Total Players");

  // Get data ranges (adjust if your data starts at different rows)
  const data2024 = sheet2024.getRange("H6:J100").getValues();
  const data2025 = sheet2025.getRange("H6:J100").getValues();
  const totalData = totalSheet.getRange("A2:E100").getValues();

  const players = [];
  const months = [
    "january",
    "february",
    "march",
    "april",
    "may",
    "june",
    "july",
    "august",
    "september",
    "october",
    "november",
    "december",
  ];

  // Process each player from total sheet
  totalData.forEach((row, index) => {
    const name = row[0];
    if (!name) return; // Skip empty rows

    // Find player in 2024 and 2025 sheets
    const player2024 = data2024.find((r) => r[0] === name);
    const player2025 = data2025.find((r) => r[0] === name);

    // Parse dates into monthly counts
    const games2024 = parseMonthlyGames(player2024 ? player2024[1] : "");
    const games2025 = parseMonthlyGames(player2025 ? player2025[1] : "");

    // Calculate ranks (will be sorted later)
    players.push({
      name: name,
      games2024: games2024,
      games2025: games2025,
      total2024: row[1] || 0,
      total2025: row[2] || 0,
      dates2024: player2024
        ? player2024[1]
            .split(",")
            .map((d) => d.trim())
            .filter((d) => d)
        : [],
      dates2025: player2025
        ? player2025[1]
            .split(",")
            .map((d) => d.trim())
            .filter((d) => d)
        : [],
    });
  });

  // Calculate ranks
  const sorted2024 = [...players].sort((a, b) => b.total2024 - a.total2024);
  const sorted2025 = [...players].sort((a, b) => b.total2025 - a.total2025);

  players.forEach((player) => {
    player.rank2024 = sorted2024.findIndex((p) => p.name === player.name) + 1;
    player.rank2025 = sorted2025.findIndex((p) => p.name === player.name) + 1;
  });

  const output = {
    players: players,
    totalPlayers: players.length,
    seasonName: "Съботно Футболче 2025",
    exportDate: new Date().toISOString(),
  };

  // Show JSON in a dialog
  const json = JSON.stringify(output, null, 2);
  const html = HtmlService.createHtmlOutput("<pre>" + json + "</pre>")
    .setWidth(600)
    .setHeight(400);
  SpreadsheetApp.getUi().showModalDialog(html, "Export JSON - Copy this!");
}

function parseMonthlyGames(datesString) {
  const months = {
    "01": "january",
    "02": "february",
    "03": "march",
    "04": "april",
    "05": "may",
    "06": "june",
    "07": "july",
    "08": "august",
    "09": "september",
    10: "october",
    11: "november",
    12: "december",
  };

  const result = {
    january: 0,
    february: 0,
    march: 0,
    april: 0,
    may: 0,
    june: 0,
    july: 0,
    august: 0,
    september: 0,
    october: 0,
    november: 0,
    december: 0,
  };

  if (!datesString) return result;

  const dates = datesString.split(",");
  dates.forEach((date) => {
    const match = date.trim().match(/\d{2}\/(\d{2})/);
    if (match) {
      const monthNum = match[1];
      const monthName = months[monthNum];
      if (monthName) result[monthName]++;
    }
  });

  return result;
}
```

3. Save the script (Ctrl+S)
4. Run `exportToJSON` function
5. Authorize when prompted
6. Copy the JSON from the popup dialog
7. Save as `players.json` in your React app's `src/data/` folder

#### Step 3: Alternative Manual Export

If the script doesn't work, you can:

1. Download each sheet as CSV
2. Use an online CSV to JSON converter
3. Manually structure the data following the format above

---

## Page Sections & Layout

### 1. Header

- Language toggle (EN/BG) in top right corner
- "Съботно Футболче 2025" logo/title
- Minimal, stays visible

### 2. Landing / Player Selection

- Large title: "Your 2025 Football Wrapped"
- Subtitle: "Select your name to see your stats"
- Searchable dropdown with all player names
- Fun background animation (floating footballs, subtle particles)

### 3. Loading Animation

- After selection, show 2-3 second "generating" animation
- Messages like "Crunching the numbers...", "Analyzing your games...", "Preparing your wrapped..."
- Progress bar or spinning football

### 4. Story Cards (Click/Tap through)

- Full-screen cards, one stat at a time
- Tap anywhere or click arrow to proceed
- Progress dots at top (like Instagram stories)
- Each card has entrance animation

### 5. Scroll Section

- Smooth scroll with reveal animations
- Charts animate in when scrolled into view
- Sections clearly separated

### 6. Summary Card Section

- Final "Your 2025 Wrapped" card
- Designed for screenshots (16:9 or 9:16 aspect ratio option)
- "Screenshot & Share!" prompt
- Optional: Download button using html-to-image

---

## Animation Details

### Entry Animations

- Fade in + slide up for text
- Count-up animation for numbers
- Scale + bounce for rank reveals
- Confetti burst for achievements

### Transitions

- Smooth page transitions between story cards
- Parallax effects on scroll
- Charts draw themselves when in view

### Micro-interactions

- Hover effects on interactive elements
- Button press feedback
- Progress indicators

---

## Color Palette (Spotify-Dark Style)

```css
/* Base */
--bg-primary: #121212;
--bg-secondary: #181818;
--bg-card: #282828;

/* Text */
--text-primary: #ffffff;
--text-secondary: #b3b3b3;

/* Accents */
--accent-green: #1db954; /* Spotify green - for positive */
--accent-gold: #ffd700; /* Gold - for achievements */
--accent-red: #e74c3c; /* Red - for negative changes */
--accent-blue: #3498db; /* Blue - for neutral highlights */

/* Gradients */
--gradient-hero: linear-gradient(135deg, #1db954, #191414);
--gradient-card: linear-gradient(180deg, #282828, #181818);
```

---

## Responsive Design

- **Mobile-first** approach
- Story cards: Full screen on mobile, centered card on desktop
- Charts: Horizontal scroll on mobile if needed
- Summary card: Optimized for phone screenshots (9:16)
- Touch-friendly tap targets

---

## File Structure

```
football-wrapped/
├── public/
│   └── favicon.ico
├── src/
│   ├── components/
│   │   ├── Header.jsx
│   │   ├── PlayerSelect.jsx
│   │   ├── LoadingAnimation.jsx
│   │   ├── StoryCard.jsx
│   │   ├── StorySection.jsx
│   │   ├── ScrollSection.jsx
│   │   ├── MonthlyChart.jsx
│   │   ├── ComparisonChart.jsx
│   │   ├── StatCard.jsx
│   │   ├── AchievementBadge.jsx
│   │   ├── SummaryCard.jsx
│   │   └── LanguageToggle.jsx
│   ├── data/
│   │   └── players.json
│   ├── hooks/
│   │   └── usePlayerStats.js
│   ├── i18n/
│   │   ├── i18n.js
│   │   ├── en.json
│   │   └── bg.json
│   ├── utils/
│   │   ├── calculations.js
│   │   └── helpers.js
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
├── index.html
├── package.json
├── tailwind.config.js
└── vite.config.js
```

---

## Deployment

### Netlify Setup

1. Push code to GitHub repository
2. Connect repo to Netlify
3. Build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
4. Deploy!

### Custom Domain (Optional)

- Can use free Netlify subdomain: `sabotno-futbolche.netlify.app`
- Or connect custom domain if you have one

---

## Future Enhancements (Optional)

- [ ] Add sound effects for reveals
- [ ] Social media share buttons
- [ ] Compare with another player mode
- [ ] All-time stats (not just 2024-2025)
- [ ] Leaderboard view
- [ ] PWA support for "Add to Home Screen"

---

## Summary

This app will provide a fun, engaging way for ~40-50 football players to view their 2025 season statistics in a Spotify Wrapped-style experience. Key features include animated stat reveals, beautiful charts, fun comparisons, and an easy-to-screenshot summary card for sharing.

The tech stack (React + Vite + Tailwind + Framer Motion) ensures fast development and smooth performance, while static hosting on Netlify keeps costs at zero.
