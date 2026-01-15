import React from 'react';
import { motion } from 'framer-motion';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { TrendingUp, Award, Calendar, Target, Flame, Trophy } from 'lucide-react';
import { useHabits } from '../context/HabitContext';

const Analytics: React.FC = () => {
  const { habits, getWeeklyData, getMonthlyData, getTotalCompletionsToday } = useHabits();

  const weeklyData = getWeeklyData();
  const monthlyData = getMonthlyData();
  const completedToday = getTotalCompletionsToday();

  // Calculate overall stats
  const totalCompletions = habits.reduce((sum, h) => sum + h.completedDates.length, 0);
  const totalStreaks = habits.reduce((sum, h) => sum + h.streak, 0);
  const bestStreak = Math.max(...habits.map(h => h.bestStreak), 0);
  const avgCompletion = habits.length > 0 
    ? Math.round(weeklyData.reduce((sum, d) => sum + (d.total > 0 ? (d.completed / d.total) * 100 : 0), 0) / 7)
    : 0;

  // Data for pie chart
  const pieData = [
    { name: 'Completed', value: completedToday, color: '#667eea' },
    { name: 'Remaining', value: Math.max(0, habits.length - completedToday), color: 'rgba(255,255,255,0.08)' },
  ];

  // Habit performance data
  const habitPerformance = habits.map(habit => ({
    name: habit.name.slice(0, 8) + (habit.name.length > 8 ? '..' : ''),
    streak: habit.streak,
    best: habit.bestStreak,
    total: habit.completedDates.length,
    color: habit.color,
  })).slice(0, 5);

  // Unified stat card component
  const StatCard = ({ icon: Icon, label, value, gradient, delay = 0 }: {
    icon: React.ElementType;
    label: string;
    value: string | number;
    gradient: string;
    delay?: number;
  }) => (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.25 }}
      className="glass-card stat-card"
    >
      <div className={`stat-icon bg-gradient-to-br ${gradient}`}>
        <Icon className="text-white" strokeWidth={2} />
      </div>
      <div className="stat-content">
        <div className="stat-value">{value}</div>
        <div className="stat-label">{label}</div>
      </div>
    </motion.div>
  );

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-card p-3 text-sm border-0">
          <p className="text-white font-medium text-xs mb-1">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="text-xs">
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (habits.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="glass-card empty-state"
      >
        <motion.div
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          className="empty-state-icon"
        >
          📊
        </motion.div>
        <h3>No Data Yet</h3>
        <p>Start tracking habits to see your analytics!</p>
      </motion.div>
    );
  }

  return (
    <div className="analytics-grid">
      {/* Stats Grid - 2x2 on mobile, 4 cols on tablet+ */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <StatCard
          icon={Target}
          label="Completions"
          value={totalCompletions}
          gradient="from-blue-400 to-cyan-400"
          delay={0}
        />
        <StatCard
          icon={Flame}
          label="Streaks"
          value={totalStreaks}
          gradient="from-orange-400 to-red-400"
          delay={0.05}
        />
        <StatCard
          icon={Trophy}
          label="Best Streak"
          value={`${bestStreak}d`}
          gradient="from-purple-400 to-pink-400"
          delay={0.1}
        />
        <StatCard
          icon={Award}
          label="Avg. Rate"
          value={`${avgCompletion}%`}
          gradient="from-green-400 to-teal-400"
          delay={0.15}
        />
      </div>

      {/* Charts Grid - 1 col on mobile, 2 cols on tablet+ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
        {/* Today's Progress */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.25 }}
          className="glass-card analytics-card"
        >
          <div className="analytics-card-header">
            <div className="analytics-card-icon bg-gradient-to-br from-purple-400 to-pink-500">
              <Calendar className="text-white" strokeWidth={2} />
            </div>
            <h3 className="analytics-card-title">Today's Progress</h3>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-24 h-24 flex-shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={28}
                    outerRadius={42}
                    paddingAngle={3}
                    dataKey="value"
                    strokeWidth={0}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div>
              <div className="text-2xl font-semibold text-white">
                {habits.length > 0 ? Math.round((completedToday / habits.length) * 100) : 0}%
              </div>
              <div className="text-sm text-white/45 mt-0.5">
                {completedToday} of {habits.length} done
              </div>
            </div>
          </div>
        </motion.div>

        {/* Weekly Progress Chart */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.25 }}
          className="glass-card analytics-card"
        >
          <div className="analytics-card-header">
            <div className="analytics-card-icon bg-gradient-to-br from-blue-400 to-cyan-500">
              <TrendingUp className="text-white" strokeWidth={2} />
            </div>
            <h3 className="analytics-card-title">Weekly Overview</h3>
          </div>
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklyData}>
                <defs>
                  <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#667eea" stopOpacity={0.35}/>
                    <stop offset="95%" stopColor="#667eea" stopOpacity={0.05}/>
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="day" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#9ca3af', fontSize: 10, fontWeight: 500 }}
                />
                <YAxis hide />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="completed"
                  stroke="#667eea"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorCompleted)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Monthly Progress */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.25 }}
          className="glass-card analytics-card"
        >
          <div className="analytics-card-header">
            <div className="analytics-card-icon bg-gradient-to-br from-green-400 to-emerald-500">
              <Calendar className="text-white" strokeWidth={2} />
            </div>
            <h3 className="analytics-card-title">Monthly Progress</h3>
          </div>
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <XAxis 
                  dataKey="week" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#9ca3af', fontSize: 10, fontWeight: 500 }}
                />
                <YAxis hide />
                <Tooltip content={<CustomTooltip />} />
                <Bar 
                  dataKey="completed" 
                  fill="url(#barGradient)"
                  radius={[4, 4, 0, 0]}
                  name="Completed"
                >
                  {monthlyData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={`rgba(102, 126, 234, ${0.5 + (index * 0.125)})`} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Habit Performance */}
        {habitPerformance.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.25 }}
            className="glass-card analytics-card"
          >
            <div className="analytics-card-header">
              <div className="analytics-card-icon bg-gradient-to-br from-yellow-400 to-orange-500">
                <Award className="text-white" strokeWidth={2} />
              </div>
              <h3 className="analytics-card-title">Habit Performance</h3>
            </div>
            <div className="h-44">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={habitPerformance} layout="vertical" barSize={16}>
                  <XAxis type="number" hide />
                  <YAxis 
                    type="category" 
                    dataKey="name" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#d1d5db', fontSize: 10, fontWeight: 500 }}
                    width={70}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar 
                    dataKey="total" 
                    radius={[0, 4, 4, 0]}
                    name="Total"
                  >
                    {habitPerformance.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color || '#667eea'} fillOpacity={0.8} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Analytics;
