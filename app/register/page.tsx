"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role] = useState("staff");
  const [organizationId] = useState("ca5196b5-479b-4559-8f44-867d053d7fc5");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validation
    if (!username || !email || !password || !confirmPassword) {
      setError("Semua field harus diisi");
      return;
    }

    if (password !== confirmPassword) {
      setError("Kata sandi tidak cocok");
      return;
    }

    if (password.length < 6) {
      setError("Kata sandi minimal 6 karakter");
      return;
    }

    if (!email.includes("@")) {
      setError("Email tidak valid");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          username,
          email,
          password,
          role,
          organization_id: organizationId
        })
      });

      const data = (await response.json()) as
        | {
            success?: boolean;
            server_message?: string;
            detail?: string;
            id?: string;
            username?: string;
            email?: string;
          }
        | null;

      if (!response.ok || !data?.success) {
        setError(data?.server_message ?? data?.detail ?? "Gagal mendaftar");
        return;
      }

      setSuccess("Akun berhasil dibuat! Redirecting ke login...");
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch {
      setError("Gagal mendaftar akun");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">

      {/* LEFT SIDE */}
      <div className="hidden md:flex w-1/2 relative bg-[#0B1F3A] text-white p-16">

        {/* Background */}
        <div className="absolute inset-0 opacity-10 bg-pattern bg-cover" />

        {/* CENTER CONTENT */}
        <div className="relative z-10 max-w-lg m-auto">
          <h1 className="text-4xl font-semibold leading-tight">
            Bangun akses yang aman <br />
            <span className="text-[#22C55E] font-bold">
              sejak hari pertama.
            </span>
          </h1>

          <p className="mt-6 text-gray-300 text-sm leading-relaxed">
            Daftarkan akun baru untuk mulai mengelola transaksi,
            laporan periodik, dan insight prediksi pendapatan
            dalam satu sistem.
          </p>
        </div>

  {/* BOTTOM RIGHT */}
  <div className="absolute bottom-10 right-10 z-10 flex items-center gap-2 text-gray-400 text-sm">
    <div className="flex -space-x-2">
      <div className="w-6 h-6 bg-gray-400 rounded-full" />
      <div className="w-6 h-6 bg-gray-500 rounded-full" />
      <div className="w-6 h-6 bg-gray-600 rounded-full" />
    </div>
    <span>Dipercaya oleh 12.000+ operator institusional.</span>
  </div>

</div>

      {/* RIGHT SIDE */}
      <div className="flex w-full md:w-1/2 items-center justify-center bg-[#F8FAFC] px-6">

        <div className="w-full max-w-md">

          {/* Logo */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-[#22C55E] rounded-lg flex items-center justify-center text-white font-bold">
              F
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-800 tracking-wide">
                RENTAL FINANCE CONTROL
              </p>
              <p className="text-xs text-gray-500">
                Sistem Manajemen Rental Mobil
              </p>
            </div>
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-gray-800 mb-1">
            Buat akun
          </h2>
          <p className="text-sm text-gray-500 mb-6">
            Lengkapi formulir untuk membuat akun Anda.
          </p>

          {/* FORM */}
          <form className="flex flex-col text-gray-700 gap-4" onSubmit={handleSubmit}>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}

            {success && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
                {success}
              </div>
            )}

            {/* Username */}
            <div>
              <label className="text-sm font-medium text-gray-700">
                Username
              </label>
              <input
                type="text"
                placeholder="contoh: akbar.admin"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={isLoading}
                className="w-full mt-1 px-4 py-3 border border-gray-200 rounded-lg bg-gray-100 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B1F3A] disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>

            {/* Email */}
            <div>
              <label className="text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                placeholder="contoh: admin@financecontrol.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                className="w-full mt-1 px-4 py-3 border border-gray-200 rounded-lg bg-gray-100 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B1F3A] disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>

            {/* Password */}
            <div>
              <label className="text-sm font-medium text-gray-700">
                Kata Sandi
              </label>

              <div className="relative mt-1">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Minimal 6 karakter"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-100 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B1F3A] disabled:opacity-50 disabled:cursor-not-allowed"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                  className="absolute right-3 top-3 text-gray-400 disabled:opacity-50"
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="text-sm font-medium text-gray-700">
                Konfirmasi Kata Sandi
              </label>

              <div className="relative mt-1">
                <input
                  type={showConfirm ? "text" : "password"}
                  placeholder="Masukkan ulang kata sandi"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={isLoading}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-100 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B1F3A] disabled:opacity-50 disabled:cursor-not-allowed"
                />

                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  disabled={isLoading}
                  className="absolute right-3 top-3 text-gray-400 disabled:opacity-50"
                >
                  {showConfirm ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            {/* Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="mt-2 bg-[#0B1F3A] text-white py-3 rounded-lg font-medium hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Mendaftar..." : "Buat Akun"}
            </button>
          </form>

          {/* Login link */}
          <p className="text-sm text-gray-500 mt-6 text-center">
            Sudah punya akun?{" "}
            <Link href="/login" className="text-[#0B1F3A] font-medium">
              Masuk
            </Link>
          </p>

        </div>
      </div>
    </div>
  );
}