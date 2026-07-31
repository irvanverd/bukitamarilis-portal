"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { X } from "lucide-react";

const VERSION = "jadwal-lomba-v1";
const MAX_SHOW = 3;

export default function PopupBanner() {

  const [open, setOpen] = useState(false);

  useEffect(() => {

    const count = Number(localStorage.getItem(VERSION) || "0");
  
    if (count < MAX_SHOW) {
      setOpen(true);
    }
  
  }, []);

  function closeBanner() {

    localStorage.setItem(VERSION, "1");
  
    setOpen(false);
  
  }
  if (!open) return null;

  return (

    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">

<div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">

  {/* HEADER */}
  <div className="flex items-center justify-between px-4 py-3 border-b bg-white sticky top-0 z-50">

    <h2 className="font-bold text-lg">
      📢 Jadwal Lomba HUT RI
    </h2>

    <button
      onClick={closeBanner}
      className="rounded-full p-2 hover:bg-red-500 hover:text-white transition"
    >
      <X size={22} />
    </button>

  </div>

  {/* ISI */}
  <div className="overflow-auto max-h-[80vh]">

    <Image
      src="/assets/jadwal-lomba.jpeg"
      alt="Jadwal"
      width={1200}
      height={1800}
      className="w-full h-auto"
      priority
    />

  </div>

</div>

</div>
    </>

  );

}