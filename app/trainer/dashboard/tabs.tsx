"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ===== Assignments =====
export function Assignments() {
  const [classes, setClasses] = useState<any[]>([]);
  const [allClasses, setAllClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [claiming, setClaiming] = useState<string | null>(null);

  useEffect(() => {
    fetchMyClasses();
  }, []);

  async function fetchMyClasses() {
    setLoading(true);
    try {
      const r = await fetch("/api/trainer/classes", { credentials: "include" });
      const d = await r.json();
      if (d.success) setClasses(d.data);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  }

  async function fetchAllClasses() {
    try {
      const r = await fetch("/api/classes");
      const d = await r.json();
      if (d.success) {
        setAllClasses(d.data.filter((c: any) => !c.trainer));
      }
    } catch (e) { console.error(e); }
  }

  function openClaimModal() {
    setIsModalOpen(true);
    fetchAllClasses();
  }

  async function claimClass(classId: string) {
    setClaiming(classId);
    try {
      const r = await fetch("/api/trainer/classes", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ classId }),
        credentials: "include"
      });
      const d = await r.json();
      if (d.success) {
        setIsModalOpen(false);
        fetchMyClasses();
      } else {
        alert(d.error || "Failed to claim class");
      }
    } catch (e) { alert("Failed to claim class"); } finally { setClaiming(null); }
  }

  return (
    <>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "1.5rem" }}>
        <button className="sp-btn-primary" onClick={openClaimModal}>+ CLAIM A CLASS</button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "1.5rem" }}>
        {loading ? [1,2,3].map(i => <div key={i} className="panel skeleton" style={{ height: "200px" }} />) :
         classes.length ? classes.map(c => (
           <div key={c.id} className="panel" style={{ transition: "transform 0.2s", cursor: "default" }}>
              <div style={{ padding: "2rem" }}>
                <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--red)", textTransform: "uppercase", marginBottom: "0.5rem", letterSpacing: "0.05em" }}>{c.categoryName || "CLASS"}</div>
                <h3 style={{ fontFamily: "Bebas Neue, sans-serif", fontSize: "2.5rem", marginBottom: "1rem", color: "var(--text)", letterSpacing: "0.05em", lineHeight: 1 }}>{c.name}</h3>
                <div style={{ display: "flex", gap: "1.2rem", fontSize: "0.9rem", color: "var(--muted)", fontFamily: "Cabinet Grotesk, sans-serif", fontWeight: 500 }}>
                  <span>⏱ {c.duration} MINS</span>
                  <span>👥 MAX {c.maxCapacity}</span>
                </div>
              </div>
              <div style={{ padding: "1.2rem 2rem", borderTop: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "0.85rem", fontWeight: 600 }}>{c.schedules?.length || 0} SESSIONS</span>
                <span className="m-badge">{c.difficulty}</span>
              </div>
           </div>
         )) : <div style={{ gridColumn: "1 / -1", padding: "4rem", textAlign: "center", color: "var(--muted)" }}>NO CLASSES ASSIGNED TO YOU YET.</div>
        }
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <motion.div 
              className="panel"
              style={{ width: "100%", maxWidth: "500px" }}
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
            >
              <div className="panel-h">
                <h3 className="panel-title">Claim a Class</h3>
                <button onClick={() => setIsModalOpen(false)} style={{ background: "none", border: "none", color: "var(--muted)", fontSize: "1.5rem", cursor: "pointer" }}>&times;</button>
              </div>
              <div className="panel-b" style={{ maxHeight: "400px", overflowY: "auto" }}>
                {allClasses.length > 0 ? (
                  <div className="member-list">
                    {allClasses.map(c => (
                      <div key={c.id} className="member-row">
                        <div className="m-info">
                          <div className="m-name">{c.name}</div>
                          <div className="m-email">{c.duration} mins • {c.difficulty}</div>
                        </div>
                        <button 
                          className="sp-btn-secondary" 
                          onClick={() => claimClass(c.id)}
                          disabled={claiming === c.id}
                        >
                          {claiming === c.id ? "..." : "CLAIM"}
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ textAlign: "center", color: "var(--muted)" }}>
                    There are no unassigned classes available to claim.
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

// ===== AthleteList =====
export function AthleteList() {
  const [athletes, setAthletes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/trainer/athletes", { credentials: "include" })
      .then(r => r.json())
      .then(d => { if (d.success) setAthletes(d.data); })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="panel">
      <div className="panel-h">
        <h2 className="panel-title">My Athletes</h2>
      </div>
      
      {loading ? (
        <div style={{ padding: "2rem" }}>
          {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: "60px", marginBottom: "1rem" }} />)}
        </div>
      ) : athletes.length > 0 ? (
        <table className="brutalist-table">
          <thead>
            <tr>
              <th>Athlete</th>
              <th>Plan Status</th>
              <th>Sessions Attended</th>
              <th>Latest Booking</th>
            </tr>
          </thead>
          <tbody>
            {athletes.map(a => (
              <tr key={a.id}>
                <td>
                  <div style={{ fontWeight: 600, color: "var(--text)" }}>{a.memberProfile?.firstName || "Unknown"} {a.memberProfile?.lastName || ""}</div>
                  <div style={{ fontSize: "0.8rem", color: "var(--muted)" }}>{a.email}</div>
                </td>
                <td>
                  <span className={`m-badge ${a.memberProfile?.membershipStatus === "ACTIVE" ? "ACTIVE" : ""}`}>
                    {a.memberProfile?.plan?.name?.toUpperCase() || "NONE"} • {a.memberProfile?.membershipStatus || "PENDING"}
                  </span>
                </td>
                <td>
                  <div style={{ fontWeight: 600, fontFamily: "Bebas Neue, sans-serif", fontSize: "1.5rem" }}>{a._count?.bookings || 0}</div>
                </td>
                <td>
                  {a.bookings && a.bookings.length > 0 ? (
                    <div>
                      <div style={{ fontSize: "0.85rem", fontWeight: 600 }}>{a.bookings[0].schedule.gymClass.name}</div>
                      <div style={{ fontSize: "0.75rem", color: "var(--muted)", textTransform: "uppercase" }}>
                        {new Date(a.bookings[0].schedule.startsAt).toLocaleDateString()}
                      </div>
                    </div>
                  ) : (
                    <span style={{ color: "var(--muted)" }}>—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div style={{ padding: "4rem", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem" }}>
          <div style={{ fontFamily: "Bebas Neue, sans-serif", fontSize: "3rem", color: "var(--text)", letterSpacing: "0.05em" }}>NO ATHLETES YET</div>
          <p style={{ maxWidth: "400px", color: "var(--muted)" }}>When members book your classes, they will automatically appear here for you to manage.</p>
        </div>
      )}
    </div>
  );
}

// ===== OverviewTab =====
export function OverviewTab({ data, setTab }: { data: any | null, setTab: (t: string) => void }) {
  return (
    <>
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-accent" />
          <div className="stat-val">{data?.stats.assignedClasses || 0}</div>
          <div className="stat-lbl">Classes Taught</div>
        </div>
        <div className="stat-card">
          <div className="stat-accent" />
          <div className="stat-val">{data?.stats.totalActiveBookings || 0}</div>
          <div className="stat-lbl">Active Bookings</div>
        </div>
        <div className="stat-card">
          <div className="stat-accent" />
          <div className="stat-val">{data?.stats.upcomingSchedulesCount || 0}</div>
          <div className="stat-lbl">Sessions This Week</div>
        </div>
        <div className="stat-card">
          <div className="stat-accent" />
          <div className="stat-val">{data?.stats.totalPastClasses || 0}</div>
          <div className="stat-lbl">Total Sessions</div>
        </div>
      </div>

      <div className="dashboard-grid" style={{ gridTemplateColumns: "1fr" }}>
        <div className="panel">
          <div className="panel-h">
            <h2 className="panel-title">Upcoming Schedule</h2>
            <button className="panel-link-btn" onClick={() => setTab("schedules")}>Manage All →</button>
          </div>
          <div className="member-list">
            {data?.upcomingSchedules?.length ? data.upcomingSchedules.map((sc: any) => (
              <div key={sc.id} className="member-row" style={{ padding: "1.5rem" }}>
                <div style={{ width: "60px", textAlign: "center" }}>
                  <div style={{ fontSize: "0.7rem", fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>{new Date(sc.startsAt).toLocaleDateString("en-US", { weekday: "short" })}</div>
                  <div style={{ fontFamily: "Outfit, sans-serif", fontSize: "1.4rem", fontWeight: 700, lineHeight: 1, color: "var(--text)" }}>{new Date(sc.startsAt).getDate()}</div>
                </div>
                <div className="m-info">
                  <div className="m-name">{sc.gymClass.name}</div>
                  <div className="m-email" style={{ display: "flex", gap: "1rem", marginTop: "0.2rem" }}>
                    <span>{sc.gymClass.categoryName}</span>
                    <span>•</span>
                    <span>{sc.gymClass.duration} mins</span>
                  </div>
                </div>
                <div style={{ fontFamily: "Bebas Neue, sans-serif", fontSize: "1.5rem", letterSpacing: "0.1em", color: "var(--red)" }}>
                  {new Date(sc.startsAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                </div>
                <div className="m-badge" style={{ marginLeft: "1.5rem" }}>{sc._count.bookings} Athletes</div>
              </div>
            )) : (
              <div style={{ padding: "4rem", textAlign: "center", color: "var(--muted)" }}>No classes scheduled for the next 7 days.</div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

// ===== SchedulesList =====
export function SchedulesList({ refreshOverview }: { refreshOverview: () => void }) {
  const [schedules, setSchedules] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newSchedule, setNewSchedule] = useState({ classId: "", date: "", time: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
    fetchClasses();
  }, []);

  async function fetchData() {
    setLoading(true);
    try {
      const r = await fetch("/api/trainer/schedules", { credentials: "include" });
      const d = await r.json();
      if (d.success) setSchedules(d.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function fetchClasses() {
    try {
      const r = await fetch("/api/trainer/classes", { credentials: "include" });
      const d = await r.json();
      if (d.success) {
        setClasses(d.data);
        if (d.data.length > 0) {
          setNewSchedule(prev => ({ ...prev, classId: d.data[0].id }));
        }
      }
    } catch (e) {
      console.error(e);
    }
  }

  async function handleCreateSchedule(e: React.FormEvent) {
    e.preventDefault();
    if (!newSchedule.classId || !newSchedule.date || !newSchedule.time) return;
    
    setIsSubmitting(true);
    try {
      const selectedClass = classes.find(c => c.id === newSchedule.classId);
      const duration = selectedClass?.duration || 60;
      
      const startsAt = new Date(`${newSchedule.date}T${newSchedule.time}`);
      const endsAt = new Date(startsAt.getTime() + duration * 60000);

      const res = await fetch("/api/trainer/schedules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          classId: newSchedule.classId,
          startsAt: startsAt.toISOString(),
          endsAt: endsAt.toISOString(),
          isRecurring: false
        })
      });
      
      if (res.ok) {
        setIsModalOpen(false);
        setNewSchedule({ ...newSchedule, date: "", time: "" }); 
        fetchData();
        refreshOverview();
      } else {
        const error = await res.json();
        alert(error.error || "Failed to create schedule");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function toggleStatus(id: string, currentStatus: boolean) {
    try {
      const res = await fetch("/api/trainer/schedules", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, isCancelled: !currentStatus })
      });
      if (res.ok) {
        fetchData();
        refreshOverview();
      }
    } catch (e) {
      console.error(e);
    }
  }

  async function deleteSchedule(id: string) {
    if (!confirm("Are you sure you want to permanently delete this session?")) return;
    try {
      const res = await fetch(`/api/trainer/schedules?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchData();
        refreshOverview();
      }
    } catch (e) {
      console.error(e);
    }
  }

  const now = new Date();
  const upcoming = schedules.filter(s => new Date(s.startsAt) >= now);
  const past = schedules.filter(s => new Date(s.startsAt) < now);

  return (
    <>
      <div className="panel">
        <div className="panel-h">
          <h2 className="panel-title">Manage Roster</h2>
          <button className="sp-btn-primary" onClick={() => setIsModalOpen(true)}>+ NEW SESSION</button>
        </div>
        
        <div style={{ padding: "1rem 2rem", borderBottom: "1px solid var(--border)", fontSize: "0.85rem", fontWeight: 600, color: "var(--red)", fontFamily: "Bebas Neue, sans-serif", letterSpacing: "0.1em" }}>
          UPCOMING SESSIONS
        </div>
        
        <div className="member-list">
          {loading ? <div style={{ padding: "4rem", textAlign: "center", color: "var(--muted)" }}>Loading roster...</div> :
           upcoming.length ? upcoming.map(sc => (
             <div key={sc.id} className="member-row" style={{ padding: "1.5rem", opacity: sc.isCancelled ? 0.5 : 1 }}>
                <div style={{ width: "60px", textAlign: "center" }}>
                  <div style={{ fontSize: "0.7rem", fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>{new Date(sc.startsAt).toLocaleDateString("en-US", { weekday: "short" })}</div>
                  <div style={{ fontFamily: "Outfit, sans-serif", fontSize: "1.4rem", fontWeight: 700, lineHeight: 1 }}>{new Date(sc.startsAt).getDate()}</div>
                </div>
                <div className="m-info">
                  <div className="m-name">
                    {sc.gymClass.name} 
                    {sc.isCancelled && <span className="m-badge" style={{ marginLeft: "1rem", color: "var(--red)", borderColor: "var(--red)" }}>CANCELLED</span>}
                  </div>
                  <div className="m-email" style={{ display: "flex", gap: "1rem", marginTop: "0.2rem" }}>
                    <span>{new Date(sc.startsAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })}</span>
                    <span>•</span>
                    <span style={{ color: "var(--text)" }}>{new Date(sc.startsAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}</span>
                  </div>
                </div>
                <div className="m-badge">{sc._count.bookings} Athletes</div>
                <div style={{ display: "flex", gap: "0.5rem", marginLeft: "1rem" }}>
                  <button className="sp-btn-secondary" onClick={() => toggleStatus(sc.id, sc.isCancelled)} style={{ padding: "0.5rem 1rem", fontSize: "0.7rem" }}>
                    {sc.isCancelled ? "RESTORE" : "CANCEL"}
                  </button>
                  <button className="sp-btn-danger" onClick={() => deleteSchedule(sc.id)} style={{ padding: "0.5rem 1rem", fontSize: "0.7rem" }}>DELETE</button>
                </div>
             </div>
           )) : <div style={{ padding: "4rem", textAlign: "center", color: "var(--muted)" }}>No upcoming sessions.</div>}
        </div>

        {past.length > 0 && (
          <>
            <div style={{ padding: "1rem 2rem", borderBottom: "1px solid var(--border)", borderTop: "1px solid var(--border)", fontSize: "0.85rem", fontWeight: 600, color: "var(--muted)", fontFamily: "Bebas Neue, sans-serif", letterSpacing: "0.1em" }}>
              PAST SESSIONS
            </div>
            <div className="member-list">
              {past.map(sc => (
                <div key={sc.id} className="member-row" style={{ padding: "1.5rem", opacity: 0.6 }}>
                    <div style={{ width: "60px", textAlign: "center" }}>
                      <div style={{ fontSize: "0.7rem", fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>{new Date(sc.startsAt).toLocaleDateString("en-US", { weekday: "short" })}</div>
                      <div style={{ fontFamily: "Outfit, sans-serif", fontSize: "1.4rem", fontWeight: 700, lineHeight: 1 }}>{new Date(sc.startsAt).getDate()}</div>
                    </div>
                    <div className="m-info">
                      <div className="m-name">{sc.gymClass.name}</div>
                      <div className="m-email" style={{ marginTop: "0.2rem" }}>
                        <span>{new Date(sc.startsAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })}</span>
                      </div>
                    </div>
                    <div className="m-badge">{sc._count.bookings} Athletes</div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <motion.div 
              className="panel"
              style={{ width: "100%", maxWidth: "500px" }}
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
            >
              <div className="panel-h">
                <h3 className="panel-title">Schedule a Session</h3>
                <button onClick={() => setIsModalOpen(false)} style={{ background: "none", border: "none", color: "var(--muted)", fontSize: "1.5rem", cursor: "pointer" }}>&times;</button>
              </div>
              <form onSubmit={handleCreateSchedule}>
                <div className="panel-b" style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.5rem", color: "var(--muted)", textTransform: "uppercase" }}>Select Class</label>
                    <select className="brutalist-input" value={newSchedule.classId} onChange={e => setNewSchedule({...newSchedule, classId: e.target.value})} required>
                      {classes.map(c => <option key={c.id} value={c.id}>{c.name} ({c.duration} mins)</option>)}
                    </select>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.5rem", color: "var(--muted)", textTransform: "uppercase" }}>Date</label>
                      <input type="date" className="brutalist-input" value={newSchedule.date} onChange={e => setNewSchedule({...newSchedule, date: e.target.value})} required min={new Date().toISOString().split('T')[0]} />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.5rem", color: "var(--muted)", textTransform: "uppercase" }}>Start Time</label>
                      <input type="time" className="brutalist-input" value={newSchedule.time} onChange={e => setNewSchedule({...newSchedule, time: e.target.value})} required />
                    </div>
                  </div>
                </div>
                <div style={{ padding: "1.5rem 2rem", borderTop: "1px solid var(--border)", display: "flex", justifyContent: "flex-end", gap: "1rem" }}>
                  <button type="button" className="sp-btn-secondary" onClick={() => setIsModalOpen(false)}>CANCEL</button>
                  <button type="submit" className="sp-btn-primary" disabled={isSubmitting}>{isSubmitting ? "CREATING..." : "CREATE SESSION"}</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
