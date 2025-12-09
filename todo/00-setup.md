# Step 00: Project Setup

## Objective
Initialize a React + Vite project with all necessary dependencies and folder structure.

## Tasks

### 1. Initialize Vite React Project
```bash
npm create vite@latest . -- --template react
npm install
```

### 2. Install Dependencies
```bash
npm install tailwindcss postcss autoprefixer
npm install framer-motion
npm install i18next react-i18next
npm install chart.js react-chartjs-2
npm install html-to-image
npm install react-select
```

### 3. Install Dev Dependencies
```bash
npm install -D @types/react @types/react-dom
```

### 4. Initialize Tailwind CSS
```bash
npx tailwindcss init -p
```

### 5. Configure Tailwind
Update `tailwind.config.js`:
```js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'bg-primary': '#121212',
        'bg-secondary': '#181818',
        'bg-card': '#282828',
        'text-primary': '#ffffff',
        'text-secondary': '#b3b3b3',
        'accent-green': '#1db954',
        'accent-gold': '#ffd700',
        'accent-red': '#e74c3c',
        'accent-blue': '#3498db',
      },
    },
  },
  plugins: [],
}
```

### 6. Create Folder Structure
Create these folders in `src/`:
- `src/components/`
- `src/data/`
- `src/hooks/`
- `src/i18n/`
- `src/utils/`

### 7. Update src/index.css
Replace contents with Tailwind directives and base styles:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body {
    @apply bg-bg-primary text-text-primary font-sans;
    margin: 0;
    padding: 0;
  }
}
```

### 8. Verify Setup
```bash
npm run dev
```

## Expected Outcome
- Vite dev server running
- All dependencies installed
- Tailwind configured with custom color palette
- Folder structure created
- Ready for component development

## Next Step
Proceed to `01-data-structure.md`
