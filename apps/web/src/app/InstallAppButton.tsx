'use client';

import { useEffect, useState } from 'react';

interface InstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export default function InstallAppButton() {
  const [installPrompt, setInstallPrompt] = useState<InstallPromptEvent | null>(null);
  const [showInstructions, setShowInstructions] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches
      || ('standalone' in navigator && Boolean((navigator as Navigator & { standalone?: boolean }).standalone));
    setInstalled(isStandalone);

    const handleBeforeInstall = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as InstallPromptEvent);
    };
    const handleInstalled = () => {
      setInstalled(true);
      setInstallPrompt(null);
      setShowInstructions(false);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleInstalled);
    };
  }, []);

  async function installApp() {
    if (!installPrompt) {
      setShowInstructions(true);
      return;
    }

    await installPrompt.prompt();
    const choice = await installPrompt.userChoice;
    if (choice.outcome === 'accepted') setInstalled(true);
    setInstallPrompt(null);
  }

  if (installed) return null;

  return (
    <>
      <button
        type="button"
        onClick={installApp}
        className="mt-7 rounded-lg px-4 py-2 text-sm font-bold text-[#34784A] underline underline-offset-4 transition-colors hover:text-[#193D2B]"
      >
        Install Touch Grass on your phone
      </button>

      {showInstructions && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-[#193D2B]/55 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setShowInstructions(false);
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="install-app-title"
            className="w-full max-w-md rounded-2xl border-2 border-[#193D2B] bg-[#FFF9EF] p-6 text-left text-[#193D2B] shadow-[0_7px_0_#193D2B]"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 id="install-app-title" className="text-xl font-extrabold">Add Touch Grass to your phone</h2>
                <p className="mt-2 text-sm leading-relaxed text-[#5F6B5E]">
                  Add it to your Home Screen to launch it in its own app window.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowInstructions(false)}
                aria-label="Close install instructions"
                className="rounded-md px-2 py-1 font-bold text-[#193D2B] hover:bg-[#F5EDDF]"
              >
                Close
              </button>
            </div>

            <ol className="mt-5 list-decimal space-y-3 pl-5 text-sm leading-relaxed">
              <li><strong>iPhone or iPad:</strong> open this site in Safari, tap Share, then choose Add to Home Screen.</li>
              <li><strong>Android:</strong> open the browser menu and choose Install app or Add to Home screen.</li>
            </ol>
            <p className="mt-4 text-xs leading-relaxed text-[#5F6B5E]">
              Missions and account features need an internet connection.
            </p>
          </section>
        </div>
      )}
    </>
  );
}
