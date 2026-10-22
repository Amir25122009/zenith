# Zenith — Habit Tracker & Personal Productivity Planner

> **"Rise to your best, one habit at a time."**

Zenith is a clean, responsive, local-first web application inspired by the functionality and minimalist user experience of [APEX](https://apexhabits.app/). It is engineered to help individuals build positive routines, eliminate harmful habits, overcome procrastination, and cultivate long-term self-discipline.

---

## 🌟 Key Features

### 1. Daily Dashboard & Check-ins (`/`)
- **Today's Agenda**: Clean interactive checklist with single-click completion toggles and numeric value entry.
- **Date Selector & Backfilling**: Easily browse forward and back in time to review history or backfill missed check-ins without losing streaks.
- **Circular Consistency Ring**: Dynamic visual feedback reflecting daily progress.
- **Daily Discipline Philosophy**: Curated motivational thoughts on discipline and compound habits.
- **1-Tap Mood Check-in**: Fast logging of emotional state (Awful, Bad, Okay, Good, Great).

### 2. Habit Management (`/habits`)
- **Build & Break Habits**: Dedicated workflows for building constructive routines (e.g., *Reading*, *Hydration*, *Workout*) and breaking negative patterns (e.g., *Excessive Screen Time*, *Sugar*).
- **Flexible Recurrence Schedules**:
  - *Daily*: Every day.
  - *Specific Days of the Week*: e.g., Mon–Fri study habits.
  - *Times Per Week*: Flexible targets (e.g., 4x/week) so an unexpected busy day doesn't break momentum.
- **Tracking Modalities**:
  - *Yes/No (Boolean)*
  - *Numeric Units* (e.g., 20 pages, 500 ml, 60 mins).
- **Categories & Customization**: 9 life categories, 30+ custom icons, and color palettes.
- **Archive & Soft Delete**: Preserve historical logs without cluttering your active view.

### 3. Calendar & Consistency Heatmap (`/calendar`)
- **Monthly Matrix View**: Interactive monthly calendar with day-by-day completion percentages.
- **120-Day Consistency Heatmap**: GitHub-style activity grid visualizing consistency momentum over 17 weeks.
- **Day Inspection & Backfill Modal**: Click any calendar day to view scheduled habits, toggle check-ins, or review that day's journal reflection.

### 4. Advanced Statistics & Weakness Detection (`/statistics`)
- **Daily Completion Trajectory**: Interactive Recharts area chart over 7, 30, or 90 days.
- **Habit-by-Habit Comparison**: Horizontal performance bar charts highlighting top performers.
- **Category Balance**: Visual progress breakdown across health, learning, mindfulness, and productivity.
- **Weakness & Risk Detection**: Automatically flags habits falling below 50% consistency to prompt routine adjustments.
- **Streaks Leaderboard**: Tracks active streaks, lifetime bests, and total lifetime check-ins.

### 5. Long-Term Goals & Milestones (`/goals`)
- **Outcome Planning**: Establish target completion dates and milestone checklists.
- **Supporting Habits Linking**: Connect daily micro-habits to macro goals (e.g., linking *Daily Reading* to *Read 6 Books this Quarter*).
- **Interactive Milestones**: Check off progressive steps as you advance.

### 6. Mindful Journal & Reflection (`/journal`)
- **Daily Reflections**: Record thoughts, wins, and lessons learned.
- **Gratitude Tracking**: Daily gratitude prompt for mental clarity.
- **14-Day Mood Trajectory**: Interactive trend line chart tracking emotional well-being.
- **Habit-Mood Correlation**: Visual insight illustrating how discipline impacts mental health.

### 7. Deep Work & Focus Timer (`/focus`)
- **Pomodoro & Focus Sessions**: Clean Pomodoro timer with presets (25m Pomodoro, 50m Deep Work, 15m Sprint).
- **Distraction-Free Interface**: Animated circular timer countdown with pause, resume, and skip controls.
- **Automated Logging**: Completed focus sessions automatically save to local database with duration and task labels.

### 8. Local-First Portability & Settings (`/settings`)
- **Zero-Cloud Dependency**: 100% of data is stored in browser **IndexedDB** using Dexie.js. Works offline seamlessly.
- **Backup & Restore**: Export full tracking history to JSON and restore on any browser or device.
- **Sample Re-Seeding**: Reset database anytime with realistic sample history.

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Framework** | React 19 + TypeScript |
| **Bundler** | Vite 8 |
| **Styling** | Tailwind CSS v4 |
| **Icons** | Lucide React |
| **Charts** | Recharts |
| **Database** | Dexie.js (IndexedDB wrapper) |
| **Date Utilities** | date-fns v4 |
| **Routing** | React Router v7 |

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher

### Installation & Running Locally

1. Navigate to the project directory:
   ```bash
   cd zenith
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```
   Open [http://localhost:5173](http://localhost:5173) in your browser.

4. Build for production:
   ```bash
   npm run build
   ```
   The production bundle is generated in `dist/`.

---

## 📦 Project Structure

```
zenith/
├── src/
│   ├── components/
│   │   ├── habits/         # HabitCard, HabitForm
│   │   ├── layout/         # Sidebar, MobileNav, Layout wrapper
│   │   └── ui/             # Button, Modal, Card, Badge, Input, ProgressRing
│   ├── db/
│   │   ├── index.ts        # Dexie IndexedDB tables & schema
│   │   └── seed.ts         # Starter demo habits & 21-day log history
│   ├── hooks/
│   │   ├── useHabits.ts    # Habit & check-in queries & mutations
│   │   ├── useGoals.ts     # Goals & milestone hooks
│   │   ├── useJournal.ts   # Daily notes & mood queries
│   │   ├── useFocusTimer.ts# Pomodoro timer logic & session persistence
│   │   └── useSettings.ts  # Theme & app preferences
│   ├── lib/
│   │   ├── constants.ts    # Colors, quotes, defaults
│   │   └── utils.ts        # Streaks, dates, formatters, mood helpers
│   ├── pages/
│   │   ├── DashboardPage.tsx
│   │   ├── HabitsPage.tsx
│   │   ├── CalendarPage.tsx
│   │   ├── StatisticsPage.tsx
│   │   ├── GoalsPage.tsx
│   │   ├── JournalPage.tsx
│   │   ├── FocusPage.tsx
│   │   └── SettingsPage.tsx
│   ├── types/
│   │   └── index.ts        # TypeScript data models & contracts
│   ├── App.tsx             # Route definitions
│   ├── index.css           # Tailwind CSS v4 styling & color tokens
│   └── main.tsx            # Entry mount point
├── index.html
├── vite.config.ts
├── tsconfig.json
└── package.json
```

---

## 🔒 Data Privacy & Cloud Architecture Note

Zenith is architected **local-first** by default:
- **Private by Design**: Your habit logs and personal journal entries never leave your device without your explicit export.
- **Cloud Synchronization Readiness**: If cloud multi-device sync is desired, the data models in `src/types/index.ts` map 1:1 to PostgreSQL / Supabase tables. Simply configure Supabase credentials in `.env` and swap or augment Dexie tables with Supabase client sync hooks.
