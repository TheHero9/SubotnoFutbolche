# Step 10: Polish Styling & Animations

## Objective
Final polish: confetti effects, micro-interactions, and overall styling improvements.

## Tasks

### 1. Install Confetti Library
```bash
npm install canvas-confetti
npm install -D @types/canvas-confetti
```

### 2. Add Confetti to Rank Reveal
Update `src/components/StorySection.jsx` to add confetti when rank is revealed:

```jsx
// Add import at top
import confetti from 'canvas-confetti';

// In the rank story (Story 3), add confetti trigger:
// Modify the rank story content to include useEffect

import { useEffect } from 'react'; // Add to imports

// In the StorySection component, add this effect:
useEffect(() => {
  if (currentStory === 2) { // Rank reveal story
    // Trigger confetti
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#1db954', '#ffd700', '#ffffff']
    });
  }
}, [currentStory]);
```

### 3. Add Scroll-to-Top Button
Create `src/components/ScrollToTop.jsx`:

```jsx
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ScrollToTop = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0 }}
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 z-50 bg-accent-green hover:bg-accent-gold text-bg-primary p-4 rounded-full shadow-lg transition-colors"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 10l7-7m0 0l7 7m-7-7v18"
            />
          </svg>
        </motion.button>
      )}
    </AnimatePresence>
  );
};

export default ScrollToTop;
```

### 4. Add ScrollToTop to ScrollSection
Update `src/components/ScrollSection.jsx`:

```jsx
// Add import
import ScrollToTop from './ScrollToTop';

// Add component at the end of the return statement
return (
  <div className="min-h-screen pt-24 pb-16 px-4">
    {/* ... existing content ... */}
    <ScrollToTop />
  </div>
);
```

### 5. Add Custom Fonts (Optional)
Update `index.html` to include Google Fonts:

```html
<head>
  <!-- ... existing head content ... -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;900&display=swap" rel="stylesheet">
</head>
```

Update `tailwind.config.js`:

```js
theme: {
  extend: {
    fontFamily: {
      sans: ['Inter', 'system-ui', 'sans-serif'],
    },
    // ... rest of config
  }
}
```

### 6. Add Smooth Page Transitions
Update `src/index.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  * {
    scroll-behavior: smooth;
  }

  body {
    @apply bg-bg-primary text-text-primary font-sans;
    margin: 0;
    padding: 0;
    overflow-x: hidden;
  }

  /* Custom scrollbar */
  ::-webkit-scrollbar {
    width: 10px;
  }

  ::-webkit-scrollbar-track {
    background: #181818;
  }

  ::-webkit-scrollbar-thumb {
    background: #1db954;
    border-radius: 5px;
  }

  ::-webkit-scrollbar-thumb:hover {
    background: #1ed760;
  }
}

@layer utilities {
  .gradient-text {
    @apply bg-gradient-to-r from-accent-green to-accent-gold bg-clip-text text-transparent;
  }
}
```

### 7. Add Loading State for Images
If you add player photos later, create an image loader component:

Create `src/components/ImageLoader.jsx`:

```jsx
import { useState } from 'react';
import { motion } from 'framer-motion';

const ImageLoader = ({ src, alt, className }) => {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div className="relative">
      {!isLoaded && (
        <div className={`${className} bg-bg-card animate-pulse`} />
      )}
      <motion.img
        src={src}
        alt={alt}
        className={className}
        onLoad={() => setIsLoaded(true)}
        initial={{ opacity: 0 }}
        animate={{ opacity: isLoaded ? 1 : 0 }}
        transition={{ duration: 0.3 }}
      />
    </div>
  );
};

export default ImageLoader;
```

## Expected Outcome
- Confetti animation on rank reveal
- Scroll-to-top button
- Custom scrollbar styled to match theme
- Smooth page transitions
- Custom fonts (Inter)
- All animations polished
- Professional, cohesive feel

## Next Step
Proceed to `11-deployment.md`
