import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const truncateLabel = (label, maxLength = 30) => {
  if (!label) return '';
  return label.length > maxLength ? label.substring(0, maxLength - 3) + '...' : label;
};

export default function CustomChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500 bg-white rounded-lg shadow-lg">
        <p>ไม่พบข้อมูลสรุป</p>
        <p className="text-sm mt-1">อาจไม่มีข้อมูลในชุดข้อมูลปัจจุบัน</p>
      </div>
    );
  }

  const labels = data.map(item => truncateLabel(item.name_type, 25));
  const originalLabels = data.map(item => item.name_type || '');

  const chartData = {
    labels,
    datasets: [
      {
        label: 'ชดเชย',
        data: data.map(item => item.totalCompensatedAmount || 0),
        backgroundColor: '#82ca9d',
      },
      {
        label: 'ไม่ชดเชย',
        data: data.map(item => item.totalNonCompensatedAmount || 0),
        backgroundColor: '#FFA500',
      },
    ],
  };

  const options = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' },
      title: {
        display: true,
        text: 'เปรียบเทียบงบ ชดเชย vs ไม่ชดเชย แยกตามรายการประเภทที่ขอเบิก',
        font: {
          family: 'Prompt',
          size: 15,
          weight: 'bold',
        },
        color: '#111',
        padding: {
          top: 20,
          bottom: 30,
        },
      },
      tooltip: {
        callbacks: {
          title: function (context) {
            return originalLabels[context[0].dataIndex];
          },
          label: function (context) {
            const value = context.parsed.x.toLocaleString();
            return `${context.dataset.label}: ${value} บาท`;
          },
        },
      },
    },
    scales: {
      x: {
        beginAtZero: true,
      },
    },
  };

  return (
    <div style={{ width: '100%', height: `100%`, backgroundColor: 'white', borderRadius: '10px' }}>
      <Bar data={chartData} options={options} />
    </div>
  );
}
