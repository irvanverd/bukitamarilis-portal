"use client";

import { useEffect, useState } from "react";
import { getClientCache, saveClientCache } from "@/lib/client-cache";

interface KasData {
  pemasukan: number;
  pengeluaran: number;
  saldo: number;
  lastupdatetime: string;
}

const CACHE_KEY = "kas-summary";

export default function KasSummary() {
  const [kas, setKas] = useState<KasData>({
    pemasukan: 0,
    pengeluaran: 0,
    saldo: 0,
    lastupdatetime: "-",
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadKas = async () => {
      // =====================================================
      // 1. LOCALSTORAGE
      // =====================================================

      const cached = getClientCache<KasData>(CACHE_KEY);

      if (cached?.data) {
        console.log(
          "📦 KasSummary: menggunakan localStorage",
          new Date(cached.timestamp)
        );

        setKas(cached.data);
        setLoading(false);
      }

      // =====================================================
      // 2. BACKGROUND REQUEST
      // =====================================================

      try {
        console.log("🌐 KasSummary: mengambil data terbaru...");

        const controller = new AbortController();

        const timeout = setTimeout(() => {
          controller.abort();
        }, 10000);

        try {
          const res = await fetch(
            "/api/finance?action=getFinanceData",
            {
              cache: "no-store",
              signal: controller.signal,
            }
          );

          if (!res.ok) {
            throw new Error(`HTTP ${res.status}`);
          }

          const json = await res.json();

          if (!json?.success) {
            throw new Error(
              json?.message ||
                "Gagal mengambil data keuangan"
            );
          }

          const data = json.data;

          if (!Array.isArray(data)) {
            throw new Error(
              "Data kas bukan array"
            );
          }

          // =====================================================
          // 3. CARI BULAN BERJALAN
          // =====================================================

          const bulanIndonesia = [
            "Januari",
            "Februari",
            "Maret",
            "April",
            "Mei",
            "Juni",
            "Juli",
            "Agustus",
            "September",
            "Oktober",
            "November",
            "Desember",
          ];

          const now = new Date();

          const currentYear = now.getFullYear();

          const currentMonth =
            bulanIndonesia[now.getMonth()];

          const kasBulanIni = data.find(
            (item: any) => {
              const tahun = Number(item.Tahun);

              const bulan = String(
                item.bulan ?? ""
              )
                .trim()
                .toLowerCase();

              return (
                tahun === currentYear &&
                bulan ===
                  currentMonth.toLowerCase()
              );
            }
          );

          const result: KasData = {
            pemasukan: Number(
              kasBulanIni?.pemasukan ?? 0
            ),
            pengeluaran: Number(
              kasBulanIni?.pengeluaran ?? 0
            ),
            saldo: Number(
              kasBulanIni?.saldo ?? 0
            ),
            lastupdatetime:
              json?.timestamp
                ? new Date(
                    json.timestamp
                  ).toLocaleString(
                    "id-ID",
                    {
                      dateStyle: "medium",
                      timeStyle: "short",
                    }
                  )
                : "-",
          };

          // =====================================================
          // 4. UPDATE STATE
          // =====================================================

          setKas(result);

          // =====================================================
          // 5. SIMPAN LOCALSTORAGE
          // =====================================================

          saveClientCache(
            CACHE_KEY,
            result
          );

          console.log(
            "💾 KasSummary: localStorage diperbarui"
          );
        } finally {
          clearTimeout(timeout);
        }
      } catch (error) {
        console.warn(
          "⚠️ KasSummary: server gagal, menggunakan cache",
          error
        );

        // Jangan kosongkan state.
        // Jika cache ada, data tetap tampil.
      } finally {
        setLoading(false);
      }
    };

    loadKas();
  }, []);

  return (
    <section>
      <div className="bg-background rounded-3xl shadow-sm border p-6">

        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold">
              Ringkasan Kas RT
            </h2>

            <p className="text-slate-500 dark:text-slate-400">
              Last Update : {kas.lastupdatetime}
            </p>
          </div>

          <a
            href="/transparansi"
            className="text-green-600 font-medium"
          >
            Lihat Detail →
          </a>
        </div>

        {loading && (
          <div className="text-xs text-slate-400 mb-3">
            Memuat data kas...
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-3">
          <KasCard
            title="Pemasukan bulan ini"
            value={kas.pemasukan}
            color="text-green-600"
          />

          <KasCard
            title="Pengeluaran bulan ini"
            value={kas.pengeluaran}
            color="text-red-600"
          />

          <KasCard
            title="Saldo"
            value={kas.saldo}
            color="text-blue-600"
          />
        </div>
      </div>
    </section>
  );
}

function KasCard({
  title,
  value,
  color,
}: {
  title: string;
  value: number;
  color: string;
}) {
  return (
    <div className="border rounded-xl p-4 shadow-sm">
      <p className="text-slate-500 dark:text-slate-400">
        {title}
      </p>

      <h3
        className={`text-2xl font-bold mt-2 ${color}`}
      >
        Rp{" "}
        {Number(value).toLocaleString("id-ID")}
      </h3>
    </div>
  );
}