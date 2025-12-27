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

export interface CommunityStreakData {
  streakLength: number;
  startDate: string | null;
  endDate: string | null;
  startYear: number;
  endYear: number;
  dates: { date: string; year: number }[];
  spansYears: boolean;  // True if streak crosses 2024-2025
}

export interface SquadMatch {
  players: string[];           // The player names
  occurrences: number;         // How many times this exact squad played together
  dates: string[];             // Dates when they played together
}

export interface SquadSizeResult {
  squadSize: number;
  squads: SquadMatch[];        // All squads of this size with 2+ occurrences (sorted by occurrences desc)
  bestOccurrences: number;     // Highest occurrence count for this size
}

export interface RepeatSquadData {
  bestMatch: { squadSize: number; squad: SquadMatch } | null;  // The largest squad with 2+ occurrences
  allResults: SquadSizeResult[]; // Results for all searched sizes
}

export interface ActiveMonthsData {
  activeCount: number;       // Months with at least 1 game
  totalMonths: number;       // Total months in year (12 or months passed)
  monthsList: string[];      // List of active month names
}

export interface BestSeasonData {
  season: 'winter' | 'spring' | 'summer' | 'autumn';
  games: number;
  emoji: string;
}

export interface TrioFinderResult {
  players: string[];
  gamesTogether: number;
  dates: string[];
  playerGames: number[];    // Each player's total games [p1, p2, p3]
  maxPossibleMeetings: number;  // Min of all 3 players' games (theoretical max overlap)
  meetingRate: number;      // gamesTogether / maxPossibleMeetings as percentage
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

  // Only count players who have played at least one game in 2025
  const activePlayers = allPlayers.filter(p =>
    p.name !== playerName && (p.dates2025?.length || 0) > 0
  );

  // For each other active player, check if they share any dates
  activePlayers.forEach(otherPlayer => {
    const otherDates = otherPlayer.dates2025 || [];

    // Check if any dates overlap
    for (const date of otherDates) {
      if (playerDatesSet.has(date)) {
        playedWith.add(otherPlayer.name);
        break; // Found at least one shared game, move to next player
      }
    }
  });

  const totalPlayersCount = activePlayers.length;
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

// ============================================
// COMMUNITY STREAK (2024-2025)
// ============================================

/**
 * Calculate longest consecutive streak of community games spanning 2024-2025
 *
 * Combines games from both years and finds the longest streak
 * A streak is broken when a scheduled game is cancelled (played: false)
 */
export const calculateCommunityStreak = (
  games2024: GameRecord[],
  games2025: GameRecord[]
): CommunityStreakData => {
  // Combine games from both years with year info
  const allGames: { game: GameRecord; year: number }[] = [
    ...games2024.map(g => ({ game: g, year: 2024 })),
    ...games2025.map(g => ({ game: g, year: 2025 }))
  ];

  // Sort by date (month first, then day)
  // Since games are already in chronological order within each year,
  // and 2024 comes before 2025, they should already be sorted
  // But let's make sure by sorting properly
  allGames.sort((a, b) => {
    if (a.year !== b.year) return a.year - b.year;
    const [dayA, monthA] = a.game.date.split('/').map(Number);
    const [dayB, monthB] = b.game.date.split('/').map(Number);
    if (monthA !== monthB) return monthA - monthB;
    return dayA - dayB;
  });

  let maxStreak = 0;
  let maxStreakDates: { date: string; year: number }[] = [];
  let currentStreak = 0;
  let currentStreakDates: { date: string; year: number }[] = [];

  for (const { game, year } of allGames) {
    if (game.played) {
      currentStreak++;
      currentStreakDates.push({ date: game.date, year });

      if (currentStreak > maxStreak) {
        maxStreak = currentStreak;
        maxStreakDates = [...currentStreakDates];
      }
    } else {
      // Game was cancelled - streak breaks
      currentStreak = 0;
      currentStreakDates = [];
    }
  }

  const spansYears = maxStreakDates.length > 0 &&
    maxStreakDates[0].year !== maxStreakDates[maxStreakDates.length - 1].year;

  return {
    streakLength: maxStreak,
    startDate: maxStreakDates.length > 0 ? maxStreakDates[0].date : null,
    endDate: maxStreakDates.length > 0 ? maxStreakDates[maxStreakDates.length - 1].date : null,
    startYear: maxStreakDates.length > 0 ? maxStreakDates[0].year : 0,
    endYear: maxStreakDates.length > 0 ? maxStreakDates[maxStreakDates.length - 1].year : 0,
    dates: maxStreakDates,
    spansYears
  };
};

// ============================================
// REPEAT SQUADS
// ============================================

/**
 * Find groups of players that played together multiple times
 *
 * Algorithm:
 * 1. For each game date, get the set of players who played
 * 2. For each squad size from maxSize down to minSize, find all possible
 *    combinations of that size within each game's lineup
 * 3. Track which combinations appear on multiple dates
 * 4. Return ALL squads with 2+ occurrences per size (for interactive UI)
 */
export const calculateRepeatSquads = (
  allPlayers: ProcessedPlayer[],
  communityGames: GameRecord[],
  minSize: number = 7,
  maxSize: number = 14,
  maxSquadsPerSize: number = 5
): RepeatSquadData => {
  const playedGameDates = getPlayedGameDates(communityGames);
  const allResults: SquadSizeResult[] = [];
  let bestMatch: { squadSize: number; squad: SquadMatch } | null = null;

  // Build a map: date -> set of player names who played
  const dateToPlayers: Map<string, Set<string>> = new Map();

  for (const date of playedGameDates) {
    const playersOnDate = new Set<string>();
    for (const player of allPlayers) {
      if ((player.dates2025 || []).includes(date)) {
        playersOnDate.add(player.name);
      }
    }
    if (playersOnDate.size > 0) {
      dateToPlayers.set(date, playersOnDate);
    }
  }

  // For each squad size from max down to min, look for repeat lineups
  for (let squadSize = maxSize; squadSize >= minSize; squadSize--) {
    // Map: sorted player names joined -> list of dates
    const lineupToDate: Map<string, string[]> = new Map();

    // First check exact matches
    for (const [date, players] of dateToPlayers) {
      if (players.size === squadSize) {
        const signature = [...players].sort().join('|');
        const dates = lineupToDate.get(signature) || [];
        dates.push(date);
        lineupToDate.set(signature, dates);
      }
    }

    // Also check subset combinations (for games with more players)
    for (const [date, players] of dateToPlayers) {
      if (players.size > squadSize) {
        const playerArr = [...players];
        const combinations = getCombinations(playerArr, squadSize);

        for (const combo of combinations) {
          const signature = combo.sort().join('|');
          const dates = lineupToDate.get(signature) || [];
          if (!dates.includes(date)) {
            dates.push(date);
            lineupToDate.set(signature, dates);
          }
        }
      }
    }

    // Collect ALL squads with 2+ occurrences
    const squadsForSize: SquadMatch[] = [];

    for (const [signature, dates] of lineupToDate) {
      if (dates.length >= 2) {
        squadsForSize.push({
          players: signature.split('|'),
          occurrences: dates.length,
          dates
        });
      }
    }

    // Sort by occurrences (descending) and limit
    squadsForSize.sort((a, b) => b.occurrences - a.occurrences);
    const topSquads = squadsForSize.slice(0, maxSquadsPerSize);

    const result: SquadSizeResult = {
      squadSize,
      squads: topSquads,
      bestOccurrences: topSquads.length > 0 ? topSquads[0].occurrences : 0
    };

    allResults.push(result);

    // Track best overall match (largest size with 2+ occurrences)
    if (topSquads.length > 0 && bestMatch === null) {
      bestMatch = { squadSize, squad: topSquads[0] };
    }
  }

  return { bestMatch, allResults };
};

/**
 * Generate all combinations of k elements from array
 */
function getCombinations<T>(arr: T[], k: number): T[][] {
  if (k === 0) return [[]];
  if (arr.length === 0) return [];
  if (k > arr.length) return [];

  // Limit iterations to prevent performance issues
  if (arr.length > 16 && k > 10) {
    // For large arrays, just return empty to skip
    return [];
  }

  const [first, ...rest] = arr;
  const withFirst = getCombinations(rest, k - 1).map(combo => [first, ...combo]);
  const withoutFirst = getCombinations(rest, k);
  return [...withFirst, ...withoutFirst];
}

// ============================================
// ACTIVE MONTHS
// ============================================

/**
 * Calculate how many months the player was active in 2025
 */
export const calculateActiveMonths = (
  playerDates: string[],
  communityGames: GameRecord[]
): ActiveMonthsData => {
  const monthNames = [
    'january', 'february', 'march', 'april', 'may', 'june',
    'july', 'august', 'september', 'october', 'november', 'december'
  ];

  // Get unique months player played in
  const activeMonthsSet = new Set<number>();
  playerDates.forEach(date => {
    const [, month] = date.split('/').map(Number);
    activeMonthsSet.add(month);
  });

  // Get months where community had games
  const communityMonthsSet = new Set<number>();
  communityGames.filter(g => g.played).forEach(g => {
    const [, month] = g.date.split('/').map(Number);
    communityMonthsSet.add(month);
  });

  const activeMonths = Array.from(activeMonthsSet).sort((a, b) => a - b);
  const monthsList = activeMonths.map(m => monthNames[m - 1]);

  return {
    activeCount: activeMonths.length,
    totalMonths: communityMonthsSet.size,
    monthsList
  };
};

// ============================================
// BEST SEASON
// ============================================

/**
 * Calculate player's best season based on games played
 *
 * Seasons:
 * - Winter: December, January, February
 * - Spring: March, April, May
 * - Summer: June, July, August
 * - Autumn: September, October, November
 */
export const calculateBestSeason = (
  playerDates: string[]
): BestSeasonData => {
  const seasonMap: Record<string, { season: 'winter' | 'spring' | 'summer' | 'autumn'; emoji: string }> = {
    '12': { season: 'winter', emoji: '❄️' },
    '1': { season: 'winter', emoji: '❄️' },
    '2': { season: 'winter', emoji: '❄️' },
    '3': { season: 'spring', emoji: '🌸' },
    '4': { season: 'spring', emoji: '🌸' },
    '5': { season: 'spring', emoji: '🌸' },
    '6': { season: 'summer', emoji: '☀️' },
    '7': { season: 'summer', emoji: '☀️' },
    '8': { season: 'summer', emoji: '☀️' },
    '9': { season: 'autumn', emoji: '🍂' },
    '10': { season: 'autumn', emoji: '🍂' },
    '11': { season: 'autumn', emoji: '🍂' }
  };

  const seasonCounts: Record<string, number> = {
    winter: 0,
    spring: 0,
    summer: 0,
    autumn: 0
  };

  playerDates.forEach(date => {
    const [, month] = date.split('/').map(Number);
    const seasonInfo = seasonMap[month.toString()];
    if (seasonInfo) {
      seasonCounts[seasonInfo.season]++;
    }
  });

  // Find best season
  let bestSeason: 'winter' | 'spring' | 'summer' | 'autumn' = 'winter';
  let maxGames = 0;

  (Object.keys(seasonCounts) as Array<'winter' | 'spring' | 'summer' | 'autumn'>).forEach(season => {
    if (seasonCounts[season] > maxGames) {
      maxGames = seasonCounts[season];
      bestSeason = season;
    }
  });

  const emojiMap: Record<string, string> = {
    winter: '❄️',
    spring: '🌸',
    summer: '☀️',
    autumn: '🍂'
  };

  return {
    season: bestSeason,
    games: maxGames,
    emoji: emojiMap[bestSeason]
  };
};

// ============================================
// TRIO FINDER
// ============================================

/**
 * Calculate when 3 selected players have played together
 *
 * Returns:
 * - Number of games all 3 played together
 * - Specific dates
 * - Coverage: % of total games where at least one of them played
 */
export const calculateTrioStats = (
  player1Name: string,
  player2Name: string,
  player3Name: string,
  allPlayers: ProcessedPlayer[],
  _communityGames: GameRecord[]
): TrioFinderResult => {
  const p1 = allPlayers.find(p => p.name === player1Name);
  const p2 = allPlayers.find(p => p.name === player2Name);
  const p3 = allPlayers.find(p => p.name === player3Name);

  if (!p1 || !p2 || !p3) {
    return {
      players: [player1Name, player2Name, player3Name],
      gamesTogether: 0,
      dates: [],
      playerGames: [0, 0, 0],
      maxPossibleMeetings: 0,
      meetingRate: 0
    };
  }

  const dates1 = new Set(p1.dates2025 || []);
  const dates2 = new Set(p2.dates2025 || []);
  const dates3 = new Set(p3.dates2025 || []);

  const p1Games = dates1.size;
  const p2Games = dates2.size;
  const p3Games = dates3.size;

  // Find dates where all 3 played
  const togetherDates: string[] = [];
  dates1.forEach(date => {
    if (dates2.has(date) && dates3.has(date)) {
      togetherDates.push(date);
    }
  });

  // Sort dates chronologically
  togetherDates.sort((a, b) => {
    const [dayA, monthA] = a.split('/').map(Number);
    const [dayB, monthB] = b.split('/').map(Number);
    if (monthA !== monthB) return monthA - monthB;
    return dayA - dayB;
  });

  // Max possible meetings is constrained by the player with fewest games
  const maxPossibleMeetings = Math.min(p1Games, p2Games, p3Games);
  const meetingRate = maxPossibleMeetings > 0
    ? Math.round((togetherDates.length / maxPossibleMeetings) * 100)
    : 0;

  return {
    players: [player1Name, player2Name, player3Name],
    gamesTogether: togetherDates.length,
    dates: togetherDates,
    playerGames: [p1Games, p2Games, p3Games],
    maxPossibleMeetings,
    meetingRate
  };
};

// ============================================
// PLAYER MOVEMENT (Risers, Fallers, Newcomers)
// ============================================

export interface PlayerMovement {
  name: string;
  games2024: number;
  games2025: number;
  change: number;  // Positive = rise, negative = fall
}

export interface PlayerMovementData {
  risers: PlayerMovement[];      // Top 3 biggest increases (must have played in 2024)
  fallers: PlayerMovement[];     // Top 3 biggest decreases (must have played in 2024)
  newcomers: string[];           // Players with 0 games in 2024 but games in 2025
}

/**
 * Calculate player movement between 2024 and 2025
 *
 * - Risers: Players who increased their games the most (must have played in 2024)
 * - Fallers: Players who decreased their games the most (must have played in 2024)
 * - Newcomers: Players who didn't play in 2024 but play in 2025
 *
 * @param excludeNewcomers - Array of player names to exclude from newcomers (e.g., they played in 2023)
 */
export const calculatePlayerMovement = (
  allPlayers: ProcessedPlayer[],
  excludeNewcomers: string[] = []
): PlayerMovementData => {
  const excludeSet = new Set(excludeNewcomers);

  // Players who played in 2024
  const returning = allPlayers.filter(p => p.total2024 > 0 && p.total2025 > 0);

  // Calculate changes
  const withChanges: PlayerMovement[] = returning.map(p => ({
    name: p.name,
    games2024: p.total2024,
    games2025: p.total2025,
    change: p.total2025 - p.total2024
  }));

  // Sort by change (descending for risers)
  const sortedByRise = [...withChanges].sort((a, b) => b.change - a.change);
  const risers = sortedByRise.filter(p => p.change > 0).slice(0, 3);

  // Sort by change (ascending for fallers)
  const sortedByFall = [...withChanges].sort((a, b) => a.change - b.change);
  const fallers = sortedByFall.filter(p => p.change < 0).slice(0, 3);

  // Newcomers: played in 2025 but not in 2024
  const newcomers = allPlayers
    .filter(p => p.total2024 === 0 && p.total2025 > 0)
    .filter(p => !excludeSet.has(p.name))
    .map(p => p.name)
    .sort();

  return { risers, fallers, newcomers };
};
