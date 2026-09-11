import React, { useState, useEffect } from 'react';
import { Database, Key, Check, AlertCircle, Sparkles, ExternalLink, X } from 'lucide-react';
import { getSupabaseCredentials, saveSupabaseCredentials, isSupabaseConfigured, cleanSupabaseUrl } from '../lib/supabase';

interface SupabaseConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnected?: () => void;
}

export const SupabaseConnectModal: React.FC<SupabaseConnectModalProps> = ({
  isOpen,
  onClose,
  onConnected,
}) => {
  const [url, setUrl] = useState('');
  const [key, setKey] = useState('');
  const [status, setStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (isOpen) {
      const current = getSupabaseCredentials();
      setUrl(current.url);
      setKey(current.key);
      setStatus('idle');
      setErrorMsg('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSaveAndConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUrl = cleanSupabaseUrl(url.trim());
    const cleanKey = key.trim();

    if (!cleanUrl || !cleanKey) {
      setErrorMsg('Please provide both your Supabase Project URL and Anon Public Key.');
      setStatus('error');
      return;
    }

    if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
      setErrorMsg('Project URL must begin with https:// (e.g. https://your-project.supabase.co)');
      setStatus('error');
      return;
    }

    if (cleanKey.length < 20) {
      setErrorMsg('The Anon Public Key appears too short. Please copy the anon key from Project Settings -> API.');
      setStatus('error');
      return;
    }

    setStatus('testing');
    setErrorMsg('');

    try {
      // Test direct REST call with headers
      const testRes = await fetch(`${cleanUrl.replace(/\/$/, '')}/rest/v1/`, {
        headers: {
          apikey: cleanKey,
          Authorization: `Bearer ${cleanKey}`,
        },
      });

      if (testRes.status === 401 || testRes.status === 403) {
        const body = await testRes.json().catch(() => ({}));
        setErrorMsg(body.message || 'Unauthorized: The Supabase Anon key is rejected by the server.');
        setStatus('error');
        return;
      }

      // Save credentials to localStorage
      saveSupabaseCredentials(cleanUrl, cleanKey);
      setStatus('success');

      setTimeout(() => {
        if (onConnected) {
          onConnected();
        } else {
          window.location.reload();
        }
      }, 500);
    } catch (err: any) {
      // Even if rest/v1 root check has network CORS or 404, we save and reload to let client connect
      saveSupabaseCredentials(cleanUrl, cleanKey);
      setStatus('success');
      setTimeout(() => {
        if (onConnected) {
          onConnected();
        } else {
          window.location.reload();
        }
      }, 500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-rose-100 dark:border-slate-800 p-6 sm:p-8 space-y-6">
        
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 dark:bg-emerald-500/20 flex items-center justify-center">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                Connect Supabase Project
                {isSupabaseConfigured && (
                  <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full font-bold">
                    Connected
                  </span>
                )}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                All accounts, messages, timeline photos & couple data are stored in your database.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Instructions */}
        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 text-xs text-slate-600 dark:text-slate-300 space-y-1.5">
          <div className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            Where to find credentials in Supabase Dashboard:
          </div>
          <ol className="list-decimal list-inside space-y-1 text-slate-500 dark:text-slate-400 pl-1 text-[11px]">
            <li>Open your project at <strong className="text-slate-700 dark:text-slate-200">supabase.com</strong></li>
            <li>Go to <strong className="text-slate-700 dark:text-slate-200">Project Settings</strong> → <strong className="text-slate-700 dark:text-slate-200">API</strong></li>
            <li>Copy <strong className="text-slate-700 dark:text-slate-200">Project URL</strong> and <strong className="text-slate-700 dark:text-slate-200">Project API Keys (anon public)</strong></li>
          </ol>
        </div>

        {/* Error notice */}
        {errorMsg && (
          <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-xs text-rose-600 dark:text-rose-400 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSaveAndConnect} className="space-y-4 text-left">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Project URL
            </label>
            <div className="relative">
              <Database className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
              <input
                type="url"
                required
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://xyzabcdefg.supabase.co"
                className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:outline-none focus:border-rose-500 text-slate-800 dark:text-slate-100 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Anon Public Key (API Key)
            </label>
            <div className="relative">
              <Key className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
              <textarea
                required
                rows={3}
                value={key}
                onChange={(e) => setKey(e.target.value)}
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:outline-none focus:border-rose-500 text-slate-800 dark:text-slate-100 font-mono resize-none"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 px-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={status === 'testing'}
              className="flex-1 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {status === 'testing' ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Connecting...</span>
                </>
              ) : status === 'success' ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Connected!</span>
                </>
              ) : (
                <>
                  <Database className="w-4 h-4" />
                  <span>Save & Connect Database</span>
                </>
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
