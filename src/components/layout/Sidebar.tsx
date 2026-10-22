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
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { APP_NAME } from '../../lib/constants';

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
}

export function Sidebar({ collapsed = false }: SidebarProps) {
  return (
    <aside className={cn(
      'hidden md:flex flex-col h-screen bg-white border-r border-[#E5E7EB] fixed left-0 top-0 z-40 transition-all duration-300',
      collapsed ? 'w-16' : 'w-60'
    )}>
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 h-16 border-b border-[#E5E7EB]">
        <div className="w-8 h-8 rounded-lg bg-[#2D5A3D] flex items-center justify-center flex-shrink-0">
          <Mountain size={18} className="text-white" />
        </div>
        {!collapsed && (
          <span className="text-lg font-bold text-[#1A1A1A] tracking-tight">{APP_NAME}</span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
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
        'px-4 py-3 border-t border-[#E5E7EB]',
        collapsed && 'px-2'
      )}>
        <div className={cn(
          'text-xs text-[#9CA3AF]',
          collapsed ? 'text-center' : ''
        )}>
          {collapsed ? 'Z' : 'Zenith v1.0'}
        </div>
      </div>
    </aside>
  );
}
