import React, { useState, useMemo } from 'react';
import type { ProcessedPlayer, PlayersData } from './types';
import Header from './components/Header';
import PlayerSelect from './components/PlayerSelect';
import LoadingAnimation from './components/LoadingAnimation';
import StorySection from './components/StorySection';
import ScrollSection from './components/ScrollSection';
import playersDataRaw from './data/players.json';
import { processPlayerData } from './utils/calculations';

const playersData = playersDataRaw as PlayersData;

function App(): JSX.Element {
  const [selectedPlayer, setSelectedPlayer] = useState<ProcessedPlayer | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showStories, setShowStories] = useState<boolean>(false);

  // Process player data on mount (calculate totals, ranks, monthly breakdowns from raw dates)
  // This allows players.json to contain only raw data (name, dates2024, dates2025, rank2024)
  // while all other fields are calculated in the app
  const processedPlayers = useMemo<ProcessedPlayer[]>(() => {
    // Check if data is already processed (has total2025 field)
    const firstPlayer = playersData.players[0] as ProcessedPlayer | undefined;
    if (firstPlayer?.total2025 !== undefined) {
      return playersData.players as ProcessedPlayer[]; // Already processed
    }
    // Process raw data
    return processPlayerData(playersData.players);
  }, []);

  const handlePlayerSelect = (playerName: string): void => {
    setIsLoading(true);
    // Simulate data processing
    setTimeout(() => {
      const player = processedPlayers.find(p => p.name === playerName);
      if (player) {
        setSelectedPlayer(player);
        setIsLoading(false);
        setShowStories(true);
      }
    }, 2500);
  };

  const handleStoriesComplete = (): void => {
    setShowStories(false);
  };

  const handleReset = (): void => {
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
          allPlayers={processedPlayers}
        />
      )}
    </div>
  );
}

export default App;
