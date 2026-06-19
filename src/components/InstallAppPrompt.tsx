"use client";

import { useEffect, useState } from "react";

const DISMISS_KEY = "local-harvest-install-dismissed";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

function isIos() {
  if (typeof navigator === "undefined") return false;
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

function isStandalone() {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    ("standalone" in navigator && (navigator as Navigator & { standalone?: boolean }).standalone)
  );
}

export default function InstallAppPrompt() {
  const [visible, setVisible] = useState(false);
  const [ios, setIos] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    if (isStandalone() || localStorage.getItem(DISMISS_KEY)) return;

    const iosDevice = isIos();
    setIos(iosDevice);

    if (iosDevice) {
      setVisible(true);
      return;
    }

    const onBeforeInstall = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
      setVisible(true);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    return () => window.removeEventListener("beforeinstallprompt", onBeforeInstall);
  }, []);

  const dismiss = () => {
    localStorage.setItem(DISMISS_KEY, "1");
    setVisible(false);
  };

  const install = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    dismiss();
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-x-4 bottom-4 z-[60] mx-auto max-w-lg rounded-2xl border border-harvest-tan/60 bg-harvest-cream p-4 shadow-lg sm:inset-x-auto sm:right-6 sm:bottom-6">
      <div className="flex items-start gap-3">
        <span className="text-2xl" aria-hidden>
          📲
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-serif font-semibold text-harvest-green-dark">Install Local Harvest</p>
          {ios ? (
            <p className="mt-1 text-sm text-harvest-brown/85">
              Tap <strong>Share</strong> then <strong>Add to Home Screen</strong> to use it like an
              app.
            </p>
          ) : (
            <p className="mt-1 text-sm text-harvest-brown/85">
              Add Local Harvest to your home screen for quick access to local farm shops.
            </p>
          )}
          <div className="mt-3 flex flex-wrap gap-2">
            {!ios && deferredPrompt && (
              <button
                type="button"
                onClick={install}
                className="rounded-full bg-harvest-green px-4 py-2 text-sm font-medium text-harvest-brown hover:bg-harvest-green-dark hover:text-white"
              >
                Install app
              </button>
            )}
            <button
              type="button"
              onClick={dismiss}
              className="rounded-full border border-harvest-tan px-4 py-2 text-sm text-harvest-brown hover:border-harvest-green hover:text-harvest-green"
            >
              Not now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}