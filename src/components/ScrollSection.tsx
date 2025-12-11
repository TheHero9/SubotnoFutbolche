import React from 'react';
import { useTranslation } from 'react-i18next';
import type { ScrollSectionProps, MonthKey, SeasonKey } from '../types';
import StatCard from './StatCard';
import AchievementBadge from './AchievementBadge';
import MonthlyChart from './MonthlyChart';
import ComparisonChart from './ComparisonChart';
import SummaryCard from './SummaryCard';
import ScrollToTop from './ScrollToTop';
import {
  getBestWorstMonths,
  getBestSeason,
  getPercentile,
  getFutureProjection
} from '../utils/calculations';
import { formatMonthName, formatSeasonName } from '../utils/helpers';

const ScrollSection: React.FC<ScrollSectionProps> = ({ player, totalPlayers }) => {
  const { t, i18n } = useTranslation();

  const bestWorst = getBestWorstMonths(player.games2025);
  const seasons = getBestSeason(player.games2025);
  const percentile = getPercentile(player.rank2025, totalPlayers);
  const futureGames = getFutureProjection(player.total2025);
  const gamesDiff = player.total2025 - player.total2024;

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Monthly breakdown chart */}
        <StatCard>
          <h2 className="text-3xl font-bold mb-6" style={{ color: 'var(--color-accent-green)' }}>
            {t('scroll.monthlyBreakdown')}
          </h2>
          <MonthlyChart data={player.games2025} year="2025" />
        </StatCard>

        {/* Comparison with 2024 */}
        <StatCard delay={0.1}>
          <h2 className="text-3xl font-bold mb-6" style={{ color: 'var(--color-accent-gold)' }}>
            {t('scroll.comparison2024')}
          </h2>
          <ComparisonChart
            data2024={player.games2024}
            data2025={player.games2025}
          />
        </StatCard>

        {/* Best and worst months */}
        <StatCard delay={0.2} asGift={true} giftTheme="blue">
          <h2 className="text-3xl font-bold mb-6" style={{ color: 'var(--color-accent-green)' }}>
            {t('scroll.bestMonths')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {bestWorst.best.map(([month, games]) => (
              <div key={month} className="text-center">
                <div className="text-4xl mb-2">🏆</div>
                <div className="text-2xl font-bold" style={{ color: 'var(--color-accent-gold)' }}>
                  {formatMonthName(month as MonthKey, i18n.language as 'bg' | 'en')}
                </div>
                <div style={{ color: 'var(--color-text-secondary)' }}>
                  {games} {t('story.games')}
                </div>
              </div>
            ))}
          </div>
        </StatCard>

        <StatCard delay={0.3} asGift={true} giftTheme="red">
          <h2 className="text-3xl font-bold mb-6" style={{ color: 'var(--color-accent-red)' }}>
            {t('scroll.worstMonths')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {bestWorst.worst.map(([month, games]) => (
              <div key={month} className="text-center">
                <div className="text-4xl mb-2">📉</div>
                <div className="text-2xl font-bold">
                  {formatMonthName(month as MonthKey, i18n.language as 'bg' | 'en')}
                </div>
                <div style={{ color: 'var(--color-text-secondary)' }}>
                  {games} {t('story.games')}
                </div>
              </div>
            ))}
          </div>
        </StatCard>

        {/* Best and worst seasons */}
        <StatCard delay={0.4}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="text-center">
              <h3 className="text-2xl font-bold mb-4" style={{ color: 'var(--color-accent-green)' }}>
                {t('scroll.bestSeason')}
              </h3>
              <div className="text-6xl mb-3">☀️</div>
              <div className="text-3xl font-bold" style={{ color: 'var(--color-accent-gold)' }}>
                {formatSeasonName(seasons.best[0] as SeasonKey, i18n.language as 'bg' | 'en')}
              </div>
              <div className="mt-2" style={{ color: 'var(--color-text-secondary)' }}>
                {seasons.best[1]} {t('story.games')}
              </div>
            </div>
            <div className="text-center">
              <h3 className="text-2xl font-bold mb-4" style={{ color: 'var(--color-accent-red)' }}>
                {t('scroll.worstSeason')}
              </h3>
              <div className="text-6xl mb-3">❄️</div>
              <div className="text-3xl font-bold">
                {formatSeasonName(seasons.worst[0] as SeasonKey, i18n.language as 'bg' | 'en')}
              </div>
              <div className="mt-2" style={{ color: 'var(--color-text-secondary)' }}>
                {seasons.worst[1]} {t('story.games')}
              </div>
            </div>
          </div>
        </StatCard>

        {/* Achievements */}
        <StatCard delay={0.5} asGift={true} giftTheme="yellow">
          <h2 className="text-3xl font-bold mb-6 text-center" style={{ color: 'var(--color-accent-gold)' }}>
            {t('scroll.achievements')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AchievementBadge
              icon="🎯"
              text={t('achievements.moreGames', { percent: percentile })}
              delay={0.1}
            />
            <AchievementBadge
              icon="🔥"
              text={
                player.longestStreakStart && player.longestStreakEnd
                  ? `${t('achievements.longestStreak', { streak: player.longestStreak2025 || 0 })} (${player.longestStreakStart} - ${player.longestStreakEnd})`
                  : t('achievements.longestStreak', { streak: player.longestStreak2025 || 0 })
              }
              delay={0.2}
            />
            <AchievementBadge
              icon="🚀"
              text={t('achievements.futureProjection', { games: futureGames })}
              delay={0.3}
            />
            {gamesDiff > 0 && (
              <AchievementBadge
                icon="📈"
                text={t('achievements.moreThanLastYear', { diff: gamesDiff })}
                delay={0.4}
              />
            )}
            {gamesDiff < 0 && (
              <AchievementBadge
                icon="📉"
                text={t('achievements.lessThanLastYear', { diff: Math.abs(gamesDiff) })}
                delay={0.4}
              />
            )}
            {gamesDiff === 0 && (
              <AchievementBadge
                icon="🟰"
                text={t('achievements.sameAsLastYear')}
                delay={0.4}
              />
            )}
          </div>
        </StatCard>

        {/* Summary Card */}
        <SummaryCard player={player} totalPlayers={totalPlayers} />
      </div>

      {/* Scroll to top button */}
      <ScrollToTop />
    </div>
  );
};

export default ScrollSection;
