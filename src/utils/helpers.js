/**
 * Format month name for display
 */
export const formatMonthName = (month, language = 'bg') => {
  const months = {
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

  return months[language][month] || month;
};

/**
 * Format season name for display
 */
export const formatSeasonName = (season, language = 'bg') => {
  const seasons = {
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

  return seasons[language][season] || season;
};
