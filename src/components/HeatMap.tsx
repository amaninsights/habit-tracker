import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useHabits } from '../context/HabitContext';

const HeatMap: React.FC = () => {
  const { habits } = useHabits();

  // Generate last 365 days
  const calendarData = useMemo(() => {
    const data: { date: string; count: number; level: number }[] = [];
    const today = new Date();
    
    for (let i = 364; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      // Count completions across all habits for this date
      const count = habits.reduce((sum, habit) => {
        return sum + (habit.completedDates.includes(dateStr) ? 1 : 0);
      }, 0);
      
      // Calculate level (0-4)
      let level = 0;
      if (habits.length > 0) {
        const percentage = count / habits.length;
        if (percentage > 0.75) level = 4;
        else if (percentage > 0.5) level = 3;
        else if (percentage > 0.25) level = 2;
        else if (percentage > 0) level = 1;
      }
      
      data.push({ date: dateStr, count, level });
    }
    
    return data;
  }, [habits]);

  // Group by weeks
  const weeks = useMemo(() => {
    const result: typeof calendarData[] = [];
    for (let i = 0; i < calendarData.length; i += 7) {
      result.push(calendarData.slice(i, i + 7));
    }
    return result;
  }, [calendarData]);



  const totalCompletions = calendarData.reduce((sum, day) => sum + day.count, 0);
  const activeDays = calendarData.filter(day => day.count > 0).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card heatmap-container"
    >
      <div className="heatmap-header">
        <h3 className="heatmap-title">Activity Heat Map</h3>
        <div className="heatmap-subtitle">
          {totalCompletions} completions in {activeDays} days
        </div>
      </div>

      {/* Heat Map Grid */}
      <div className="heatmap-grid">
        {weeks.map((week, weekIndex) => (
          <div key={weekIndex} className="heatmap-week">
            {week.map((day) => (
              <div
                key={day.date}
                className={`heatmap-day ${day.level > 0 ? `level-${day.level}` : ''}`}
                title={`${day.date}: ${day.count} completions`}
              />
            ))}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="heatmap-legend">
        <span>Less</span>
        <div className="heatmap-legend-item" />
        <div className="heatmap-legend-item level-1" />
        <div className="heatmap-legend-item level-2" />
        <div className="heatmap-legend-item level-3" />
        <div className="heatmap-legend-item level-4" />
        <span>More</span>
      </div>
    </motion.div>
  );
};

export default HeatMap;
