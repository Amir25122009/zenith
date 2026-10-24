import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  CheckSquare,
  Calendar,
  BarChart3,
  Target,
  BookHeart,
  Timer,
  Settings,
  Mountain,
  Cloud,
  CloudCheck,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { APP_NAME } from '../../lib/constants';
import { useGamification } from '../../hooks/useGamification';
import { useCloudSync } from '../../hooks/useCloudSync';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/habits', icon: CheckSquare, label: 'Habits' },
  { to: '/calendar', icon: Calendar, label: 'Calendar' },
  { to: '/statistics', icon: BarChart3, label: 'Statistics' },
  { to: '/goals', icon: Target, label: 'Goals' },
  { to: '/journal', icon: BookHeart, label: 'Journal' },
  { to: '/focus', icon: Timer, label: 'Focus' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

interface SidebarProps {
  collapsed?: boolean;
  onOpenCloudSync?: () => void;
}

export function Sidebar({ collapsed = false, onOpenCloudSync }: SidebarProps) {
  const { level, rankName, rankEmoji, xpInCurrentLevel, xpForNextLevel, progressPercent, totalXP } = useGamification();
  const { user } = useCloudSync();

  return (
    <aside className={cn(
      'hidden md:flex flex-col h-screen bg-white border-r border-[#E5E7EB] fixed left-0 top-0 z-40 transition-all duration-300',
      collapsed ? 'w-16' : 'w-60'
    )}>
      {/* Logo */}
      <div className="flex items-center justify-between px-4 h-16 border-b border-[#E5E7EB]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#2D5A3D] flex items-center justify-center flex-shrink-0 shadow-xs">
            <Mountain size={18} className="text-white" />
          </div>
          {!collapsed && (
            <span className="text-lg font-bold text-[#1A1A1A] tracking-tight">{APP_NAME}</span>
          )}
        </div>

        {!collapsed && (
          <button
            onClick={onOpenCloudSync}
            className="p-1 rounded-lg text-[#9CA3AF] hover:text-[#2D5A3D] hover:bg-[#F3F4F6] transition-colors"
            title={user ? `Cloud Vault: ${user.email}` : 'Connect Free Cloud Vault'}
          >
            {user ? <CloudCheck size={18} className="text-[#2D5A3D]" /> : <Cloud size={18} />}
          </button>
        )}
      </div>

      {/* Gamification Level & Ascent Card */}
      {!collapsed && (
        <div className="px-3 pt-3.5 pb-2">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-neutral-50 to-[#2D5A3D]/5 border border-[#E5E7EB] space-y-1.5">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="flex items-center gap-1.5 text-[#1A1A1A]">
                <span>{rankEmoji}</span>
                <span className="truncate">{rankName}</span>
              </span>
              <span className="text-[#2D5A3D] font-bold text-[11px]">Lvl {level}</span>
            </div>

            <div className="w-full bg-[#E5E7EB] h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-[#2D5A3D] h-full rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[10px] text-[#9CA3AF]">
              <span>{xpInCurrentLevel} / {xpForNextLevel} XP</span>
              <span>{totalXP} total XP</span>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 py-2 px-2 space-y-1 overflow-y-auto">
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) => cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
              isActive
                ? 'bg-[#2D5A3D]/10 text-[#2D5A3D]'
                : 'text-[#6B7280] hover:text-[#1A1A1A] hover:bg-[#F3F4F6]',
              collapsed && 'justify-center px-2'
            )}
          >
            <item.icon size={20} className="flex-shrink-0" />
            {!collapsed && <span>{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className={cn(
        'px-4 py-3 border-t border-[#E5E7EB] flex items-center justify-between text-xs text-[#9CA3AF]',
        collapsed && 'px-2 justify-center'
      )}>
        {!collapsed && <span>Zenith v1.2</span>}
        <button
          onClick={onOpenCloudSync}
          className="hover:text-[#1A1A1A] transition-colors flex items-center gap-1"
        >
          {user ? 'Cloud Active' : 'Free Cloud'}
        </button>
      </div>
    </aside>
  );
}
