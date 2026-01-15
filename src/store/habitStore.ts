import { v4 as uuidv4 } from 'uuid';

export interface Habit {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: 'purple' | 'pink' | 'blue' | 'green' | 'orange' | 'teal';
  frequency: 'daily' | 'weekly' | 'custom';
  targetDays: number[];
  completedDates: string[];
  createdAt: string;
  streak: number;
  bestStreak: number;
}

export interface HabitStore {
  habits: Habit[];
  addHabit: (habit: Omit<Habit, 'id' | 'completedDates' | 'createdAt' | 'streak' | 'bestStreak'>) => void;
  deleteHabit: (id: string) => void;
  toggleHabitCompletion: (id: string, date: string) => void;
  getHabitCompletionRate: (id: string, days: number) => number;
  getTotalCompletionsToday: () => number;
  getWeeklyData: () => { day: string; completed: number; total: number }[];
  getMonthlyData: () => { week: string; completed: number; total: number }[];
}

const STORAGE_KEY = 'habitflow-data';

const loadHabits = (): Habit[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

const saveHabits = (habits: Habit[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(habits));
};

const calculateStreak = (completedDates: string[]): number => {
  if (completedDates.length === 0) return 0;
  
  const sorted = [...completedDates].sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  let streak = 0;
  let currentDate = new Date(today);
  
  for (let i = 0; i < 365; i++) {
    const dateStr = currentDate.toISOString().split('T')[0];
    if (sorted.includes(dateStr)) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    } else if (i === 0) {
      // Today not completed yet, check yesterday
      currentDate.setDate(currentDate.getDate() - 1);
    } else {
      break;
    }
  }
  
  return streak;
};

export const createHabitStore = (): HabitStore => {
  let habits = loadHabits();

  const updateStreaks = () => {
    habits = habits.map(habit => {
      const streak = calculateStreak(habit.completedDates);
      return {
        ...habit,
        streak,
        bestStreak: Math.max(habit.bestStreak, streak)
      };
    });
    saveHabits(habits);
  };

  // Update streaks on load
  updateStreaks();

  return {
    get habits() {
      return habits;
    },

    addHabit(habitData) {
      const newHabit: Habit = {
        ...habitData,
        id: uuidv4(),
        completedDates: [],
        createdAt: new Date().toISOString(),
        streak: 0,
        bestStreak: 0
      };
      habits = [...habits, newHabit];
      saveHabits(habits);
    },

    deleteHabit(id) {
      habits = habits.filter(h => h.id !== id);
      saveHabits(habits);
    },

    toggleHabitCompletion(id, date) {
      habits = habits.map(habit => {
        if (habit.id !== id) return habit;
        
        const isCompleted = habit.completedDates.includes(date);
        const completedDates = isCompleted
          ? habit.completedDates.filter(d => d !== date)
          : [...habit.completedDates, date];
        
        const streak = calculateStreak(completedDates);
        
        return {
          ...habit,
          completedDates,
          streak,
          bestStreak: Math.max(habit.bestStreak, streak)
        };
      });
      saveHabits(habits);
    },

    getHabitCompletionRate(id, days) {
      const habit = habits.find(h => h.id === id);
      if (!habit) return 0;
      
      const today = new Date();
      let completed = 0;
      
      for (let i = 0; i < days; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        if (habit.completedDates.includes(dateStr)) {
          completed++;
        }
      }
      
      return Math.round((completed / days) * 100);
    },

    getTotalCompletionsToday() {
      const today = new Date().toISOString().split('T')[0];
      return habits.filter(h => h.completedDates.includes(today)).length;
    },

    getWeeklyData() {
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const data = [];
      const today = new Date();
      
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        const dayName = days[date.getDay()];
        
        const completed = habits.filter(h => h.completedDates.includes(dateStr)).length;
        
        data.push({
          day: dayName,
          completed,
          total: habits.length
        });
      }
      
      return data;
    },

    getMonthlyData() {
      const data = [];
      const today = new Date();
      
      for (let week = 3; week >= 0; week--) {
        let completed = 0;
        let total = 0;
        
        for (let day = 0; day < 7; day++) {
          const date = new Date(today);
          date.setDate(date.getDate() - (week * 7 + day));
          const dateStr = date.toISOString().split('T')[0];
          
          habits.forEach(habit => {
            total++;
            if (habit.completedDates.includes(dateStr)) {
              completed++;
            }
          });
        }
        
        data.push({
          week: `Week ${4 - week}`,
          completed,
          total
        });
      }
      
      return data;
    }
  };
};
