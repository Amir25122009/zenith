import { useState } from 'react';
import {
  Download,
  Upload,
  RefreshCw,
  Database,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Info,
  Cloud,
  CloudCheck,
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { CloudSyncModal } from '../components/ui/CloudSyncModal';
import { db } from '../db';
import { seedInitialData } from '../db/seed';
import { useHabits } from '../hooks/useHabits';
import { useGoals } from '../hooks/useGoals';
import { useJournal } from '../hooks/useJournal';
import { useCloudSync } from '../hooks/useCloudSync';
import { APP_NAME } from '../lib/constants';

export function SettingsPage() {
  const { habits } = useHabits();
  const { goals } = useGoals();
  const { notes } = useJournal();
  const { user, isConfigured } = useCloudSync();

  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [isCloudModalOpen, setIsCloudModalOpen] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Export JSON backup
  const handleExportData = async () => {
    try {
      const allHabits = await db.habits.toArray();
      const allLogs = await db.habitLogs.toArray();
      const allGoals = await db.goals.toArray();
      const allNotes = await db.dailyNotes.toArray();
      const allFocus = await db.focusSessions.toArray();
      const allSettings = await db.settings.toArray();

      const backup = {
        version: 1,
        exportedAt: new Date().toISOString(),
        appName: APP_NAME,
        data: {
          habits: allHabits,
          habitLogs: allLogs,
          goals: allGoals,
          dailyNotes: allNotes,
          focusSessions: allFocus,
          settings: allSettings,
        },
      };

      const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `zenith-backup-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);

      setStatusMessage('Data exported successfully!');
      setTimeout(() => setStatusMessage(null), 3000);
    } catch (err) {
      console.error(err);
      setStatusMessage('Export failed. Check browser console.');
    }
  };

  // Import JSON backup
  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const content = event.target?.result as string;
        const backup = JSON.parse(content);

        if (!backup.data || !backup.data.habits) {
          throw new Error('Invalid backup file schema.');
        }

        await db.transaction('rw', [db.habits, db.habitLogs, db.goals, db.dailyNotes, db.focusSessions], async () => {
          await db.habits.clear();
          await db.habitLogs.clear();
          await db.goals.clear();
          await db.dailyNotes.clear();
          await db.focusSessions.clear();

          if (backup.data.habits?.length) await db.habits.bulkAdd(backup.data.habits);
          if (backup.data.habitLogs?.length) await db.habitLogs.bulkAdd(backup.data.habitLogs);
          if (backup.data.goals?.length) await db.goals.bulkAdd(backup.data.goals);
          if (backup.data.dailyNotes?.length) await db.dailyNotes.bulkAdd(backup.data.dailyNotes);
          if (backup.data.focusSessions?.length) await db.focusSessions.bulkAdd(backup.data.focusSessions);
        });

        setStatusMessage('Backup restored successfully! All data loaded.');
        setTimeout(() => setStatusMessage(null), 3000);
      } catch (err) {
        console.error(err);
        setStatusMessage('Failed to import file. Please verify it is a valid Zenith backup.');
      }
    };
    reader.readAsText(file);
  };

  // Reset & Re-seed
  const handleResetData = async () => {
    try {
      localStorage.removeItem('zenith-seeded');
    } catch { /* ignore */ }
    await db.transaction('rw', [db.habits, db.habitLogs, db.goals, db.dailyNotes, db.focusSessions], async () => {
      await db.habits.clear();
      await db.habitLogs.clear();
      await db.goals.clear();
      await db.dailyNotes.clear();
      await db.focusSessions.clear();
      await seedInitialData(true);
    });

    setIsResetConfirmOpen(false);
    setStatusMessage('Database reset and re-seeded with demo data!');
    setTimeout(() => setStatusMessage(null), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="pb-2 border-b border-[#E5E7EB]">
        <h1 className="text-2xl font-bold text-[#1A1A1A] tracking-tight">System & Data Settings</h1>
        <p className="text-xs sm:text-sm text-[#6B7280] mt-0.5">
          Local-first storage management, backups, and app architecture.
        </p>
      </div>

      {statusMessage && (
        <div className="p-3.5 rounded-xl bg-[#2D5A3D]/10 border border-[#2D5A3D]/20 text-[#2D5A3D] text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 size={16} />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Local-First Architecture Badge */}
      <Card className="p-5 sm:p-6 shadow-xs border-[#2D5A3D]/30 bg-gradient-to-r from-white via-white to-[#2D5A3D]/5">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#2D5A3D]/10 flex items-center justify-center shrink-0 text-[#2D5A3D]">
            <ShieldCheck size={26} />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#1A1A1A] flex items-center gap-2">
              Local-First & Offline Privacy Guarantee
            </h3>
            <p className="text-xs text-[#6B7280] mt-1 leading-relaxed">
              Inspired by the privacy philosophy of APEX, all your habits, check-ins, journal reflections, and focus sessions are stored <strong className="text-[#1A1A1A]">locally on this device using IndexedDB</strong>. No tracking scripts, no third-party telemetry, and 100% offline functionality. You own your data completely.
            </p>
          </div>
        </div>
      </Card>

      {/* Cloud Synchronization & Free Server */}
      <Card className="p-5 sm:p-6 shadow-xs space-y-3.5 border-[#E5E7EB]">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-[#1A1A1A] flex items-center gap-2">
              {user ? <CloudCheck size={18} className="text-[#2D5A3D]" /> : <Cloud size={18} className="text-[#C9A96E]" />}
              Cloud Synchronization (Free Supabase Backend)
            </h3>
            <p className="text-xs text-[#6B7280] mt-0.5 leading-relaxed">
              {user
                ? `Logged in as ${user.email}. Sync your habits, streaks, and journals between devices.`
                : isConfigured
                ? 'Free cloud server configured! Sign in or register to sync your habits across devices.'
                : 'Connect a free PostgreSQL database (Supabase) in 2 minutes so you and your users can access data from any phone or computer.'}
            </p>
          </div>
          <Button
            size="sm"
            onClick={() => setIsCloudModalOpen(true)}
            className="self-start sm:self-auto text-xs"
          >
            {user ? 'Manage Cloud Vault' : isConfigured ? 'Sign In / Register' : 'Connect Free Server'}
          </Button>
        </div>
      </Card>

      {/* Backup & Portability */}
      <Card className="p-5 sm:p-6 shadow-xs space-y-4">
        <h3 className="text-base font-bold text-[#1A1A1A] flex items-center gap-2">
          <Database size={18} className="text-[#2D5A3D]" />
          Data Portability & Backups
        </h3>
        <p className="text-xs text-[#6B7280] leading-relaxed">
          Export your entire tracking history to a JSON file at any time, or restore a previous backup when switching devices or browsers.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <Button onClick={handleExportData} size="sm">
            <Download size={16} /> Export Backup (.JSON)
          </Button>

          <label className="inline-flex items-center justify-center font-medium rounded-lg px-4 py-2 text-sm gap-2 border border-[#E5E7EB] text-[#1A1A1A] hover:bg-[#F9FAFB] cursor-pointer transition-colors">
            <Upload size={16} /> Restore from Backup
            <input
              type="file"
              accept=".json"
              onChange={handleImportData}
              className="hidden"
            />
          </label>
        </div>
      </Card>

      {/* Database Diagnostics */}
      <Card className="p-5 sm:p-6 shadow-xs space-y-4">
        <h3 className="text-base font-bold text-[#1A1A1A] flex items-center gap-2">
          <Info size={18} className="text-[#C9A96E]" />
          Storage Metrics
        </h3>

        <div className="grid grid-cols-3 gap-3">
          <div className="p-3 rounded-lg bg-[#F9FAFB] border border-[#E5E7EB] text-center">
            <span className="text-xl font-bold text-[#1A1A1A] block">{habits.length}</span>
            <span className="text-[11px] text-[#6B7280]">Active Habits</span>
          </div>
          <div className="p-3 rounded-lg bg-[#F9FAFB] border border-[#E5E7EB] text-center">
            <span className="text-xl font-bold text-[#1A1A1A] block">{goals.length}</span>
            <span className="text-[11px] text-[#6B7280]">Long-Term Goals</span>
          </div>
          <div className="p-3 rounded-lg bg-[#F9FAFB] border border-[#E5E7EB] text-center">
            <span className="text-xl font-bold text-[#1A1A1A] block">{notes.length}</span>
            <span className="text-[11px] text-[#6B7280]">Journal Entries</span>
          </div>
        </div>
      </Card>

      {/* Danger Zone: Reset Data */}
      <Card className="p-5 sm:p-6 shadow-xs border-rose-200 bg-rose-50/20 space-y-3">
        <div className="flex items-center gap-2 text-rose-800 text-sm font-bold">
          <AlertTriangle size={18} /> Danger Zone: Factory Reset
        </div>
        <p className="text-xs text-[#6B7280] leading-relaxed">
          Reset all stored habits, streaks, journals, and focus logs to the default initial sample state.
        </p>

        <div>
          <Button
            variant="danger"
            size="sm"
            onClick={() => setIsResetConfirmOpen(true)}
            className="text-xs"
          >
            <RefreshCw size={14} /> Reset & Re-Seed Database
          </Button>
        </div>
      </Card>

      {/* Confirmation Modal */}
      <Modal
        isOpen={isResetConfirmOpen}
        onClose={() => setIsResetConfirmOpen(false)}
        title="Confirm Reset Database"
        size="sm"
      >
        <div className="space-y-4 py-2">
          <p className="text-xs text-[#4B5563] leading-relaxed">
            Are you sure you want to reset? Any custom habits and check-in logs created will be replaced with clean demo habits.
          </p>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" size="sm" onClick={() => setIsResetConfirmOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" size="sm" onClick={handleResetData}>
              Yes, Reset Everything
            </Button>
          </div>
        </div>
      </Modal>

      {/* Cloud Sync Modal */}
      <CloudSyncModal
        isOpen={isCloudModalOpen}
        onClose={() => setIsCloudModalOpen(false)}
      />
    </div>
  );
}
