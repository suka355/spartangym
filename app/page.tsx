"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";

const MARQUEE_ITEMS = [
  "Functional Training", "Olympic Lifting", "Endurance",
  "Recovery", "Personal Coaching", "Nutrition", "Mobility",
];

const CLASSES = [
  { num: "I", name: "Strength", desc: "Progressive overload focused on compound movements. Build absolute strength from the ground up.", time: "60 Min" },
  { num: "II", name: "Conditioning", desc: "High-intensity intervals engineered to maximize cardiovascular output and mental resilience.", time: "45 Min" },
  { num: "III", name: "Mobility", desc: "Active recovery and joint protocols to keep you moving efficiently for decades.", time: "30 Min" },
];

const FALLBACK_PLANS = [
  {
    tier: "starter", name: "Starter", price: "79", isFeatured: false, tag: "Foundation",
    features: ["Full facility access", "2 group classes / week", "Locker room access", "App programming"],
  },
  {
    tier: "elite", name: "Elite", price: "149", isFeatured: true, tag: "Most Popular",
    features: ["Unlimited group classes", "1 PT session / month", "Recovery zone access", "Nutrition tracking", "Priority booking"],
  },
  {
    tier: "apex", name: "Apex", price: "249", isFeatured: false, tag: "Premium",
    features: ["Unlimited everything", "4 PT sessions / month", "Dedicated coach", "Custom programming", "Guest passes ×4", "24/7 VIP support"],
  },
];

const NAV_LINKS = [
  { name: "About", href: "#about" },
  { name: "Classes", href: "#classes" },
  { name: "Membership", href: "#pricing" },
];

export default function HomePage() {
  const [plans, setPlans] = useState<any[]>([]);
  const revealRefs = useRef<HTMLElement[]>([]);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const res = await fetch("/api/plans");
        const json = await res.json();
        if (json.success) setPlans(json.data);
        else setPlans(FALLBACK_PLANS);
      } catch {
        setPlans(FALLBACK_PLANS);
      }
    };
    fetchPlans();
  }, []);

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            const el = e.target as HTMLElement;
            el.style.opacity = "1";
            el.style.transform = "translateY(0)";
            io.unobserve(el);
          }
        }),
      { threshold: 0.1, rootMargin: "-40px" }
    );
    revealRefs.current.forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, [plans]);

  const reveal = (delay = 0) => ({
    ref: (el: HTMLElement | null) => { if (el) revealRefs.current.push(el); },
    style: {
      opacity: 0,
      transform: "translateY(28px)",
      transition: `opacity 0.75s cubic-bezier(0.16,1,0.3,1) ${delay}s, transform 0.75s cubic-bezier(0.16,1,0.3,1) ${delay}s`,
    } as React.CSSProperties,
  });

  const displayPlans = plans.length > 0 ? plans : FALLBACK_PLANS;

  return (
    <div style={{ background: "#0c0c0c", color: "#e8e4de", fontFamily: "'Cabinet Grotesk', sans-serif", overflowX: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Cabinet+Grotesk:wght@300;400;500;700&family=Instrument+Serif:ital@0;1&display=swap');
        :root {
          --bg: #0c0c0c; --surface: #131313; --border: #252525;
          --red: #e03030; --text: #e8e4de; --muted: #6b6460; --dim: #2e2a28;
        }
        html { scroll-behavior: smooth; }
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .sp-nav { position: fixed; top: 0; left: 0; right: 0; z-index: 100; display: flex; justify-content: space-between; align-items: center; padding: 0 2.5rem; height: 60px; border-bottom: 1px solid var(--border); background: rgba(12,12,12,0.85); backdrop-filter: blur(12px); }
        .sp-logo { font-family: 'Bebas Neue', sans-serif; font-size: 1.6rem; letter-spacing: 0.14em; color: var(--text); text-decoration: none; }
        .sp-logo span { color: var(--red); }
        .sp-nav-links { display: flex; list-style: none; align-items: center; gap: 2.5rem; }
        .sp-nav-links a { font-size: 0.72rem; letter-spacing: 0.18em; text-transform: uppercase; text-decoration: none; color: var(--muted); transition: color 0.2s; }
        .sp-nav-links a:hover { color: var(--text); }
        .sp-nav-cta { color: var(--text) !important; border: 1px solid var(--border) !important; padding: 0.5rem 1.2rem; transition: border-color 0.2s, background 0.2s !important; }
        .sp-nav-cta:hover { border-color: var(--red) !important; background: rgba(224,48,48,0.08) !important; }

        .sp-hero { min-height: 100vh; padding-top: 60px; display: grid; grid-template-columns: 55% 45%; }
        .sp-hero-content { display: flex; flex-direction: column; justify-content: center; padding: 6rem 4rem 6rem 4.5rem; }
        .sp-hero-eyebrow { display: flex; align-items: center; gap: 0.8rem; margin-bottom: 2.5rem; opacity: 0; animation: fadeIn 0.8s 0.1s forwards; }
        .sp-hero-eyebrow-line { width: 2rem; height: 1px; background: var(--red); }
        .sp-hero-eyebrow span { font-size: 0.62rem; letter-spacing: 0.28em; text-transform: uppercase; color: var(--red); }
        .sp-hero-h1 { font-family: 'Bebas Neue', sans-serif; font-size: clamp(5.5rem, 10vw, 9rem); line-height: 0.9; letter-spacing: 0.02em; margin-bottom: 2.5rem; opacity: 0; animation: fadeUp 1s 0.25s cubic-bezier(0.16,1,0.3,1) forwards; }
        .sp-hero-h1 .italic { font-family: 'Instrument Serif', serif; font-style: italic; color: transparent; -webkit-text-stroke: 1.5px var(--text); }
        .sp-hero-desc { font-size: 0.88rem; line-height: 1.8; color: var(--muted); max-width: 38ch; margin-bottom: 3.5rem; font-weight: 300; opacity: 0; animation: fadeIn 0.8s 0.5s forwards; }
        .sp-hero-actions { display: flex; gap: 1rem; opacity: 0; animation: fadeIn 0.8s 0.7s forwards; }
        .sp-btn-primary { display: inline-flex; align-items: center; gap: 0.6rem; padding: 0.95rem 2rem; background: var(--red); color: #fff; font-size: 0.72rem; letter-spacing: 0.14em; text-transform: uppercase; text-decoration: none; font-weight: 500; transition: background 0.2s, transform 0.2s; }
        .sp-btn-primary:hover { background: #b82626; transform: translateY(-1px); }
        .sp-btn-secondary { display: inline-flex; align-items: center; gap: 0.6rem; padding: 0.95rem 1.8rem; border: 1px solid var(--border); color: var(--text); font-size: 0.72rem; letter-spacing: 0.14em; text-transform: uppercase; text-decoration: none; transition: border-color 0.2s, background 0.2s; }
        .sp-btn-secondary:hover { border-color: var(--muted); background: var(--surface); }
        .sp-hero-img-col { position: relative; overflow: hidden; }
        .sp-hero-img-col img { width: 100%; height: 100%; object-fit: cover; display: block; filter: brightness(0.4) contrast(1.2); }
        .sp-hero-img-overlay { position: absolute; inset: 0; background: linear-gradient(to right, #0c0c0c 0%, transparent 40%); }
        .sp-hero-stats { position: absolute; bottom: 0; left: 0; right: 0; display: grid; grid-template-columns: repeat(3,1fr); border-top: 1px solid rgba(255,255,255,0.08); background: rgba(12,12,12,0.7); backdrop-filter: blur(8px); }
        .sp-stat { padding: 1.5rem 2rem; border-right: 1px solid rgba(255,255,255,0.06); }
        .sp-stat:last-child { border-right: none; }
        .sp-stat-num { font-family: 'Bebas Neue', sans-serif; font-size: 2.5rem; color: var(--text); line-height: 1; }
        .sp-stat-label { font-size: 0.6rem; letter-spacing: 0.2em; text-transform: uppercase; color: var(--muted); margin-top: 0.3rem; }

        .sp-marquee-wrap { overflow: hidden; border-top: 1px solid var(--border); border-bottom: 1px solid var(--border); padding: 1rem 0; background: var(--surface); }
        .sp-marquee-track { display: flex; white-space: nowrap; animation: marquee 30s linear infinite; }
        .sp-marquee-item { display: inline-flex; align-items: center; gap: 1.2rem; padding: 0 2rem; font-size: 0.62rem; letter-spacing: 0.22em; text-transform: uppercase; color: var(--muted); }
        .sp-marquee-dot { width: 3px; height: 3px; border-radius: 50%; background: var(--red); flex-shrink: 0; display: inline-block; }

        .sp-about { display: grid; grid-template-columns: 1fr 1fr; border-top: 1px solid var(--border); }
        .sp-about-img { position: relative; min-height: 580px; overflow: hidden; }
        .sp-about-img img { width: 100%; height: 100%; object-fit: cover; filter: brightness(0.5) contrast(1.1); transition: filter 0.5s; }
        .sp-about-img:hover img { filter: brightness(0.6) contrast(1.1); }
        .sp-about-overlay-num { position: absolute; bottom: 2.5rem; left: 2.5rem; font-family: 'Bebas Neue', sans-serif; font-size: 6rem; line-height: 1; color: rgba(255,255,255,0.06); pointer-events: none; user-select: none; }
        .sp-about-content { padding: 5rem 4.5rem; display: flex; flex-direction: column; justify-content: center; border-left: 1px solid var(--border); }
        .sp-label { font-size: 0.6rem; letter-spacing: 0.28em; text-transform: uppercase; color: var(--red); margin-bottom: 1.2rem; }
        .sp-section-title { font-family: 'Bebas Neue', sans-serif; font-size: clamp(2.8rem, 5vw, 4.5rem); line-height: 0.95; margin-bottom: 2rem; }
        .sp-section-title em { font-family: 'Instrument Serif', serif; font-style: italic; font-weight: 400; color: var(--muted); display: block; }
        .sp-about-body { font-size: 0.83rem; line-height: 1.85; color: var(--muted); font-weight: 300; max-width: 40ch; margin-bottom: 3rem; }
        .sp-features-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1px; background: var(--border); }
        .sp-feature-card { background: var(--bg); padding: 1.3rem 1.2rem; }
        .sp-feature-num { font-family: 'Bebas Neue', sans-serif; font-size: 1.3rem; color: var(--red); margin-bottom: 0.5rem; }
        .sp-feature-text { font-size: 0.68rem; line-height: 1.65; color: var(--muted); font-weight: 300; }

        .sp-classes { border-top: 1px solid var(--border); }
        .sp-classes-header { display: flex; justify-content: space-between; align-items: center; padding: 3rem 4.5rem; border-bottom: 1px solid var(--border); }
        .sp-classes-h2 { font-family: 'Bebas Neue', sans-serif; font-size: 3.2rem; line-height: 1; }
        .sp-classes-grid { display: grid; grid-template-columns: repeat(3,1fr); }
        .sp-class-card { padding: 3rem 3rem 3.5rem; border-right: 1px solid var(--border); position: relative; overflow: hidden; transition: background 0.3s; }
        .sp-class-card:last-child { border-right: none; }
        .sp-class-card:hover { background: var(--surface); }
        .sp-class-accent { width: 2rem; height: 2px; background: var(--red); margin-bottom: 2.5rem; transition: width 0.3s; }
        .sp-class-card:hover .sp-class-accent { width: 4rem; }
        .sp-class-watermark { position: absolute; top: 2rem; right: 2.5rem; font-family: 'Bebas Neue', sans-serif; font-size: 5rem; color: rgba(255,255,255,0.03); line-height: 1; pointer-events: none; }
        .sp-class-name { font-family: 'Bebas Neue', sans-serif; font-size: 2.5rem; line-height: 1; margin-bottom: 1rem; }
        .sp-class-desc { font-size: 0.75rem; line-height: 1.8; color: var(--muted); font-weight: 300; margin-bottom: 2.5rem; }
        .sp-class-footer { display: flex; justify-content: space-between; align-items: center; }
        .sp-class-time { font-size: 0.6rem; letter-spacing: 0.18em; text-transform: uppercase; color: var(--muted); padding: 0.35rem 0.8rem; border: 1px solid var(--dim); }
        .sp-class-link { font-size: 0.62rem; letter-spacing: 0.14em; text-transform: uppercase; color: var(--red); text-decoration: none; }

        .sp-pricing { border-top: 1px solid var(--border); }
        .sp-pricing-header { padding: 5rem 4.5rem 4rem; text-align: center; border-bottom: 1px solid var(--border); }
        .sp-pricing-h2 { font-family: 'Bebas Neue', sans-serif; font-size: clamp(3rem, 6vw, 5.5rem); line-height: 0.9; margin: 1rem 0 1.5rem; }
        .sp-pricing-sub { font-size: 0.8rem; color: var(--muted); max-width: 42ch; margin: 0 auto; font-weight: 300; line-height: 1.7; }
        .sp-pricing-grid { display: grid; grid-template-columns: repeat(3,1fr); }
        .sp-plan-card { 
          padding: 3.5rem 3rem; 
          border-right: 1px solid var(--border); 
          display: flex; 
          flex-direction: column; 
          position: relative; 
          transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
          background: transparent;
        }
        .sp-plan-card:last-child { border-right: none; }
        .sp-plan-card.featured { background: rgba(20, 20, 20, 0.4); }
        
        .sp-plan-card:hover {
          transform: translateY(-12px);
          background: var(--surface);
          z-index: 10;
          border-color: rgba(224, 48, 48, 0.3);
          box-shadow: 0 30px 60px rgba(0, 0, 0, 0.5), 0 0 20px rgba(224, 48, 48, 0.05);
        }

        .sp-plan-card.featured:hover {
          box-shadow: 0 30px 60px rgba(0, 0, 0, 0.6), 0 0 30px rgba(224, 48, 48, 0.15);
          border-color: var(--red);
        }

        .sp-featured-bar { 
          position: absolute; 
          top: 0; left: 0; right: 0; 
          height: 2px; 
          background: var(--red); 
          transition: height 0.3s ease;
        }
        .sp-plan-card:hover .sp-featured-bar { height: 4px; box-shadow: 0 0 15px var(--red); }

        .sp-plan-tag { font-size: 0.58rem; letter-spacing: 0.25em; text-transform: uppercase; color: var(--red); margin-bottom: 1.5rem; transition: transform 0.3s; }
        .sp-plan-card:hover .sp-plan-tag { transform: translateX(4px); }

        .sp-plan-name { font-family: 'Bebas Neue', sans-serif; font-size: 2rem; margin-bottom: 1.5rem; }
        .sp-plan-price-row { display: flex; align-items: baseline; gap: 0.3rem; margin-bottom: 2.5rem; }
        .sp-plan-price { font-family: 'Bebas Neue', sans-serif; font-size: 4rem; line-height: 1; }
        .sp-plan-period { font-size: 0.7rem; color: var(--muted); letter-spacing: 0.1em; }
        .sp-plan-divider { height: 1px; background: var(--border); margin-bottom: 2rem; }
        .sp-plan-features { list-style: none; flex: 1; margin-bottom: 2.5rem; }
        .sp-plan-features li { font-size: 0.72rem; padding: 0.65rem 0; border-bottom: 1px solid var(--dim); color: var(--muted); display: flex; align-items: center; gap: 0.75rem; font-weight: 300; transition: color 0.3s; }
        .sp-plan-card:hover .sp-plan-features li { color: var(--text); }
        .sp-plan-features li::before { content: ''; width: 4px; height: 4px; border-radius: 50%; background: var(--red); flex-shrink: 0; transition: transform 0.3s; }
        .sp-plan-card:hover .sp-plan-features li::before { transform: scale(1.5); }
        
        .sp-plan-cta { display: block; text-align: center; padding: 1rem; font-size: 0.65rem; letter-spacing: 0.2em; text-transform: uppercase; text-decoration: none; font-weight: 500; border: 1px solid var(--border); color: var(--text); transition: all 0.3s; }
        .sp-plan-cta:hover { background: var(--red); border-color: var(--red); color: #fff; transform: translateY(-2px); box-shadow: 0 10px 20px rgba(224, 48, 48, 0.2); }
        .sp-plan-cta.featured-cta { background: var(--red); border-color: var(--red); color: #fff; }
        .sp-plan-cta.featured-cta:hover { background: #b82626; box-shadow: 0 10px 30px rgba(224, 48, 48, 0.4); }

        .sp-footer { border-top: 1px solid var(--border); background: var(--surface); }
        .sp-footer-grid { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; gap: 4rem; padding: 4rem 4.5rem; border-bottom: 1px solid var(--border); }
        .sp-footer-logo { font-family: 'Bebas Neue', sans-serif; font-size: 1.6rem; letter-spacing: 0.12em; color: var(--text); text-decoration: none; display: block; margin-bottom: 1rem; }
        .sp-footer-logo span { color: var(--red); }
        .sp-footer-desc { font-size: 0.7rem; line-height: 1.8; color: var(--muted); font-weight: 300; }
        .sp-footer-heading { font-size: 0.58rem; letter-spacing: 0.24em; text-transform: uppercase; color: var(--text); margin-bottom: 1.5rem; }
        .sp-footer-links { list-style: none; }
        .sp-footer-links li { margin-bottom: 0.7rem; }
        .sp-footer-links a, .sp-footer-links span { font-size: 0.72rem; color: var(--muted); text-decoration: none; transition: color 0.2s; }
        .sp-footer-links a:hover { color: var(--red); }
        .sp-footer-bottom { padding: 1.5rem 4.5rem; display: flex; justify-content: space-between; align-items: center; }
        .sp-footer-copy { font-size: 0.6rem; color: var(--muted); letter-spacing: 0.1em; }
        .sp-footer-socials { display: flex; gap: 2rem; }
        .sp-footer-socials a { font-size: 0.6rem; letter-spacing: 0.18em; text-transform: uppercase; color: var(--muted); text-decoration: none; transition: color 0.2s; }
        .sp-footer-socials a:hover { color: var(--red); }

        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(36px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-33.33%); } }
      `}</style>

      {/* NAV */}
      <nav className="sp-nav">
        <Link href="/" className="sp-logo">Spartan<span>.</span></Link>
        <ul className="sp-nav-links">
          {NAV_LINKS.map((l) => (
            <li key={l.name}><Link href={l.href}>{l.name}</Link></li>
          ))}
          <li><Link href="/auth/login" className="sp-nav-cta">Sign In</Link></li>
        </ul>
      </nav>

      {/* HERO */}
      <section className="sp-hero">
        <div className="sp-hero-content">
          <div className="sp-hero-eyebrow">
            <div className="sp-hero-eyebrow-line" />
            <span>Premium Training Facility</span>
          </div>
          <h1 className="sp-hero-h1">
            Forge<br />Your<br /><span className="italic">Legacy.</span>
          </h1>
          <p className="sp-hero-desc">
            A sanctuary for those who demand more. Elite equipment, world-class coaching, and a space designed to push your limits.
          </p>
          <div className="sp-hero-actions">
            <Link href="#pricing" className="sp-btn-primary">Join Now &nbsp;→</Link>
            <Link href="#classes" className="sp-btn-secondary">Explore Classes</Link>
          </div>
        </div>
        <div className="sp-hero-img-col">
          <img
            src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1400&auto=format&fit=crop"
            alt="Gym interior"
          />
          <div className="sp-hero-img-overlay" />
          <div className="sp-hero-stats">
            {[
              { num: "5k+", lbl: "Active Members" },
              { num: "24/7", lbl: "Facility Access" },
              { num: "12", lbl: "Elite Trainers" },
            ].map((s) => (
              <div key={s.lbl} className="sp-stat">
                <div className="sp-stat-num">{s.num}</div>
                <div className="sp-stat-label">{s.lbl}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MARQUEE */}
      <div className="sp-marquee-wrap">
        <div className="sp-marquee-track">
          {[0, 1, 2].map((i) => (
            <div key={i} style={{ display: "flex", flexShrink: 0 }}>
              {MARQUEE_ITEMS.map((item) => (
                <div key={item} className="sp-marquee-item">
                  {item}<span className="sp-marquee-dot" />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* ABOUT */}
      <section id="about" className="sp-about">
        <div className="sp-about-img">
          <img
            src="https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=1200&auto=format&fit=crop"
            alt="Training equipment"
          />
          <div className="sp-about-overlay-num">01</div>
        </div>
        <div className="sp-about-content">
          <p className="sp-label" {...reveal()}>Our Philosophy</p>
          <h2 className="sp-section-title" {...reveal(0.1)}>
            Designed for<em>Performance</em>
          </h2>
          <p className="sp-about-body" {...reveal(0.15)}>
            Your environment shapes your output. Spartan is built to remove every distraction and give you the tools for peak execution. No gimmicks. No spectacle. Just iron and intent.
          </p>
          <div className="sp-features-grid" {...reveal(0.2)}>
            {[
              { n: "01", t: "Curated equipment from Rogue and Eleiko." },
              { n: "02", t: "Expert programming for sustainable results." },
              { n: "03", t: "Recovery zone: cold plunges and saunas." },
              { n: "04", t: "Limited capacity. Always uncrowded." },
            ].map((f) => (
              <div key={f.n} className="sp-feature-card">
                <div className="sp-feature-num">{f.n}</div>
                <div className="sp-feature-text">{f.t}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CLASSES */}
      <section id="classes" className="sp-classes">
        <div className="sp-classes-header">
          <div>
            <p className="sp-label">Training</p>
            <h2 className="sp-classes-h2">Small Group Sessions</h2>
          </div>
          <Link href="/classes" className="sp-btn-secondary">View Schedule</Link>
        </div>
        <div className="sp-classes-grid">
          {CLASSES.map((cls, i) => (
            <div key={cls.name} className="sp-class-card" {...reveal(i * 0.1)}>
              <div className="sp-class-watermark">{cls.num}</div>
              <div className="sp-class-accent" />
              <h3 className="sp-class-name">{cls.name}</h3>
              <p className="sp-class-desc">{cls.desc}</p>
              <div className="sp-class-footer">
                <span className="sp-class-time">{cls.time}</span>
                <a href="#" className="sp-class-link">Learn More →</a>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="sp-pricing">
        <div className="sp-pricing-header" {...reveal()}>
          <p className="sp-label">Membership</p>
          <h2 className="sp-pricing-h2">Choose Your Tier</h2>
          <p className="sp-pricing-sub">No hidden fees, no complicated contracts. Pure access to the finest training facility in the city.</p>
        </div>
        <div className="sp-pricing-grid">
          {displayPlans.map((plan: any, i: number) => (
            <div
              key={plan.tier}
              className={`sp-plan-card${plan.isFeatured ? " featured" : ""}`}
              {...reveal(i * 0.1)}
            >
              {plan.isFeatured && <div className="sp-featured-bar" />}
              <div className="sp-plan-tag">{plan.tag ?? (plan.isFeatured ? "Most Popular" : "")}</div>
              <div className="sp-plan-name">{plan.name}</div>
              <div className="sp-plan-price-row">
                <span className="sp-plan-price">${parseFloat(plan.price).toString()}</span>
                <span className="sp-plan-period">/mo</span>
              </div>
              <div className="sp-plan-divider" />
              <ul className="sp-plan-features">
                {(plan.features ?? []).map((f: string) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
              <Link
                href={`/auth/register?plan=${plan.tier.toLowerCase()}`}
                className={`sp-plan-cta${plan.isFeatured ? " featured-cta" : ""}`}
              >
                Select {plan.name}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="sp-footer">
        <div className="sp-footer-grid">
          <div>
            <Link href="/" className="sp-footer-logo">Spartan<span>.</span></Link>
            <p className="sp-footer-desc">Premium training facility built for those who refuse to settle. Elevate your physical standards.</p>
          </div>
          <div>
            <h4 className="sp-footer-heading">Navigate</h4>
            <ul className="sp-footer-links">
              {NAV_LINKS.map((l) => (
                <li key={l.name}><Link href={l.href}>{l.name}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="sp-footer-heading">Contact</h4>
            <ul className="sp-footer-links">
              <li><span>info@spartangym.com</span></li>
              <li><span>+1 (555) 123-4567</span></li>
              <li><span>123 Fitness Ave, NY 10001</span></li>
            </ul>
          </div>
          <div>
            <h4 className="sp-footer-heading">Follow</h4>
            <ul className="sp-footer-links">
              <li><a href="#">Instagram</a></li>
              <li><a href="#">Twitter</a></li>
            </ul>
          </div>
        </div>
        <div className="sp-footer-bottom">
          <p className="sp-footer-copy">© {new Date().getFullYear()} Spartan Gym. All rights reserved.</p>
          <div className="sp-footer-socials">
            <a href="#">Instagram</a>
            <a href="#">Twitter</a>
          </div>
        </div>
      </footer>
    </div>
  );
}