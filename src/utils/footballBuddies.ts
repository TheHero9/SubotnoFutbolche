import type { ProcessedPlayer, FootballBuddy } from '../types';

/**
 * Football Buddies Algorithm
 *
 * Finds the players you play with most often, using an "affinity" score
 * that accounts for attendance frequency to avoid bias toward frequent players.
 *
 * See FOOTBALL_BUDDIES.md for detailed algorithm explanation.
 */

/**
 * Calculate all unique game dates from all players
 */
const getTotalGameDays = (allPlayers: ProcessedPlayer[]): number => {
  const allDates = new Set<string>();
  allPlayers.forEach(p => {
    (p.dates2025 || []).forEach(d => allDates.add(d));
  });
  return allDates.size;
};

/**
 * Calculate overlap between two players' game dates
 */
const calculateOverlap = (dates1: Set<string>, dates2: Set<string>): number => {
  return [...dates1].filter(d => dates2.has(d)).length;
};

/**
 * Calculate affinity score (lift metric)
 *
 * Affinity = actual_overlap / expected_overlap
 * Expected = (player1_games × player2_games) / total_game_days
 *
 * Affinity > 1: Players play together MORE than random chance
 * Affinity = 1: Players play together exactly as expected by chance
 * Affinity < 1: Players play together LESS than random chance
 */
const calculateAffinity = (
  overlap: number,
  player1Games: number,
  player2Games: number,
  totalGameDays: number
): number => {
  const expected = (player1Games * player2Games) / totalGameDays;
  return expected > 0 ? overlap / expected : 0;
};

/**
 * Get football buddies - players you play with most often
 *
 * Uses "affinity" score to find genuine buddies, not just frequent players.
 * Also calculates "influence" - what % of their games you were part of.
 *
 * @param player - The current player
 * @param allPlayers - All players to compare against
 * @param minGamesForStats - Minimum games required for meaningful stats (default: 3)
 * @param minOverlap - Minimum games together required (default: 2)
 * @param topN - Number of buddies to return (default: 5)
 */
export const getFootballBuddies = (
  player: ProcessedPlayer,
  allPlayers: ProcessedPlayer[],
  minGamesForStats: number = 3,
  minOverlap: number = 2,
  topN: number = 5
): FootballBuddy[] => {
  const playerDates = new Set(player.dates2025 || []);

  // Need minimum games for meaningful stats
  if (playerDates.size < minGamesForStats) return [];

  const totalGameDays = getTotalGameDays(allPlayers);
  if (totalGameDays === 0) return [];

  const buddies: FootballBuddy[] = [];

  for (const other of allPlayers) {
    // Skip self
    if (other.name === player.name) continue;

    const otherDates = new Set(other.dates2025 || []);

    // Skip players with too few games
    if (otherDates.size < 2) continue;

    // Calculate overlap
    const overlap = calculateOverlap(playerDates, otherDates);

    // Need minimum games together
    if (overlap < minOverlap) continue;

    // Calculate metrics
    const affinity = calculateAffinity(
      overlap,
      playerDates.size,
      otherDates.size,
      totalGameDays
    );

    const percentageOfYourGames = Math.round((overlap / playerDates.size) * 100);
    const influenceOnThem = Math.round((overlap / otherDates.size) * 100);

    buddies.push({
      name: other.name,
      gamesWithYou: overlap,
      theirTotalGames: otherDates.size,
      percentageOfYourGames,
      influenceOnThem,
      affinity
    });
  }

  // Sort by affinity descending, then by influence as tiebreaker
  buddies.sort((a, b) => {
    // If affinity difference is significant (>10%), use affinity
    if (Math.abs(a.affinity - b.affinity) > 0.1) {
      return b.affinity - a.affinity;
    }
    // Use influence as secondary sort
    if (a.influenceOnThem !== b.influenceOnThem) {
      return b.influenceOnThem - a.influenceOnThem;
    }
    // Finally, use games together
    return b.gamesWithYou - a.gamesWithYou;
  });

  return buddies.slice(0, topN);
};

/**
 * Get players you have highest influence on
 *
 * Finds players where YOU were part of the highest percentage of THEIR games.
 * Great for showing "cornerstone" effect - who relies on your attendance.
 *
 * @param player - The current player
 * @param allPlayers - All players to compare against
 * @param minTheirGames - Minimum games the other player must have (default: 3)
 * @param topN - Number of results to return (default: 5)
 */
export const getPlayersYouInfluence = (
  player: ProcessedPlayer,
  allPlayers: ProcessedPlayer[],
  minTheirGames: number = 3,
  topN: number = 5
): FootballBuddy[] => {
  const playerDates = new Set(player.dates2025 || []);

  if (playerDates.size < 2) return [];

  const totalGameDays = getTotalGameDays(allPlayers);
  const influenced: FootballBuddy[] = [];

  for (const other of allPlayers) {
    if (other.name === player.name) continue;

    const otherDates = new Set(other.dates2025 || []);

    // Only consider players with enough games
    if (otherDates.size < minTheirGames) continue;

    const overlap = calculateOverlap(playerDates, otherDates);
    if (overlap < 2) continue;

    const influenceOnThem = Math.round((overlap / otherDates.size) * 100);
    const percentageOfYourGames = Math.round((overlap / playerDates.size) * 100);
    const affinity = calculateAffinity(
      overlap,
      playerDates.size,
      otherDates.size,
      totalGameDays
    );

    influenced.push({
      name: other.name,
      gamesWithYou: overlap,
      theirTotalGames: otherDates.size,
      percentageOfYourGames,
      influenceOnThem,
      affinity
    });
  }

  // Sort by influence descending
  influenced.sort((a, b) => b.influenceOnThem - a.influenceOnThem);

  return influenced.slice(0, topN);
};
