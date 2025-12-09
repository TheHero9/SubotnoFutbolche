# Step 02: Base Layout & App Structure

## Objective
Create the main app structure, routing logic, header component, and state management.

## Tasks

### 1. Create App State Management
Update `src/App.jsx`:

```jsx
import { useState } from 'react';
import Header from './components/Header';
import PlayerSelect from './components/PlayerSelect';
import LoadingAnimation from './components/LoadingAnimation';
import StorySection from './components/StorySection';
import ScrollSection from './components/ScrollSection';
import playersData from './data/players.json';

function App() {
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showStories, setShowStories] = useState(false);

  const handlePlayerSelect = (playerName) => {
    setIsLoading(true);
    // Simulate data processing
    setTimeout(() => {
      const player = playersData.players.find(p => p.name === playerName);
      setSelectedPlayer(player);
      setIsLoading(false);
      setShowStories(true);
    }, 2500);
  };

  const handleStoriesComplete = () => {
    setShowStories(false);
  };

  const handleReset = () => {
    setSelectedPlayer(null);
    setShowStories(false);
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-bg-primary">
      <Header onReset={handleReset} />

      {!selectedPlayer && !isLoading && (
        <PlayerSelect
          players={playersData.players}
          onSelect={handlePlayerSelect}
        />
      )}

      {isLoading && <LoadingAnimation />}

      {selectedPlayer && showStories && (
        <StorySection
          player={selectedPlayer}
          totalPlayers={playersData.totalPlayers}
          onComplete={handleStoriesComplete}
        />
      )}

      {selectedPlayer && !showStories && !isLoading && (
        <ScrollSection
          player={selectedPlayer}
          totalPlayers={playersData.totalPlayers}
        />
      )}
    </div>
  );
}

export default App;
```

### 2. Create Header Component
Create `src/components/Header.jsx`:

```jsx
import { useTranslation } from 'react-i18next';
import LanguageToggle from './LanguageToggle';

const Header = ({ onReset }) => {
  const { t } = useTranslation();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-bg-secondary/80 backdrop-blur-sm border-b border-bg-card">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <button
          onClick={onReset}
          className="text-xl font-bold text-accent-green hover:text-accent-gold transition-colors"
        >
          {t('header.title')}
        </button>

        <LanguageToggle />
      </div>
    </header>
  );
};

export default Header;
```

### 3. Create Language Toggle Component (Placeholder)
Create `src/components/LanguageToggle.jsx`:

```jsx
import { useTranslation } from 'react-i18next';

const LanguageToggle = () => {
  const { i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'bg' ? 'en' : 'bg';
    i18n.changeLanguage(newLang);
  };

  return (
    <button
      onClick={toggleLanguage}
      className="px-4 py-2 rounded-lg bg-bg-card hover:bg-accent-green/20 transition-colors text-sm font-semibold"
    >
      {i18n.language === 'bg' ? 'EN' : 'BG'}
    </button>
  );
};

export default LanguageToggle;
```

### 4. Create Placeholder Components
These will be built in later steps, but create empty files now:

`src/components/PlayerSelect.jsx`:
```jsx
const PlayerSelect = ({ players, onSelect }) => {
  return <div>PlayerSelect - To be implemented in step 04</div>;
};

export default PlayerSelect;
```

`src/components/LoadingAnimation.jsx`:
```jsx
const LoadingAnimation = () => {
  return <div>LoadingAnimation - To be implemented in step 05</div>;
};

export default LoadingAnimation;
```

`src/components/StorySection.jsx`:
```jsx
const StorySection = ({ player, totalPlayers, onComplete }) => {
  return <div>StorySection - To be implemented in step 06</div>;
};

export default StorySection;
```

`src/components/ScrollSection.jsx`:
```jsx
const ScrollSection = ({ player, totalPlayers }) => {
  return <div>ScrollSection - To be implemented in step 07</div>;
};

export default ScrollSection;
```

## Expected Outcome
- App structure with state management
- Header with reset functionality
- Language toggle component
- Placeholder components for future development
- App flow: Selection → Loading → Stories → Scroll

## Next Step
Proceed to `03-i18n.md`
