# Step 08: Charts

## Objective
Create monthly and comparison charts using Chart.js.

## Tasks

### 1. Create MonthlyChart Component
Create `src/components/MonthlyChart.jsx`:

```jsx
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
```

### 2. Create ComparisonChart Component
Create `src/components/ComparisonChart.jsx`:

```jsx
import { Line } from 'react-chartjs-2';
import { useTranslation } from 'react-i18next';
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
import { formatMonthName } from '../utils/helpers';

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

const ComparisonChart = ({ data2024, data2025 }) => {
  const { i18n } = useTranslation();

  const months = [
    'january', 'february', 'march', 'april', 'may', 'june',
    'july', 'august', 'september', 'october', 'november', 'december'
  ];

  const chartData = {
    labels: months.map(m => formatMonthName(m, i18n.language)),
    datasets: [
      {
        label: '2024',
        data: months.map(m => data2024[m]),
        borderColor: '#3498db',
        backgroundColor: 'rgba(52, 152, 219, 0.1)',
        borderWidth: 3,
        pointRadius: 5,
        pointBackgroundColor: '#3498db',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        tension: 0.4,
        fill: true
      },
      {
        label: '2025',
        data: months.map(m => data2025[m]),
        borderColor: '#1db954',
        backgroundColor: 'rgba(29, 185, 84, 0.1)',
        borderWidth: 3,
        pointRadius: 5,
        pointBackgroundColor: '#1db954',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        tension: 0.4,
        fill: true
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
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
          pointStyle: 'circle'
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
          color: '#b3b3b3'
        },
        grid: {
          color: '#282828'
        }
      }
    }
  };

  return (
    <div className="h-80">
      <Line data={chartData} options={options} />
    </div>
  );
};

export default ComparisonChart;
```

## Expected Outcome
- Bar chart for 2025 monthly breakdown
- Line chart comparing 2024 vs 2025
- Charts styled to match dark theme
- Responsive and interactive tooltips
- Smooth animations

## Next Step
Proceed to `09-summary-card.md`
