const CACHE_PREFIX = "amarilis:";

interface CacheData<T> {
  data: T;
  timestamp: number;
}

export function saveClientCache<T>(
  key: string,
  data: T
) {
  if (typeof window === "undefined") return;

  try {
    const payload: CacheData<T> = {
      data,
      timestamp: Date.now(),
    };

    localStorage.setItem(
      `${CACHE_PREFIX}${key}`,
      JSON.stringify(payload)
    );
  } catch (error) {
    console.error("Gagal menyimpan localStorage:", error);
  }
}

export function getClientCache<T>(
  key: string
): CacheData<T> | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = localStorage.getItem(
      `${CACHE_PREFIX}${key}`
    );

    if (!raw) return null;

    return JSON.parse(raw);
  } catch (error) {
    console.error("Gagal membaca localStorage:", error);
    return null;
  }
}

export function removeClientCache(key: string) {
  if (typeof window === "undefined") return;

  localStorage.removeItem(
    `${CACHE_PREFIX}${key}`
  );
}