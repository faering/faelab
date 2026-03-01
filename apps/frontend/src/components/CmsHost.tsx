import React from 'react';
import { X } from 'lucide-react';
import CmsShell from './CmsShell';

const CMS_OPEN_KEY = 'cmsOpen';
const CMS_STATE_KEY = 'projectsCmsState';

type CmsHostProps = {
  title?: string;
};

export default function CmsHost({ title = 'CMS' }: CmsHostProps) {
  const [isCmsOpen, setIsCmsOpen] = React.useState(() => {
    try {
      return localStorage.getItem(CMS_OPEN_KEY) === '1';
    } catch {
      return false;
    }
  });
  const [cmsIsDirty, setCmsIsDirty] = React.useState(false);
  const [pendingDiscard, setPendingDiscard] = React.useState(false);
  const noDiscardButtonRef = React.useRef<HTMLButtonElement | null>(null);

  React.useEffect(() => {
    try {
      localStorage.setItem(CMS_OPEN_KEY, isCmsOpen ? '1' : '0');
    } catch {
      // ignore (storage unavailable)
    }
  }, [isCmsOpen]);

  React.useEffect(() => {
    const handleCmsOpen = () => {
      setIsCmsOpen(true);
    };

    window.addEventListener('cms-open', handleCmsOpen as EventListener);
    return () => window.removeEventListener('cms-open', handleCmsOpen as EventListener);
  }, []);

  React.useEffect(() => {
    if (!isCmsOpen) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') requestClose();
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isCmsOpen, cmsIsDirty]);

  React.useEffect(() => {
    if (!pendingDiscard) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setPendingDiscard(false);
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [pendingDiscard]);

  React.useEffect(() => {
    if (!pendingDiscard) return;
    noDiscardButtonRef.current?.focus();
  }, [pendingDiscard]);

  React.useEffect(() => {
    if (!isCmsOpen) return;
    if (!cmsIsDirty) return;

    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
      return '';
    };

    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [isCmsOpen, cmsIsDirty]);

  React.useEffect(() => {
    if (!isCmsOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isCmsOpen]);

  const discardAndClose = () => {
    try {
      localStorage.removeItem(CMS_STATE_KEY);
    } catch {
      // ignore
    }
    setPendingDiscard(false);
    setIsCmsOpen(false);
  };

  const requestClose = () => {
    if (cmsIsDirty) {
      setPendingDiscard(true);
      return;
    }
    setIsCmsOpen(false);
  };

  if (!isCmsOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <button
          className="absolute inset-0 bg-black/40"
          aria-label="Close CMS"
          onClick={requestClose}
          type="button"
        />

        <div className="relative w-full max-w-5xl rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-gray-900 shadow-xl">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-700">
            <div className="font-semibold text-slate-900 dark:text-slate-100">{title}</div>
            <button
              type="button"
              className="flex items-center justify-center w-10 h-10 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              onClick={requestClose}
              aria-label="Close"
            >
              <X size={22} className="text-slate-600 dark:text-slate-300" />
            </button>
          </div>

          <div className="p-5 text-slate-700 dark:text-slate-200">
            <CmsShell onDirtyChange={setCmsIsDirty} />
          </div>
        </div>
      </div>

      {pendingDiscard && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Discard changes?"
        >
          <button
            type="button"
            className="absolute inset-0 bg-black/50"
            aria-label="Keep editing"
            onClick={() => setPendingDiscard(false)}
          />

          <div className="relative w-full max-w-lg rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-gray-900 shadow-xl p-5">
            <div className="text-lg font-semibold text-slate-900 dark:text-slate-100">Discard changes?</div>
            <div className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              You have unsaved changes. Do you want to discard them?
            </div>

            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                ref={noDiscardButtonRef}
                type="button"
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white transition-colors focus:outline-none focus:ring-2 focus:ring-purple-300"
                onClick={() => setPendingDiscard(false)}
              >
                No, keep editing
              </button>
              <button
                type="button"
                className="px-4 py-2 rounded-xl border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
                onClick={discardAndClose}
              >
                Yes, discard
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
