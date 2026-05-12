"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { OverviewTab, ClassesTab, BookingsTab, ProgressTab, MembershipTab, ProfileTab } from "./tabs";

const NAV = [
  { id: "overview",   icon: "OVERVIEW" },
  { id: "classes",    icon: "CLASSES" },
  { id: "bookings",   icon: "MY BOOKINGS" },
  { id: "progress",   icon: "PROGRESS" },
  { id: "membership", icon: "MEMBERSHIP" },
  { id: "profile",    icon: "PROFILE" },
];

export default function MemberDashboard() {
  const router = useRouter();
  const [user, setUser]       = useState<any>(null);
  const [data, setData]       = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab]         = useState("overview");

  // Plan Change Modal
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [updatingPlan, setUpdatingPlan] = useState(false);
  const [plans, setPlans] = useState<any[]>([]);

  useEffect(() => {
    fetchUserAndData();
    fetchPlans();
  }, []);

  async function fetchUserAndData() {
    setLoading(true);
    try {
      const r = await fetch("/api/dashboard/member", { credentials: "include" });
      if (r.status === 401 || r.status === 403) {
        router.push("/auth/login");
        return;
      }
      const d = await r.json();
      if (d.success) {
        setData(d.data);
        setUser({ ...d.data.member, role: "MEMBER" } || { firstName: "Member", lastName: "", role: "MEMBER" });
      }
    } catch (e) {
      console.error(e);
      router.push("/auth/login");
    } finally {
      setLoading(false);
    }
  }

  async function fetchPlans() {
    try {
      const r = await fetch("/api/plans");
      const d = await r.json();
      if (d.success) setPlans(d.data);
    } catch (e) {
      console.error("Failed to fetch plans:", e);
    }
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    router.push("/");
  }

  async function cancelBooking(id: string) {
    if (!confirm("Cancel this booking?")) return;
    await fetch(`/api/bookings/${id}`, { method: "PATCH", credentials: "include" });
    setData((prev: any) =>
      prev ? { ...prev, upcomingBookings: prev.upcomingBookings.filter((b: any) => b.id !== id) } : prev
    );
  }

  async function changePlan(planId: string) {
    setUpdatingPlan(true);
    try {
      const res = await fetch("/api/payments", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId, method: "CREDIT_CARD" }),
      });
      if (res.ok) {
        await fetchUserAndData();
        setShowPlanModal(false);
      } else {
        const d = await res.json();
        console.error("Plan change failed:", d);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setUpdatingPlan(false);
    }
  }

  const initials = user ? `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}` : "M";

  if (!user && !loading) return null;

  return (
    <div className="shell brutalist-theme">
      {/* OVERLAY for Modals */}
      <AnimatePresence>
        {showPlanModal && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <motion.div 
              className="panel"
              style={{ width: "100%", maxWidth: "700px" }}
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
            >
              <div className="panel-h">
                <h3 className="panel-title">Switch Your Plan</h3>
                <button onClick={() => setShowPlanModal(false)} style={{ background: "none", border: "none", color: "var(--muted)", fontSize: "1.5rem", cursor: "pointer" }}>&times;</button>
              </div>
              <div className="panel-b">
                <p style={{ color: "var(--muted)", marginBottom: "2rem" }}>Choose a new plan that fits your current goals.</p>
                
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}>
                  {plans.length === 0 ? (
                    <div style={{ gridColumn: "1/-1", textAlign: "center", color: "var(--muted)", padding: "2rem" }}>Loading plans...</div>
                  ) : plans.map((p) => {
                    const isCurrent = data?.membership?.name === p.name;
                    return (
                      <div
                        key={p.id}
                        style={{
                          padding: "2rem",
                          border: `2px solid ${isCurrent ? "var(--red)" : "var(--border)"}`,
                          background: isCurrent ? "rgba(224,48,48,0.05)" : "var(--bg)",
                          cursor: isCurrent ? "default" : "pointer",
                          transition: "border-color 0.2s"
                        }}
                        onClick={() => { if (!isCurrent) changePlan(p.id); }}
                      >
                        <div style={{ fontWeight: 700, fontSize: "0.8rem", letterSpacing: "0.1em", color: "var(--muted)", marginBottom: "0.5rem", textTransform: "uppercase" }}>{p.name}</div>
                        <div style={{ fontFamily: "Bebas Neue, sans-serif", fontSize: "2.5rem", lineHeight: 1, color: "var(--text)" }}>${p.price}<span style={{ fontSize: "1rem", color: "var(--muted)" }}>/mo</span></div>
                        <ul style={{ marginTop: "1.5rem", listStyle: "none", padding: 0 }}>
                          {Array.isArray(p.features) && p.features.map((f: string) => (
                            <li key={f} style={{ fontSize: "0.75rem", color: "var(--muted)", marginBottom: "0.5rem", display: "flex", gap: "0.5rem" }}>
                              <span style={{ color: "var(--red)", fontWeight: 700 }}>✓</span> {f}
                            </li>
                          ))}
                        </ul>
                      </div>
                    );
                  })}
                </div>
                
                <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "2rem" }}>
                  <button className="sp-btn-secondary" onClick={() => setShowPlanModal(false)}>CANCEL</button>
                </div>
                
                {updatingPlan && (
                  <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--red)", fontFamily: "Bebas Neue, sans-serif", fontSize: "2rem", letterSpacing: "0.1em" }}>
                    UPDATING...
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <aside className="sidebar">
        <div className="sb-logo">
          <Link href="/">SPARTAN<span>.</span></Link>
        </div>
        <nav className="sb-nav">
          {NAV.map(n => (
            <button 
              key={n.id} 
              className={`sb-item ${tab === n.id ? "active" : ""}`}
              onClick={() => setTab(n.id)}
            >
              {n.icon}
            </button>
          ))}
        </nav>
        <div className="sb-foot">
          <div className="sb-user">
            <div className="avatar">{initials}</div>
            <div>
              <div style={{ fontSize: "1rem", fontFamily: "Bebas Neue, sans-serif", letterSpacing: "0.1em" }}>{user?.firstName}</div>
              <div style={{ fontSize: "0.75rem", color: "var(--red)", letterSpacing: "0.1em" }}>MEMBER</div>
            </div>
          </div>
          <button className="sp-btn-secondary" style={{ padding: "0.5rem 1rem", fontSize: "0.7rem" }} onClick={logout}>LOGOUT</button>
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <h1 className="pg-title">{NAV.find(n => n.id === tab)?.icon || "DASHBOARD"}</h1>
          <div style={{ fontSize: "0.85rem", color: "var(--muted)", letterSpacing: "0.1em", fontWeight: 500 }}>
            {data?.membership ? <span style={{ marginRight: "1rem", padding: "0.3rem 0.8rem", background: "rgba(224,48,48,0.1)", color: "var(--red)", border: "1px solid var(--red)" }}>{data.membership.type} PLAN</span> : null}
            {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }).toUpperCase()}
          </div>
        </header>

        <div className="content">
          <div className="content-inner">
            {loading ? (
              <div className="stats-grid">
                {[1,2,3,4].map(i => <div key={i} className="stat-card skeleton" style={{ height: "140px" }} />)}
              </div>
            ) : (
              <AnimatePresence mode="wait">
                <motion.div
                  key={tab}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                >
                  {tab === "overview" && <OverviewTab data={data} setTab={setTab} />}
                  {tab === "bookings" && <BookingsTab data={data} cancelBooking={cancelBooking} />}
                  {tab === "progress" && <ProgressTab data={data} />}
                  {tab === "membership" && <MembershipTab data={data} setShowPlanModal={setShowPlanModal} />}
                  {tab === "profile" && <ProfileTab user={user} data={data} />}
                  {tab === "classes" && <ClassesTab refreshOverview={fetchUserAndData} />}
                </motion.div>
              </AnimatePresence>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}