import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { DashboardPage } from './pages/DashboardPage';
import { HabitsPage } from './pages/HabitsPage';
import { CalendarPage } from './pages/CalendarPage';
import { StatisticsPage } from './pages/StatisticsPage';
import { GoalsPage } from './pages/GoalsPage';
import { JournalPage } from './pages/JournalPage';
import { FocusPage } from './pages/FocusPage';
import { SettingsPage } from './pages/SettingsPage';

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<DashboardPage />} />
          <Route path="habits" element={<HabitsPage />} />
          <Route path="calendar" element={<CalendarPage />} />
          <Route path="statistics" element={<StatisticsPage />} />
          <Route path="goals" element={<GoalsPage />} />
          <Route path="journal" element={<JournalPage />} />
          <Route path="focus" element={<FocusPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
