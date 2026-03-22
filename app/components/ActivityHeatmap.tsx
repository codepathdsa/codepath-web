'use client';

import { useEffect, useState } from 'react';
import { useProgress } from '@/app/hooks/useProgress';

export default function ActivityHeatmap() {
  const { solvedState } = useProgress();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="heatmap-container loading-skeleton" style={{ height: '140px' }} />;
  }

  // 1. Group solving timestamps by YYYY-MM-DD
  const activity: Record<string, number> = {};
  Object.values(solvedState).forEach(item => {
    if (item.ts) {
      const dateStr = new Date(item.ts).toISOString().slice(0, 10);
      activity[dateStr] = (activity[dateStr] || 0) + 1;
    }
  });

  // 2. Generate aligned grid ending on today
  const today = new Date();
  const todayDay = today.getDay(); // 0 is Sunday
  const weeksToShow = 26; // 6 months of data
  const totalCells = (weeksToShow - 1) * 7 + (todayDay + 1);

  const days = [];
  for (let i = totalCells - 1; i >= 0; i--) {
    const d = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
    const dateStr = d.toISOString().slice(0, 10);
    days.push({
      dateStr,
      count: activity[dateStr] || 0,
      month: d.toLocaleString('en-US', { month: 'short' })
    });
  }

  // Generate month labels
  const monthLabels: { label: string, colIndex: number }[] = [];
  let lastMonth = '';
  days.forEach((d, i) => {
    // Only add a label if it's the first week of the month being displayed
    if (d.month !== lastMonth && i % 7 === 0) {
      monthLabels.push({ label: d.month, colIndex: Math.floor(i / 7) });
      lastMonth = d.month;
    } else if (d.month !== lastMonth) {
      lastMonth = d.month;
    }
  });

  return (
    <div className="heatmap-container">
      <div className="heatmap-header">
        <h4 className="heatmap-title">Activity Timeline</h4>
        <span className="heatmap-total">{Object.keys(solvedState).length} problems solved total</span>
      </div>

      <div className="heatmap-wrapper">
        <div className="heatmap-y-axis">
          <span>Mon</span>
          <span>Wed</span>
          <span>Fri</span>
        </div>

        <div className="heatmap-scroll">
          <div className="heatmap-months">
            {monthLabels.map((m, i) => (
              <span key={i} style={{ gridColumn: m.colIndex + 1 }}>{m.label}</span>
            ))}
          </div>
          <div className="heatmap-grid">
            {days.map(d => {
              // Clamp level to 0-4
              const level = Math.min(d.count, 4);
              return (
                <div 
                  key={d.dateStr}
                  className={`heatmap-cell count-${level}`}
                  title={`${d.count} problems on ${d.dateStr}`}
                />
              );
            })}
          </div>
        </div>
      </div>
      
      <div className="heatmap-legend">
        <span>Less</span>
        <div className="heatmap-cell count-0" />
        <div className="heatmap-cell count-1" />
        <div className="heatmap-cell count-2" />
        <div className="heatmap-cell count-3" />
        <div className="heatmap-cell count-4" />
        <span>More</span>
      </div>
    </div>
  );
}
