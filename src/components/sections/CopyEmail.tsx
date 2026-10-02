'use client';

import { useEffect, useRef, useState } from 'react';
import { Icon } from '@/components/ui/Icon';

/** Copia o e-mail com confirmação anunciada a leitores de tela (aria-live). */
export function CopyEmail({ email, labels }: { email: string; labels: { copy: string; copied: string; failed: string } }) {
  const [status, setStatus] = useState<'idle' | 'copied' | 'failed'>('idle');
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const copy = async () => {
    let ok = false;
    try {
      await navigator.clipboard.writeText(email);
      ok = true;
    } catch {
      // Alternativa para navegadores sem a API de área de transferência.
      const field = document.createElement('textarea');
      field.value = email;
      field.setAttribute('readonly', '');
      field.style.position = 'fixed';
      field.style.opacity = '0';
      document.body.appendChild(field);
      field.select();
      try {
        ok = document.execCommand('copy');
      } catch {
        ok = false;
      }
      field.remove();
    }
    setStatus(ok ? 'copied' : 'failed');
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setStatus('idle'), 4000);
  };

  return (
    <>
      <button type="button" className="btn btn--ghost" onClick={copy} data-status={status}>
        <Icon name={status === 'copied' ? 'check' : 'copy'} />
        {labels.copy}
      </button>
      <p role="status" aria-live="polite" className="copy-status">
        {status === 'copied' ? labels.copied : status === 'failed' ? labels.failed : ''}
      </p>
    </>
  );
}
