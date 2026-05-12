"use client";
import { useState, useEffect } from "react";
import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0c0c0c', color: '#e8e4de' }}>
        Loading registration portal...
      </div>
    }>
      <RegisterForm />
    </Suspense>
  );
}

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [step, setStep]               = useState(1);
  const [firstName, setFirstName]     = useState("");
  const [lastName, setLastName]       = useState("");
  const [email, setEmail]             = useState("");
  const [phone, setPhone]             = useState("");
  const [password, setPassword]       = useState("");
  const [confirm, setConfirm]         = useState("");
  const [showPass, setShowPass]       = useState(false);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState("");
  const [agreed, setAgreed]           = useState(false);
  
  const [plan, setPlan]               = useState<string | null>(null);

  useEffect(() => {
    const p = searchParams.get("plan");
    if (p) setPlan(p.toUpperCase());
  }, [searchParams]);

  const passwordStrength = (() => {
    if (!password) return 0;
    let score = 0;
    if (password.length >= 8)  score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    return score;
  })();

  const strengthLabel = ["", "Weak", "Fair", "Good", "Strong"][passwordStrength];
  const strengthColor = ["", "#ef4444", "#f59e0b", "#3b82f6", "#22c55e"][passwordStrength];

  function nextStep(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!firstName || !lastName || !email) {
      setError("Please fill in all required fields.");
      return;
    }
    setStep(2);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password.length < 8) { setError("Password must be at least 8 characters"); return; }
    if (password !== confirm) { setError("Passwords do not match"); return; }
    if (!agreed) { setError("Please accept the terms to continue"); return; }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ 
          firstName, 
          lastName, 
          email, 
          phone, 
          password,
          membershipType: plan 
        }),
      });

      const data = await res.json();
      if (!res.ok) { setError(data.error || "Registration failed"); return; }

      localStorage.setItem("spartan_user", JSON.stringify({
        id: data.data.id,
        firstName: data.data.firstName,
        lastName: data.data.lastName,
        email: data.data.email,
        role: data.data.role
      }));
      router.push("/member/dashboard");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const slideVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, x: -20, transition: { duration: 0.2 } }
  };

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

        .auth-container { min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 6rem 2rem; position: relative; }
        .auth-bg-decor { position: absolute; top: 0; left: 0; width: 100%; height: 100%; overflow: hidden; pointer-events: none; z-index: 0; }
        .auth-bg-line { position: absolute; background: var(--border); }
        
        .auth-card { 
          width: 100%; 
          max-width: 500px; 
          background: var(--surface); 
          border: 1px solid var(--border); 
          padding: 3.5rem 3rem; 
          position: relative; 
          z-index: 1; 
          box-shadow: 0 30px 60px rgba(0,0,0,0.4);
        }
        .auth-accent-bar { position: absolute; top: 0; left: 0; right: 0; height: 2px; background: var(--red); }

        .auth-steps { display: flex; align-items: center; justify-content: center; gap: 1.5rem; margin-bottom: 2.5rem; }
        .step-pill { font-family: 'Bebas Neue', sans-serif; font-size: 0.8rem; letter-spacing: 0.1em; color: var(--muted); display: flex; align-items: center; gap: 0.6rem; }
        .step-pill.active { color: var(--text); }
        .step-pill.done { color: var(--red); }
        .step-num { width: 20px; height: 20px; border: 1px solid var(--border); display: flex; align-items: center; justify-content: center; font-size: 0.7rem; border-radius: 2px; }
        .step-pill.active .step-num { border-color: var(--red); color: var(--red); }
        .step-pill.done .step-num { background: var(--red); border-color: var(--red); color: #fff; }
        .step-divider { width: 30px; height: 1px; background: var(--border); }

        .auth-header { margin-bottom: 2.5rem; text-align: center; }
        .auth-label { font-size: 0.6rem; letter-spacing: 0.28em; text-transform: uppercase; color: var(--red); margin-bottom: 0.8rem; }
        .auth-title { font-family: 'Bebas Neue', sans-serif; font-size: 3rem; line-height: 0.9; margin-bottom: 1rem; }
        .auth-subtitle { font-size: 0.8rem; color: var(--muted); font-weight: 300; line-height: 1.6; max-width: 35ch; margin: 0 auto; }
        
        .plan-badge { display: inline-block; padding: 0.3rem 0.8rem; border: 1px solid var(--red); color: var(--red); font-size: 0.55rem; letter-spacing: 0.2em; text-transform: uppercase; margin-top: 1rem; }

        .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }
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

        .strength-wrap { margin-top: 0.6rem; }
        .strength-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 4px; }
        .strength-bar { height: 2px; background: var(--dim); transition: background 0.3s; }

        .checkbox-group { display: flex; align-items: flex-start; gap: 1rem; margin: 2rem 0; cursor: pointer; }
        .custom-check { width: 18px; height: 18px; border: 1px solid var(--border); background: var(--bg); flex-shrink: 0; position: relative; transition: all 0.2s; margin-top: 2px; }
        .checkbox-group:hover .custom-check { border-color: var(--muted); }
        .custom-check.checked { background: var(--red); border-color: var(--red); }
        .custom-check.checked::after { content: ''; position: absolute; top: 4px; left: 7px; width: 4px; height: 8px; border: solid white; border-width: 0 2px 2px 0; transform: rotate(45deg); }
        .check-text { font-size: 0.75rem; color: var(--muted); line-height: 1.6; }
        .check-text a { color: var(--text); text-decoration: none; border-bottom: 1px solid var(--dim); }

        .auth-error { background: rgba(224, 48, 48, 0.05); border: 1px solid rgba(224, 48, 48, 0.2); padding: 0.8rem 1rem; color: #ff6b6b; font-size: 0.75rem; margin-bottom: 1.5rem; display: flex; align-items: center; gap: 0.6rem; }

        .btn-stack { display: flex; gap: 1rem; margin-top: 1.5rem; }
        .auth-btn { 
          flex: 1;
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
        }
        .auth-btn:hover:not(:disabled) { background: #b82626; transform: translateY(-1px); }
        .auth-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .secondary-btn { background: transparent; border: 1px solid var(--border); color: var(--text); flex: 0.4; }
        .secondary-btn:hover { background: var(--bg); border-color: var(--muted); }

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
          <div className="auth-bg-line" style={{ left: '20%', top: 0, bottom: 0, width: '1px' }} />
          <div className="auth-bg-line" style={{ left: '80%', top: 0, bottom: 0, width: '1px' }} />
          <div className="auth-bg-line" style={{ top: '40%', left: 0, right: 0, height: '1px' }} />
        </div>

        <motion.div 
          className="auth-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="auth-accent-bar" />

          <div className="auth-steps">
            <div className={`step-pill ${step === 1 ? "active" : "done"}`}>
              <div className="step-num">{step > 1 ? "✓" : "01"}</div>
              <span>Profile</span>
            </div>
            <div className={`step-divider ${step > 1 ? "done" : ""}`} />
            <div className={`step-pill ${step === 2 ? "active" : ""}`}>
              <div className="step-num">02</div>
              <span>Security</span>
            </div>
          </div>

          <div className="auth-header">
            <p className="auth-label">Initialization</p>
            <h1 className="auth-title">Forge Your Account</h1>
            <p className="auth-subtitle">
              {step === 1 ? "Provide your physical details to synchronize with our facility systems." : 
               "Secure your athlete profile with high-entropy credentials."}
            </p>
            {plan && <div className="plan-badge">Plan: {plan}</div>}
          </div>

          <AnimatePresence mode="wait">
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="auth-error"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.form 
                key="step1"
                variants={slideVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                onSubmit={nextStep}
              >
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">First Name</label>
                    <input className="input-control" placeholder="Ares" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Last Name</label>
                    <input className="input-control" placeholder="Spartan" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input className="input-control" type="email" placeholder="athlete@spartangym.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Contact Number</label>
                  <input className="input-control" type="tel" placeholder="+1 (555) 000-0000" value={phone} onChange={(e) => setPhone(e.target.value)} />
                </div>
                
                <button type="submit" className="auth-btn">
                  Next Protocol &nbsp; →
                </button>
              </motion.form>
            ) : (
              <motion.form 
                key="step2"
                variants={slideVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                onSubmit={handleSubmit}
              >
                <div className="form-group">
                  <label className="form-label">Athlete Password</label>
                  <div className="pass-wrap">
                    <input
                      className="input-control"
                      type={showPass ? "text" : "password"}
                      placeholder="Min. 8 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <button type="button" className="pass-toggle" onClick={() => setShowPass(!showPass)} tabIndex={-1}>
                      {showPass ? "HIDE" : "SHOW"}
                    </button>
                  </div>
                  {password && (
                    <div className="strength-wrap">
                      <div className="strength-grid">
                        {[1, 2, 3, 4].map((i) => (
                          <div
                            key={i}
                            className="strength-bar"
                            style={{ background: i <= passwordStrength ? strengthColor : undefined }}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">Verify Password</label>
                  <input
                    className="input-control"
                    type="password"
                    placeholder="Repeat password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    required
                    style={{ borderColor: confirm && confirm !== password ? "#ef4444" : undefined }}
                  />
                </div>

                <div className="checkbox-group" onClick={() => setAgreed(!agreed)}>
                  <div className={`custom-check ${agreed ? "checked" : ""}`} />
                  <div className="check-text">
                    I acknowledge the <a href="#">Service Terms</a> and understand the <a href="#">Risk Protocols</a> associated with elite training.
                  </div>
                </div>

                <div className="btn-stack">
                  <button type="button" className="auth-btn secondary-btn" onClick={() => { setStep(1); setError(""); }}>
                    Back
                  </button>
                  <button type="submit" className="auth-btn" disabled={loading}>
                    {loading ? <span className="spinner" /> : "Confirm Registration"}
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>

          <div className="auth-footer">
            <p className="auth-footer-text">
              Already synchronized? 
              <Link href="/auth/login" className="auth-link">Secure Sign In</Link>
            </p>
          </div>
        </motion.div>
      </div>
    </>
  );
}