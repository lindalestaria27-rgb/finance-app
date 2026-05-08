"use client";

import { useState, useEffect } from "react";
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
  
  const [registeredUser, setRegisteredUser] = useState<{
    username: string;
    email: string;
    role: string;
  } | null>(null);

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

      // Set registered user data to show success state
      setRegisteredUser({
        username: data.username || username,
        email: data.email || email,
        role: "Staff"
      });
      
      // Clear form
      setUsername("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
    } catch {
      setError("Gagal mendaftar akun");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoToLogin = () => {
    router.push("/login");
  };

  useEffect(() => {
    document.body.classList.add("register-page");
    return () => {
      document.body.classList.remove("register-page");
    };
  }, []);

  return (
    <main className="login-shell">

      <section className="brand-panel">
        <div className="finance-motion" aria-hidden="true">
          <div className="finance-line-layer"></div>
          <div className="finance-grid-layer"></div>
        </div>

        <div className="brand-copy">
          <h1>Bangun akses yang aman <span>sejak hari pertama.</span></h1>
          <p>
            Daftarkan akun baru untuk mulai mengelola transaksi, laporan periodik,
            dan insight prediksi pendapatan dalam satu sistem.
          </p>
        </div>

        <div className="brand-foot">
          <div className="avatar-stack" aria-hidden="true">
            <span></span><span></span><span></span>
          </div>
          <p>Dipercaya oleh 12.000+ operator institusional.</p>
        </div>
      </section>

      <section className="auth-panel">
        <div className="auth-inner">

          <div className="brand-top auth-brand-top">
            <div className="brand-mark">F</div>
            <div className="brand-name-wrap auth-brand-name-wrap">
              <p className="brand-name auth-brand-name">RENTAL FINANCE CONTROL</p>
              <p className="brand-sub auth-brand-sub">Sistem Manajemen Rental Mobil</p>
            </div>
          </div>

          {!registeredUser && (
            <div className="auth-header">
              <h2>Buat akun</h2>
              <p>Lengkapi formulir untuk membuat akun Anda.</p>
            </div>
          )}

          {/* SUCCESS STATE */}
          {registeredUser && (
            <div>
              <div className="auth-header">
                <h2>Pendaftaran Berhasil!</h2>
                <p className="request-access">Akun Anda berhasil dibuat. Silakan lanjut ke halaman login untuk masuk.</p>
              </div>

              <div style={{ marginTop: 18, marginBottom: 18, display: 'flex', justifyContent: 'center' }} aria-hidden>
                <div style={{ width: 72, height: 72, borderRadius: 999, display: 'grid', placeItems: 'center', background: 'linear-gradient(140deg,#dff4e9,#bde9ce)', color: '#06472a' }}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#06472a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
                </div>
              </div>

              <div>
                <button onClick={handleGoToLogin} className="btn-login" style={{ width: '100%' }}>
                  Lanjut ke Login
                </button>
              </div>

              <div style={{ marginTop: 12 }}>
                <button
                  onClick={() => {
                    setRegisteredUser(null);
                    setError("");
                    setSuccess("");
                  }}
                  className="link-muted"
                >
                  ← Buat akun baru
                </button>
              </div>
            </div>
          )}

          {/* FORM (Hidden when success) */}
          {!registeredUser && (
            <form className="auth-form" onSubmit={handleSubmit}>

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

            <div>
              <label htmlFor="username">Username</label>
              <input id="username" name="username" type="text" placeholder="contoh: akbar.admin" required value={username} onChange={(e) => setUsername(e.target.value)} />
            </div>

            <div>
              <label htmlFor="registerEmail">Email</label>
              <input id="registerEmail" name="registerEmail" type="email" placeholder="contoh: admin@financecontrol.com" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>

            <div>
              <div className="password-row">
                <label htmlFor="password">Kata Sandi</label>
              </div>
              <div className="password-field">
                <input id="password" name="password" type={showPassword ? 'text' : 'password'} placeholder="Minimal 8 karakter" required value={password} onChange={(e) => setPassword(e.target.value)} />
                <button type="button" className={`password-toggle ${showPassword ? 'is-open' : ''}`} aria-pressed={showPassword} onClick={() => setShowPassword(!showPassword)} aria-label="Tampilkan kata sandi">
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

            <div>
              <label htmlFor="confirmPassword">Konfirmasi Kata Sandi</label>
              <div className="password-field">
                <input id="confirmPassword" name="confirmPassword" type={showConfirm ? 'text' : 'password'} placeholder="Masukkan ulang kata sandi" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                <button type="button" className={`password-toggle ${showConfirm ? 'is-open' : ''}`} aria-pressed={showConfirm} onClick={() => setShowConfirm(!showConfirm)} aria-label="Tampilkan kata sandi">
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
            <button type="submit" disabled={isLoading} className="btn-login">
              {isLoading ? "Mendaftar..." : "Buat Akun"}
            </button>
            </form>
          )}

          {/* Login link - Show only when not registered */}
          {!registeredUser && (
            <p className="text-sm text-gray-500 mt-6 text-center">
              Sudah punya akun?{" "}
              <Link href="/login" className="text-[#0B1F3A] font-medium">
                Masuk
              </Link>
            </p>
          )}

        </div>
      </section>
    </main>
  );
}