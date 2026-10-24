import React, { useState } from 'react';
import {
  Cloud,
  CloudCheck,
  CloudUpload,
  CloudDownload,
  Key,
  Lock,
  Mail,
  LogOut,
  ExternalLink,
  ShieldCheck,
  Info,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { Modal } from './Modal';
import { Button } from './Button';
import { Input } from './Input';
import { useCloudSync } from '../../hooks/useCloudSync';

interface CloudSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CloudSyncModal({ isOpen, onClose }: CloudSyncModalProps) {
  const {
    isConfigured,
    user,
    isSyncing,
    syncStatus,
    signIn,
    signUp,
    signOut,
    syncToCloud,
    pullFromCloud,
  } = useCloudSync();

  const [isSignUpMode, setIsSignUpMode] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccess, setAuthSuccess] = useState<string | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthSuccess(null);
    try {
      if (isSignUpMode) {
        await signUp(email, password);
        setAuthSuccess('Account created! Please check your email or sign in.');
      } else {
        await signIn(email, password);
        setAuthSuccess('Signed in successfully! Your cloud vault is active.');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Authentication failed';
      setAuthError(msg);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Cloud Synchronization & Multi-Device Vault" size="md">
      <div className="space-y-5 py-1">
        {/* Supabase Status Header */}
        <div className={`p-4 rounded-xl border flex items-start gap-3.5 ${
          user
            ? 'bg-[#2D5A3D]/10 border-[#2D5A3D]/20 text-[#2D5A3D]'
            : isConfigured
            ? 'bg-[#FDF8EF] border-[#E8C07D] text-[#92700E]'
            : 'bg-neutral-50 border-[#E5E7EB] text-[#4B5563]'
        }`}>
          <div className="p-2 rounded-lg bg-white shadow-xs shrink-0">
            {user ? <CloudCheck size={22} className="text-[#2D5A3D]" /> : <Cloud size={22} className="text-[#C9A96E]" />}
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider">
              {user ? 'Cloud Vault Active' : isConfigured ? 'Supabase Backend Ready' : 'Local-First Mode Active'}
            </h4>
            <p className="text-xs mt-0.5 leading-relaxed">
              {user
                ? `Connected as ${user.email}. Your habits and stats can sync across your phone and desktop.`
                : isConfigured
                ? 'Sign in or create a free account below to sync across all your devices.'
                : 'Zenith runs 100% locally on your browser. To sync across devices, link a free Supabase server.'}
            </p>
          </div>
        </div>

        {syncStatus && (
          <div className="p-3 rounded-xl bg-[#2D5A3D]/10 text-[#2D5A3D] text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 size={16} />
            <span>{syncStatus}</span>
          </div>
        )}

        {authError && (
          <div className="p-3 rounded-xl bg-rose-50 text-[#B45555] text-xs font-semibold flex items-center gap-2">
            <AlertCircle size={16} />
            <span>{authError}</span>
          </div>
        )}

        {authSuccess && (
          <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 size={16} />
            <span>{authSuccess}</span>
          </div>
        )}

        {/* If User is Signed In */}
        {user ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="primary"
                onClick={syncToCloud}
                disabled={isSyncing}
                className="text-xs flex items-center justify-center gap-2"
              >
                <CloudUpload size={16} />
                <span>{isSyncing ? 'Syncing...' : 'Upload to Cloud'}</span>
              </Button>
              <Button
                variant="outline"
                onClick={pullFromCloud}
                disabled={isSyncing}
                className="text-xs flex items-center justify-center gap-2"
              >
                <CloudDownload size={16} />
                <span>{isSyncing ? 'Syncing...' : 'Restore from Cloud'}</span>
              </Button>
            </div>

            <div className="pt-2 flex justify-between items-center border-t border-[#E5E7EB]">
              <span className="text-xs text-[#9CA3AF]">Account: {user.email}</span>
              <Button size="sm" variant="ghost" onClick={signOut} className="text-xs text-[#B45555] hover:bg-rose-50">
                <LogOut size={14} /> Sign Out
              </Button>
            </div>
          </div>
        ) : isConfigured ? (
          /* Sign In / Sign Up Form */
          <form onSubmit={handleAuth} className="space-y-3.5">
            <Input
              label="Email Address"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@domain.com"
              required
            />
            <Input
              label="Password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />

            <div className="pt-1 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setIsSignUpMode(!isSignUpMode)}
                className="text-xs text-[#2D5A3D] font-semibold hover:underline"
              >
                {isSignUpMode ? 'Already have an account? Sign In' : 'Need an account? Sign Up Free'}
              </button>
              <Button type="submit" size="sm">
                {isSignUpMode ? 'Create Account' : 'Sign In'}
              </Button>
            </div>
          </form>
        ) : (
          /* Step-by-Step Free Cloud Setup Guide */
          <div className="space-y-3.5 text-xs text-[#4B5563] bg-[#F9FAFB] p-4 rounded-xl border border-[#E5E7EB]">
            <h5 className="font-bold text-[#1A1A1A] flex items-center gap-1.5">
              <Key size={14} className="text-[#C9A96E]" />
              Connect Free Supabase Backend (2 Minutes):
            </h5>
            <ol className="list-decimal list-inside space-y-1.5 leading-relaxed">
              <li>
                Create a free project at{' '}
                <a
                  href="https://supabase.com"
                  target="_blank"
                  rel="noreferrer"
                  className="font-bold text-[#2D5A3D] inline-flex items-center gap-0.5 hover:underline"
                >
                  supabase.com <ExternalLink size={11} />
                </a>
              </li>
              <li>Open <strong>SQL Editor</strong> in Supabase and paste <code className="px-1.5 py-0.5 bg-white rounded border border-[#E5E7EB]">supabase/schema.sql</code> from this repository.</li>
              <li>Go to <strong>Project Settings → API</strong> and copy your URL & anon public key.</li>
              <li>Add them to Vercel Environment Variables or your local <code className="px-1.5 py-0.5 bg-white rounded border border-[#E5E7EB]">.env</code>:</li>
            </ol>
            <pre className="p-2.5 rounded-lg bg-[#1A1A1A] text-emerald-400 font-mono text-[11px] overflow-x-auto">
              VITE_SUPABASE_URL=https://xyz.supabase.co&#10;VITE_SUPABASE_ANON_KEY=eyJhbGci...
            </pre>
            <p className="text-[11px] text-[#9CA3AF]">
              Once added, anyone visiting your link can create an account and sync their personal habits securely for free!
            </p>
          </div>
        )}
      </div>
    </Modal>
  );
}
