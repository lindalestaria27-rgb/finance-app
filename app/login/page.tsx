"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
// Using global login styles copied from slicing/login.css

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validation
    if (!email || !password) {
      setError("Email dan password harus diisi");
      return;
    }

    if (!email.includes("@")) {
      setError("Email tidak valid");
      return;
    }

    setIsLoading(true);
    try {
      const success = await login(email, password);

      if (success) {
        router.push("/dashboard");
      } else {
        setError("Email atau password salah");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Terjadi kesalahan saat login");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="login-shell">

      {/* LEFT SIDE (brand) */}
      <section className="brand-panel">

        {/* Background */}
        <div className="finance-motion" aria-hidden="true">
          <div className="finance-line-layer" />
          <div className="finance-grid-layer" />
        </div>

        {/* CENTER CONTENT */}
        <div className="brand-copy">
          <h1>
            Intelijen di balik <br />
            <span>pertumbuhan institusional.</span>
          </h1>

          <p>
            Akses dashboard keuangan rental mobil dengan ringkasan transaksi,
            laporan periodik, dan insight prediktif dalam satu portal.
          </p>
        </div>

        <div className="brand-foot">
          <div className="avatar-stack" aria-hidden="true">
            <span></span>
            <span></span>
            <span></span>
          </div>
          <p>Dipercaya oleh 12.000+ operator institusional.</p>
        </div>

      </section>

      {/* RIGHT SIDE (auth) */}
      <section className="auth-panel">
        <div className="auth-inner">

          {/* Logo / Brand top */}
          <div className="brand-top auth-brand-top">
            <div className="brand-mark">F</div>
            <div className="brand-name-wrap auth-brand-name-wrap">
              <p className="brand-name auth-brand-name">RENTAL FINANCE CONTROL</p>
              <p className="brand-sub auth-brand-sub">Sistem Manajemen Rental Mobil</p>
            </div>
          </div>

          {/* Title */}
          <div className="auth-header">
            <h2>Selamat datang kembali</h2>
            <p>Silakan masukkan kredensial untuk mengakses akun Anda.</p>
          </div>

          {/* Form */}
          <form className="auth-form" onSubmit={handleSubmit}>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}

            {/* Email */}
            <div>
              <label htmlFor="email">Email</label>
              <input id="email" name="email" type="email" placeholder="contoh: admin@financecontrol.com" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} disabled={isLoading} />
            </div>

            {/* Password */}
            <div>
              <div className="password-row">
                <label htmlFor="password">Kata Sandi</label>
                <Link href="/lupa-password" className="link-muted">Lupa kata sandi?</Link>
              </div>
              <div className="password-field">
                <input id="password" name="password" type={showPassword ? 'text' : 'password'} placeholder="Masukkan kata sandi" required value={password} onChange={(e) => setPassword(e.target.value)} disabled={isLoading} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className={`password-toggle ${showPassword ? 'is-open' : ''}`} aria-pressed={showPassword} aria-label="Tampilkan kata sandi">
                  <svg className="icon-eye-closed" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M3 3l18 18"></path>
                    <path d="M10.58 10.58a2 2 0 0 0 2.83 2.83"></path>
                    <path d="M16.68 16.67A10.94 10.94 0 0 1 12 18C7 18 3 12 3 12a18.46 18.46 0 0 1 3.17-3.92"></path>
                    <path d="M9.88 5.09A10.94 10.94 0 0 1 12 5c5 0 9 7 9 7a18.47 18.47 0 0 1-1.67 2.68"></path>
                  </svg>
                  <svg className="icon-eye-open" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                </button>
              </div>
            </div>

            {/* Button */}
            <button type="submit" className="btn-login">{isLoading ? 'Sedang masuk...' : 'Masuk'}</button>

          </form>

          {/* Register */}
          <p className="text-sm text-gray-500 mt-6 text-center">
            Belum punya akun?{" "}
            <Link href="/register" className="text-[#0B1F3A] font-medium">
              Daftar
            </Link>
          </p>

        </div>
      </section>
    </main>
  );
}