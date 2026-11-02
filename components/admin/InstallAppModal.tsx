"use client";

import { useState, useEffect } from "react";
import { Download, X, Smartphone, Share, PlusSquare, CheckCircle2 } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

export default function InstallAppModal() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // 1. Cek apakah aplikasi sudah berjalan dalam mode standalone (sudah terinstal)
    const isAppInstalled =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true;

    if (isAppInstalled) {
      setIsStandalone(true);
      return;
    }

    // 2. Cek apakah user pernah menolak/menutup pop-up hari ini
    const dismissedTime = localStorage.getItem("dismiss_install_admin_app");
    if (dismissedTime) {
      const diffHours = (Date.now() - parseInt(dismissedTime, 10)) / (1000 * 60 * 60);
      if (diffHours < 24) return; // Jangan munculkan lagi selama 24 jam
    }

    // 3. Deteksi perangkat iOS (Safari)
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    // Tangkap prompt native browser (Android / Chrome / Edge)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowModal(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // Jika iOS dan belum terinstall, tampilkan modal petunjuk setelah jeda 2 detik
    if (isIosDevice) {
      const timer = setTimeout(() => {
        setShowModal(true);
      }, 2000);
      return () => clearTimeout(timer);
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  // Handler tombol Install (Chrome/Android)
  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      setShowModal(false);
    }
    setDeferredPrompt(null);
  };

  // Handler Tutup Pop-up
  const handleDismiss = () => {
    localStorage.setItem("dismiss_install_admin_app", Date.now().toString());
    setShowModal(false);
  };

  // Jangan render apapun jika sudah terinstall atau modal tidak aktif
  if (isStandalone || !showModal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-sm rounded-3xl border border-slate-200 bg-white p-5 shadow-2xl dark:border-slate-800 dark:bg-slate-900 text-slate-800 dark:text-slate-100">
        {/* Header Modal */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-600 font-black text-white shadow-md shadow-emerald-600/30">
              ADM[cite: 3]
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Install Admin Amarilis
              </h3>
              <p className="text-[11px] text-slate-400">Aplikasi Pengurus RT</p>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X size={18} />
          </button>
        </div>

        {/* Header Modal dengan Logo dari Manifest */}
<div className="flex items-start justify-between">
  <div className="flex items-center gap-3">
    <div className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-white p-1 shadow-md dark:border-slate-800 dark:bg-slate-800">
      <img
        src="/icons/icon-192.png"
        alt="Logo MyAmarilis"
        className="h-full w-full object-contain"
      />
    </div>
    <div>
      <h3 className="text-sm font-bold text-slate-900 dark:text-white">
        Pasang MyAdmin
      </h3>
      <p className="text-[11px] text-slate-400">Aplikasinya Warga Bukit Amarilis</p>
    </div>
  </div>
  <button
    onClick={handleDismiss}
    className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
  >
    <X size={18} />
  </button>
</div>

        {/* Deskripsi Keuntungan */}
        <div className="mt-4 space-y-2 rounded-2xl bg-slate-50 p-3.5 text-xs dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
            <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
            <span>Akses cepat dari layar utama HP tanpa buka browser</span>
          </div>
          <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
            <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
            <span>Tampilan layar penuh (*Full Screen App*)</span>
          </div>
          <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
            <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
            <span>Entri data IPL & kas lebih ringan dan praktis</span>
          </div>
        </div>

        {/* Instruksi Khusus iOS / Safari */}
        {isIOS ? (
          <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50/80 p-3 text-[11px] text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-200 space-y-1.5">
            <p className="font-bold flex items-center gap-1.5">
              <Smartphone size={14} /> Cara Pasang di iPhone/iPad:
            </p>
            <p className="flex items-center gap-1.5">
              1. Ketuk tombol <Share size={13} className="inline text-blue-600" /> (Share) di browser Safari.
            </p>
            <p className="flex items-center gap-1.5">
              2. Gulir ke bawah lalu pilih <PlusSquare size={13} className="inline" /> <strong>Add to Home Screen</strong>.
            </p>
          </div>
        ) : null}

        {/* Tombol Aksi */}
        <div className="mt-5 flex gap-2">
          <button
            type="button"
            onClick={handleDismiss}
            className="w-1/3 rounded-xl border border-slate-200 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 transition"
          >
            Nanti Saja
          </button>

          {!isIOS ? (
            <button
              type="button"
              onClick={handleInstallClick}
              className="w-2/3 flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 py-2.5 text-xs font-bold text-white shadow-md shadow-emerald-600/20 hover:bg-emerald-700 transition"
            >
              <Download size={14} />
              <span>Install Sekarang</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleDismiss}
              className="w-2/3 rounded-xl bg-emerald-600 py-2.5 text-xs font-bold text-white shadow-md shadow-emerald-600/20 hover:bg-emerald-700 transition"
            >
              Saya Mengerti
            </button>
          )}
        </div>
      </div>
    </div>
  );
}