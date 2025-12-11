import type { Language, MonthKey, SeasonKey } from '../types';

type MonthsTranslations = Record<Language, Record<MonthKey, string>>;
type SeasonsTranslations = Record<Language, Record<SeasonKey, string>>;

const MONTHS: MonthsTranslations = {
  bg: {
    january: 'Януари',
    february: 'Февруари',
    march: 'Март',
    april: 'Април',
    may: 'Май',
    june: 'Юни',
    july: 'Юли',
    august: 'Август',
    september: 'Септември',
    october: 'Октомври',
    november: 'Ноември',
    december: 'Декември'
  },
  en: {
    january: 'January',
    february: 'February',
    march: 'March',
    april: 'April',
    may: 'May',
    june: 'June',
    july: 'July',
    august: 'August',
    september: 'September',
    october: 'October',
    november: 'November',
    december: 'December'
  }
};

const SEASONS: SeasonsTranslations = {
  bg: {
    winter: 'Зима',
    spring: 'Пролет',
    summer: 'Лято',
    autumn: 'Есен'
  },
  en: {
    winter: 'Winter',
    spring: 'Spring',
    summer: 'Summer',
    autumn: 'Autumn'
  }
};

/**
 * Format month name for display
 */
export const formatMonthName = (month: MonthKey, language: Language = 'bg'): string => {
  return MONTHS[language][month] || month;
};

/**
 * Format season name for display
 */
export const formatSeasonName = (season: SeasonKey, language: Language = 'bg'): string => {
  return SEASONS[language][season] || season;
};
