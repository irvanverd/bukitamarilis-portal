"use client";

import { useEffect, useState } from "react";
import { Download, ShieldCheck, X } from "lucide-react";

export default function AdminInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // 1. Cek apakah aplikasi sudah dalam mode terinstall (standalone)
    if (
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true
    ) {
      setIsInstalled(true);
      return;
    }

    // 2. Hubungkan manifest khusus admin secara dinamis
    let adminManifestLink = document.querySelector<HTMLLinkElement>('link[rel="manifest"]');
    if (adminManifestLink) {
      adminManifestLink.setAttribute("href", "/manifest-admin.json");
    } else {
      adminManifestLink = document.createElement("link");
      adminManifestLink.rel = "manifest";
      adminManifestLink.href = "/manifest-admin.json";
      document.head.appendChild(adminManifestLink);
    }

    // 3. Tangkap event beforeinstallprompt dari Chrome
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Tampilkan banner jika belum pernah ditutup secara eksplisit di sesi ini
      const isDismissed = sessionStorage.getItem("admin-install-dismissed");
      if (!isDismissed) {
        setShowBanner(true);
      }
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    // Picu prompt resmi Chrome
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      setShowBanner(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowBanner(false);
    sessionStorage.setItem("admin-install-dismissed", "true");
  };

  // Jangan tampilkan jika sudah diinstall atau belum ada prompt
  if (isInstalled || !showBanner) return null;

  return (
    <div className="fixed bottom-5 left-4 right-4 z-50 mx-auto max-w-md animate-fade-in sm:left-auto sm:right-6">
      <div className="flex items-start gap-3 rounded-2xl border border-slate-700/80 bg-slate-900/95 p-4 text-white shadow-2xl backdrop-blur-md">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400">
          <ShieldCheck size={22} />
        </div>

        <div className="flex-1">
          <h4 className="text-sm font-bold text-white">
            Install Aplikasi Admin Portal
          </h4>
          <p className="mt-0.5 text-xs text-slate-300 leading-relaxed">
            Pasang di layar utama HP agar langsung membuka dashboard pengurus tanpa membuka browser.
          </p>

          <div className="mt-3 flex items-center gap-2">
            <button
              onClick={handleInstallClick}
              className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-500 px-3.5 py-1.5 text-xs font-bold text-slate-950 shadow-md hover:bg-emerald-400 transition"
            >
              <Download size={14} />
              Install Sekarang
            </button>
            <button
              onClick={handleDismiss}
              className="rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-400 hover:text-white transition"
            >
              Nanti Saja
            </button>
          </div>
        </div>

        <button
          onClick={handleDismiss}
          className="text-slate-400 hover:text-white"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}