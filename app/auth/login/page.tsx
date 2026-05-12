"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

export default function LoginPage() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<"MEMBER" | "TRAINER" | "ADMIN">("MEMBER");
  const [email, setEmail]         = useState("");
  const [password, setPassword]   = useState("");
  const [showPass, setShowPass]   = useState(false);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Invalid credentials");
        return;
      }

      const role = data.data.user.role;
      if (selectedRole !== role) {
        setError(`This account does not have ${selectedRole.toLowerCase()} access`);
        return;
      }

      localStorage.setItem("spartan_user", JSON.stringify(data.data.user));
      
      const routes = {
        MEMBER: "/member/dashboard",
        TRAINER: "/trainer/dashboard",
        ADMIN: "/admin/dashboard",
      };
      router.push(routes[role as keyof typeof routes]);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Cabinet+Grotesk:wght@300;400;500;700&family=Instrument+Serif:ital@0;1&display=swap');
        :root {
          --bg: #0c0c0c; --surface: #131313; --border: #252525;
          --red: #e03030; --text: #e8e4de; --muted: #6b6460; --dim: #2e2a28;
        }
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: var(--bg); color: var(--text); font-family: 'Cabinet Grotesk', sans-serif; overflow-x: hidden; }

        .sp-nav { position: fixed; top: 0; left: 0; right: 0; z-index: 100; display: flex; justify-content: space-between; align-items: center; padding: 0 2.5rem; height: 60px; border-bottom: 1px solid var(--border); background: rgba(12,12,12,0.85); backdrop-filter: blur(12px); }
        .sp-logo { font-family: 'Bebas Neue', sans-serif; font-size: 1.6rem; letter-spacing: 0.14em; color: var(--text); text-decoration: none; }
        .sp-logo span { color: var(--red); }
        .sp-back-link { font-size: 0.72rem; letter-spacing: 0.18em; text-transform: uppercase; text-decoration: none; color: var(--muted); transition: color 0.2s; display: flex; align-items: center; gap: 0.6rem; }
        .sp-back-link:hover { color: var(--text); }

        .auth-container { min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 4rem 2rem; position: relative; }
        .auth-bg-decor { position: absolute; top: 0; left: 0; width: 100%; height: 100%; overflow: hidden; pointer-events: none; z-index: 0; }
        .auth-bg-line { position: absolute; background: var(--border); }
        
        .auth-card { 
          width: 100%; 
          max-width: 440px; 
          background: var(--surface); 
          border: 1px solid var(--border); 
          padding: 3.5rem 3rem; 
          position: relative; 
          z-index: 1; 
          box-shadow: 0 30px 60px rgba(0,0,0,0.4);
        }
        .auth-accent-bar { position: absolute; top: 0; left: 0; right: 0; height: 2px; background: var(--red); }

        .role-selector { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1px; background: var(--border); margin-bottom: 2.5rem; border: 1px solid var(--border); }
        .role-tab { 
          background: var(--bg); 
          border: none; 
          padding: 0.8rem 0.5rem; 
          font-family: 'Bebas Neue', sans-serif; 
          font-size: 0.9rem; 
          letter-spacing: 0.1em; 
          color: var(--muted); 
          cursor: pointer; 
          transition: all 0.2s; 
        }
        .role-tab.active { background: var(--surface); color: var(--red); }
        
        .auth-header { margin-bottom: 2.5rem; }
        .auth-label { font-size: 0.6rem; letter-spacing: 0.28em; text-transform: uppercase; color: var(--red); margin-bottom: 0.8rem; }
        .auth-title { font-family: 'Bebas Neue', sans-serif; font-size: 3.5rem; line-height: 0.9; margin-bottom: 1rem; }
        .auth-title em { font-family: 'Instrument Serif', serif; font-style: italic; font-weight: 400; color: var(--muted); }
        .auth-subtitle { font-size: 0.8rem; color: var(--muted); font-weight: 300; line-height: 1.6; }

        .form-group { margin-bottom: 1.5rem; }
        .form-label { display: block; font-size: 0.6rem; letter-spacing: 0.2em; text-transform: uppercase; color: var(--muted); margin-bottom: 0.6rem; }
        .input-control { 
          width: 100%; 
          background: var(--bg); 
          border: 1px solid var(--border); 
          padding: 1rem 1.2rem; 
          color: var(--text); 
          font-family: 'Cabinet Grotesk', sans-serif; 
          font-size: 0.9rem; 
          outline: none; 
          transition: border-color 0.2s;
        }
        .input-control:focus { border-color: var(--red); }

        .pass-wrap { position: relative; }
        .pass-toggle { position: absolute; right: 1rem; top: 50%; transform: translateY(-50%); background: none; border: none; color: var(--muted); cursor: pointer; font-size: 0.8rem; }

        .auth-error { 
          background: rgba(224, 48, 48, 0.05); 
          border: 1px solid rgba(224, 48, 48, 0.2); 
          padding: 0.8rem 1rem; 
          color: #ff6b6b; 
          font-size: 0.75rem; 
          margin-bottom: 1.5rem; 
          display: flex; 
          align-items: center; 
          gap: 0.6rem; 
        }

        .auth-btn { 
          width: 100%; 
          padding: 1rem; 
          background: var(--red); 
          color: #fff; 
          border: none; 
          font-family: 'Bebas Neue', sans-serif; 
          font-size: 1.1rem; 
          letter-spacing: 0.1em; 
          cursor: pointer; 
          transition: all 0.2s; 
          display: flex; 
          align-items: center; 
          justify-content: center; 
          gap: 0.8rem;
          margin-top: 1rem;
        }
        .auth-btn:hover:not(:disabled) { background: #b82626; transform: translateY(-1px); }
        .auth-btn:disabled { opacity: 0.6; cursor: not-allowed; }

        .auth-footer { margin-top: 2rem; text-align: center; border-top: 1px solid var(--border); padding-top: 2rem; }
        .auth-footer-text { font-size: 0.75rem; color: var(--muted); font-weight: 300; }
        .auth-link { color: var(--red); text-decoration: none; font-weight: 500; margin-left: 0.4rem; }
        .auth-link:hover { text-decoration: underline; }

        .spinner { width: 16px; height: 16px; border: 2px solid rgba(255,255,255,0.2); border-top-color: #fff; border-radius: 50%; animation: spin 0.8s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      <nav className="sp-nav">
        <Link href="/" className="sp-logo">Spartan<span>.</span></Link>
        <Link href="/" className="sp-back-link">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
          Back to Site
        </Link>
      </nav>

      <div className="auth-container">
        <div className="auth-bg-decor">
          <div className="auth-bg-line" style={{ left: '25%', top: 0, bottom: 0, width: '1px' }} />
          <div className="auth-bg-line" style={{ left: '75%', top: 0, bottom: 0, width: '1px' }} />
          <div className="auth-bg-line" style={{ top: '33%', left: 0, right: 0, height: '1px' }} />
        </div>

        <motion.div 
          className="auth-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <div className="auth-accent-bar" />
          
          <div className="role-selector">
            {(["MEMBER", "TRAINER", "ADMIN"] as const).map((r) => (
              <button
                key={r}
                type="button"
                className={`role-tab ${selectedRole === r ? "active" : ""}`}
                onClick={() => { setSelectedRole(r); setError(""); }}
              >
                {r}
              </button>
            ))}
          </div>

          <div className="auth-header">
            <p className="auth-label">Access Portal</p>
            <h1 className="auth-title">
              {selectedRole === "ADMIN" ? <>Admin<em>Portal</em></> : 
               selectedRole === "TRAINER" ? <>Trainer<em>Hub</em></> : 
               <>Welcome<em>Back</em></>}
            </h1>
            <p className="auth-subtitle">
              {selectedRole === "ADMIN" ? "Restricted access for authorized facility administrators." : 
               selectedRole === "TRAINER" ? "Manage your sessions and athlete performance metrics." : 
               "Enter your credentials to access your Spartan training dashboard."}
            </p>
          </div>

          <AnimatePresence mode="wait">
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="auth-error"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                className="input-control"
                type="email"
                placeholder="athlete@spartangym.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Secure Password</label>
              <div className="pass-wrap">
                <input
                  className="input-control"
                  type={showPass ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="pass-toggle"
                  onClick={() => setShowPass(!showPass)}
                  tabIndex={-1}
                >
                  {showPass ? "HIDE" : "SHOW"}
                </button>
              </div>
            </div>

            <button type="submit" className="auth-btn" disabled={loading}>
              {loading ? <span className="spinner" /> : "Authenticate"}
            </button>
          </form>

          {selectedRole === "MEMBER" && (
            <div className="auth-footer">
              <p className="auth-footer-text">
                New to the facility? 
                <Link href="/auth/register" className="auth-link">Initialize Account</Link>
              </p>
            </div>
          )}
        </motion.div>
      </div>

    </>
  );
}