# Step 06: Story Section (Click-through Cards)

## Objective
Create Instagram-style story cards that reveal key stats one at a time.

## Tasks

### 1. Create StoryCard Component
Create `src/components/StoryCard.jsx`:

```jsx
import { motion } from 'framer-motion';

const StoryCard = ({ children, onNext }) => {
  return (
    <motion.div
      className="fixed inset-0 bg-gradient-to-br from-bg-secondary via-bg-primary to-bg-secondary flex items-center justify-center cursor-pointer z-40"
      onClick={onNext}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ duration: 0.3 }}
    >
      <div className="text-center px-4 max-w-2xl">
        {children}
      </div>

      {/* Tap to continue hint */}
      <div className="absolute bottom-8 left-0 right-0 text-center">
        <motion.p
          className="text-text-secondary text-sm"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          Tap to continue →
        </motion.p>
      </div>
    </motion.div>
  );
};

export default StoryCard;
```

### 2. Update StorySection Component
Replace `src/components/StorySection.jsx`:

```jsx
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import StoryCard from './StoryCard';
import { getRankTitle, getRankChange } from '../utils/calculations';

const StorySection = ({ player, totalPlayers, onComplete }) => {
  const { t, i18n } = useTranslation();
  const [currentStory, setCurrentStory] = useState(0);

  const rankChange = getRankChange(player.rank2024, player.rank2025);
  const rankTitle = getRankTitle(player.rank2025, i18n.language);

  const stories = [
    // Story 1: Welcome
    {
      content: (
        <div>
          <motion.h1
            className="text-6xl md:text-8xl font-bold mb-4"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", duration: 0.8 }}
          >
            {player.name}
          </motion.h1>
          <motion.p
            className="text-4xl text-accent-gold"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            {t('story.welcome')}
          </motion.p>
        </div>
      )
    },
    // Story 2: Total games
    {
      content: (
        <div>
          <motion.p
            className="text-2xl text-text-secondary mb-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {t('story.gamesPlayed')}
          </motion.p>
          <motion.div
            className="text-9xl font-bold text-accent-green mb-4"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", duration: 1 }}
          >
            {player.total2025}
          </motion.div>
          <motion.p
            className="text-3xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            {t('story.games')}
          </motion.p>
        </div>
      )
    },
    // Story 3: Rank
    {
      content: (
        <div>
          <motion.p
            className="text-2xl text-text-secondary mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {t('story.rank')}
          </motion.p>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", duration: 0.8 }}
          >
            <div className="text-8xl font-bold text-accent-gold mb-4">
              #{player.rank2025}
            </div>
            <div className="text-2xl text-text-secondary">
              {t('story.outOf')} {totalPlayers} {t('story.players')}
            </div>
          </motion.div>
          <motion.div
            className="mt-8 text-xl text-accent-green"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            {rankTitle.title}
          </motion.div>
          <motion.p
            className="text-text-secondary mt-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            {rankTitle.description}
          </motion.p>
        </div>
      )
    },
    // Story 4: Rank change
    {
      content: (
        <div>
          <motion.p
            className="text-2xl text-text-secondary mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {t('story.rankChange')}
          </motion.p>
          <motion.div
            className="text-9xl mb-4"
            initial={{ scale: 0, rotate: rankChange.direction === 'up' ? -180 : 180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", duration: 1 }}
          >
            {rankChange.emoji}
          </motion.div>
          <motion.p
            className={`text-4xl font-bold ${
              rankChange.direction === 'up' ? 'text-accent-green' :
              rankChange.direction === 'down' ? 'text-accent-red' :
              'text-accent-blue'
            }`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            {rankChange.direction === 'up' && `${t('story.rankUp')} ${rankChange.value} ${rankChange.value === 1 ? t('story.position') : t('story.positions')}`}
            {rankChange.direction === 'down' && `${t('story.rankDown')} ${rankChange.value} ${rankChange.value === 1 ? t('story.position') : t('story.positions')}`}
            {rankChange.direction === 'same' && t('story.rankSame')}
          </motion.p>
        </div>
      )
    }
  ];

  const handleNext = () => {
    if (currentStory < stories.length - 1) {
      setCurrentStory(prev => prev + 1);
    } else {
      onComplete();
    }
  };

  return (
    <div className="fixed inset-0 z-40">
      {/* Progress indicators */}
      <div className="fixed top-20 left-0 right-0 z-50 flex gap-1 px-4">
        {stories.map((_, index) => (
          <div
            key={index}
            className="flex-1 h-1 bg-bg-card rounded-full overflow-hidden"
          >
            <motion.div
              className="h-full bg-accent-green"
              initial={{ width: 0 }}
              animate={{ width: index <= currentStory ? "100%" : "0%" }}
              transition={{ duration: 0.3 }}
            />
          </div>
        ))}
      </div>

      {/* Story cards */}
      <AnimatePresence mode="wait">
        <StoryCard key={currentStory} onNext={handleNext}>
          {stories[currentStory].content}
        </StoryCard>
      </AnimatePresence>
    </div>
  );
};

export default StorySection;
```

## Expected Outcome
- 4 full-screen story cards
- Progress indicators at top
- Tap/click anywhere to advance
- Smooth animations for each card
- Shows: Welcome, Total Games, Rank, Rank Change

## Next Step
Proceed to `07-scroll-section.md`
