import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { useTranslation } from 'react-i18next';
import type { MonthlyData, MonthKey } from '../types';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface CumulativeChartProps {
  data2024: MonthlyData;
  data2025: MonthlyData;
}

const CumulativeChart: React.FC<CumulativeChartProps> = ({ data2024, data2025 }) => {
  const { i18n } = useTranslation();

  const months: MonthKey[] = [
    'january', 'february', 'march', 'april', 'may', 'june',
    'july', 'august', 'september', 'october', 'november', 'december'
  ];

  const monthLabels = i18n.language === 'bg'
    ? ['Яну', 'Фев', 'Мар', 'Апр', 'Май', 'Юни', 'Юли', 'Авг', 'Сеп', 'Окт', 'Ное', 'Дек']
    : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  // Calculate cumulative values
  const getCumulative = (data: MonthlyData): number[] => {
    let cumulative = 0;
    return months.map(month => {
      cumulative += data[month] || 0;
      return cumulative;
    });
  };

  const cumulative2024 = getCumulative(data2024);
  const cumulative2025 = getCumulative(data2025);

  // Find the last month with data in 2025 (for current year, might not be complete)
  const lastMonth2025 = months.findIndex((month, index) => {
    const remaining = months.slice(index + 1);
    return remaining.every(m => (data2025[m as keyof MonthlyGames] || 0) === 0);
  });

  const chartData = {
    labels: monthLabels,
    datasets: [
      {
        label: '2025',
        data: cumulative2025,
        borderColor: '#1db954', // Green
        backgroundColor: 'rgba(29, 185, 84, 0.1)',
        fill: true,
        tension: 0.3,
        pointBackgroundColor: '#1db954',
        pointBorderColor: '#1db954',
        pointRadius: 4,
        pointHoverRadius: 6,
        borderWidth: 3
      },
      {
        label: '2024',
        data: cumulative2024,
        borderColor: '#3b82f6', // Blue
        backgroundColor: 'rgba(59, 130, 246, 0.05)',
        fill: true,
        tension: 0.3,
        pointBackgroundColor: '#3b82f6',
        pointBorderColor: '#3b82f6',
        pointRadius: 3,
        pointHoverRadius: 5,
        borderWidth: 2,
        borderDash: [5, 5]
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: '#b3b3b3',
          usePointStyle: true,
          pointStyle: 'circle',
          padding: 20
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#ffffff',
        bodyColor: '#b3b3b3',
        borderColor: '#1db954',
        borderWidth: 1,
        cornerRadius: 8,
        padding: 12,
        callbacks: {
          label: (context: any) => {
            const year = context.dataset.label;
            const monthIndex = context.dataIndex;
            const value = context.raw;
            const monthlyValue = monthIndex === 0
              ? value
              : value - (year === '2025' ? cumulative2025[monthIndex - 1] : cumulative2024[monthIndex - 1]);
            return `${year}: ${value} total (+${monthlyValue} this month)`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
          drawBorder: false
        },
        ticks: {
          color: '#b3b3b3',
          font: {
            size: 11
          }
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
          drawBorder: false
        },
        ticks: {
          color: '#b3b3b3',
          stepSize: 5,
          font: {
            size: 11
          }
        }
      }
    },
    interaction: {
      intersect: false,
      mode: 'index' as const
    }
  };

  // Calculate final totals
  const total2024 = cumulative2024[11];
  const total2025 = cumulative2025[11];
  const diff = total2025 - total2024;

  return (
    <div>
      <div className="h-64 md:h-80">
        <Line data={chartData} options={options} />
      </div>

      {/* Summary */}
      <div className="flex justify-center gap-6 mt-4">
        <div className="text-center">
          <div className="text-2xl font-bold" style={{ color: '#1db954' }}>
            {total2025}
          </div>
          <div className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
            2025
          </div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold" style={{ color: '#3b82f6' }}>
            {total2024}
          </div>
          <div className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
            2024
          </div>
        </div>
        <div className="text-center">
          <div
            className="text-2xl font-bold"
            style={{ color: diff >= 0 ? 'var(--color-accent-green)' : 'var(--color-accent-red)' }}
          >
            {diff >= 0 ? '+' : ''}{diff}
          </div>
          <div className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
            {diff >= 0 ? '↑' : '↓'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CumulativeChart;
