import { useState, useMemo } from 'react';
import {
  ShieldAlert,
  Users,
  UserCheck,
  UserX,
  UserPlus,
  Shield,
  ShieldOff,
  Trash2,
  Search,
  Bell,
  Database,
  Download,
  CheckCircle2,
  AlertCircle,
  Key,
  Flame,
  Clock,
  Sparkles,
  ArrowRight,
  Send,
  Eye,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useHabits, useAllHabitLogs } from '../hooks/useHabits';
import { useGoals } from '../hooks/useGoals';
import { useFocusTimer } from '../hooks/useFocusTimer';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { db } from '../db';
import type { AppUser, UserRole } from '../types';

export function AdminPage() {
  const {
    currentUser,
    isAdmin,
    isSupabase,
    allUsers,
    systemAnnouncement,
    updateUserRole,
    toggleUserStatus,
    deleteUser,
    addUser,
    setSystemAnnouncement,
    toggleAdminMode,
  } = useAuth();

  const { habits } = useHabits();
  const allLogs = useAllHabitLogs();
  const { goals } = useGoals();
  const { totalFocusToday } = useFocusTimer();

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'user' | 'suspended'>('all');

  // Announcement state
  const [announcementText, setAnnouncementText] = useState(systemAnnouncement?.text || '');
  const [announcementActive, setAnnouncementActive] = useState(systemAnnouncement?.active ?? true);
  const [announcementMsg, setAnnouncementMsg] = useState<string | null>(null);

  // New User Modal
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState<UserRole>('user');

  // Secret passcode unlock for owner if not logged in as admin
  const [passcode, setPasscode] = useState('');
  const [passcodeError, setPasscodeError] = useState(false);

  // Filtered users
  const filteredUsers = useMemo(() => {
    return allUsers.filter(u => {
      const matchesSearch =
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      if (roleFilter === 'admin') return u.role === 'admin';
      if (roleFilter === 'user') return u.role === 'user';
      if (roleFilter === 'suspended') return u.status === 'suspended';
      return true;
    });
  }, [allUsers, searchQuery, roleFilter]);

  // Statistics
  const adminCount = allUsers.filter(u => u.role === 'admin').length;
  const activeCount = allUsers.filter(u => u.status === 'active').length;

  const handleSaveAnnouncement = () => {
    if (!announcementText.trim()) {
      setSystemAnnouncement(null);
      setAnnouncementMsg('Оповещение отключено');
    } else {
      setSystemAnnouncement({
        id: `announcement-${Date.now()}`,
        text: announcementText.trim(),
        active: announcementActive,
        date: new Date().toISOString().split('T')[0],
        priority: 'success',
      });
      setAnnouncementMsg('Оповещение успешно сохранено и опубликовано!');
    }
    setTimeout(() => setAnnouncementMsg(null), 3000);
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserEmail.trim()) return;

    addUser({
      name: newUserName.trim() || newUserEmail.split('@')[0],
      email: newUserEmail.trim().toLowerCase(),
      role: newUserRole,
      status: 'active',
    });

    setIsAddUserOpen(false);
    setNewUserName('');
    setNewUserEmail('');
    setNewUserRole('user');
  };

  const handleUnlockWithPasscode = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode === 'admin' || passcode === 'admin123' || passcode === '2512') {
      toggleAdminMode();
      setPasscodeError(false);
    } else {
      setPasscodeError(true);
    }
  };

  // If not admin, show graceful unlock prompt
  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto py-12 px-4 space-y-6">
        <Card className="p-6 sm:p-8 text-center space-y-5 shadow-sm border-amber-200 bg-amber-50/10">
          <div className="w-14 h-14 rounded-2xl bg-[#C9A96E]/20 text-[#92700E] flex items-center justify-center mx-auto">
            <ShieldAlert size={28} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#1A1A1A]">Требуется доступ администратора</h2>
            <p className="text-xs text-[#6B7280] mt-1.5 leading-relaxed">
              Вы вошли как <strong className="text-[#1A1A1A]">{currentUser?.email || 'Гость'}</strong> (роль: {currentUser?.role || 'user'}). Для управления платформой включите права администратора.
            </p>
          </div>

          <form onSubmit={handleUnlockWithPasscode} className="space-y-3 pt-2">
            <div>
              <Input
                type="password"
                placeholder="Мастер-пароль администратора (или 2512)"
                value={passcode}
                onChange={e => {
                  setPasscode(e.target.value);
                  setPasscodeError(false);
                }}
                className="text-center text-xs"
              />
              {passcodeError && (
                <p className="text-[11px] text-rose-600 mt-1">Неверный код доступа</p>
              )}
            </div>

            <Button type="submit" className="w-full text-xs font-bold">
              <Key size={14} /> Подтвердить доступ администратора
            </Button>
          </form>

          <div className="pt-2 border-t border-[#E5E7EB]">
            <Button
              variant="outline"
              size="sm"
              onClick={toggleAdminMode}
              className="w-full text-xs text-[#2D5A3D] font-bold"
            >
              В 1 клик активировать режим администратора для {currentUser?.name || 'текущего аккаунта'}
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-[#E5E7EB]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-[#1A1A1A] tracking-tight">Панель управления Zenith</h1>
            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-[#C9A96E]/20 text-[#92700E] border border-[#C9A96E]/40">
              Admin Console
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#6B7280] mt-0.5">
            Управление пользователями, общесистемными оповещениями, метриками и базой данных.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button size="sm" onClick={() => setIsAddUserOpen(true)} className="text-xs">
            <UserPlus size={15} /> Добавить пользователя
          </Button>
        </div>
      </div>

      {/* Metric Tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-[#2D5A3D]/10 flex items-center justify-center shrink-0">
              <Users size={22} className="text-[#2D5A3D]" />
            </div>
            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-[#1A1A1A]">{allUsers.length}</span>
                <span className="text-xs text-[#9CA3AF]">чел.</span>
              </div>
              <p className="text-xs text-[#6B7280] font-medium">Всего пользователей</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-[#C9A96E]/15 flex items-center justify-center shrink-0">
              <Shield size={22} className="text-[#92700E]" />
            </div>
            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-[#1A1A1A]">{adminCount}</span>
                <span className="text-xs text-[#9CA3AF]">админ.</span>
              </div>
              <p className="text-xs text-[#6B7280] font-medium">Администраторов</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-[#4A90A4]/15 flex items-center justify-center shrink-0">
              <Flame size={22} className="text-[#4A90A4]" />
            </div>
            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-[#1A1A1A]">{habits.length}</span>
                <span className="text-xs text-[#9CA3AF]">прив.</span>
              </div>
              <p className="text-xs text-[#6B7280] font-medium">Активных привычек в БД</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-[#8B5CF6]/15 flex items-center justify-center shrink-0">
              <Database size={22} className="text-[#8B5CF6]" />
            </div>
            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-sm font-bold text-[#1A1A1A]">
                  {isSupabase ? '🟢 Supabase' : '🟡 Local IndexedDB'}
                </span>
              </div>
              <p className="text-xs text-[#6B7280] font-medium">Статус подключения</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Announcement Broadcast Section */}
      <Card className="p-5 sm:p-6 shadow-xs border-[#E5E7EB] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-[#1A1A1A] flex items-center gap-2">
              <Bell size={16} className="text-[#C9A96E]" />
              Общесистемное объявление для всех пользователей
            </h3>
            <p className="text-xs text-[#6B7280]">
              Этот баннер отображается в верхней части приложения для каждого посетителя.
            </p>
          </div>

          <label className="flex items-center gap-2 cursor-pointer self-start sm:self-auto">
            <input
              type="checkbox"
              checked={announcementActive}
              onChange={e => setAnnouncementActive(e.target.checked)}
              className="rounded border-[#D1D5DB] text-[#2D5A3D] focus:ring-[#2D5A3D]"
            />
            <span className="text-xs font-semibold text-[#1A1A1A]">
              {announcementActive ? 'Оповещение включено' : 'Оповещение скрыто'}
            </span>
          </label>
        </div>

        {announcementMsg && (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-[#2D5A3D] text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 size={16} />
            <span>{announcementMsg}</span>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={announcementText}
            onChange={e => setAnnouncementText(e.target.value)}
            placeholder="Текст объявления (например: 🚀 Zenith обновлён! Добавлены новые функции)."
            className="flex-1 px-3.5 py-2 text-xs rounded-xl border border-[#E5E7EB] bg-white focus:outline-none focus:ring-2 focus:ring-[#2D5A3D] text-[#1A1A1A]"
          />
          <Button size="sm" onClick={handleSaveAnnouncement} className="text-xs whitespace-nowrap">
            <Send size={14} /> Сохранить и применить
          </Button>
        </div>
      </Card>

      {/* User Directory Table */}
      <Card className="p-5 sm:p-6 shadow-xs border-[#E5E7EB] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-[#1A1A1A] flex items-center gap-2">
              <Users size={18} className="text-[#2D5A3D]" />
              Реестр пользователей платформы ({filteredUsers.length})
            </h3>
            <p className="text-xs text-[#6B7280]">
              Просмотр учетных записей, назначение ролей и блокировка доступа.
            </p>
          </div>

          {/* Search & Filter Controls */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Поиск по имени / email..."
                className="pl-8 pr-3 py-1.5 text-xs rounded-xl border border-[#E5E7EB] bg-white focus:outline-none focus:ring-2 focus:ring-[#2D5A3D] w-48 sm:w-56"
              />
            </div>

            <div className="flex items-center rounded-xl bg-[#F3F4F6] p-1 text-xs font-medium">
              <button
                onClick={() => setRoleFilter('all')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  roleFilter === 'all' ? 'bg-white text-[#1A1A1A] shadow-2xs font-bold' : 'text-[#6B7280]'
                }`}
              >
                Все ({allUsers.length})
              </button>
              <button
                onClick={() => setRoleFilter('admin')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  roleFilter === 'admin' ? 'bg-white text-[#1A1A1A] shadow-2xs font-bold' : 'text-[#6B7280]'
                }`}
              >
                Админы ({adminCount})
              </button>
              <button
                onClick={() => setRoleFilter('user')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  roleFilter === 'user' ? 'bg-white text-[#1A1A1A] shadow-2xs font-bold' : 'text-[#6B7280]'
                }`}
              >
                Обычные
              </button>
              <button
                onClick={() => setRoleFilter('suspended')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  roleFilter === 'suspended' ? 'bg-white text-rose-600 shadow-2xs font-bold' : 'text-[#6B7280]'
                }`}
              >
                Бан
              </button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto border border-[#E5E7EB] rounded-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F9FAFB] text-[#6B7280] font-semibold border-b border-[#E5E7EB]">
              <tr>
                <th className="px-4 py-3">Пользователь</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Роль</th>
                <th className="px-4 py-3">Статус</th>
                <th className="px-4 py-3">Дата регистрации</th>
                <th className="px-4 py-3 text-right">Действия</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7EB] bg-white">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-[#9CA3AF]">
                    Пользователи не найдены.
                  </td>
                </tr>
              ) : (
                filteredUsers.map(user => {
                  const isCurrent = currentUser?.id === user.id;
                  const isUserAdmin = user.role === 'admin';
                  const isSuspended = user.status === 'suspended';

                  return (
                    <tr key={user.id} className="hover:bg-[#F9FAFB]/80 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-[#2D5A3D]/10 text-[#2D5A3D] font-bold text-xs flex items-center justify-center shrink-0">
                            {user.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <span className="font-semibold text-[#1A1A1A] block">
                              {user.name} {isCurrent && <span className="text-[10px] text-[#2D5A3D]">(Вы)</span>}
                            </span>
                            <span className="text-[10px] text-[#9CA3AF]">ID: {user.id.slice(0, 8)}...</span>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3 text-[#4B5563] font-mono text-[11px]">
                        {user.email}
                      </td>

                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            isUserAdmin
                              ? 'bg-[#C9A96E]/20 text-[#92700E] border border-[#C9A96E]/30'
                              : 'bg-neutral-100 text-[#4B5563]'
                          }`}
                        >
                          {isUserAdmin ? '🛡️ Администратор' : '👤 Пользователь'}
                        </span>
                      </td>

                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            isSuspended
                              ? 'bg-rose-100 text-rose-700'
                              : 'bg-emerald-100 text-emerald-700'
                          }`}
                        >
                          {isSuspended ? '🔴 Заблокирован' : '🟢 Активен'}
                        </span>
                      </td>

                      <td className="px-4 py-3 text-[#6B7280]">
                        {user.createdAt}
                      </td>

                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {/* Toggle Role */}
                          <button
                            onClick={() => updateUserRole(user.id, isUserAdmin ? 'user' : 'admin')}
                            title={isUserAdmin ? 'Снять права админа' : 'Сделать администратором'}
                            className={`p-1.5 rounded-lg transition-colors ${
                              isUserAdmin
                                ? 'text-[#92700E] hover:bg-[#C9A96E]/15'
                                : 'text-[#6B7280] hover:text-[#2D5A3D] hover:bg-[#2D5A3D]/10'
                            }`}
                          >
                            {isUserAdmin ? <ShieldOff size={15} /> : <Shield size={15} />}
                          </button>

                          {/* Toggle Status (Ban/Unban) */}
                          <button
                            onClick={() => toggleUserStatus(user.id)}
                            title={isSuspended ? 'Разблокировать' : 'Заблокировать'}
                            className={`p-1.5 rounded-lg transition-colors ${
                              isSuspended
                                ? 'text-emerald-700 hover:bg-emerald-50'
                                : 'text-rose-600 hover:bg-rose-50'
                            }`}
                          >
                            {isSuspended ? <UserCheck size={15} /> : <UserX size={15} />}
                          </button>

                          {/* Delete User */}
                          {!isCurrent && (
                            <button
                              onClick={() => {
                                if (window.confirm(`Удалить пользователя ${user.email}?`)) {
                                  deleteUser(user.id);
                                }
                              }}
                              title="Удалить аккаунт"
                              className="p-1.5 rounded-lg text-[#9CA3AF] hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            >
                              <Trash2 size={15} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* System Diagnostics & Maintenance */}
      <Card className="p-5 sm:p-6 shadow-xs space-y-4">
        <h3 className="text-base font-bold text-[#1A1A1A] flex items-center gap-2">
          <Database size={18} className="text-[#2D5A3D]" />
          Диагностика базы данных и системные метрики
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          <div className="p-3 rounded-xl bg-[#FAFAFA] border border-[#E5E7EB]">
            <span className="text-lg font-bold text-[#1A1A1A] block">{habits.length}</span>
            <span className="text-[10px] text-[#6B7280]">Привычек (habits)</span>
          </div>
          <div className="p-3 rounded-xl bg-[#FAFAFA] border border-[#E5E7EB]">
            <span className="text-lg font-bold text-[#1A1A1A] block">{allLogs.length}</span>
            <span className="text-[10px] text-[#6B7280]">Записей логов (logs)</span>
          </div>
          <div className="p-3 rounded-xl bg-[#FAFAFA] border border-[#E5E7EB]">
            <span className="text-lg font-bold text-[#1A1A1A] block">{goals.length}</span>
            <span className="text-[10px] text-[#6B7280]">Целей (goals)</span>
          </div>
          <div className="p-3 rounded-xl bg-[#FAFAFA] border border-[#E5E7EB]">
            <span className="text-lg font-bold text-[#1A1A1A] block">{totalFocusToday} мин</span>
            <span className="text-[10px] text-[#6B7280]">Фокуса сегодня</span>
          </div>
        </div>
      </Card>

      {/* Add User Modal */}
      <Modal
        isOpen={isAddUserOpen}
        onClose={() => setIsAddUserOpen(false)}
        title="Добавить нового пользователя"
        size="sm"
      >
        <form onSubmit={handleCreateUser} className="space-y-4 py-2">
          <div>
            <label className="block text-xs font-semibold text-[#1A1A1A] mb-1">Имя пользователя</label>
            <input
              type="text"
              required
              placeholder="Например, Тимур"
              value={newUserName}
              onChange={e => setNewUserName(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-[#E5E7EB] focus:outline-none focus:ring-2 focus:ring-[#2D5A3D]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#1A1A1A] mb-1">Email</label>
            <input
              type="email"
              required
              placeholder="user@example.com"
              value={newUserEmail}
              onChange={e => setNewUserEmail(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-[#E5E7EB] focus:outline-none focus:ring-2 focus:ring-[#2D5A3D]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#1A1A1A] mb-1">Назначить роль</label>
            <select
              value={newUserRole}
              onChange={e => setNewUserRole(e.target.value as UserRole)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-[#E5E7EB] focus:outline-none focus:ring-2 focus:ring-[#2D5A3D] bg-white"
            >
              <option value="user">Обычный пользователь</option>
              <option value="admin">Администратор</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" size="sm" onClick={() => setIsAddUserOpen(false)}>
              Отмена
            </Button>
            <Button type="submit" size="sm">
              Создать аккаунт
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
