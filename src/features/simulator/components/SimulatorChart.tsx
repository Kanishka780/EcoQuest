'use client';

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface SimulatorChartProps {
  current: number;
  simulated: number;
}

export default function SimulatorChart({ current, simulated }: SimulatorChartProps) {
  const data = [
    { name: 'Current', value: current, fill: '#64748b' },
    { name: 'Simulated', value: simulated, fill: '#10b981' }
  ];

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(226, 232, 240, 0.1)" />
          <XAxis 
            dataKey="name" 
            tickLine={false}
            tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 600 }}
          />
          <YAxis 
            tickLine={false}
            tick={{ fill: '#94a3b8', fontSize: 10 }}
            unit=" kg"
          />
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
          <Bar dataKey="value" radius={[8, 8, 0, 0]} maxBarSize={60}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
