import React from 'react';
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
} from 'lucide-react';
import { cn } from '../../lib/utils';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Home' },
  { to: '/habits', icon: CheckSquare, label: 'Habits' },
  { to: '/calendar', icon: Calendar, label: 'Calendar' },
  { to: '/statistics', icon: BarChart3, label: 'Stats' },
  { to: '/focus', icon: Timer, label: 'Focus' },
];

const moreItems = [
  { to: '/goals', icon: Target, label: 'Goals' },
  { to: '/journal', icon: BookHeart, label: 'Journal' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export function MobileNav() {
  const [showMore, setShowMore] = React.useState(false);

  return (
    <>
      {/* More menu overlay */}
      {showMore && (
        <div className="fixed inset-0 z-40 md:hidden" onClick={() => setShowMore(false)}>
          <div className="absolute bottom-16 left-0 right-0 bg-white border-t border-[#E5E7EB] shadow-lg px-4 py-3">
            <div className="grid grid-cols-3 gap-2">
              {moreItems.map(item => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setShowMore(false)}
                  className={({ isActive }) => cn(
                    'flex flex-col items-center gap-1 py-3 rounded-lg text-xs font-medium transition-colors',
                    isActive
                      ? 'bg-[#2D5A3D]/10 text-[#2D5A3D]'
                      : 'text-[#6B7280] hover:text-[#1A1A1A] hover:bg-[#F3F4F6]'
                  )}
                >
                  <item.icon size={20} />
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Bottom nav bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-[#E5E7EB] md:hidden">
        <div className="flex items-center justify-around h-16 px-1">
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) => cn(
                'flex flex-col items-center gap-0.5 py-1 px-2 rounded-lg text-[10px] font-medium transition-colors min-w-[48px]',
                isActive
                  ? 'text-[#2D5A3D]'
                  : 'text-[#9CA3AF]'
              )}
            >
              <item.icon size={20} />
              <span>{item.label}</span>
            </NavLink>
          ))}
          <button
            onClick={() => setShowMore(!showMore)}
            className={cn(
              'flex flex-col items-center gap-0.5 py-1 px-2 rounded-lg text-[10px] font-medium transition-colors min-w-[48px]',
              showMore ? 'text-[#2D5A3D]' : 'text-[#9CA3AF]'
            )}
          >
            <Settings size={20} />
            <span>More</span>
          </button>
        </div>
      </nav>
    </>
  );
}
