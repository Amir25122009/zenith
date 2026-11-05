import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Mountain,
  Lock,
  Mail,
  User as UserIcon,
  Eye,
  EyeOff,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Sparkles,
  LogOut,
  ShieldAlert,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import type { UserRole } from '../types';

export function AuthPage() {
  const navigate = useNavigate();
  const { currentUser, isAdmin, isSupabase, signIn, signUp, signOut } = useAuth();

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('user');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      if (mode === 'signup') {
        if (!name.trim()) {
          throw new Error('Пожалуйста, укажите ваше имя');
        }
        if (password.length < 6) {
          throw new Error('Пароль должен содержать минимум 6 символов');
        }
        await signUp({ email, password, name, role });
        setSuccess('Аккаунт успешно создан! Добро пожаловать в Zenith.');
      } else {
        await signIn({ email, password });
        setSuccess('Вы успешно вошли в систему!');
      }

      setTimeout(() => {
        navigate('/');
      }, 700);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Произошла ошибка авторизации';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoLogin = async (demoEmail: string, demoPass: string) => {
    setError(null);
    setLoading(true);
    try {
      await signIn({ email: demoEmail, password: demoPass });
      setSuccess('Успешный вход!');
      setTimeout(() => navigate('/'), 500);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Ошибка входа';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[#2D5A3D] text-white shadow-md mb-2">
            <Mountain size={26} />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1A1A1A] tracking-tight">
            {currentUser ? 'Ваш профиль Zenith' : 'Добро пожаловать в Zenith'}
          </h1>
          <p className="text-xs sm:text-sm text-[#6B7280]">
            {currentUser
              ? 'Управление вашим аккаунтом и уровнем доступа'
              : 'Единая система привычек, глубокого фокуса и дисциплины'}
          </p>
        </div>

        {/* If Already Logged In */}
        {currentUser ? (
          <Card className="p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-[#2D5A3D]/10 text-[#2D5A3D] font-bold text-xl flex items-center justify-center border border-[#2D5A3D]/20">
                {currentUser.name.slice(0, 2).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-[#1A1A1A] truncate">{currentUser.name}</h3>
                  <span
                    className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                      isAdmin
                        ? 'bg-[#C9A96E]/20 text-[#92700E] border border-[#C9A96E]/40'
                        : 'bg-[#2D5A3D]/10 text-[#2D5A3D]'
                    }`}
                  >
                    {isAdmin ? 'Администратор' : 'Пользователь'}
                  </span>
                </div>
                <p className="text-xs text-[#6B7280] truncate mt-0.5">{currentUser.email}</p>
                <p className="text-[11px] text-[#9CA3AF] mt-1">
                  Зарегистрирован: {currentUser.createdAt}
                </p>
              </div>
            </div>

            <div className="space-y-2.5 pt-2 border-t border-[#E5E7EB]">
              {isAdmin && (
                <Button
                  onClick={() => navigate('/admin')}
                  className="w-full flex items-center justify-center gap-2 bg-[#1A1A1A] hover:bg-[#333333] text-white"
                >
                  <ShieldAlert size={16} className="text-[#C9A96E]" />
                  <span>Открыть панель администратора</span>
                  <ArrowRight size={14} />
                </Button>
              )}

              <Button
                variant="outline"
                onClick={() => navigate('/')}
                className="w-full flex items-center justify-center gap-2"
              >
                <span>Перейти к моим привычкам</span>
                <ArrowRight size={14} />
              </Button>

              <Button
                variant="danger"
                onClick={async () => {
                  await signOut();
                  setSuccess('Вы вышли из аккаунта');
                }}
                className="w-full flex items-center justify-center gap-2 text-xs"
              >
                <LogOut size={14} />
                <span>Выйти из аккаунта</span>
              </Button>
            </div>
          </Card>
        ) : (
          /* Sign In & Sign Up Form */
          <Card className="p-6 sm:p-8 shadow-sm">
            {/* Tabs */}
            <div className="flex rounded-xl bg-[#F3F4F6] p-1 mb-6">
              <button
                type="button"
                onClick={() => {
                  setMode('signin');
                  setError(null);
                  setSuccess(null);
                }}
                className={`flex-1 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all ${
                  mode === 'signin'
                    ? 'bg-white text-[#1A1A1A] shadow-xs'
                    : 'text-[#6B7280] hover:text-[#1A1A1A]'
                }`}
              >
                Вход в систему
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('signup');
                  setError(null);
                  setSuccess(null);
                }}
                className={`flex-1 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all ${
                  mode === 'signup'
                    ? 'bg-white text-[#1A1A1A] shadow-xs'
                    : 'text-[#6B7280] hover:text-[#1A1A1A]'
                }`}
              >
                Регистрация
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-[#B45555] text-xs font-medium flex items-center gap-2">
                <AlertCircle size={16} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-[#2D5A3D] text-xs font-medium flex items-center gap-2">
                <CheckCircle2 size={16} className="shrink-0" />
                <span>{success}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name field on register */}
              {mode === 'signup' && (
                <div>
                  <label className="block text-xs font-semibold text-[#1A1A1A] mb-1.5">
                    Ваше имя или никнейм
                  </label>
                  <div className="relative">
                    <UserIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
                    <input
                      type="text"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="Например, Амир"
                      required
                      className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-[#E5E7EB] bg-white focus:outline-none focus:ring-2 focus:ring-[#2D5A3D] focus:border-transparent text-[#1A1A1A]"
                    />
                  </div>
                </div>
              )}

              {/* Email */}
              <div>
                <label className="block text-xs font-semibold text-[#1A1A1A] mb-1.5">
                  Электронная почта
                </label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="you@domain.com"
                    required
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-[#E5E7EB] bg-white focus:outline-none focus:ring-2 focus:ring-[#2D5A3D] focus:border-transparent text-[#1A1A1A]"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-semibold text-[#1A1A1A] mb-1.5">
                  Пароль
                </label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    minLength={6}
                    className="w-full pl-9 pr-10 py-2 text-sm rounded-xl border border-[#E5E7EB] bg-white focus:outline-none focus:ring-2 focus:ring-[#2D5A3D] focus:border-transparent text-[#1A1A1A]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#1A1A1A]"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Role selection on registration */}
              {mode === 'signup' && (
                <div>
                  <label className="block text-xs font-semibold text-[#1A1A1A] mb-1.5">
                    Уровень доступа аккаунта
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setRole('user')}
                      className={`p-2.5 rounded-xl border text-xs font-medium text-left transition-all ${
                        role === 'user'
                          ? 'border-[#2D5A3D] bg-[#2D5A3D]/10 text-[#2D5A3D] font-bold'
                          : 'border-[#E5E7EB] hover:bg-[#F9FAFB] text-[#4B5563]'
                      }`}
                    >
                      <span className="block text-sm">👤 Пользователь</span>
                      <span className="text-[10px] text-[#6B7280]">Личный трекер</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setRole('admin')}
                      className={`p-2.5 rounded-xl border text-xs font-medium text-left transition-all ${
                        role === 'admin'
                          ? 'border-[#C9A96E] bg-[#C9A96E]/15 text-[#92700E] font-bold'
                          : 'border-[#E5E7EB] hover:bg-[#F9FAFB] text-[#4B5563]'
                      }`}
                    >
                      <span className="block text-sm">🛡️ Администратор</span>
                      <span className="text-[10px] text-[#6B7280]">Доступ к админ-панели</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 text-sm font-bold flex items-center justify-center gap-2"
              >
                {loading ? (
                  <span>Выполняется...</span>
                ) : mode === 'signin' ? (
                  <>
                    <span>Войти в аккаунт</span>
                    <ArrowRight size={16} />
                  </>
                ) : (
                  <>
                    <span>Создать аккаунт</span>
                    <Sparkles size={16} />
                  </>
                )}
              </Button>
            </form>

            {/* Quick Demo Access Bar */}
            <div className="mt-6 pt-5 border-t border-[#E5E7EB] space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#9CA3AF] block text-center">
                Быстрый вход в 1 клик для тестирования:
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickDemoLogin('amir@zenith.app', 'owner123')}
                  className="px-3 py-2 rounded-xl border border-[#C9A96E]/50 bg-[#C9A96E]/10 hover:bg-[#C9A96E]/20 text-[#92700E] text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <ShieldCheck size={14} />
                  <span>Вход: Amir (Admin)</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickDemoLogin('alex@example.com', 'user123')}
                  className="px-3 py-2 rounded-xl border border-[#E5E7EB] bg-[#FAFAFA] hover:bg-[#F3F4F6] text-[#4B5563] text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <UserIcon size={14} />
                  <span>Вход: Пользователь</span>
                </button>
              </div>
            </div>

            {/* Cloud vs Local Note */}
            <div className="mt-4 p-3 rounded-xl bg-[#FAFAFA] border border-[#E5E7EB] text-[11px] text-[#6B7280] text-center">
              {isSupabase ? (
                <span className="text-[#2D5A3D] font-medium">
                  🟢 Supabase подключен. Регистрация синхронизируется с облачной базой данных.
                </span>
              ) : (
                <span>
                  🟡 Локальный режим активен. Все данные и аккаунты сохраняются прямо в вашем браузере.
                </span>
              )}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
