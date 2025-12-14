// Player data types
export interface Player {
  name: string;
  dates2024: string[];
  dates2025: string[];
}

export interface ProcessedPlayer extends Player {
  total2024: number;
  total2025: number;
  totalAllTime: number;
  rank2024: number;
  rank2025: number;
  games2024: MonthlyData;
  games2025: MonthlyData;
  longestStreak2025: number;
  longestStreakDates: string[];
  longestStreakStart: string | null;
  longestStreakEnd: string | null;
}

export interface PlayersData {
  players: Player[];
}

// Rank and title types
export interface RankTitle {
  title: string;
  description: string;
}

export interface RankChange {
  value: number;
  direction: 'up' | 'down' | 'same';
  emoji: string;
}

export interface BestWorstMonths {
  best: [string, number][];
  worst: [string, number][];
}

export interface BestWorstSeason {
  best: [string, number];
  worst: [string, number];
}

export interface StreakData {
  count: number;
  startDate: string | null;
  endDate: string | null;
  dates: string[];
}

export interface FootballBuddy {
  name: string;
  gamesWithYou: number;
  theirTotalGames: number;
  percentageOfYourGames: number;   // What % of YOUR games were with them
  influenceOnThem: number;         // What % of THEIR games you were part of (your influence!)
  affinity: number;                // Lift metric: actual overlap / expected overlap
  impactScore: number;             // Weighted score: influence% × √gamesWithYou (prioritizes more games)
}

export type Language = 'bg' | 'en';
export type MonthKey = 'january' | 'february' | 'march' | 'april' | 'may' | 'june' |
                       'july' | 'august' | 'september' | 'october' | 'november' | 'december';
export type SeasonKey = 'winter' | 'spring' | 'summer' | 'autumn';

export interface MonthlyData {
  [month: string]: number;
}

// Component props types
export interface HeaderProps {
  onReset: () => void;
}

export interface PlayerSelectProps {
  players: ProcessedPlayer[];
  onSelect: (playerName: string) => void;
}

export interface StoryCardProps {
  children: React.ReactNode;
  onNext: () => void;
  onPrev?: () => void;
  canGoBack?: boolean;
}

export interface AchievementBadgeProps {
  icon: string;
  text: string;
  delay?: number;
}

export interface StatCardProps {
  children: React.ReactNode;
  delay?: number;
  asGift?: boolean;
  giftTheme?: 'yellow' | 'green' | 'purple';
}

export interface MonthlyChartProps {
  data: MonthlyData;
  year: string;
}

export interface ComparisonChartProps {
  data2024: MonthlyData;
  data2025: MonthlyData;
}

export interface SummaryCardProps {
  player: ProcessedPlayer;
  totalPlayers: number;
}

export interface ScrollSectionProps {
  player: ProcessedPlayer;
  totalPlayers: number;
  allPlayers: ProcessedPlayer[];
}

export interface StorySectionProps {
  player: ProcessedPlayer;
  totalPlayers: number;
  allPlayers: ProcessedPlayer[];
  onComplete: () => void;
}

export interface GiftCardProps {
  children: React.ReactNode;
  delay?: number;
  theme?: 'yellow' | 'blue' | 'red' | 'green' | 'purple';
}

// Community stats types
export interface GameRecord {
  month: string;
  date: string;
  played: boolean;
  players: number | null;
  field: string | null;
}

export interface CommunityStatsRaw {
  games2024: GameRecord[];
  games2025: GameRecord[];
}

export interface CommunityStatsCalculated {
  // 2024 stats
  gamesPlayed2024: number;
  gamesCancelled2024: number;
  totalAttempted2024: number;
  avgPlayers2024: number;
  successRate2024: number;
  gamesPerMonth2024: Record<string, number>;
  fields2024: Record<string, number>;

  // 2025 stats
  gamesPlayed2025: number;
  gamesCancelled2025: number;
  totalAttempted2025: number;
  avgPlayers2025: number;
  successRate2025: number;
  gamesPerMonth2025: Record<string, number>;
  fields2025: Record<string, number>;

  // Comparisons
  gamesChange: number;
  avgPlayersChange: number;
  successRateChange: number;

  // All time
  totalGamesAllTime: number;
}
