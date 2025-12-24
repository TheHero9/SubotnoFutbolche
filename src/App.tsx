import React, { useState, useMemo } from 'react';
import type { ProcessedPlayer, PlayersData, CommunityStatsRaw } from './types';
import Header from './components/Header';
import PlayerSelect from './components/PlayerSelect';
import LoadingAnimation from './components/LoadingAnimation';
import QuizPrompt from './components/QuizPrompt';
import AnnualQuiz from './components/AnnualQuiz';
import StorySection from './components/StorySection';
import ScrollSection from './components/ScrollSection';
import AnimatedBackground from './components/AnimatedBackground';
import playersDataRaw from './data/players.json';
import communityStatsRaw from './data/communityStats.json';
import { processPlayerData } from './utils/calculations';
import type { QuizResult } from './utils/quizCalculations';

const communityStats = communityStatsRaw as CommunityStatsRaw;

const playersData = playersDataRaw as PlayersData;

function App(): JSX.Element {
  const [selectedPlayer, setSelectedPlayer] = useState<ProcessedPlayer | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showQuizPrompt, setShowQuizPrompt] = useState<boolean>(false);
  const [showQuiz, setShowQuiz] = useState<boolean>(false);
  const [showStories, setShowStories] = useState<boolean>(false);
  const [quizResults, setQuizResults] = useState<QuizResult | null>(null);

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
        setShowQuizPrompt(true);
      }
    }, 2500);
  };

  const handleTakeQuiz = (): void => {
    setShowQuizPrompt(false);
    setShowQuiz(true);
  };

  const handleSkipQuiz = (): void => {
    setShowQuizPrompt(false);
    setShowStories(true);
  };

  const handleQuizComplete = (results: QuizResult): void => {
    setQuizResults(results);
    setShowQuiz(false);
    setShowStories(true);
  };

  const handleStoriesComplete = (): void => {
    setShowStories(false);
  };

  const handleReset = (): void => {
    setSelectedPlayer(null);
    setShowQuizPrompt(false);
    setShowQuiz(false);
    setShowStories(false);
    setIsLoading(false);
    setQuizResults(null);
  };

  return (
    <div className="min-h-screen relative">
      <AnimatedBackground />
      <div className="relative" style={{ zIndex: 1 }}>
        <Header onReset={handleReset} />

      {!selectedPlayer && !isLoading && (
        <PlayerSelect
          players={processedPlayers}
          onSelect={handlePlayerSelect}
        />
      )}

      {isLoading && <LoadingAnimation />}

      {selectedPlayer && showQuizPrompt && !showQuiz && (
        <QuizPrompt
          playerName={selectedPlayer.name}
          onTakeQuiz={handleTakeQuiz}
          onSkip={handleSkipQuiz}
        />
      )}

      {selectedPlayer && showQuiz && (
        <AnnualQuiz
          player={selectedPlayer}
          allPlayers={processedPlayers}
          games2024={communityStats.games2024}
          games2025={communityStats.games2025}
          onClose={handleQuizComplete}
        />
      )}

      {selectedPlayer && showStories && (
        <StorySection
          player={selectedPlayer}
          totalPlayers={processedPlayers.length}
          allPlayers={processedPlayers}
          onComplete={handleStoriesComplete}
        />
      )}

      {selectedPlayer && !showStories && !isLoading && !showQuizPrompt && !showQuiz && (
        <ScrollSection
          player={selectedPlayer}
          totalPlayers={processedPlayers.length}
          allPlayers={processedPlayers}
          quizResults={quizResults}
        />
      )}
      </div>
    </div>
  );
}

export default App;
