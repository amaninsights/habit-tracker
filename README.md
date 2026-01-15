# 🌟 HabitFlow - Ultimate Habit Tracker

A beautiful, modern habit tracking Progressive Web App (PWA) with stunning UI, analytics, and streak tracking. Install it on your phone and track your habits anywhere!

![HabitFlow](https://img.shields.io/badge/React-18-blue) ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue) ![Tailwind](https://img.shields.io/badge/Tailwind-4-teal) ![PWA](https://img.shields.io/badge/PWA-Ready-green)

## ✨ Features

- **🎨 Stunning UI** - Glassmorphism design with beautiful gradients and animations
- **📊 Analytics Dashboard** - Weekly/monthly charts to track your progress
- **🔥 Streak Tracking** - Stay motivated with streak counters and best streak records
- **📱 Mobile-First PWA** - Install on your phone like a native app
- **💾 Offline Support** - Works without internet connection
- **🌙 Dark Theme** - Easy on the eyes with a beautiful dark interface
- **⚡ Smooth Animations** - Delightful interactions powered by Framer Motion

## 🚀 Getting Started

### Install Dependencies
```bash
npm install
```

### Run Development Server
```bash
npm run dev
```

### Build for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```
## 📱 Install on Your Phone

1. Open the app in Chrome on your phone
2. Tap the "Add to Home Screen" prompt (or use browser menu → "Install App")
3. The app will appear on your home screen like a native app!

## 🛠 Tech Stack

- **React 18** - UI Library
- **TypeScript** - Type Safety
- **Vite** - Build Tool
- **Tailwind CSS 4** - Styling
- **Framer Motion** - Animations
- **Recharts** - Charts & Analytics
- **Lucide Icons** - Beautiful Icons
- **Vite PWA Plugin** - PWA Support

## 📁 Project Structure

```
src/
├── components/          # React components
│   ├── Header.tsx       # App header with stats
│   ├── HabitCard.tsx    # Individual habit card
│   ├── HabitList.tsx    # List of all habits
│   ├── AddHabitModal.tsx# Add new habit modal
│   ├── Analytics.tsx    # Analytics dashboard
│   └── Navigation.tsx   # Bottom navigation
├── context/
│   └── HabitContext.tsx # Global habit state
├── store/
│   └── habitStore.ts    # Data persistence layer
├── App.tsx              # Main app component
├── main.tsx             # App entry point
└── index.css            # Global styles
```

## 🎯 Usage

1. **Add a Habit** - Tap the + button to create a new habit
2. **Complete Habits** - Tap the circle to mark a habit complete
3. **View Analytics** - Switch to Analytics tab to see your progress
4. **Track Streaks** - Build streaks by completing habits daily

## 📄 License

MIT License - feel free to use this project for personal or commercial purposes.
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
>>>>>>> 82a2d3f (Initial commit: Ultimate Habit Tracker)
