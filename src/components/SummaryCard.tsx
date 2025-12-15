import React, { useRef, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { toPng } from 'html-to-image';
import type { SummaryCardProps, CommunityStatsRaw } from '../types';
import { getRankChange } from '../utils/calculations';
import { calculatePeakPerformance, calculateAttendanceRate } from '../utils/playerStats';
import communityStatsRaw from '../data/communityStats.json';

const rawStats = communityStatsRaw as CommunityStatsRaw;

const SummaryCard: React.FC<SummaryCardProps> = ({ player, totalPlayers }) => {
  const { t } = useTranslation();
  const cardRef = useRef<HTMLDivElement>(null);

  const rankChange = getRankChange(player.rank2024, player.rank2025, player.total2024);
  const gamesDiff = player.total2025 - player.total2024;

  // Calculate streak
  const peakPerformance = useMemo(
    () => calculatePeakPerformance(player.dates2025 || [], rawStats.games2025),
    [player.dates2025]
  );

  // Calculate attendance rate
  const attendanceRate = useMemo(
    () => calculateAttendanceRate(player.dates2025 || [], rawStats.games2025),
    [player.dates2025]
  );

  const handleDownload = async (): Promise<void> => {
    if (cardRef.current === null) return;

    try {
      const dataUrl = await toPng(cardRef.current, {
        quality: 1,
        pixelRatio: 2,
        backgroundColor: '#121212'
      });

      const link = document.createElement('a');
      link.download = `${player.name}-wrapped-2025.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to generate image:', err);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="mt-12 mb-8"
    >
      {/* Screenshot Card */}
      <div
        ref={cardRef}
        className="rounded-3xl p-1 max-w-md md:max-w-2xl mx-auto"
        style={{
          background: 'linear-gradient(135deg, #1db954, #ffd700, #1db954)'
        }}
      >
        <div
          className="rounded-3xl p-4 md:p-8 relative overflow-hidden"
          style={{
            background: 'linear-gradient(160deg, #1a1a2e 0%, #16213e 50%, #0f0f23 100%)'
          }}
        >
          {/* Decorative circles */}
          <div
            className="absolute -top-20 -right-20 w-40 h-40 rounded-full opacity-10"
            style={{ background: 'linear-gradient(135deg, #1db954, #ffd700)' }}
          />
          <div
            className="absolute -bottom-16 -left-16 w-32 h-32 rounded-full opacity-10"
            style={{ background: 'linear-gradient(135deg, #ffd700, #1db954)' }}
          />

          {/* Header with year */}
          <div className="text-center mb-4 md:mb-6 relative">
            <div className="inline-block px-3 py-1 rounded-full mb-2 md:mb-3" style={{ backgroundColor: 'rgba(29, 185, 84, 0.2)' }}>
              <span className="text-xs md:text-sm font-bold" style={{ color: 'var(--color-accent-green)' }}>⚽ 2025</span>
            </div>
            <h3 className="text-3xl md:text-5xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
              {player.name}
            </h3>
          </div>

          {/* Main stats - Big numbers */}
          <div className="flex justify-center gap-6 md:gap-8 mb-4 md:mb-6">
            {/* Total games */}
            <div className="text-center">
              <div className="text-5xl md:text-6xl font-black" style={{ color: 'var(--color-accent-green)' }}>
                {player.total2025}
              </div>
              <div className="text-xs md:text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                {t('summary.totalGames')}
              </div>
            </div>

            {/* Divider */}
            <div className="w-px self-stretch opacity-20" style={{ backgroundColor: 'var(--color-text-primary)' }} />

            {/* Rank */}
            <div className="text-center">
              <div className="text-5xl md:text-6xl font-black" style={{ color: 'var(--color-accent-gold)' }}>
                #{player.rank2025}
              </div>
              <div className="text-xs md:text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                {t('summary.rank')}
              </div>
            </div>
          </div>

          {/* Secondary stats grid - 2 cols mobile, 4 cols desktop */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3 mb-4 md:mb-6">
            {/* Streak */}
            <div
              className="rounded-xl p-2 md:p-3 text-center"
              style={{ backgroundColor: 'rgba(29, 185, 84, 0.15)' }}
            >
              <div className="text-lg md:text-2xl font-bold mb-0.5 md:mb-1" style={{ color: 'var(--color-accent-green)' }}>
                🔥 {peakPerformance.streakLength}
              </div>
              <div className="text-[10px] md:text-xs leading-tight" style={{ color: 'var(--color-text-secondary)' }}>
                {t('scroll.consecutiveGames')}
              </div>
            </div>

            {/* Attendance */}
            <div
              className="rounded-xl p-2 md:p-3 text-center"
              style={{ backgroundColor: 'rgba(59, 130, 246, 0.15)' }}
            >
              <div className="text-lg md:text-2xl font-bold mb-0.5 md:mb-1" style={{ color: '#3b82f6' }}>
                {attendanceRate}%
              </div>
              <div className="text-[10px] md:text-xs leading-tight" style={{ color: 'var(--color-text-secondary)' }}>
                {t('stats.attendanceRate')}
              </div>
            </div>

            {/* Rank change */}
            <div
              className="rounded-xl p-2 md:p-3 text-center"
              style={{
                backgroundColor: rankChange.direction === 'up' ? 'rgba(29, 185, 84, 0.15)' :
                                 rankChange.direction === 'down' ? 'rgba(239, 68, 68, 0.15)' :
                                 rankChange.direction === 'new' ? 'rgba(255, 215, 0, 0.15)' :
                                 'rgba(59, 130, 246, 0.15)'
              }}
            >
              <div
                className="text-lg md:text-2xl font-bold mb-0.5 md:mb-1"
                style={{
                  color: rankChange.direction === 'up' ? 'var(--color-accent-green)' :
                         rankChange.direction === 'down' ? '#ef4444' :
                         rankChange.direction === 'new' ? 'var(--color-accent-gold)' :
                         '#3b82f6'
                }}
              >
                {rankChange.emoji} {rankChange.direction !== 'new' && rankChange.value}
              </div>
              <div className="text-[10px] md:text-xs leading-tight" style={{ color: 'var(--color-text-secondary)' }}>
                {t('summary.rankChange')}
              </div>
            </div>

            {/* Games vs 2024 */}
            <div
              className="rounded-xl p-2 md:p-3 text-center"
              style={{
                backgroundColor: gamesDiff >= 0 ? 'rgba(29, 185, 84, 0.15)' : 'rgba(239, 68, 68, 0.15)'
              }}
            >
              <div
                className="text-lg md:text-2xl font-bold mb-0.5 md:mb-1"
                style={{ color: gamesDiff >= 0 ? 'var(--color-accent-green)' : '#ef4444' }}
              >
                {gamesDiff > 0 ? '↑' : gamesDiff < 0 ? '↓' : '='}{Math.abs(gamesDiff)}
              </div>
              <div className="text-[10px] md:text-xs leading-tight" style={{ color: 'var(--color-text-secondary)' }}>
                vs 2024
              </div>
            </div>
          </div>

          {/* Footer with branding */}
          <div className="text-center pt-3 md:pt-4 border-t border-opacity-10" style={{ borderColor: 'var(--color-text-primary)' }}>
            <div className="flex items-center justify-center gap-2">
              <span className="text-base md:text-lg">⚽</span>
              <span className="text-sm md:text-base font-bold" style={{ color: 'var(--color-accent-green)' }}>
                {t('summary.footer')}
              </span>
              <span className="text-base md:text-lg">⚽</span>
            </div>
          </div>
        </div>
      </div>

      {/* Screenshot prompt */}
      <div className="text-center mt-6">
        <motion.button
          onClick={handleDownload}
          className="px-8 py-4 font-bold rounded-xl text-lg transition-all"
          style={{
            background: 'linear-gradient(135deg, var(--color-accent-green), #15803d)',
            color: 'var(--color-bg-primary)',
            boxShadow: '0 4px 20px rgba(29, 185, 84, 0.3)'
          }}
          whileHover={{ scale: 1.05, boxShadow: '0 6px 30px rgba(29, 185, 84, 0.5)' }}
          whileTap={{ scale: 0.95 }}
        >
          📸 {t('summary.screenshotPrompt')}
        </motion.button>
      </div>
    </motion.div>
  );
};

export default SummaryCard;
