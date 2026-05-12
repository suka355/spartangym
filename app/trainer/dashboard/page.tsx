"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { OverviewTab, Assignments, SchedulesList, AthleteList } from "./tabs";

const NAV = [
  { id: "overview",  icon: "OVERVIEW" },
  { id: "classes",   icon: "MY CLASSES" },
  { id: "schedules", icon: "SCHEDULES" },
  { id: "members",   icon: "ATHLETES" },
];

export default function TrainerDashboard() {
  const router = useRouter();
  const [user, setUser]       = useState<any>(null);
  const [data, setData]       = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab]         = useState("overview");

  useEffect(() => {
    fetchUserAndData();
  }, []);

  async function fetchUserAndData() {
    try {
      const r = await fetch("/api/trainer/dashboard", { credentials: "include" });
      if (r.status === 401 || r.status === 403) {
        router.push("/auth/login");
        return;
      }
      const d = await r.json();
      if (d.success) {
        setData(d.data);
        setUser({ firstName: d.data.trainer.firstName, lastName: d.data.trainer.lastName, role: "TRAINER" });
      }
    } catch (e) {
      console.error(e);
      router.push("/auth/login");
    } finally {
      setLoading(false);
    }
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    router.push("/");
  }

  const initials = user ? `${user.firstName[0]}${user.lastName[0]}` : "T";

  if (!user && !loading) return null;

  return (
    <div className="shell brutalist-theme">
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
              <div style={{ fontSize: "1rem", fontFamily: "Bebas Neue, sans-serif", letterSpacing: "0.1em" }}>{user?.firstName} {user?.lastName}</div>
              <div style={{ fontSize: "0.75rem", color: "var(--red)", letterSpacing: "0.1em" }}>COACH</div>
            </div>
          </div>
          <button className="sp-btn-secondary" style={{ padding: "0.5rem 1rem", fontSize: "0.7rem" }} onClick={logout}>LOGOUT</button>
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <h1 className="pg-title">{NAV.find(n => n.id === tab)?.icon || "DASHBOARD"}</h1>
          <div style={{ fontSize: "0.85rem", color: "var(--muted)", letterSpacing: "0.1em" }}>{new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }).toUpperCase()}</div>
        </header>

        <div className="content">
          <div className="content-inner">
            {loading ? (
              <div className="stats-grid">
                {[1,2,3,4].map(i => <div key={i} className="stat-card skeleton" style={{ height: "120px" }} />)}
              </div>
            ) : (
              <AnimatePresence mode="wait">
                <motion.div
                  key={tab}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.3 }}
                >
                  {tab === "overview" && <OverviewTab data={data} setTab={setTab} />}
                  {tab === "classes" && <Assignments />}
                  {tab === "schedules" && <SchedulesList refreshOverview={fetchUserAndData} />}
                  {tab === "members" && <AthleteList />}
                </motion.div>
              </AnimatePresence>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
