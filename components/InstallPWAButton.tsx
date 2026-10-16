"use client";

import { useEffect, useState } from "react";
import { Download, Smartphone } from "lucide-react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

export default function InstallPWAButton() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    const standalone = window.matchMedia("(display-mode: standalone)").matches;
    const iosStandalone = (navigator as Navigator & { standalone?: boolean }).standalone === true;
    setIsInstalled(standalone || iosStandalone);
    setIsIOS(/iphone|ipad|ipod/i.test(navigator.userAgent));

    // Register a service worker so Chromium can evaluate the site as a PWA.
    // The worker is intentionally network-only; it does not cache private or live portal data.
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch((error) => {
        console.error("PWA service worker registration failed:", error);
      });
    }

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as BeforeInstallPromptEvent);
    };
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setInstallPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  if (isInstalled) return null;

  const handleInstall = async () => {
    if (installPrompt) {
      await installPrompt.prompt();
      const choice = await installPrompt.userChoice;
      if (choice.outcome === "accepted") setIsInstalled(true);
      setInstallPrompt(null);
      return;
    }

    if (isIOS) {
      window.alert('Not Support iPhone/iPad.');
      return;
    }

    window.alert('Chrome belum menyediakan prompt instalasi untuk halaman ini. Pastikan deployment terbaru sudah aktif, lalu muat ulang website. Di Chrome desktop, buka menu ⋮ dan cari "Install MyAmarilis…" atau "Cast, save and share" > "Install page as app…". Jika opsi itu tidak ada, buka DevTools (F12) > Application > Manifest untuk melihat kesalahan manifest atau ikon. Pada Android, gunakan Chrome lalu buka menu ⋮ > Install app / Add to Home screen.');
  };

  return (
    <button
      type="button"
      onClick={handleInstall}
      className="inline-flex w-fit items-center justify-center gap-2 rounded-lg bg-[var(--primary)] px-3 py-2 text-sm font-medium text-white transition hover:opacity-90"
      aria-label="Install aplikasi Portal Amarilis"
    >
      {isIOS ? <Smartphone size={16} /> : <Download size={16} />}
      <span>Install Aplikasi</span>
    </button>
  );
}
