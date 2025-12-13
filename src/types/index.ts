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

export type Language = 'bg' | 'en';
export type MonthKey = 'january' | 'february' | 'march' | 'april' | 'may' | 'june' |
                       'july' | 'august' | 'september' | 'october' | 'november' | 'december';
export type SeasonKey = 'winter' | 'spring' | 'summer' | 'autumn';

// Stats types
export interface PlayerStats {
  total: number;
  total2024: number;
  total2025: number;
  longestStreak: number;
  longestStreak2025: number;
  monthlyData: MonthlyData;
}

export interface MonthlyData {
  [month: string]: number;
}

// Chart types
export interface ChartData {
  labels: string[];
  datasets: ChartDataset[];
}

export interface ChartDataset {
  label: string;
  data: number[];
  backgroundColor?: string | string[];
  borderColor?: string | string[];
  borderWidth?: number;
  tension?: number;
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
  onComplete: () => void;
}

export interface GiftCardProps {
  children: React.ReactNode;
  delay?: number;
  theme?: 'yellow' | 'blue' | 'red' | 'green' | 'purple';
}

export interface ImageLoaderProps {
  src: string;
  alt: string;
  className?: string;
}

export interface LoadingAnimationProps {
  playerName: string;
  onComplete: () => void;
}

// Community stats types
export interface CommunityStats {
  totalGames2024: number;
  totalGames2025: number;
  totalGamesAllTime: number;
  longestStreak: number;
  averagePlayersPerMatch: number;
  fields: Record<string, number>;
  comparisonLastYear: {
    gamesChange: number;
    averagePlayersChange: number;
  };
}
