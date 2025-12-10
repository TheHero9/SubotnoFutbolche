import { Bar } from 'react-chartjs-2';
import { useTranslation } from 'react-i18next';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { formatMonthName } from '../utils/helpers';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const MonthlyChart = ({ data, year }) => {
  const { i18n } = useTranslation();

  const months = [
    'january', 'february', 'march', 'april', 'may', 'june',
    'july', 'august', 'september', 'october', 'november', 'december'
  ];

  const chartData = {
    labels: months.map(m => formatMonthName(m, i18n.language)),
    datasets: [
      {
        label: year,
        data: months.map(m => data[m]),
        backgroundColor: '#1db954',
        borderColor: '#1db954',
        borderWidth: 2,
        borderRadius: 8,
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: '#282828',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: '#1db954',
        borderWidth: 1,
        padding: 12,
        displayColors: false
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
          color: '#b3b3b3'
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

export default MonthlyChart;
