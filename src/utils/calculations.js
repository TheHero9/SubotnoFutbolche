/**
 * Get player's rank title based on 2025 rank
 */
export const getRankTitle = (rank, language = 'bg') => {
  const titles = {
    bg: {
      1: { title: 'Легендата', description: 'Ако погледнеш нагоре, няма други' },
      '2-5': { title: 'Голяма машина', description: 'В златната петорка на футбола, носите положението всяка седмица' },
      '6-10': { title: 'Много сериозен', description: 'От най-сериозните участници, с по-малко личен живот можеше и в петицата' },
      '11-20': { title: 'Редовен играч', description: 'Идвате на вълни, но винаги спасявате положението' },
      '21-30': { title: 'Любител на играта', description: 'От време на време идвате да се видите с приятели, понякога се включвате и в мачовете' },
      '31+': { title: 'Заета личност', description: 'Твърде много ангажименти никога не са на добре, особенно, ако футболчето страда заради това' }
    },
    en: {
      1: { title: 'The Legend', description: 'If you look up, there\'s no one else' },
      '2-5': { title: 'Big Machine', description: 'In the golden five of football, carrying the team every week' },
      '6-10': { title: 'Very Serious', description: 'Among the most serious participants, with less personal life could be in top five' },
      '11-20': { title: 'Regular Player', description: 'You come in waves, but always save the day' },
      '21-30': { title: 'Game Enthusiast', description: 'From time to time you come to see friends, sometimes join the matches' },
      '31+': { title: 'Busy Person', description: 'Too many commitments is never good, especially when football suffers' }
    }
  };

  const lang = titles[language] || titles.bg;

  if (rank === 1) return lang[1];
  if (rank >= 2 && rank <= 5) return lang['2-5'];
  if (rank >= 6 && rank <= 10) return lang['6-10'];
  if (rank >= 11 && rank <= 20) return lang['11-20'];
  if (rank >= 21 && rank <= 30) return lang['21-30'];
  return lang['31+'];
};

/**
 * Calculate rank change from 2024 to 2025
 */
export const getRankChange = (rank2024, rank2025) => {
  const diff = rank2024 - rank2025;
  return {
    value: Math.abs(diff),
    direction: diff > 0 ? 'up' : diff < 0 ? 'down' : 'same',
    emoji: diff > 0 ? '⬆️' : diff < 0 ? '⬇️' : '🟰'
  };
};

/**
 * Get best and worst months
 */
export const getBestWorstMonths = (monthlyGames) => {
  const entries = Object.entries(monthlyGames);
  const sorted = entries.sort((a, b) => b[1] - a[1]);

  return {
    best: sorted.filter(e => e[1] > 0).slice(0, 3),
    worst: sorted.filter(e => e[1] === 0 || e[1] === sorted[sorted.length - 1][1]).slice(-3)
  };
};

/**
 * Get best season (Winter/Spring/Summer/Autumn)
 */
export const getBestSeason = (monthlyGames) => {
  const seasons = {
    winter: monthlyGames.december + monthlyGames.january + monthlyGames.february,
    spring: monthlyGames.march + monthlyGames.april + monthlyGames.may,
    summer: monthlyGames.june + monthlyGames.july + monthlyGames.august,
    autumn: monthlyGames.september + monthlyGames.october + monthlyGames.november
  };

  const sorted = Object.entries(seasons).sort((a, b) => b[1] - a[1]);
  return {
    best: sorted[0],
    worst: sorted[sorted.length - 1]
  };
};

/**
 * Calculate percentile (how many players this player beat)
 */
export const getPercentile = (rank, totalPlayers) => {
  return Math.round(((totalPlayers - rank) / totalPlayers) * 100);
};

/**
 * Calculate future projection (games in 10 years)
 */
export const getFutureProjection = (total2025) => {
  return total2025 * 10;
};

/**
 * Calculate monthly games from dates array
 * @param {string[]} dates - Array of dates in format "DD/MM"
 * @returns {Object} - Monthly breakdown {january: 3, february: 2, ...}
 */
export const calculateMonthlyGames = (dates) => {
  const monthly = {
    january: 0, february: 0, march: 0, april: 0,
    may: 0, june: 0, july: 0, august: 0,
    september: 0, october: 0, november: 0, december: 0
  };

  const monthMap = {
    '01': 'january', '02': 'february', '03': 'march', '04': 'april',
    '05': 'may', '06': 'june', '07': 'july', '08': 'august',
    '09': 'september', '10': 'october', '11': 'november', '12': 'december'
  };

  dates.forEach(date => {
    const [day, month] = date.split('/');
    const monthName = monthMap[month];
    if (monthName) {
      monthly[monthName]++;
    }
  });

  return monthly;
};

/**
 * Calculate total games from dates array
 * @param {string[]} dates - Array of dates
 * @returns {number} - Total count
 */
export const calculateTotal = (dates) => {
  return dates ? dates.length : 0;
};

/**
 * Calculate all-time total from multiple date arrays
 * @param {string[]} dates2024
 * @param {string[]} dates2025
 * @returns {number}
 */
export const calculateAllTimeTotal = (dates2024, dates2025) => {
  return calculateTotal(dates2024) + calculateTotal(dates2025);
};

/**
 * Calculate ranks for all players based on 2025 games
 * @param {Array} players - Array of player objects with dates2025
 * @returns {Array} - Players with calculated ranks
 */
export const calculateRanks = (players) => {
  // Calculate totals for each player
  const playersWithTotals = players.map(player => ({
    ...player,
    total2025: calculateTotal(player.dates2025),
    total2024: calculateTotal(player.dates2024)
  }));

  // Sort by 2025 total (descending)
  const sorted = [...playersWithTotals].sort((a, b) => b.total2025 - a.total2025);

  // Assign ranks
  let currentRank = 1;
  let previousTotal = null;

  return sorted.map((player, index) => {
    // Handle ties - same total gets same rank
    if (previousTotal !== null && player.total2025 < previousTotal) {
      currentRank = index + 1;
    }
    previousTotal = player.total2025;

    return {
      ...player,
      rank2025: currentRank,
      // For 2024 rank, we'll need to calculate separately or store it
      rank2024: player.rank2024 || currentRank // Keep existing if available
    };
  });
};

/**
 * Helper: Parse date string "DD/MM" to Date object
 */
const parseDate = (dateStr, year = 2025) => {
  const [day, month] = dateStr.split('/');
  return new Date(year, parseInt(month) - 1, parseInt(day));
};

/**
 * Helper: Format Date to "DD/MM" (handles single digit dates)
 */
const formatDateToDDMM = (date) => {
  const day = date.getDate().toString();
  const month = (date.getMonth() + 1).toString();
  return `${day}/${month}`;
};

/**
 * Calculate longest streak for 2025 - only breaks when Saturday is missed
 * @param {string[]} playerDates2025 - Player's 2025 dates
 * @param {string[]} allGameDates2025 - All game dates from all players
 * @returns {Object} - { count, startDate, endDate, dates }
 */
export const calculateLongestStreak2025 = (playerDates2025, allGameDates2025) => {
  if (!playerDates2025 || playerDates2025.length === 0) {
    return { count: 0, startDate: null, endDate: null, dates: [] };
  }

  // Parse all game dates and filter to Saturdays only
  const allDates = allGameDates2025.map(d => parseDate(d, 2025));
  const saturdayDates = allDates
    .filter(d => d.getDay() === 6) // 6 = Saturday
    .sort((a, b) => a - b);

  if (saturdayDates.length === 0) {
    return {
      count: playerDates2025.length,
      startDate: playerDates2025[0],
      endDate: playerDates2025[playerDates2025.length - 1],
      dates: playerDates2025
    };
  }

  // Create a set for fast lookup
  const playerDatesSet = new Set(playerDates2025);

  let maxStreak = { count: 0, startDate: null, endDate: null, dates: [] };
  let currentStreak = 0;
  let currentStreakDates = [];
  let lastSaturday = null;

  for (const saturday of saturdayDates) {
    const saturdayStr = formatDateToDDMM(saturday);
    const playedThisSaturday = playerDatesSet.has(saturdayStr);

    if (playedThisSaturday) {
      // Add 1 for this Saturday
      let streakIncrement = 1;
      let newDates = [saturdayStr];

      if (lastSaturday) {
        // Count midweek games between last Saturday and this Saturday
        const midweekGames = playerDates2025.filter(dateStr => {
          const d = parseDate(dateStr, 2025);
          return d > lastSaturday && d < saturday;
        });
        streakIncrement += midweekGames.length;
        newDates = [...midweekGames, saturdayStr];
      } else {
        // First Saturday in this streak - count any games before it
        const gamesBeforeSaturday = playerDates2025.filter(dateStr => {
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
          dates: [...currentStreakDates]
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
 * @param {Array} players - All players
 * @param {string} datesKey - 'dates2024' or 'dates2025'
 * @returns {string[]} - Unique sorted dates
 */
const getAllGameDates = (players, datesKey) => {
  const allDates = new Set();
  players.forEach(player => {
    if (player[datesKey]) {
      player[datesKey].forEach(date => allDates.add(date));
    }
  });
  return Array.from(allDates);
};

/**
 * Process raw player data to add all calculated fields
 * @param {Array} rawPlayers - Players with only name and dates arrays
 * @returns {Array} - Enriched players with all calculated stats
 */
export const processPlayerData = (rawPlayers) => {
  // Get all game dates for streak calculation
  const allGameDates2025 = getAllGameDates(rawPlayers, 'dates2025');

  // First pass: calculate totals and ranks
  const withRanks = calculateRanks(rawPlayers);

  // Second pass: add monthly breakdowns and longest streak
  return withRanks.map(player => {
    const streakData = calculateLongestStreak2025(player.dates2025 || [], allGameDates2025);
    return {
      ...player,
      games2024: calculateMonthlyGames(player.dates2024 || []),
      games2025: calculateMonthlyGames(player.dates2025 || []),
      totalAllTime: calculateAllTimeTotal(player.dates2024, player.dates2025),
      longestStreak2025: streakData.count,
      longestStreakDates: streakData.dates,
      longestStreakStart: streakData.startDate,
      longestStreakEnd: streakData.endDate
    };
  });
};
