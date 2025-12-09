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
