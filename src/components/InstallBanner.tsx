import { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function InstallBanner() {
  const [prompt, setPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(() =>
    localStorage.getItem('surf-pt-install-dismissed') === '1'
  );

  useEffect(() => {
    function handler(e: Event) {
      e.preventDefault();
      setPrompt(e as BeforeInstallPromptEvent);
    }
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  if (!prompt || dismissed) return null;

  async function install() {
    if (!prompt) return;
    await prompt.prompt();
    const { outcome } = await prompt.userChoice;
    if (outcome === 'accepted') setPrompt(null);
  }

  function dismiss() {
    setDismissed(true);
    localStorage.setItem('surf-pt-install-dismissed', '1');
  }

  return (
    <div className="flex items-center gap-3 px-4 py-2.5 bg-cyan-900/40 border-b border-cyan-700/30">
      <Download size={16} className="text-cyan-400 shrink-0" />
      <p className="text-sm text-cyan-200 flex-1">
        Instalar Surf Portugal no ecrã inicial
      </p>
      <button
        onClick={install}
        className="text-xs font-semibold bg-cyan-500 hover:bg-cyan-400 text-slate-950 px-3 py-1.5 rounded-lg transition-colors shrink-0"
      >
        Instalar
      </button>
      <button onClick={dismiss} className="text-slate-500 hover:text-slate-300">
        <X size={16} />
      </button>
    </div>
  );
}
