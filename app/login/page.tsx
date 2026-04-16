"use client";

import { useState } from "react";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="min-h-screen flex">

      {/* LEFT SIDE */}
      <div className="hidden md:flex w-1/2 relative bg-[#0B1F3A] text-white p-16 flex-col justify-center">
        
        {/* Background subtle line */}
        <div className="absolute inset-0 opacity-10 bg-[url('/pattern.svg')] bg-cover" />

        <div className="relative z-10 max-w-lg">
          <h1 className="text-4xl font-semibold leading-tight">
            Intelijen di balik <br />
            <span className="text-[#22C55E] font-bold">
              pertumbuhan institusional.
            </span>
          </h1>

          <p className="mt-6 text-gray-300 text-sm leading-relaxed">
            Akses dashboard keuangan rental mobil dengan ringkasan transaksi,
            laporan periodik, dan insight prediktif dalam satu portal.
          </p>

          <div className="mt-20 flex items-center gap-2 text-gray-400 text-sm">
            <div className="flex -space-x-2">
              <div className="w-6 h-6 bg-gray-400 rounded-full" />
              <div className="w-6 h-6 bg-gray-500 rounded-full" />
              <div className="w-6 h-6 bg-gray-600 rounded-full" />
            </div>
            <span>Dipercaya oleh 12.000+ operator institusional.</span>
          </div>
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
            Selamat datang kembali
          </h2>
          <p className="text-sm text-gray-500 mb-6">
            Silakan masukkan kredensial untuk mengakses akun Anda.
          </p>

          {/* Form */}
          <form className="flex flex-col gap-4">

            {/* Email */}
            <div>
              <label className="text-sm font-medium text-gray-700">
                Email atau Username
              </label>
              <input
                type="text"
                placeholder="contoh: admin@financecontrol.com"
                className="w-full mt-1 px-4 py-3 border border-gray-200 rounded-lg bg-gray-100 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B1F3A]"
              />
            </div>

            {/* Password */}
            <div>
              <div className="flex justify-between text-sm mb-1">
                <label className="font-medium text-gray-700">
                  Kata Sandi
                </label>
                <span className="text-gray-400 cursor-pointer hover:text-gray-600">
                  Lupa kata sandi?
                </span>
              </div>

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Masukkan kata sandi"
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-100 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B1F3A]"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-400"
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            {/* Button */}
            <button
              type="submit"
              className="mt-2 bg-[#0B1F3A] text-white py-3 rounded-lg font-medium hover:opacity-90 transition"
            >
              Masuk
            </button>
          </form>

          {/* Register */}
          <p className="text-sm text-gray-500 mt-6 text-center">
            Belum punya akun?{" "}
            <span className="text-[#0B1F3A] font-medium cursor-pointer">
              Daftar
            </span>
          </p>

        </div>
      </div>
    </div>
  );
}