"use client";

import { useEffect, useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  Loader2,
  MessageCircle,
  Send,
  User,
} from "lucide-react";

interface Comment {
  ID: string;
  KEGIATAN_ID: string;
  NAMA: string;
  KOMENTAR: string;
  TANGGAL: string;
}

interface Props {
  kegiatanId: string;
}

export default function CommentSection({
  kegiatanId,
}: Props) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [nama, setNama] = useState("");
  const [komentar, setKomentar] = useState("");

  const [loading, setLoading] = useState(false);

  const [success, setSuccess] =
    useState(false);

  const [open, setOpen] =
    useState(false);

  async function loadComment() {
    try {

      const res = await fetch(
        `/api/comments?kegiatanId=${kegiatanId}`,
        {
          cache: "no-store",
        }
      );

      const data = await res.json();

      const sorted = data.sort(
        (a: Comment, b: Comment) =>
          new Date(b.TANGGAL).getTime() -
          new Date(a.TANGGAL).getTime()
      );

      setComments(sorted);

      if (sorted.length > 0) {
        setOpen(false);
      }

    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => {
    loadComment();
  }, []);

  async function submit() {

    if (!komentar.trim()) {
      alert("Silakan isi komentar.");
      return;
    }

    setLoading(true);

    try {

      await fetch("/api/comments", {

        method: "POST",

        headers: {
          "Content-Type":
            "application/json",
        },

        body: JSON.stringify({

          kegiatanId,

          nama:
            nama.trim() || "Warga",

          komentar,

        }),

      });

      setNama("");

      setKomentar("");

      await loadComment();

      setOpen(true);

      setSuccess(true);

      setTimeout(() => {
        setSuccess(false);
      }, 3000);

    } catch (err) {

      console.error(err);

      alert("Gagal mengirim komentar.");

    }

    setLoading(false);

  }

  function formatTanggal(
    tanggal: string
  ) {

    try {

      return new Date(
        tanggal
      ).toLocaleString("id-ID", {
        dateStyle: "medium",
        timeStyle: "short",
      });

    } catch {

      return tanggal;

    }

  }

  return (

    <div
      className="
      mt-6
      rounded-xl
      border
      border-slate-200
      dark:border-slate-700
      bg-white
      dark:bg-slate-900
      shadow-sm
      overflow-hidden
    "
    >

      {/* Header */}

      <button
        type="button"
        onClick={() =>
          setOpen(!open)
        }
        className="
        flex
        w-full
        items-center
        justify-between
        px-5
        py-4
        hover:bg-slate-50
        dark:hover:bg-slate-800
        transition
      "
      >

        <div className="flex items-center gap-3">

          <MessageCircle
            className="text-blue-600"
            size={22}
          />

          <span className="font-semibold text-lg">

            Komentar

          </span>

          <span
            className="
            rounded-full
            bg-blue-600
            px-2.5
            py-0.5
            text-xs
            font-medium
            text-white
          "
          >

            {comments.length}

          </span>

        </div>

        {open ? (

          <ChevronUp size={20} />

        ) : (

          <ChevronDown size={20} />

        )}

      </button>

      <div
        className={`
          overflow-hidden
          transition-all
          duration-300
          ease-in-out
          ${
            open
              ? "max-h-[2500px] opacity-100"
              : "max-h-0 opacity-0"
          }
        `}
      >

        <div className="px-5 pb-5">

          {success && (

            <div
              className="
              mb-5
              rounded-lg
              border
              border-green-300
              bg-green-50
              dark:bg-green-900/20
              dark:border-green-700
              p-3
              text-green-700
              dark:text-green-300
            "
            >

              ✅ Komentar berhasil dikirim.

            </div>

          )}
          {/* List Komentar */}

          <div className="space-y-4">

            {comments.length === 0 && (

              <div
                className="
                  rounded-lg
                  border
                  border-dashed
                  border-slate-300
                  dark:border-slate-700
                  p-6
                  text-center
                  text-sm
                  text-slate-500
                "
              >

                Belum ada komentar.

                <br />

                Jadilah yang pertama memberikan komentar 😊

              </div>

            )}

            {comments.map((item) => (

              <div
                key={item.ID}
                className="
                  rounded-xl
                  border
                  border-slate-200
                  dark:border-slate-700
                  bg-slate-50
                  dark:bg-slate-800
                  p-4
                  shadow-sm
                "
              >

                <div className="flex items-center justify-between">

                  <div className="flex items-center gap-2">

                    <div
                      className="
                        flex
                        h-9
                        w-9
                        items-center
                        justify-center
                        rounded-full
                        bg-blue-100
                        dark:bg-blue-900
                      "
                    >

                      <User
                        size={18}
                        className="text-blue-600 dark:text-blue-300"
                      />

                    </div>

                    <div>

                      <div className="font-semibold">

                        {item.NAMA}

                      </div>

                      <div className="text-xs text-slate-500">

                        {formatTanggal(item.TANGGAL)}

                      </div>

                    </div>

                  </div>

                </div>

                <div
                  className="
                    mt-3
                    whitespace-pre-line
                    leading-7
                    text-slate-700
                    dark:text-slate-300
                  "
                >

                  {item.KOMENTAR}

                </div>

              </div>

            ))}

          </div>

          {/* Form */}

          <div className="mt-8 border-t pt-6 dark:border-slate-700">

            <h4 className="mb-4 font-semibold">

              Tulis Komentar

            </h4>

            <div className="space-y-4">

              <input
                type="text"
                value={nama}
                onChange={(e) =>
                  setNama(e.target.value)
                }
                placeholder="Nama (Opsional)"
                className="
                  w-full
                  rounded-lg
                  border
                  border-slate-300
                  dark:border-slate-700
                  bg-white
                  dark:bg-slate-900
                  px-4
                  py-3
                  outline-none
                  focus:ring-2
                  focus:ring-blue-500
                "
              />

              <textarea
                rows={4}
                value={komentar}
                onChange={(e) =>
                  setKomentar(e.target.value)
                }
                placeholder="Tulis komentar..."
                className="
                  w-full
                  rounded-lg
                  border
                  border-slate-300
                  dark:border-slate-700
                  bg-white
                  dark:bg-slate-900
                  px-4
                  py-3
                  resize-none
                  outline-none
                  focus:ring-2
                  focus:ring-blue-500
                "
              />

              <button
                type="button"
                disabled={loading}
                onClick={submit}
                className="
                  flex
                  w-full
                  items-center
                  justify-center
                  gap-2
                  rounded-lg
                  bg-blue-600
                  hover:bg-blue-700
                  disabled:bg-blue-400
                  disabled:cursor-not-allowed
                  py-3
                  font-medium
                  text-white
                  transition
                "
              >

                {loading ? (

                  <>

                    <Loader2
                      size={18}
                      className="animate-spin"
                    />

                    Mengirim...

                  </>

                ) : (

                  <>

                    <Send size={18} />

                    Kirim Komentar

                  </>

                )}

              </button>

            </div>

          </div>

        </div>

      </div>

    </div>

  );

}          