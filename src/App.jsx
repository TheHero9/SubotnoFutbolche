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
    <div className="min-h-screen" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
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
