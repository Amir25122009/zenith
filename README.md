# Zenith — Habit Tracker & Personal Productivity Planner

> **"Rise to your best, one habit at a time."**

Zenith is a clean, responsive, local-first web application inspired by the functionality and minimalist user experience of [APEX](https://apexhabits.app/). It is engineered to help individuals build positive routines, eliminate harmful habits, overcome procrastination, and cultivate long-term self-discipline.

---

## 🌟 Key Features

### 1. Daily Dashboard & Check-ins (`/`)
- **Today's Agenda**: Clean interactive checklist with single-click completion toggles and numeric value entry.
- **Zen Sound Effects**: Acoustic wooden marimba click on checking off habits (with instant mute/unmute toggle).
- **Celebration Confetti Blast**: Particle burst and melodic chime when completing 100% of today's habits!
- **Date Selector & Backfilling**: Easily browse forward and back in time to review history or backfill missed check-ins without losing streaks.
- **Circular Consistency Ring**: Dynamic visual feedback reflecting daily progress.
- **1-Tap Mood Check-in**: Fast logging of emotional state (Awful, Bad, Okay, Good, Great).

### 2. Habit Management (`/habits`)
- **Build & Break Habits**: Dedicated workflows for building constructive routines (e.g., *Reading*, *Hydration*, *Workout*) and breaking negative patterns (e.g., *Excessive Screen Time*, *Sugar*).
- **Flexible Recurrence Schedules**:
  - *Daily*: Every day.
  - *Specific Days of the Week*: e.g., Mon–Fri study habits.
  - *Times Per Week*: Weekly streak evaluation (e.g., 4x/week) so rest days don't break your momentum.
- **Tracking Modalities**:
  - *Yes/No (Boolean)*
  - *Numeric Units* (e.g., 20 pages, 500 ml, 60 mins).
- **Categories & Customization**: 9 life categories, 30+ custom icons, and color palettes.

### 3. Focus Sanctuary & Ambient Soundscapes (`/focus`)
- **Pomodoro & Deep Work Timer**: Presets (25m Pomodoro, 50m Deep Work, 15m Sprint, 90m Marathon).
- **Synthesized Ambient Audio**: Native Web Audio soundscapes (Rain 🌧️, Ocean Waves 🌊, 432Hz Alpha Waves 🧘, White Noise 🎧) with real-time volume slider.
- **Singing Bowl Bell**: Gentle Tibetan chime upon completing each focus round.
- **Automated Logging**: Completed focus sessions automatically save to your daily ledger.

### 4. Gamification & Discipline Ascent
- Earn XP for every check-in (+15 XP), focused study minute (+2 XP), and streak milestones (+30 XP).
- Progress from *Basecamp Novice* 🏕️ up to *Zenith Peak Master* 👑 with level progression badges.

### 5. Spotlight Command Palette (`Ctrl+K` / `Cmd+K`)
- Press `Cmd+K` anywhere to open instant search:
  - Jump directly to any page.
  - Search and toggle any habit instantly with a keystroke.
  - Toggle audio sound effects or open cloud sync.

### 6. Free Cloud Synchronization (Supabase)
- **Hybrid Architecture**: Works 100% offline out-of-the-box (IndexedDB).
- **Multi-Device Cloud Vault**: Link a free Supabase PostgreSQL database to allow users on the web to create accounts, sign in, and sync their habits between mobile and desktop!
- Fully protected with Row Level Security (RLS) policies.

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Framework** | React 19 + TypeScript |
| **Bundler** | Vite 8 |
| **Styling** | Tailwind CSS v4 |
| **Icons** | Lucide React |
| **Charts** | Recharts |
| **Audio Engine** | Web Audio API (native synthesized soundscapes) |
| **Celebrations** | canvas-confetti |
| **Database** | Dexie.js (IndexedDB) + Supabase (PostgreSQL Cloud) |
| **Date Utilities** | date-fns v4 |
| **Routing** | React Router v7 |

---

## 🚀 Connecting Free Cloud Server (Supabase) in 2 Minutes

1. Create a free project at [supabase.com](https://supabase.com).
2. In the Supabase Dashboard, go to **SQL Editor** -> **New Query**, paste the contents of `supabase/schema.sql` and click **Run**.
3. Go to **Project Settings -> API**, and copy:
   - `Project URL`
   - `Project API Keys -> anon public`
4. Add them to your Vercel Environment Variables (or local `.env`):
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGci...
   ```
5. Deploy or restart: users can now sign up, log in, and sync their habits across all their devices for free!

---

## 📦 Running Locally

```bash
cd zenith
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).
