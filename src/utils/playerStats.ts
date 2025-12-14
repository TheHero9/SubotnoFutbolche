import type { ProcessedPlayer, GameRecord } from '../types';

/**
 * Player Statistics Calculations
 *
 * Advanced stats that are hard to calculate manually:
 * - Consistency Score
 * - Clutch Appearances
 * - Peak Performance (consecutive games streak)
 * - Perfect Months
 * - Dynamic Duos (for community)
 */

// ============================================
// TYPES
// ============================================

export interface ConsistencyData {
  score: number;           // 0-100, higher = more consistent
  rating: 'very_consistent' | 'consistent' | 'moderate' | 'irregular';
  avgGamesGap: number;     // Average community games between player's participations
  maxGap: number;          // Longest gap without playing (in days)
}

export interface ClutchData {
  clutchGames: number;     // Games attended with low attendance
  totalLowGames: number;   // Total low attendance games that happened
  clutchRate: number;      // Percentage of low games you attended
  gamesSaved: number;      // Games where your attendance was critical
}

export interface PeakPerformanceData {
  streakLength: number;    // Consecutive community games attended
  startDate: string | null;
  endDate: string | null;
  dates: string[];
}

export interface PerfectMonthData {
  month: string;
  gamesPlayed: number;
  totalGames: number;
}

export interface DynamicDuo {
  player1: string;
  player2: string;
  gamesTogethers: number;
  mutualRate: number;      // Average of both players' overlap percentages
  player1Rate: number;     // % of player1's games with player2
  player2Rate: number;     // % of player2's games with player1
}

export interface RareDuo {
  player1: string;
  player2: string;
  player1Games: number;
  player2Games: number;
  totalGames: number;      // Combined games they could have played together
  gamesTogethers: number;  // How many times they actually played together
  rarityScore: number;     // Higher = more rare (both play a lot, rarely together)
  overlapRate: number;     // % of possible overlap they actually have
}

export interface SocialButterflyData {
  uniquePlayersCount: number;
  totalPlayersCount: number;
  percentage: number;
  playedWith: Set<string>;  // Names of players played with
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get all played game dates from community stats
 */
export const getPlayedGameDates = (games: GameRecord[]): string[] => {
  return games
    .filter(g => g.played)
    .map(g => g.date)
    .sort((a, b) => {
      const [dayA, monthA] = a.split('/').map(Number);
      const [dayB, monthB] = b.split('/').map(Number);
      if (monthA !== monthB) return monthA - monthB;
      return dayA - dayB;
    });
};

/**
 * Get games per month from community stats
 */
const getGamesPerMonth = (games: GameRecord[]): Record<string, number> => {
  const perMonth: Record<string, number> = {};
  games.filter(g => g.played).forEach(g => {
    perMonth[g.month] = (perMonth[g.month] || 0) + 1;
  });
  return perMonth;
};

/**
 * Parse date string to comparable format
 */
const parseDate = (dateStr: string, year: number = 2025): Date => {
  const [day, month] = dateStr.split('/').map(Number);
  return new Date(year, month - 1, day);
};

// ============================================
// CONSISTENCY SCORE
// ============================================

/**
 * Calculate consistency score based on regularity of attendance
 *
 * Factors:
 * - Variance in monthly games (lower = better)
 * - Average gap between games (lower = better)
 * - Max gap without playing (lower = better)
 */
export const calculateConsistency = (
  playerDates: string[],
  communityGames: GameRecord[]
): ConsistencyData => {
  if (playerDates.length < 3) {
    return { score: 0, rating: 'irregular', avgGamesGap: 0, maxGap: 0 };
  }

  const playerDatesSet = new Set(playerDates);
  const playedGameDates = getPlayedGameDates(communityGames);

  // Calculate games gap between player's participations
  const gamesGaps: number[] = [];
  let lastPlayedIndex = -1;

  for (let i = 0; i < playedGameDates.length; i++) {
    if (playerDatesSet.has(playedGameDates[i])) {
      if (lastPlayedIndex !== -1) {
        // Number of community games between this participation and last
        const gamesSkipped = i - lastPlayedIndex - 1;
        gamesGaps.push(gamesSkipped);
      }
      lastPlayedIndex = i;
    }
  }

  const avgGamesGap = gamesGaps.length > 0
    ? gamesGaps.reduce((a, b) => a + b, 0) / gamesGaps.length
    : 0;

  // Calculate max days gap for additional context
  const sortedDates = [...playerDates].sort((a, b) => {
    const dateA = parseDate(a);
    const dateB = parseDate(b);
    return dateA.getTime() - dateB.getTime();
  });

  let maxGap = 0;
  for (let i = 1; i < sortedDates.length; i++) {
    const prev = parseDate(sortedDates[i - 1]);
    const curr = parseDate(sortedDates[i]);
    const daysDiff = Math.round((curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24));
    if (daysDiff > maxGap) maxGap = daysDiff;
  }

  // Calculate monthly variance
  const playedGamesPerMonth = getGamesPerMonth(communityGames);
  const playerGamesPerMonth: Record<string, number> = {};

  playerDates.forEach(date => {
    const [, month] = date.split('/');
    const monthNum = parseInt(month);
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                        'July', 'August', 'September', 'October', 'November', 'December'];
    const monthName = monthNames[monthNum - 1];
    playerGamesPerMonth[monthName] = (playerGamesPerMonth[monthName] || 0) + 1;
  });

  // Calculate attendance rate per month
  const monthlyRates: number[] = [];
  Object.keys(playedGamesPerMonth).forEach(month => {
    const communityGamesInMonth = playedGamesPerMonth[month] || 0;
    const playerGamesInMonth = playerGamesPerMonth[month] || 0;
    if (communityGamesInMonth > 0) {
      monthlyRates.push(playerGamesInMonth / communityGamesInMonth);
    }
  });

  // Calculate variance of monthly rates
  const avgRate = monthlyRates.length > 0
    ? monthlyRates.reduce((a, b) => a + b, 0) / monthlyRates.length
    : 0;
  const variance = monthlyRates.length > 0
    ? monthlyRates.reduce((sum, rate) => sum + Math.pow(rate - avgRate, 2), 0) / monthlyRates.length
    : 1;

  // Score calculation (0-100)
  // Lower variance = higher score
  // Lower avgGamesGap = higher score (0 is perfect, meaning no skipped games)
  const varianceScore = Math.max(0, 100 - variance * 200);
  const gapScore = Math.max(0, 100 - avgGamesGap * 20); // 0 skipped is 100, 5 skipped is 0
  const score = Math.round((varianceScore * 0.6 + gapScore * 0.4));

  let rating: ConsistencyData['rating'];
  if (score >= 80) rating = 'very_consistent';
  else if (score >= 60) rating = 'consistent';
  else if (score >= 40) rating = 'moderate';
  else rating = 'irregular';

  return {
    score: Math.min(100, Math.max(0, score)),
    rating,
    avgGamesGap: Math.round(avgGamesGap * 10) / 10,
    maxGap
  };
};

// ============================================
// CLUTCH PLAYER
// ============================================

/**
 * Calculate clutch appearances - games attended when attendance was low
 *
 * "Clutch" = attended games where total players were below average
 * "Saved" = games where attendance was exactly at minimum (e.g., 10 players)
 */
export const calculateClutchAppearances = (
  playerDates: string[],
  communityGames: GameRecord[],
  minimumPlayers: number = 10
): ClutchData => {
  const playerDatesSet = new Set(playerDates);
  const playedGames = communityGames.filter(g => g.played && g.players !== null);

  if (playedGames.length === 0) {
    return { clutchGames: 0, totalLowGames: 0, clutchRate: 0, gamesSaved: 0 };
  }

  // Calculate average attendance
  const avgPlayers = playedGames.reduce((sum, g) => sum + (g.players || 0), 0) / playedGames.length;

  // Find low attendance games (below average)
  const lowAttendanceGames = playedGames.filter(g => (g.players || 0) < avgPlayers);

  // Count player's clutch appearances
  let clutchGames = 0;
  let gamesSaved = 0;

  lowAttendanceGames.forEach(game => {
    if (playerDatesSet.has(game.date)) {
      clutchGames++;
      // "Saved" = was at minimum threshold
      if (game.players === minimumPlayers) {
        gamesSaved++;
      }
    }
  });

  const clutchRate = lowAttendanceGames.length > 0
    ? Math.round((clutchGames / lowAttendanceGames.length) * 100)
    : 0;

  return {
    clutchGames,
    totalLowGames: lowAttendanceGames.length,
    clutchRate,
    gamesSaved
  };
};

// ============================================
// PEAK PERFORMANCE (CONSECUTIVE GAMES STREAK)
// ============================================

/**
 * Calculate longest streak of consecutive COMMUNITY games attended
 *
 * Only counts games that actually happened (played: true)
 * Streak breaks when player misses a game that was played
 */
export const calculatePeakPerformance = (
  playerDates: string[],
  communityGames: GameRecord[]
): PeakPerformanceData => {
  const playerDatesSet = new Set(playerDates);
  const playedGameDates = getPlayedGameDates(communityGames);

  if (playedGameDates.length === 0 || playerDates.length === 0) {
    return { streakLength: 0, startDate: null, endDate: null, dates: [] };
  }

  let maxStreak = 0;
  let maxStreakDates: string[] = [];
  let currentStreak = 0;
  let currentStreakDates: string[] = [];

  for (const gameDate of playedGameDates) {
    if (playerDatesSet.has(gameDate)) {
      currentStreak++;
      currentStreakDates.push(gameDate);

      if (currentStreak > maxStreak) {
        maxStreak = currentStreak;
        maxStreakDates = [...currentStreakDates];
      }
    } else {
      // Player missed a game - streak breaks
      currentStreak = 0;
      currentStreakDates = [];
    }
  }

  return {
    streakLength: maxStreak,
    startDate: maxStreakDates.length > 0 ? maxStreakDates[0] : null,
    endDate: maxStreakDates.length > 0 ? maxStreakDates[maxStreakDates.length - 1] : null,
    dates: maxStreakDates
  };
};

// ============================================
// PERFECT MONTHS
// ============================================

/**
 * Find months where player attended ALL community games
 */
export const calculatePerfectMonths = (
  playerDates: string[],
  communityGames: GameRecord[]
): PerfectMonthData[] => {
  const playerDatesSet = new Set(playerDates);
  const playedGames = communityGames.filter(g => g.played);

  // Group games by month
  const gamesByMonth: Record<string, GameRecord[]> = {};
  playedGames.forEach(game => {
    if (!gamesByMonth[game.month]) {
      gamesByMonth[game.month] = [];
    }
    gamesByMonth[game.month].push(game);
  });

  const perfectMonths: PerfectMonthData[] = [];

  // Check each month
  const monthOrder = ['January', 'February', 'March', 'April', 'May', 'June',
                      'July', 'August', 'September', 'October', 'November', 'December'];

  monthOrder.forEach(month => {
    const monthGames = gamesByMonth[month] || [];
    if (monthGames.length === 0) return;

    const playerGamesInMonth = monthGames.filter(g => playerDatesSet.has(g.date)).length;

    if (playerGamesInMonth === monthGames.length) {
      perfectMonths.push({
        month,
        gamesPlayed: playerGamesInMonth,
        totalGames: monthGames.length
      });
    }
  });

  return perfectMonths;
};

// ============================================
// DYNAMIC DUOS (COMMUNITY STAT)
// ============================================

/**
 * Find pairs of players who almost always play together
 *
 * Mutual rate = average of both players' overlap percentages
 * High mutual rate = genuine duo
 */
export const calculateDynamicDuos = (
  allPlayers: ProcessedPlayer[],
  minGames: number = 5,
  minMutualRate: number = 50
): DynamicDuo[] => {
  const duos: DynamicDuo[] = [];

  // Compare all pairs
  for (let i = 0; i < allPlayers.length; i++) {
    for (let j = i + 1; j < allPlayers.length; j++) {
      const player1 = allPlayers[i];
      const player2 = allPlayers[j];

      const dates1 = new Set(player1.dates2025 || []);
      const dates2 = new Set(player2.dates2025 || []);

      // Skip if either player has too few games
      if (dates1.size < minGames || dates2.size < minGames) continue;

      // Calculate overlap
      const overlap = [...dates1].filter(d => dates2.has(d)).length;
      if (overlap < 3) continue;

      const player1Rate = Math.round((overlap / dates1.size) * 100);
      const player2Rate = Math.round((overlap / dates2.size) * 100);
      const mutualRate = Math.round((player1Rate + player2Rate) / 2);

      duos.push({
        player1: player1.name,
        player2: player2.name,
        gamesTogethers: overlap,
        mutualRate,
        player1Rate,
        player2Rate
      });
    }
  }

  // Sort by mutual rate descending
  duos.sort((a, b) => b.mutualRate - a.mutualRate);

  // Filter by minimum mutual rate
  return duos.filter(duo => duo.mutualRate >= minMutualRate);
};

// ============================================
// ATTENDANCE RATE
// ============================================

/**
 * Calculate overall attendance rate
 */
export const calculateAttendanceRate = (
  playerDates: string[],
  communityGames: GameRecord[]
): number => {
  const playedGames = communityGames.filter(g => g.played);
  if (playedGames.length === 0) return 0;
  return Math.round((playerDates.length / playedGames.length) * 100);
};

// ============================================
// RARE DUOS (COMMUNITY STAT)
// ============================================

/**
 * Find pairs of players who both play frequently but rarely together
 *
 * Rarity score = (player1Games + player2Games) / (gamesTogethers + 1)
 * Higher score = both play a lot but rarely overlap
 */
export const calculateRareDuos = (
  allPlayers: ProcessedPlayer[],
  minGames: number = 8,
  maxOverlapRate: number = 30
): RareDuo[] => {
  const duos: RareDuo[] = [];

  // Compare all pairs
  for (let i = 0; i < allPlayers.length; i++) {
    for (let j = i + 1; j < allPlayers.length; j++) {
      const player1 = allPlayers[i];
      const player2 = allPlayers[j];

      const dates1 = new Set(player1.dates2025 || []);
      const dates2 = new Set(player2.dates2025 || []);

      // Both players need to have played enough games
      if (dates1.size < minGames || dates2.size < minGames) continue;

      // Calculate overlap
      const overlap = [...dates1].filter(d => dates2.has(d)).length;

      // Calculate the maximum possible overlap (smaller of the two)
      const maxPossibleOverlap = Math.min(dates1.size, dates2.size);
      const overlapRate = Math.round((overlap / maxPossibleOverlap) * 100);

      // Skip if they play together too often
      if (overlapRate > maxOverlapRate) continue;

      // Rarity score: more combined games + less overlap = higher score
      const totalGames = dates1.size + dates2.size;
      const rarityScore = Math.round(totalGames / (overlap + 1));

      duos.push({
        player1: player1.name,
        player2: player2.name,
        player1Games: dates1.size,
        player2Games: dates2.size,
        totalGames,
        gamesTogethers: overlap,
        rarityScore,
        overlapRate
      });
    }
  }

  // Sort by rarity score descending (most rare first)
  duos.sort((a, b) => b.rarityScore - a.rarityScore);

  return duos.slice(0, 10);
};

// ============================================
// SOCIAL BUTTERFLY
// ============================================

/**
 * Calculate how many unique players someone has played with
 *
 * For each game the player attended, find all other players
 * who also attended that game
 */
export const calculateSocialButterfly = (
  playerName: string,
  playerDates: string[],
  allPlayers: ProcessedPlayer[]
): SocialButterflyData => {
  const playerDatesSet = new Set(playerDates);
  const playedWith = new Set<string>();

  // For each other player, check if they share any dates
  allPlayers.forEach(otherPlayer => {
    if (otherPlayer.name === playerName) return;

    const otherDates = otherPlayer.dates2025 || [];

    // Check if any dates overlap
    for (const date of otherDates) {
      if (playerDatesSet.has(date)) {
        playedWith.add(otherPlayer.name);
        break; // Found at least one shared game, move to next player
      }
    }
  });

  const totalPlayersCount = allPlayers.length - 1; // Exclude self
  const uniquePlayersCount = playedWith.size;
  const percentage = totalPlayersCount > 0
    ? Math.round((uniquePlayersCount / totalPlayersCount) * 100)
    : 0;

  return {
    uniquePlayersCount,
    totalPlayersCount,
    percentage,
    playedWith
  };
};
