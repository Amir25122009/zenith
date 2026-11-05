import { useState, useEffect } from 'react';
import { Outlet, useNavigate, Link } from 'react-router-dom';
import {
  Search,
  Cloud,
  CloudCheck,
  Plus,
  ShieldAlert,
  User as UserIcon,
  X,
  Sparkles,
} from 'lucide-react';
import { Sidebar } from './Sidebar';
import { MobileNav } from './MobileNav';
import { CommandPalette } from '../ui/CommandPalette';
import { CloudSyncModal } from '../ui/CloudSyncModal';
import { Modal } from '../ui/Modal';
import { HabitForm } from '../habits/HabitForm';
import { useHabits } from '../../hooks/useHabits';
import { useGamification } from '../../hooks/useGamification';
import { useCloudSync } from '../../hooks/useCloudSync';
import { useAuth } from '../../contexts/AuthContext';
import type { Habit } from '../../types';

export function Layout() {
  const navigate = useNavigate();
  const { addHabit } = useHabits();
  const { rankEmoji, level } = useGamification();
  const { user } = useCloudSync();
  const { currentUser, isAdmin, systemAnnouncement, setSystemAnnouncement } = useAuth();

  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [isCloudOpen, setIsCloudOpen] = useState(false);
  const [isNewHabitOpen, setIsNewHabitOpen] = useState(false);
  const [announcementDismissed, setAnnouncementDismissed] = useState(false);

  // Listen for Ctrl+K / Cmd+K
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandOpen(prev => !prev);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleCreateHabit = async (data: Omit<Habit, 'id' | 'createdAt' | 'archived' | 'order'>) => {
    await addHabit(data);
    setIsNewHabitOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <Sidebar onOpenCloudSync={() => setIsCloudOpen(true)} />
      <MobileNav />

      {/* Main Container */}
      <div className="md:ml-60 pb-20 md:pb-0 flex flex-col min-h-screen">
        {/* Global Admin Broadcast Announcement Banner */}
        {systemAnnouncement && systemAnnouncement.active && !announcementDismissed && (
          <div className="bg-gradient-to-r from-[#2D5A3D] to-[#1E3D2A] text-white px-4 py-2 text-xs font-medium flex items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-2 max-w-4xl mx-auto truncate">
              <Sparkles size={14} className="text-[#C9A96E] shrink-0" />
              <span className="truncate">{systemAnnouncement.text}</span>
            </div>
            <button
              onClick={() => setAnnouncementDismissed(true)}
              className="text-white/80 hover:text-white p-1 rounded-md hover:bg-white/10 shrink-0"
              title="Закрыть оповещение"
            >
              <X size={14} />
            </button>
          </div>
        )}

        {/* Top Header Bar */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-[#E5E7EB] px-4 sm:px-8 h-14 flex items-center justify-between gap-3">
          {/* Spotlight Search Trigger */}
          <button
            onClick={() => setIsCommandOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-[#E5E7EB] bg-[#FAFAFA] hover:bg-white hover:border-[#D1D5DB] text-xs text-[#6B7280] transition-all shadow-2xs max-w-xs w-full sm:w-64"
          >
            <Search size={14} className="text-[#9CA3AF]" />
            <span className="flex-1 text-left truncate">Search or jump to...</span>
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 rounded bg-white border border-[#E5E7EB] font-mono text-[10px] text-[#4B5563]">
              ⌘K
            </kbd>
          </button>

          {/* Quick Header Controls */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Level Badge */}
            <div
              onClick={() => navigate('/statistics')}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-xs font-semibold text-[#1A1A1A] cursor-pointer transition-colors"
              title="Discipline Level"
            >
              <span>{rankEmoji}</span>
              <span className="text-[11px] font-bold">Lvl {level}</span>
            </div>

            {/* Admin Panel Quick Link */}
            {isAdmin && (
              <Link
                to="/admin"
                className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#C9A96E]/20 hover:bg-[#C9A96E]/30 text-[#92700E] text-xs font-bold transition-colors border border-[#C9A96E]/30"
                title="Панель администратора"
              >
                <ShieldAlert size={14} />
                <span>Admin</span>
              </Link>
            )}

            {/* Cloud Sync Button */}
            <button
              onClick={() => setIsCloudOpen(true)}
              className="p-2 rounded-lg text-[#6B7280] hover:text-[#2D5A3D] hover:bg-[#F3F4F6] transition-colors flex items-center gap-1 text-xs font-medium"
              title={user ? `Cloud Vault Active: ${user.email}` : 'Connect Free Cloud Server'}
            >
              {user ? <CloudCheck size={18} className="text-[#2D5A3D]" /> : <Cloud size={18} />}
              <span className="hidden sm:inline">{user ? 'Cloud' : 'Sync'}</span>
            </button>

            {/* User Account / Profile Button */}
            <Link
              to="/auth"
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-[#E5E7EB] hover:bg-[#F3F4F6] text-xs font-semibold text-[#1A1A1A] transition-colors"
              title={currentUser ? `Аккаунт: ${currentUser.name} (${currentUser.email})` : 'Войти в аккаунт'}
            >
              <div className="w-5 h-5 rounded-md bg-[#2D5A3D] text-white flex items-center justify-center text-[10px] font-bold">
                {currentUser ? currentUser.name.charAt(0).toUpperCase() : <UserIcon size={12} />}
              </div>
              <span className="hidden md:inline max-w-[100px] truncate">
                {currentUser ? currentUser.name : 'Войти'}
              </span>
            </Link>

            {/* Add Habit Quick Button */}
            <button
              onClick={() => setIsNewHabitOpen(true)}
              className="px-2.5 py-1.5 rounded-lg bg-[#2D5A3D] hover:bg-[#1e3d2a] text-white text-xs font-medium flex items-center gap-1 shadow-xs transition-colors"
            >
              <Plus size={14} />
              <span className="hidden sm:inline">Add</span>
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-6xl w-full mx-auto">
          <Outlet />
        </main>
      </div>

      {/* Global Modals */}
      <CommandPalette
        isOpen={isCommandOpen}
        onClose={() => setIsCommandOpen(false)}
        onOpenNewHabit={() => {
          setIsCommandOpen(false);
          setIsNewHabitOpen(true);
        }}
      />

      <CloudSyncModal
        isOpen={isCloudOpen}
        onClose={() => setIsCloudOpen(false)}
      />

      <Modal
        isOpen={isNewHabitOpen}
        onClose={() => setIsNewHabitOpen(false)}
        title="Create New Habit"
        size="md"
      >
        <HabitForm
          onSubmit={handleCreateHabit}
          onCancel={() => setIsNewHabitOpen(false)}
        />
      </Modal>
    </div>
  );
}
