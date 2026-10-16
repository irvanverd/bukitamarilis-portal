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
      window.alert('Untuk memasang Portal Amarilis di iPhone/iPad:1. Buka website ini melalui Safari.2. Tekan tombol Share (ikon kotak dengan panah ke atas).3. Pilih "Add to Home Screen" / "Tambahkan ke Layar Utama".4. Tekan "Add" / "Tambah".');
      return;
    }

    window.alert('Instalasi belum tersedia di browser ini. Pastikan website sudah dibuka melalui HTTPS dan manifest serta ikon PWA sudah terpasang. Di Chrome, Anda juga bisa membuka menu ⋮ lalu pilih "Install app" atau "Tambahkan ke layar utama" jika tersedia.');
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
