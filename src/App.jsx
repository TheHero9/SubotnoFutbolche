import { useState, useMemo } from 'react';
import Header from './components/Header';
import PlayerSelect from './components/PlayerSelect';
import LoadingAnimation from './components/LoadingAnimation';
import StorySection from './components/StorySection';
import ScrollSection from './components/ScrollSection';
import playersData from './data/players.json';
import { processPlayerData } from './utils/calculations';

function App() {
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showStories, setShowStories] = useState(false);

  // Process player data on mount (calculate totals, ranks, monthly breakdowns from raw dates)
  // This allows players.json to contain only raw data (name, dates2024, dates2025, rank2024)
  // while all other fields are calculated in the app
  const processedPlayers = useMemo(() => {
    // Check if data is already processed (has total2025 field)
    if (playersData.players[0]?.total2025 !== undefined) {
      return playersData.players; // Already processed
    }
    // Process raw data
    return processPlayerData(playersData.players);
  }, []);

  const handlePlayerSelect = (playerName) => {
    setIsLoading(true);
    // Simulate data processing
    setTimeout(() => {
      const player = processedPlayers.find(p => p.name === playerName);
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
          players={processedPlayers}
          onSelect={handlePlayerSelect}
        />
      )}

      {isLoading && <LoadingAnimation />}

      {selectedPlayer && showStories && (
        <StorySection
          player={selectedPlayer}
          totalPlayers={processedPlayers.length}
          onComplete={handleStoriesComplete}
        />
      )}

      {selectedPlayer && !showStories && !isLoading && (
        <ScrollSection
          player={selectedPlayer}
          totalPlayers={processedPlayers.length}
        />
      )}
    </div>
  );
}

export default App;
