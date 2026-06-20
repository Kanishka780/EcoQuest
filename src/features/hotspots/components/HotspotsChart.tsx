'use client';

import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface HotspotsChartProps {
  data: { name: string; value: number }[];
}

const COLORS = ['#10b981', '#fbbf24', '#f87171', '#3b82f6'];

export default function HotspotsChart({ data }: HotspotsChartProps) {
  // Safe check if no data
  const hasEmissions = data.some(d => d.value > 0);
  
  if (!hasEmissions) {
    return (
      <div className="h-64 flex items-center justify-center text-xs text-zinc-500 font-medium">
        No emissions data recorded. Please fill out the Calculator.
      </div>
    );
  }

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Tooltip 
            formatter={(value: unknown) => [`${parseFloat(value as string).toFixed(1)} kg CO2e`, 'Emissions']}
            contentStyle={{ 
              backgroundColor: 'rgba(15, 23, 42, 0.95)', 
              borderColor: 'rgba(51, 65, 85, 0.5)',
              borderRadius: '8px',
              color: '#fff',
              fontSize: '11px'
            }}
          />
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={90}
            paddingAngle={4}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Legend 
            verticalAlign="bottom" 
            height={36} 
            iconType="circle"
            formatter={(value) => <span className="text-xs text-zinc-700 dark:text-zinc-300 font-semibold">{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
