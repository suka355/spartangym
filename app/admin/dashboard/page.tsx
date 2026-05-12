"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { OverviewTab, MembersTab, TrainersTab, ClassesTab, PlansTab } from "./tabs";

const NAV = [
  { id: "overview",  icon: "OVERVIEW" },
  { id: "members",   icon: "MEMBERS" },
  { id: "classes",   icon: "CLASSES" },
  { id: "trainers",  icon: "TRAINERS" },
  { id: "schedules", icon: "SCHEDULES" },
  { id: "plans",     icon: "PLANS" },
];

export default function AdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    // Basic unencrypted cookie parsing or API check to get session
    // Since we don't have a reliable client-side cookie parser for HttpOnly
    // we should really fetch /api/auth/me or rely on the initial load.
    // For now, we'll try to extract the user from local storage or do a simple check.
    // Since I refactored to cookies, I need a simple API call to check auth status.
    fetchUser();
  }, []);

  async function fetchUser() {
    try {
      // In the absence of a /api/auth/me, we can hit a protected route to see if we're admin
      const res = await fetch("/api/dashboard/admin");
      if (res.status === 401 || res.status === 403) {
        router.push("/auth/login");
      } else {
        // Just setting a dummy user to let the UI render since the API works
        setUser({ firstName: "Admin", lastName: "User", role: "ADMIN" });
      }
    } catch {
      router.push("/auth/login");
    }
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    router.push("/");
  }

  const initials = user ? `${user.firstName[0]}${user.lastName[0]}` : "A";

  if (!user) return null;

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
              onClick={() => setActiveTab(n.id)} 
              className={`sb-item ${activeTab === n.id ? "active" : ""}`}
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
              <div style={{ fontSize: "0.75rem", color: "var(--red)", letterSpacing: "0.1em" }}>ADMINISTRATOR</div>
            </div>
          </div>
          <button className="sp-btn-secondary" style={{ padding: "0.5rem 1rem", fontSize: "0.7rem" }} onClick={logout}>LOGOUT</button>
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <h1 className="pg-title">{NAV.find(n => n.id === activeTab)?.icon || "DASHBOARD"}</h1>
          <div style={{ fontSize: "0.85rem", color: "var(--muted)", letterSpacing: "0.1em" }}>{new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }).toUpperCase()}</div>
        </header>

        <div className="content">
          <div className="content-inner">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
              >
                {activeTab === "overview" && <OverviewTab setActiveTab={setActiveTab} />}
                {activeTab === "members" && <MembersTab />}
                {activeTab === "trainers" && <TrainersTab />}
                {activeTab === "plans" && <PlansTab />}
                {activeTab === "classes" && <ClassesTab />}
                {["schedules", "payments"].includes(activeTab) && (
                  <div style={{ padding: "4rem", textAlign: "center", border: "1px dashed var(--border)", background: "var(--surface)" }}>
                    <h2 style={{ fontFamily: "Bebas Neue, sans-serif", fontSize: "3rem", color: "var(--text)", marginBottom: "0.5rem", letterSpacing: "0.05em" }}>COMING SOON</h2>
                    <p style={{ color: "var(--muted)" }}>THIS SECTION IS CURRENTLY UNDER DEVELOPMENT.</p>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </main>
    </div>
  );
}
