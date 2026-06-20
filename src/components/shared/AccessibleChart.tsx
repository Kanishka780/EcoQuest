import React from 'react';

interface AccessibleChartProps {
  title: string;
  description: string; // Detailed text description for screen readers
  data: { label: string; value: number | string; unit: string }[];
  children: React.ReactNode; // Recharts component
}

export function AccessibleChart({ title, description, data, children }: AccessibleChartProps) {
  const chartId = `chart-title-${title.toLowerCase().replace(/\s+/g, '-')}`;

  return (
    <figure role="group" aria-labelledby={chartId} className="w-full">
      <h3 id={chartId} className="sr-only">{title}</h3>
      
      {/* Visual Chart - Marked as decorative because the table/figcaption provides equivalent data */}
      <div aria-hidden="true" className="w-full">
        {children}
      </div>
      
      {/* Screen Reader Alternative */}
      <figcaption className="sr-only">{description}</figcaption>
      
      {/* Expandable Data Table for Keyboard/Screen Reader Access */}
      <details className="mt-4 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-zinc-50 dark:bg-zinc-900/50 overflow-hidden">
        <summary className="text-sm font-medium px-4 py-2 text-zinc-600 dark:text-zinc-400 cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500">
          View data table for {title}
        </summary>
        
        <div className="border-t border-zinc-200 dark:border-zinc-800 p-2 overflow-x-auto">
          <table className="min-w-full text-xs text-zinc-700 dark:text-zinc-300 border-collapse">
            <caption className="sr-only">{title} data table representation</caption>
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-800">
                <th scope="col" className="text-left font-semibold py-1.5 px-2">Category</th>
                <th scope="col" className="text-right font-semibold py-1.5 px-2">Value</th>
              </tr>
            </thead>
            <tbody>
              {data.map(({ label, value, unit }) => (
                <tr key={label} className="border-b border-zinc-100 dark:border-zinc-800/40 last:border-0 hover:bg-zinc-100/50 dark:hover:bg-zinc-800/30">
                  <td className="py-1.5 px-2 text-left font-medium">{label}</td>
                  <td className="py-1.5 px-2 text-right tabular-nums">{value} {unit}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </figure>
  );
}
