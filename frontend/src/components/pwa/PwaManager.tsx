"use client";

import { useEffect, useState } from "react";
import { Download, X, WifiOff, CheckCircle2, Sparkles, Smartphone } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function PwaManager() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState<boolean>(false);
  const [isInstalled, setIsInstalled] = useState<boolean>(false);
  const [showBanner, setShowBanner] = useState<boolean>(false);
  const [isOffline, setIsOffline] = useState<boolean>(false);

  useEffect(() => {
    // 1. Register Service Worker
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("/sw.js")
          .then((registration) => {
            console.log("[PWA] Service Worker registered with scope:", registration.scope);
          })
          .catch((error) => {
            console.warn("[PWA] Service Worker registration failed:", error);
          });
      });
    }

    // 2. Track Online/Offline status
    const updateOnlineStatus = () => {
      setIsOffline(!navigator.onLine);
    };

    window.addEventListener("online", updateOnlineStatus);
    window.addEventListener("offline", updateOnlineStatus);
    updateOnlineStatus();

    // 3. Listen for PWA Install Prompt
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      const promptEvent = e as BeforeInstallPromptEvent;
      setDeferredPrompt(promptEvent);
      setIsInstallable(true);

      // Show banner after 3 seconds if not dismissed previously
      const dismissed = localStorage.getItem("biopack_pwa_dismissed");
      if (!dismissed) {
        setTimeout(() => setShowBanner(true), 3000);
      }
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setShowBanner(false);
      setDeferredPrompt(null);
      console.log("[PWA] App successfully installed!");
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("online", updateOnlineStatus);
      window.removeEventListener("offline", updateOnlineStatus);
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    if (choice.outcome === "accepted") {
      setIsInstalled(true);
      setShowBanner(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowBanner(false);
    localStorage.setItem("biopack_pwa_dismissed", "true");
  };

  return (
    <>
      {/* Offline Toast */}
      {isOffline && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-sm">
          <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-amber-500 text-white shadow-xl text-xs font-semibold animate-in fade-in slide-in-from-top-3 duration-300">
            <WifiOff className="h-4 w-4 shrink-0" />
            <span className="flex-1">Offline mode: Cached calculations & commodities active</span>
          </div>
        </div>
      )}

      {/* PWA Mobile & Desktop Install Prompt Banner */}
      {showBanner && isInstallable && !isInstalled && (
        <div className="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-50 w-[94%] max-w-md animate-in fade-in slide-in-from-bottom-5 duration-300">
          <div className="p-4 rounded-3xl bg-slate-900/95 backdrop-blur-2xl border border-slate-800 text-white shadow-[0_20px_50px_rgba(0,0,0,0.35)] flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl iridescent-sphere shadow-md">
                <span className="text-white font-black text-xs">BP</span>
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                  <span>Install BioPack App</span>
                  <span className="rounded-full bg-emerald-500/20 px-1.5 py-0.2 text-[9px] font-bold text-emerald-300 border border-emerald-500/30">
                    PWA
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 truncate mt-0.5">
                  Fast offline food physics & 1-tap launch
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={handleInstallClick}
                className="flex items-center gap-1.5 rounded-full bg-emerald-500 hover:bg-emerald-600 px-3.5 py-1.5 text-xs font-bold text-slate-950 transition-all shadow-sm active:scale-95 cursor-pointer"
              >
                <Download className="h-3.5 w-3.5 stroke-[2.5]" />
                <span>Install</span>
              </button>
              <button
                type="button"
                onClick={handleDismiss}
                className="flex h-7 w-7 items-center justify-center rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                title="Dismiss"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
