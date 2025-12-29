import type {
  Player,
  ProcessedPlayer,
  MonthlyData,
  RankTitle,
  RankChange,
  BestWorstMonths,
  BestWorstSeason,
  StreakData,
  Language,
  MonthKey,
  GameRecord,
  CommunityStatsRaw,
  CommunityStatsCalculated,
} from "../types";

type RankTitleMap = Record<Language, Record<string, RankTitle>>;

const RANK_TITLES: RankTitleMap = {
  bg: {
    "1": {
      title: "Легендата",
      description: "Ако погледнеш нагоре, няма други",
    },
    "2-5": {
      title: "Голяма машина",
      description:
        "В златната петорка на футбола, носите положението всяка седмица",
    },
    "6-10": {
      title: "Много сериозен",
      description:
        "От най-сериозните участници, с по-малко личен живот можеше и в петицата",
    },
    "11-20": {
      title: "Редовен играч",
      description: "Идвате на вълни, но винаги спасявате положението",
    },
    "21-30": {
      title: "Любител на играта",
      description:
        "Твърде много ангажименти никога не са на добре, особенно, ако футболчето страда заради това",
    },
    "31+": {
      title: "Заета личност",
      description:
        "От време на време идвате да се видите с приятели, понякога се включвате и в мачовете",
    },
  },
  en: {
    "1": {
      title: "The Legend",
      description: "If you look up, there's no one else",
    },
    "2-5": {
      title: "Big Machine",
      description:
        "In the golden five of football, carrying the team every week",
    },
    "6-10": {
      title: "Very Serious",
      description:
        "Among the most serious participants, with less personal life could be in top five",
    },
    "11-20": {
      title: "Regular Player",
      description: "You come in waves, but always save the day",
    },
    "21-30": {
      title: "Game Enthusiast",
      description:
        "Too many commitments is never good, especially when football suffers",
    },
    "31+": {
      title: "Busy Person",
      description:
        "From time to time you come to see friends, sometimes join the matches",
    },
  },
};

const MONTH_MAP: Record<string, MonthKey> = {
  "01": "january",
  "02": "february",
  "03": "march",
  "04": "april",
  "05": "may",
  "06": "june",
  "07": "july",
  "08": "august",
  "09": "september",
  "10": "october",
  "11": "november",
  "12": "december",
};

/**
 * Get player's rank title based on 2025 rank
 */
export const getRankTitle = (
  rank: number,
  language: Language = "bg"
): RankTitle => {
  const lang = RANK_TITLES[language] || RANK_TITLES.bg;

  if (rank === 1) return lang["1"];
  if (rank >= 2 && rank <= 5) return lang["2-5"];
  if (rank >= 6 && rank <= 10) return lang["6-10"];
  if (rank >= 11 && rank <= 20) return lang["11-20"];
  if (rank >= 21 && rank <= 30) return lang["21-30"];
  return lang["31+"];
};

/**
 * Calculate rank change from 2024 to 2025
 * rank2024 = 0 means the player is new (didn't play in 2024)
 */
export const getRankChange = (
  rank2024: number,
  rank2025: number,
  total2024: number = 0
): RankChange => {
  // Player didn't play in 2024
  if (rank2024 === 0 || total2024 === 0) {
    return {
      value: 0,
      direction: "new",
      emoji: "🔙",
    };
  }

  const diff = rank2024 - rank2025;
  return {
    value: Math.abs(diff),
    direction: diff > 0 ? "up" : diff < 0 ? "down" : "same",
    emoji: diff > 0 ? "⬆️" : diff < 0 ? "⬇️" : "🟰",
  };
};

/**
 * Get best and worst months
 */
export const getBestWorstMonths = (
  monthlyGames: MonthlyData
): BestWorstMonths => {
  const entries = Object.entries(monthlyGames);
  const sorted = entries.sort((a, b) => b[1] - a[1]);

  return {
    best: sorted.filter((e) => e[1] > 0).slice(0, 3),
    worst: sorted
      .filter((e) => e[1] === 0 || e[1] === sorted[sorted.length - 1][1])
      .slice(-3),
  };
};

/**
 * Get best season (Winter/Spring/Summer/Autumn)
 */
export const getBestSeason = (monthlyGames: MonthlyData): BestWorstSeason => {
  const seasons = {
    winter:
      monthlyGames.december + monthlyGames.january + monthlyGames.february,
    spring: monthlyGames.march + monthlyGames.april + monthlyGames.may,
    summer: monthlyGames.june + monthlyGames.july + monthlyGames.august,
    autumn:
      monthlyGames.september + monthlyGames.october + monthlyGames.november,
  };

  const sorted = Object.entries(seasons).sort((a, b) => b[1] - a[1]);
  return {
    best: sorted[0] as [string, number],
    worst: sorted[sorted.length - 1] as [string, number],
  };
};

/**
 * Calculate percentile (how many players this player beat)
 */
export const getPercentile = (rank: number, totalPlayers: number): number => {
  return Math.round(((totalPlayers - rank) / totalPlayers) * 100);
};

/**
 * Calculate future projection (games in 10 years)
 */
export const getFutureProjection = (total2025: number): number => {
  return total2025 * 10;
};

/**
 * Calculate monthly games from dates array
 */
export const calculateMonthlyGames = (dates: string[]): MonthlyData => {
  const monthly: MonthlyData = {
    january: 0,
    february: 0,
    march: 0,
    april: 0,
    may: 0,
    june: 0,
    july: 0,
    august: 0,
    september: 0,
    october: 0,
    november: 0,
    december: 0,
  };

  dates.forEach((date) => {
    const [, month] = date.split("/");
    const monthName = MONTH_MAP[month];
    if (monthName) {
      monthly[monthName]++;
    }
  });

  return monthly;
};

/**
 * Calculate total games from dates array
 */
export const calculateTotal = (dates: string[] | undefined): number => {
  return dates ? dates.length : 0;
};

/**
 * Calculate all-time total from multiple date arrays
 */
export const calculateAllTimeTotal = (
  dates2024: string[],
  dates2025: string[]
): number => {
  return calculateTotal(dates2024) + calculateTotal(dates2025);
};

/**
 * Calculate ranks for all players based on 2025 games
 */
export const calculateRanks = (
  players: Player[]
): Partial<ProcessedPlayer>[] => {
  // Calculate totals for each player
  const playersWithTotals = players.map((player) => ({
    ...player,
    total2025: calculateTotal(player.dates2025),
    total2024: calculateTotal(player.dates2024),
  }));

  // Calculate 2024 ranks (only for players who played in 2024)
  const players2024 = playersWithTotals.filter((p) => p.total2024 > 0);
  const sorted2024 = [...players2024].sort((a, b) => b.total2024 - a.total2024);
  const rank2024Map = new Map<string, number>();

  let rank2024 = 1;
  let prevTotal2024: number | null = null;
  sorted2024.forEach((player, index) => {
    if (prevTotal2024 !== null && player.total2024 < prevTotal2024) {
      rank2024 = index + 1;
    }
    prevTotal2024 = player.total2024;
    rank2024Map.set(player.name, rank2024);
  });

  // Sort by 2025 total (descending)
  const sorted = [...playersWithTotals].sort(
    (a, b) => b.total2025 - a.total2025
  );

  // Assign 2025 ranks
  let currentRank = 1;
  let previousTotal: number | null = null;

  return sorted.map((player, index) => {
    // Handle ties - same total gets same rank
    if (previousTotal !== null && player.total2025 < previousTotal) {
      currentRank = index + 1;
    }
    previousTotal = player.total2025;

    // Get 2024 rank - 0 means player didn't play in 2024 (new player)
    const playerRank2024 = rank2024Map.get(player.name) || 0;

    return {
      ...player,
      rank2025: currentRank,
      rank2024: playerRank2024,
    };
  });
};

/**
 * Helper: Parse date string "DD/MM" to Date object
 */
const parseDate = (dateStr: string, year: number = 2025): Date => {
  const [day, month] = dateStr.split("/");
  return new Date(year, parseInt(month) - 1, parseInt(day));
};

/**
 * Helper: Format Date to "DD/MM" (handles single digit dates)
 */
const formatDateToDDMM = (date: Date): string => {
  const day = date.getDate().toString();
  const month = (date.getMonth() + 1).toString();
  return `${day}/${month}`;
};

/**
 * Calculate longest streak for 2025 - only breaks when Saturday is missed
 */
export const calculateLongestStreak2025 = (
  playerDates2025: string[],
  allGameDates2025: string[]
): StreakData => {
  if (!playerDates2025 || playerDates2025.length === 0) {
    return { count: 0, startDate: null, endDate: null, dates: [] };
  }

  // Parse all game dates and filter to Saturdays only
  const allDates = allGameDates2025.map((d) => parseDate(d, 2025));
  const saturdayDates = allDates
    .filter((d) => d.getDay() === 6) // 6 = Saturday
    .sort((a, b) => a.getTime() - b.getTime());

  if (saturdayDates.length === 0) {
    return {
      count: playerDates2025.length,
      startDate: playerDates2025[0],
      endDate: playerDates2025[playerDates2025.length - 1],
      dates: playerDates2025,
    };
  }

  // Create a set for fast lookup
  const playerDatesSet = new Set(playerDates2025);

  let maxStreak: StreakData = {
    count: 0,
    startDate: null,
    endDate: null,
    dates: [],
  };
  let currentStreak = 0;
  let currentStreakDates: string[] = [];
  let lastSaturday: Date | null = null;

  for (const saturday of saturdayDates) {
    const saturdayStr = formatDateToDDMM(saturday);
    const playedThisSaturday = playerDatesSet.has(saturdayStr);

    if (playedThisSaturday) {
      // Add 1 for this Saturday
      let streakIncrement = 1;
      let newDates = [saturdayStr];

      if (lastSaturday) {
        // Count midweek games between last Saturday and this Saturday
        const midweekGames = playerDates2025.filter((dateStr) => {
          const d = parseDate(dateStr, 2025);
          return d > lastSaturday && d < saturday;
        });
        streakIncrement += midweekGames.length;
        newDates = [...midweekGames, saturdayStr];
      } else {
        // First Saturday in this streak - count any games before it
        const gamesBeforeSaturday = playerDates2025.filter((dateStr) => {
          const d = parseDate(dateStr, 2025);
          return d < saturday;
        });
        streakIncrement += gamesBeforeSaturday.length;
        newDates = [...gamesBeforeSaturday, saturdayStr];
      }

      currentStreak += streakIncrement;
      currentStreakDates = [...currentStreakDates, ...newDates];
      lastSaturday = saturday;

      // Update max streak if current is longer
      if (currentStreak > maxStreak.count) {
        maxStreak = {
          count: currentStreak,
          startDate: currentStreakDates[0],
          endDate: currentStreakDates[currentStreakDates.length - 1],
          dates: [...currentStreakDates],
        };
      }
    } else {
      // Missed a Saturday - streak breaks
      currentStreak = 0;
      currentStreakDates = [];
      lastSaturday = null;
    }
  }

  return maxStreak;
};

/**
 * Get all unique game dates from all players for a specific year
 */
const getAllGameDates = (
  players: Player[],
  datesKey: "dates2024" | "dates2025"
): string[] => {
  const allDates = new Set<string>();
  players.forEach((player) => {
    if (player[datesKey]) {
      player[datesKey].forEach((date) => allDates.add(date));
    }
  });
  return Array.from(allDates);
};

/**
 * Process raw player data to add all calculated fields
 */
export const processPlayerData = (rawPlayers: Player[]): ProcessedPlayer[] => {
  // Get all game dates for streak calculation
  const allGameDates2025 = getAllGameDates(rawPlayers, "dates2025");

  // First pass: calculate totals and ranks
  const withRanks = calculateRanks(rawPlayers);

  // Second pass: add monthly breakdowns and longest streak
  return withRanks.map((player) => {
    const streakData = calculateLongestStreak2025(
      player.dates2025 || [],
      allGameDates2025
    );
    return {
      ...player,
      games2024: calculateMonthlyGames(player.dates2024 || []),
      games2025: calculateMonthlyGames(player.dates2025 || []),
      totalAllTime: calculateAllTimeTotal(
        player.dates2024 || [],
        player.dates2025 || []
      ),
      longestStreak2025: streakData.count,
      longestStreakDates: streakData.dates,
      longestStreakStart: streakData.startDate,
      longestStreakEnd: streakData.endDate,
      total2024: player.total2024!,
      total2025: player.total2025!,
      rank2024: player.rank2024!,
      rank2025: player.rank2025!,
      name: player.name,
      dates2024: player.dates2024,
      dates2025: player.dates2025,
    } as ProcessedPlayer;
  });
};

/**
 * Calculate community stats from raw game records
 */
export const calculateCommunityStats = (
  rawStats: CommunityStatsRaw
): CommunityStatsCalculated => {
  const calcYearStats = (games: GameRecord[]) => {
    const playedGames = games.filter((g) => g.played);
    const cancelledGames = games.filter((g) => !g.played);

    // Games per month
    const gamesPerMonth: Record<string, number> = {};
    playedGames.forEach((g) => {
      gamesPerMonth[g.month] = (gamesPerMonth[g.month] || 0) + 1;
    });

    // Fields count
    const fields: Record<string, number> = {};
    playedGames.forEach((g) => {
      if (g.field) {
        fields[g.field] = (fields[g.field] || 0) + 1;
      }
    });

    // Average players
    const totalPlayers = playedGames.reduce(
      (sum, g) => sum + (g.players || 0),
      0
    );
    const avgPlayers =
      playedGames.length > 0 ? totalPlayers / playedGames.length : 0;

    // Success rate
    const successRate =
      games.length > 0 ? (playedGames.length / games.length) * 100 : 0;

    return {
      gamesPlayed: playedGames.length,
      gamesCancelled: cancelledGames.length,
      totalAttempted: games.length,
      avgPlayers: Math.round(avgPlayers * 10) / 10,
      successRate: Math.round(successRate),
      gamesPerMonth,
      fields,
    };
  };

  const stats2024 = calcYearStats(rawStats.games2024);
  const stats2025 = calcYearStats(rawStats.games2025);

  return {
    // 2024
    gamesPlayed2024: stats2024.gamesPlayed,
    gamesCancelled2024: stats2024.gamesCancelled,
    totalAttempted2024: stats2024.totalAttempted,
    avgPlayers2024: stats2024.avgPlayers,
    successRate2024: stats2024.successRate,
    gamesPerMonth2024: stats2024.gamesPerMonth,
    fields2024: stats2024.fields,

    // 2025
    gamesPlayed2025: stats2025.gamesPlayed,
    gamesCancelled2025: stats2025.gamesCancelled,
    totalAttempted2025: stats2025.totalAttempted,
    avgPlayers2025: stats2025.avgPlayers,
    successRate2025: stats2025.successRate,
    gamesPerMonth2025: stats2025.gamesPerMonth,
    fields2025: stats2025.fields,

    // Comparisons
    gamesChange: stats2025.gamesPlayed - stats2024.gamesPlayed,
    avgPlayersChange:
      Math.round((stats2025.avgPlayers - stats2024.avgPlayers) * 10) / 10,
    successRateChange: stats2025.successRate - stats2024.successRate,

    // All time
    totalGamesAllTime: stats2024.gamesPlayed + stats2025.gamesPlayed,
  };
};
