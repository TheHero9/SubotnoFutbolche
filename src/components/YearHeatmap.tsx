import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import type { GameRecord } from '../types';

interface YearHeatmapProps {
  year: number;
  playerDates: string[];
  communityGames: GameRecord[];
}

const YearHeatmap: React.FC<YearHeatmapProps> = ({ year, playerDates, communityGames }) => {
  const { t } = useTranslation();

  // Create a set of player dates for quick lookup
  const playerDatesSet = new Set(playerDates);

  // Create a map of community games for quick lookup
  const communityGamesMap = new Map<string, GameRecord>();
  communityGames.forEach(game => {
    communityGamesMap.set(game.date, game);
  });

  // Get all Saturdays of the year
  const getAllSaturdays = (year: number): Date[] => {
    const saturdays: Date[] = [];
    const date = new Date(year, 0, 1); // Jan 1

    // Find first Saturday
    while (date.getDay() !== 6) {
      date.setDate(date.getDate() + 1);
    }

    // Collect all Saturdays
    while (date.getFullYear() === year) {
      saturdays.push(new Date(date));
      date.setDate(date.getDate() + 7);
    }

    return saturdays;
  };

  const saturdays = getAllSaturdays(year);

  // Group by month for display
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthNamesBg = ['Яну', 'Фев', 'Мар', 'Апр', 'Май', 'Юни', 'Юли', 'Авг', 'Сеп', 'Окт', 'Ное', 'Дек'];

  // Format date to DD/MM for comparison
  const formatDateForComparison = (date: Date): string => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    return `${day}/${month}`;
  };

  // Get status of a Saturday
  const getSaturdayStatus = (saturday: Date): 'played' | 'missed' | 'cancelled' | 'no-game' => {
    const dateStr = formatDateForComparison(saturday);
    const game = communityGamesMap.get(dateStr);

    if (!game) {
      return 'no-game'; // No game scheduled this Saturday
    }

    if (!game.played) {
      return 'cancelled';
    }

    if (playerDatesSet.has(dateStr)) {
      return 'played';
    }

    return 'missed';
  };

  // Get color based on status
  const getColor = (status: 'played' | 'missed' | 'cancelled' | 'no-game'): string => {
    switch (status) {
      case 'played':
        return 'var(--color-accent-green)';
      case 'missed':
        return '#ef4444'; // Red
      case 'cancelled':
        return '#6b7280'; // Gray
      case 'no-game':
        return 'rgba(75, 75, 75, 0.3)'; // Very light gray
    }
  };

  // Group saturdays by month
  const saturdaysByMonth: Date[][] = [];
  let currentMonth = -1;
  saturdays.forEach(sat => {
    if (sat.getMonth() !== currentMonth) {
      currentMonth = sat.getMonth();
      saturdaysByMonth.push([]);
    }
    saturdaysByMonth[saturdaysByMonth.length - 1].push(sat);
  });

  const { i18n } = useTranslation();
  const isLangBg = i18n.language === 'bg';

  return (
    <div className="w-full">
      {/* Year label */}
      <div className="text-center mb-3">
        <span className="text-2xl font-bold" style={{ color: 'var(--color-accent-gold)' }}>
          {year}
        </span>
      </div>

      {/* Heatmap grid - 6 cols on mobile, 12 on desktop */}
      <div className="grid grid-cols-6 md:grid-cols-12 gap-0.5 justify-items-center">
        {saturdaysByMonth.map((monthSaturdays, monthIndex) => (
          <div key={monthIndex} className="flex flex-col items-center w-full">
            {/* Month label */}
            <div
              className="text-[10px] md:text-xs mb-1 font-medium"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              {isLangBg ? monthNamesBg[monthIndex] : monthNames[monthIndex]}
            </div>
            {/* Saturday boxes */}
            <div className="flex flex-col gap-0.5 md:gap-1">
              {monthSaturdays.map((saturday, satIndex) => {
                const status = getSaturdayStatus(saturday);
                const color = getColor(status);
                const day = saturday.getDate();

                return (
                  <motion.div
                    key={satIndex}
                    className="w-5 h-5 md:w-6 md:h-6 rounded-sm flex items-center justify-center text-[10px] md:text-xs font-medium cursor-default"
                    style={{
                      backgroundColor: color,
                      color: status === 'played' ? '#000' : status === 'missed' ? '#fff' : 'var(--color-text-secondary)',
                      opacity: status === 'no-game' ? 0.3 : 1
                    }}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: (monthIndex * 5 + satIndex) * 0.01 }}
                    title={`${day}/${monthIndex + 1}/${year}`}
                  >
                    {status !== 'no-game' && day}
                  </motion.div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-3 md:gap-4 mt-4">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: 'var(--color-accent-green)' }}></div>
          <span className="text-[10px] md:text-xs" style={{ color: 'var(--color-text-secondary)' }}>
            {t('stats.streakLegendPlayed')}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: '#ef4444' }}></div>
          <span className="text-[10px] md:text-xs" style={{ color: 'var(--color-text-secondary)' }}>
            {t('stats.streakLegendMissed')}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: '#6b7280' }}></div>
          <span className="text-[10px] md:text-xs" style={{ color: 'var(--color-text-secondary)' }}>
            {t('community.cancelled')}
          </span>
        </div>
      </div>
    </div>
  );
};

export default YearHeatmap;
