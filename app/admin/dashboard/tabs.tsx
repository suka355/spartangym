"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ===== ClassesTab =====
export function ClassesTab() {
  const [classes, setClasses] = useState<any[]>([]);
  const [trainers, setTrainers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newClass, setNewClass] = useState({ name: "", duration: 60, maxCapacity: 20, difficulty: "BEGINNER", trainerId: "" });

  useEffect(() => { 
    fetchClasses(); 
    fetchTrainers();
  }, []);

  async function fetchClasses() {
    try {
      const res = await fetch("/api/classes");
      const json = await res.json();
      if (json.success) setClasses(json.data);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  }

  async function fetchTrainers() {
    try {
      const res = await fetch("/api/trainers", { credentials: "include" });
      const json = await res.json();
      if (json.success) setTrainers(json.data);
    } catch (e) { console.error(e); }
  }

  async function createClass() {
    if (!newClass.name.trim()) { alert("Class name is required"); return; }
    if (!newClass.trainerId) { alert("Please select a trainer"); return; }
    
    try {
      const res = await fetch("/api/classes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(newClass)
      });
      const json = await res.json();
      if (json.success) {
        setClasses([...classes, json.data]);
        setNewClass({ name: "", duration: 60, maxCapacity: 20, difficulty: "BEGINNER", trainerId: "" });
      } else {
        alert(json.error || "Failed to create class");
      }
    } catch (e) { alert("Failed to create class"); }
  }

  async function deleteClass(id: string) {
    if (!confirm("Are you sure you want to delete this class? This will also remove all associated schedules and bookings.")) return;
    try {
      const res = await fetch(`/api/classes?id=${id}`, { method: "DELETE", credentials: "include" });
      const json = await res.json();
      if (json.success) {
        setClasses(prev => prev.filter(c => c.id !== id));
      } else {
        alert(json.error || "Failed to delete class");
      }
    } catch (e) {
      alert("Failed to delete class");
    }
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
      <div className="dashboard-grid">
        <div className="panel" style={{ height: "fit-content" }}>
          <div className="panel-h">
            <h2 className="panel-title">Create New Class</h2>
          </div>
          <div className="panel-b" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <input placeholder="CLASS NAME" value={newClass.name} onChange={e => setNewClass({...newClass, name: e.target.value})} className="brutalist-input" />
            <input type="number" placeholder="DURATION (MINS)" value={newClass.duration} onChange={e => setNewClass({...newClass, duration: parseInt(e.target.value)})} className="brutalist-input" />
            <input type="number" placeholder="MAX CAPACITY" value={newClass.maxCapacity} onChange={e => setNewClass({...newClass, maxCapacity: parseInt(e.target.value)})} className="brutalist-input" />
            <select value={newClass.difficulty} onChange={e => setNewClass({...newClass, difficulty: e.target.value})} className="brutalist-input">
              <option value="BEGINNER">BEGINNER</option>
              <option value="INTERMEDIATE">INTERMEDIATE</option>
              <option value="ADVANCED">ADVANCED</option>
            </select>
            <select value={newClass.trainerId} onChange={e => setNewClass({...newClass, trainerId: e.target.value})} className="brutalist-input">
              <option value="">SELECT TRAINER...</option>
              {trainers.map(t => (
                <option key={t.id} value={t.id}>{t.firstName} {t.lastName}</option>
              ))}
            </select>
            <button onClick={createClass} className="sp-btn-primary" style={{ marginTop: "1rem", width: "100%", justifyContent: "center" }}>CREATE CLASS</button>
          </div>
        </div>

        <div className="panel">
          <div className="panel-h">
            <h2 className="panel-title">Active Classes</h2>
          </div>
          <div className="panel-b" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {loading ? <p style={{ color: "var(--muted)" }}>LOADING...</p> : classes.map(c => (
              <div key={c.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1.5rem", background: "var(--bg)", border: "1px solid var(--border)" }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: "1.8rem", fontFamily: "Bebas Neue, sans-serif", letterSpacing: "0.05em", color: "var(--red)", lineHeight: 1 }}>{c.name}</div>
                  <div style={{ fontSize: "0.85rem", color: "var(--muted)", marginTop: "0.5rem" }}>{c.duration} MINS • CAPACITY: {c.maxCapacity}</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                  <div style={{ fontSize: "0.75rem", padding: "0.3rem 0.8rem", border: "1px solid var(--border)", color: "var(--muted)", fontFamily: "Bebas Neue, sans-serif", letterSpacing: "0.1em" }}>
                    {c.difficulty}
                  </div>
                  <button 
                    onClick={() => deleteClass(c.id)}
                    className="sp-btn-danger"
                    style={{ padding: "0.5rem 1rem", fontSize: "0.7rem" }}
                  >
                    DELETE
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ===== MembersTab =====
export function MembersTab() {
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchMembers();
  }, [search]);

  async function fetchMembers() {
    try {
      const res = await fetch(`/api/members?search=${search}`, { credentials: "include" });
      const data = await res.json();
      if (data.success) setMembers(data.data.members);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function deleteMember(id: string) {
    if (!confirm("Are you sure you want to delete this member?")) return;
    await fetch(`/api/members/${id}`, { method: "DELETE", credentials: "include" });
    setMembers(prev => prev.filter(m => m.id !== id));
  }

  const planNames: Record<string, string> = {
    BASIC: "Starter", STANDARD: "Elite", PREMIUM: "Apex",
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
      <div style={{ marginBottom: "2rem" }}>
        <input 
          placeholder="SEARCH MEMBERS..." 
          className="brutalist-input"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <div className="panel">
        <table className="brutalist-table">
          <thead>
            <tr>
              <th>Member</th>
              <th>Plan</th>
              <th>Status</th>
              <th>Expiry</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence>
              {loading ? (
                <tr><td colSpan={5} style={{ padding: "3rem", textAlign: "center", color: "var(--muted)" }}>LOADING...</td></tr>
              ) : members.length === 0 ? (
                <tr><td colSpan={5} style={{ padding: "3rem", textAlign: "center", color: "var(--muted)" }}>NO MEMBERS FOUND.</td></tr>
              ) : members.map((m, i) => (
                <motion.tr 
                  key={m.id} 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ delay: i * 0.05 }}
                  whileHover={{ backgroundColor: "var(--surface)" }}
                >
                  <td>
                    <div style={{ fontWeight: 600 }}>{m.firstName} {m.lastName}</div>
                    <div style={{ fontSize: "0.8rem", color: "var(--muted)" }}>{m.email}</div>
                  </td>
                  <td style={{ fontSize: "0.9rem" }}>{planNames[m.membershipType] || m.membershipType || "NONE"}</td>
                  <td>
                    <span className={`m-badge ${m.membershipStatus}`}>
                      {m.membershipStatus}
                    </span>
                  </td>
                  <td style={{ fontSize: "0.85rem", color: "var(--muted)" }}>
                    {m.membershipEndDate ? new Date(m.membershipEndDate).toLocaleDateString() : "—"}
                  </td>
                  <td>
                    <button onClick={() => deleteMember(m.id)} className="sp-btn-danger" style={{ padding: "0.5rem 1rem", fontSize: "0.7rem" }}>
                      DELETE
                    </button>
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}

// ===== OverviewTab =====
export function OverviewTab({ setActiveTab }: { setActiveTab: (t: string) => void }) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const res = await fetch("/api/dashboard/admin", { credentials: "include" });
      const json = await res.json();
      if (json.success) setData(json.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="stats-grid">
        {[1,2,3,4].map(i => <div key={i} className="stat-card skeleton" style={{ height: "140px" }} />)}
      </div>
    );
  }

  if (!data) return null;

  return (
    <>
      <div className="stats-grid">
        {[
          { lbl: "Total Members", val: data.stats.totalMembers, trend: `${data.stats.memberGrowth} from last month`, isUp: !data.stats.memberGrowth.startsWith("-") },
          { lbl: "Monthly Revenue", val: `$${data.stats.revenueThisMonth.toLocaleString()}`, trend: `${data.stats.revenueGrowth} growth`, isUp: !data.stats.revenueGrowth.startsWith("-") },
          { lbl: "Active Members", val: data.stats.activeMembers, trend: `${((data.stats.activeMembers / data.stats.totalMembers) * 100).toFixed(0)}% retention`, isUp: true, customStyle: { color: "var(--red)" } },
          { lbl: "Classes Booked", val: data.stats.totalBookingsThisMonth, trend: `${data.stats.upcomingClasses} upcoming sessions`, isUp: true, customStyle: { color: "var(--text)" } },
        ].map((stat, i) => (
          <motion.div 
            key={stat.lbl} 
            className="stat-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1, duration: 0.4 }}
          >
            <div className="stat-lbl">{stat.lbl}</div>
            <div className="stat-val">{stat.val}</div>
            <div className="stat-trend" style={stat.customStyle || (stat.isUp ? { color: "var(--text)" } : { color: "var(--muted)" })}>
              {stat.trend}
            </div>
            <div className="stat-accent" />
          </motion.div>
        ))}
      </div>

      <div className="dashboard-grid">
        <motion.section 
          className="panel"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
        >
          <div className="panel-h">
            <h2 className="panel-title">Recent Registrations</h2>
            <button 
              onClick={() => setActiveTab("members")} 
              className="panel-link-btn"
            >
              View All Members →
            </button>
          </div>
          <div className="panel-b">
            <div className="member-list">
              {data.recentMembers.map((m: any) => (
                <div key={m.id} className="member-row">
                  <div className="m-avatar">{m.firstName[0]}{m.lastName[0]}</div>
                  <div className="m-info">
                    <div className="m-name">{m.firstName} {m.lastName}</div>
                    <div className="m-email">{m.email}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: "0.85rem", fontWeight: 600, fontFamily: "Bebas Neue, sans-serif", letterSpacing: "0.1em" }}>{m.membershipType || "NONE"}</div>
                    <div className={`m-badge ${m.membershipStatus}`}>{m.membershipStatus}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.section>

        <motion.section 
          className="panel"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4, duration: 0.4 }}
        >
          <div className="panel-h">
            <h2 className="panel-title">Membership Breakdown</h2>
          </div>
          <div className="panel-b">
            <div className="breakdown-list">
              {["BASIC", "STANDARD", "PREMIUM"].map((type, i) => {
                const count = data.membershipBreakdown.find((b: any) => b.membershipType === type)?._count.membershipType || 0;
                const percent = data.stats.activeMembers ? (count / data.stats.activeMembers) * 100 : 0;
                const colors = ["var(--muted)", "var(--text)", "var(--red)"];
                const names = ["Starter", "Elite", "Apex"];
                return (
                  <div key={type} className="break-item">
                    <div className="break-h">
                      <span>{names[i]}</span>
                      <span>{count} ({percent.toFixed(0)}%)</span>
                    </div>
                    <div className="break-bar">
                      <motion.div 
                        className="break-fill" 
                        style={{ background: colors[i] }}
                        initial={{ width: 0 }}
                        animate={{ width: `${percent}%` }}
                        transition={{ duration: 1, delay: 0.6 + i * 0.1, ease: "easeOut" }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.section>
      </div>
    </>
  );
}

// ===== PlansTab =====
export function PlansTab() {
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchPlans(); }, []);

  async function fetchPlans() {
    try {
      const res = await fetch("/api/plans");
      const json = await res.json();
      if (json.success) setPlans(json.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function savePlan(plan: any) {
    try {
      const res = await fetch("/api/plans", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ id: plan.id, price: parseFloat(plan.price), description: plan.description })
      });
      const json = await res.json();
      if (json.success) {
        alert("PLAN UPDATED SUCCESSFULLY");
      } else {
        alert(json.error || "Failed to update plan");
      }
    } catch (e) {
      alert("Failed to update plan");
    }
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
      <h2 style={{ fontSize: "2rem", marginBottom: "1.5rem", fontFamily: "Bebas Neue, sans-serif", letterSpacing: "0.1em" }}>Manage Pricing Plans</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1.5rem" }}>
        {loading ? <p style={{ color: "var(--muted)" }}>LOADING PLANS...</p> : plans.map((plan) => (
          <div key={plan.id} className="panel" style={{ padding: "2rem" }}>
            <h3 style={{ fontSize: "2.5rem", color: "var(--red)", marginBottom: "1.5rem", fontFamily: "Bebas Neue, sans-serif", letterSpacing: "0.05em", lineHeight: 1 }}>{plan.name}</h3>
            
            <div style={{ marginBottom: "1.5rem" }}>
              <label style={{ display: "block", fontSize: "0.8rem", color: "var(--muted)", marginBottom: "0.5rem", fontFamily: "Bebas Neue, sans-serif", letterSpacing: "0.1em" }}>MONTHLY PRICE ($)</label>
              <input 
                type="number" 
                value={plan.price} 
                onChange={(e) => setPlans(prev => prev.map(p => p.id === plan.id ? { ...p, price: e.target.value } : p))}
                className="brutalist-input"
              />
            </div>

            <div style={{ marginBottom: "2rem" }}>
              <label style={{ display: "block", fontSize: "0.8rem", color: "var(--muted)", marginBottom: "0.5rem", fontFamily: "Bebas Neue, sans-serif", letterSpacing: "0.1em" }}>DESCRIPTION</label>
              <textarea 
                value={plan.description} 
                onChange={(e) => setPlans(prev => prev.map(p => p.id === plan.id ? { ...p, description: e.target.value } : p))}
                className="brutalist-input"
                style={{ minHeight: "80px" }}
              />
            </div>

            <button 
              onClick={() => savePlan(plan)}
              className="sp-btn-primary"
              style={{ width: "100%", justifyContent: "center" }}
            >
              SAVE CHANGES
            </button>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

// ===== TrainersTab =====
export function TrainersTab() {
  const [trainers, setTrainers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTrainer, setNewTrainer] = useState({ firstName: "", lastName: "", email: "", password: "", specialties: "", bio: "" });

  useEffect(() => { fetchTrainers(); }, []);

  async function fetchTrainers() {
    try {
      const res = await fetch("/api/trainers", { credentials: "include" });
      const json = await res.json();
      if (json.success) setTrainers(json.data);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  }

  async function createTrainer() {
    if (!newTrainer.firstName || !newTrainer.lastName || !newTrainer.email || !newTrainer.password) {
      alert("Required fields missing"); return;
    }
    try {
      const res = await fetch("/api/trainers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ ...newTrainer, specialties: newTrainer.specialties.split(",").map(s => s.trim()).filter(Boolean) })
      });
      const json = await res.json();
      if (json.success) {
        setNewTrainer({ firstName: "", lastName: "", email: "", password: "", specialties: "", bio: "" });
        fetchTrainers(); 
      } else {
        alert(json.error || "Failed to create trainer");
      }
    } catch (e) { alert("Failed to create trainer"); }
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
      <div className="dashboard-grid">
        <div className="panel" style={{ height: "fit-content" }}>
          <div className="panel-h">
            <h2 className="panel-title">Register Trainer</h2>
          </div>
          <div className="panel-b" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <input placeholder="FIRST NAME" value={newTrainer.firstName} onChange={e => setNewTrainer({...newTrainer, firstName: e.target.value})} className="brutalist-input" />
              <input placeholder="LAST NAME" value={newTrainer.lastName} onChange={e => setNewTrainer({...newTrainer, lastName: e.target.value})} className="brutalist-input" />
            </div>
            <input placeholder="EMAIL" type="email" value={newTrainer.email} onChange={e => setNewTrainer({...newTrainer, email: e.target.value})} className="brutalist-input" />
            <input placeholder="PASSWORD" type="password" value={newTrainer.password} onChange={e => setNewTrainer({...newTrainer, password: e.target.value})} className="brutalist-input" />
            <input placeholder="SPECIALTIES (COMMA SEPARATED)" value={newTrainer.specialties} onChange={e => setNewTrainer({...newTrainer, specialties: e.target.value})} className="brutalist-input" />
            <textarea placeholder="BIO" value={newTrainer.bio} onChange={e => setNewTrainer({...newTrainer, bio: e.target.value})} className="brutalist-input" style={{ minHeight: "80px" }} />
            <button onClick={createTrainer} className="sp-btn-primary" style={{ marginTop: "1rem", width: "100%", justifyContent: "center" }}>CREATE TRAINER</button>
          </div>
        </div>

        <div className="panel">
          <div className="panel-h">
            <h2 className="panel-title">Active Trainers</h2>
          </div>
          <div className="panel-b" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "1rem" }}>
            {loading ? <p style={{ color: "var(--muted)" }}>LOADING...</p> : trainers.map(t => (
              <div key={t.id} className="member-row" style={{ flexDirection: "column", alignItems: "flex-start", gap: "0.8rem", padding: "1.5rem" }}>
                <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                  <div className="m-avatar" style={{ background: "var(--text)", color: "var(--bg)" }}>{t.firstName[0]}{t.lastName[0]}</div>
                  <div>
                    <div className="m-name">{t.firstName} {t.lastName}</div>
                    <div className="m-email">{t.email}</div>
                  </div>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
                  {t.specialties?.map((s: string) => (
                    <span key={s} style={{ fontSize: "0.65rem", padding: "0.2rem 0.6rem", border: "1px solid var(--border)", color: "var(--muted)", textTransform: "uppercase" }}>{s}</span>
                  ))}
                </div>
                <div style={{ fontSize: "0.75rem", color: "var(--red)", fontWeight: 600, fontFamily: "Bebas Neue, sans-serif", letterSpacing: "0.1em" }}>
                  TEACHING {t._count?.classes || 0} CLASSES
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
