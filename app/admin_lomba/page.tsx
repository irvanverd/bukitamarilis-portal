"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";


export default function Login() {

  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);

  async function login() {

    setLoading(true);

    const res = await fetch("/api/auth", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username,
        password,
      }),
    });

    const json = await res.json();

    setLoading(false);

    if (json.success) {
      router.replace("/list-peserta");
      return;
    }

    alert("nama panitia atau Password salah.");

  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">

      <div className="bg-white rounded-xl shadow p-8 w-80 space-y-4">

        <h1 className="text-xl font-bold text-center">
          Login
        </h1>

        <input
          className="w-full border rounded-lg p-3"
          placeholder="nama panitia"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <input
          type="password"
          className="w-full border rounded-lg p-3"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") login();
          }}
        />

        <button
          onClick={login}
          disabled={loading}
          className="w-full rounded-lg bg-red-600 hover:bg-red-700 text-white py-3"
        >
          {loading ? "Loading..." : "Login"}
        </button>

      </div>

    </div>
  );
}