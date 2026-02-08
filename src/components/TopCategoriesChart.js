import React, { useRef, useMemo } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend);

const TopCategoriesChart = ({ data }) => {
  const chartRef = useRef(null);
  
  // Generate random colors for categories
  const generateColors = (count) => {
    const colors = [];
    const hueStep = 360 / Math.max(1, count);
    
    for (let i = 0; i < count; i++) {
      const hue = i * hueStep;
      colors.push(`hsl(${hue}, 70%, 60%)`);
    }
    
    return colors;
  };

  // Prepare chart data with useMemo for better performance
  const chartData = useMemo(() => ({
    labels: data.map(item => item.category),
    datasets: [
      {
        data: data.map(item => item.amount),
        backgroundColor: generateColors(data.length),
        borderWidth: 1,
      },
    ],
  }), [data]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.raw || 0;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = Math.round((value / total) * 100);
            return `${label}: Rs. ${value} (${percentage}%)`;
          }
        }
      }
    },
    cutout: '70%',
  };

  return (
    <div className="card h-80">
      <h3 className="text-lg font-medium mb-4">Spending by Category</h3>
      <div className="h-64">
        <Doughnut ref={chartRef} data={chartData} options={options} />
      </div>
    </div>
  );
};

export default TopCategoriesChart;
