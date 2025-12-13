import React from 'react';
import { Bar } from 'react-chartjs-2';
import { useTranslation } from 'react-i18next';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions
} from 'chart.js';
import { formatMonthName } from '../utils/helpers';
import type { MonthKey, Language } from '../types';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface CommunityChartProps {
  gamesPerMonth2024: Record<string, number>;
  gamesPerMonth2025: Record<string, number>;
}

const MONTHS_ORDER = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const MONTH_KEY_MAP: Record<string, MonthKey> = {
  'January': 'january', 'February': 'february', 'March': 'march',
  'April': 'april', 'May': 'may', 'June': 'june',
  'July': 'july', 'August': 'august', 'September': 'september',
  'October': 'october', 'November': 'november', 'December': 'december'
};

const CommunityChart: React.FC<CommunityChartProps> = ({ gamesPerMonth2024, gamesPerMonth2025 }) => {
  const { i18n } = useTranslation();

  const labels = MONTHS_ORDER.map(m =>
    formatMonthName(MONTH_KEY_MAP[m], i18n.language as Language)
  );

  const chartData = {
    labels,
    datasets: [
      {
        label: '2024',
        data: MONTHS_ORDER.map(m => gamesPerMonth2024[m] || 0),
        backgroundColor: 'rgba(52, 152, 219, 0.7)',
        borderColor: '#3498db',
        borderWidth: 2,
        borderRadius: 4,
      },
      {
        label: '2025',
        data: MONTHS_ORDER.map(m => gamesPerMonth2025[m] || 0),
        backgroundColor: 'rgba(29, 185, 84, 0.7)',
        borderColor: '#1db954',
        borderWidth: 2,
        borderRadius: 4,
      }
    ]
  };

  const options: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: {
          color: '#ffffff',
          font: {
            size: 14,
            weight: 'bold'
          },
          padding: 20,
          usePointStyle: true,
          pointStyle: 'rect'
        }
      },
      tooltip: {
        backgroundColor: '#282828',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: '#1db954',
        borderWidth: 1,
        padding: 12
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          color: '#b3b3b3',
          stepSize: 1
        },
        grid: {
          color: '#282828'
        }
      },
      x: {
        ticks: {
          color: '#b3b3b3',
          maxRotation: 45,
          minRotation: 45
        },
        grid: {
          display: false
        }
      }
    }
  };

  return (
    <div className="h-80">
      <Bar data={chartData} options={options} />
    </div>
  );
};

export default CommunityChart;
