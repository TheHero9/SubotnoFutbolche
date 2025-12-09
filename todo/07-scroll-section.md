# Step 07: Scroll Section

## Objective
Create the scrollable section with stat cards and achievements.

## Tasks

### 1. Create StatCard Component
Create `src/components/StatCard.jsx`:

```jsx
import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';

const StatCard = ({ children, delay = 0 }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ duration: 0.6, delay }}
      className="bg-bg-card rounded-2xl p-8 mb-6 border border-bg-secondary hover:border-accent-green transition-colors"
    >
      {children}
    </motion.div>
  );
};

export default StatCard;
```

### 2. Create AchievementBadge Component
Create `src/components/AchievementBadge.jsx`:

```jsx
import { motion } from 'framer-motion';

const AchievementBadge = ({ icon, text, delay = 0 }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.4 }}
      className="bg-gradient-to-br from-accent-gold/20 to-accent-green/20 border border-accent-gold rounded-xl p-6 text-center"
    >
      <div className="text-5xl mb-3">{icon}</div>
      <p className="text-text-primary">{text}</p>
    </motion.div>
  );
};

export default AchievementBadge;
```

### 3. Update ScrollSection Component
Replace `src/components/ScrollSection.jsx`:

```jsx
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import StatCard from './StatCard';
import AchievementBadge from './AchievementBadge';
import MonthlyChart from './MonthlyChart';
import ComparisonChart from './ComparisonChart';
import SummaryCard from './SummaryCard';
import {
  getBestWorstMonths,
  getBestSeason,
  getPercentile,
  getFutureProjection
} from '../utils/calculations';
import { formatMonthName, formatSeasonName } from '../utils/helpers';

const ScrollSection = ({ player, totalPlayers }) => {
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
          <h2 className="text-3xl font-bold mb-6 text-accent-green">
            {t('scroll.monthlyBreakdown')}
          </h2>
          <MonthlyChart data={player.games2025} year={2025} />
        </StatCard>

        {/* Comparison with 2024 */}
        <StatCard delay={0.1}>
          <h2 className="text-3xl font-bold mb-6 text-accent-gold">
            {t('scroll.comparison2024')}
          </h2>
          <ComparisonChart
            data2024={player.games2024}
            data2025={player.games2025}
          />
        </StatCard>

        {/* Best and worst months */}
        <StatCard delay={0.2}>
          <h2 className="text-3xl font-bold mb-6 text-accent-green">
            {t('scroll.bestMonths')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {bestWorst.best.map(([month, games], index) => (
              <div key={month} className="text-center">
                <div className="text-4xl mb-2">🏆</div>
                <div className="text-2xl font-bold text-accent-gold">
                  {formatMonthName(month, i18n.language)}
                </div>
                <div className="text-text-secondary">
                  {games} {t('story.games')}
                </div>
              </div>
            ))}
          </div>
        </StatCard>

        <StatCard delay={0.3}>
          <h2 className="text-3xl font-bold mb-6 text-accent-red">
            {t('scroll.worstMonths')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {bestWorst.worst.map(([month, games], index) => (
              <div key={month} className="text-center">
                <div className="text-4xl mb-2">📉</div>
                <div className="text-2xl font-bold">
                  {formatMonthName(month, i18n.language)}
                </div>
                <div className="text-text-secondary">
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
              <h3 className="text-2xl font-bold mb-4 text-accent-green">
                {t('scroll.bestSeason')}
              </h3>
              <div className="text-6xl mb-3">☀️</div>
              <div className="text-3xl font-bold text-accent-gold">
                {formatSeasonName(seasons.best[0], i18n.language)}
              </div>
              <div className="text-text-secondary mt-2">
                {seasons.best[1]} {t('story.games')}
              </div>
            </div>
            <div className="text-center">
              <h3 className="text-2xl font-bold mb-4 text-accent-red">
                {t('scroll.worstSeason')}
              </h3>
              <div className="text-6xl mb-3">❄️</div>
              <div className="text-3xl font-bold">
                {formatSeasonName(seasons.worst[0], i18n.language)}
              </div>
              <div className="text-text-secondary mt-2">
                {seasons.worst[1]} {t('story.games')}
              </div>
            </div>
          </div>
        </StatCard>

        {/* Achievements */}
        <StatCard delay={0.5}>
          <h2 className="text-3xl font-bold mb-6 text-center text-accent-gold">
            {t('scroll.achievements')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AchievementBadge
              icon="🎯"
              text={t('achievements.moreGames', { percent: percentile })}
              delay={0.1}
            />
            <AchievementBadge
              icon="🚀"
              text={t('achievements.futureProjection', { games: futureGames })}
              delay={0.2}
            />
            {gamesDiff > 0 && (
              <AchievementBadge
                icon="📈"
                text={t('achievements.moreThanLastYear', { diff: gamesDiff })}
                delay={0.3}
              />
            )}
            {gamesDiff < 0 && (
              <AchievementBadge
                icon="📉"
                text={t('achievements.lessThanLastYear', { diff: Math.abs(gamesDiff) })}
                delay={0.3}
              />
            )}
            {gamesDiff === 0 && (
              <AchievementBadge
                icon="🟰"
                text={t('achievements.sameAsLastYear')}
                delay={0.3}
              />
            )}
          </div>
        </StatCard>

        {/* Summary Card */}
        <SummaryCard player={player} totalPlayers={totalPlayers} />
      </div>
    </div>
  );
};

export default ScrollSection;
```

## Expected Outcome
- Scrollable section with animated cards
- Stats appear as you scroll (intersection observer)
- Best/worst months and seasons
- Achievement badges
- Smooth scroll animations

## Next Step
Proceed to `08-charts.md`
