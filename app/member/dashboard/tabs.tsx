"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";

// ===== BookingsTab =====
export function BookingsTab({ data, cancelBooking }: { data: any, cancelBooking: (id: string) => void }) {
  return (
    <div className="panel">
      <div className="panel-h">
        <h2 className="panel-title">Scheduled Sessions</h2>
        <span style={{ fontSize: "0.85rem", color: "var(--muted)", fontWeight: 500, fontFamily: "Bebas Neue, sans-serif", letterSpacing: "0.1em" }}>
          {data?.upcomingBookings?.length ?? 0} TOTAL
        </span>
      </div>
      <div className="member-list">
        {data?.upcomingBookings?.length ? (
          data.upcomingBookings.map((b: any) => (
            <div key={b.id} className="member-row" style={{ padding: "1.5rem" }}>
              <div style={{ width: "60px", textAlign: "center" }}>
                <div style={{ fontSize: "0.7rem", fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>{new Date(b.schedule?.startsAt).toLocaleDateString("en-US", { weekday: "short" })}</div>
                <div style={{ fontFamily: "Outfit, sans-serif", fontSize: "1.4rem", fontWeight: 700, lineHeight: 1, color: "var(--text)" }}>{new Date(b.schedule?.startsAt).getDate()}</div>
              </div>
              <div className="m-info">
                <div className="m-name">{b.schedule?.gymClass?.name}</div>
                <div className="m-email" style={{ display: "flex", gap: "1rem", marginTop: "0.2rem" }}>
                  <span>{b.schedule?.gymClass?.categoryName}</span>
                  <span>•</span>
                  <span>{b.schedule?.gymClass?.trainer?.firstName} {b.schedule?.gymClass?.trainer?.lastName}</span>
                  <span>•</span>
                  <span>{b.schedule?.gymClass?.duration} MIN</span>
                </div>
              </div>
              <div style={{ fontFamily: "Bebas Neue, sans-serif", fontSize: "1.5rem", letterSpacing: "0.1em", color: "var(--red)" }}>
                {new Date(b.schedule?.startsAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
              </div>
              <button className="sp-btn-danger" style={{ marginLeft: "1.5rem", padding: "0.5rem 1rem", fontSize: "0.7rem" }} onClick={() => cancelBooking(b.id)}>CANCEL</button>
            </div>
          ))
        ) : (
          <div style={{ padding: "4rem", textAlign: "center", color: "var(--muted)", display: "flex", flexDirection: "column", gap: "1rem", alignItems: "center" }}>
            <div style={{ fontFamily: "Bebas Neue, sans-serif", fontSize: "3rem", color: "var(--text)", letterSpacing: "0.05em" }}>NO BOOKINGS YET</div>
            <p>Your schedule is completely empty. Hit the gym and book a class!</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ===== ClassesTab =====
export function ClassesTab({ refreshOverview }: { refreshOverview: () => void }) {
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookingStatus, setBookingStatus] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchClasses();
  }, []);

  async function fetchClasses() {
    try {
      const res = await fetch("/api/classes");
      const json = await res.json();
      if (json.success) setClasses(json.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function bookClass(scheduleId: string) {
    setBookingStatus(prev => ({ ...prev, [scheduleId]: "loading" }));
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scheduleId }),
        credentials: "include"
      });
      const json = await res.json();
      if (json.success) {
        setBookingStatus(prev => ({ ...prev, [scheduleId]: "success" }));
        refreshOverview();
        setTimeout(() => setBookingStatus(prev => ({ ...prev, [scheduleId]: "" })), 3000);
      } else {
        alert(json.error || "Failed to book class");
        setBookingStatus(prev => ({ ...prev, [scheduleId]: "" }));
      }
    } catch (e) {
      alert("Failed to book class");
      setBookingStatus(prev => ({ ...prev, [scheduleId]: "" }));
    }
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))", gap: "2rem" }}>
      {loading ? (
        [1,2,3].map(i => <div key={i} className="panel skeleton" style={{ height: "200px" }} />)
      ) : classes.length ? (
        classes.map(c => (
          <div key={c.id} className="panel">
            <div style={{ padding: "2rem" }}>
              <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--red)", textTransform: "uppercase", marginBottom: "0.5rem", letterSpacing: "0.05em" }}>{c.categoryName}</div>
              <h3 style={{ fontFamily: "Bebas Neue, sans-serif", fontSize: "2.5rem", marginBottom: "0.5rem", letterSpacing: "0.05em", color: "var(--text)" }}>{c.name}</h3>
              <div style={{ display: "flex", gap: "1.2rem", fontSize: "0.9rem", color: "var(--muted)", fontWeight: 500 }}>
                <span>⏱ {c.duration} MINS</span>
                <span>👤 {c.trainer ? `${c.trainer.firstName} ${c.trainer.lastName}` : "NO TRAINER"}</span>
              </div>
            </div>
            
            <div style={{ padding: "1.5rem", borderTop: "1px solid var(--border)", background: "var(--bg)" }}>
              <h4 style={{ fontSize: "0.85rem", color: "var(--muted)", marginBottom: "1rem", fontWeight: 600, fontFamily: "Bebas Neue, sans-serif", letterSpacing: "0.1em" }}>UPCOMING SESSIONS</h4>
              {c.schedules && c.schedules.length > 0 ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.8rem" }}>
                  {c.schedules.map((sc: any) => (
                    <div key={sc.id} style={{ padding: "1rem", background: "var(--surface)", border: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: "0.95rem", textTransform: "uppercase" }}>{new Date(sc.startsAt).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}</div>
                        <div style={{ color: "var(--red)", fontFamily: "Bebas Neue, sans-serif", fontSize: "1.2rem", marginTop: "0.2rem" }}>{new Date(sc.startsAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}</div>
                        <div style={{ color: "var(--muted)", fontSize: "0.7rem", marginTop: "0.2rem", letterSpacing: "0.05em" }}>{sc._count.bookings} / {c.maxCapacity} BOOKED</div>
                      </div>
                      <button 
                        onClick={() => bookClass(sc.id)}
                        disabled={bookingStatus[sc.id] === "loading" || bookingStatus[sc.id] === "success" || sc._count.bookings >= c.maxCapacity}
                        className={bookingStatus[sc.id] === "success" ? "sp-btn-secondary" : "sp-btn-primary"}
                        style={{ padding: "0.6rem 1rem", fontSize: "0.75rem", opacity: (sc._count.bookings >= c.maxCapacity && bookingStatus[sc.id] !== "success") ? 0.5 : 1 }}
                      >
                        {bookingStatus[sc.id] === "loading" ? "..." : bookingStatus[sc.id] === "success" ? "BOOKED ✓" : sc._count.bookings >= c.maxCapacity ? "FULL" : "BOOK"}
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ fontSize: "0.85rem", color: "var(--muted)", textAlign: "center", padding: "1rem" }}>No upcoming sessions.</div>
              )}
            </div>
          </div>
        ))
      ) : (
        <div style={{ gridColumn: "1 / -1", padding: "4rem", textAlign: "center", color: "var(--muted)" }}>No classes available at the moment.</div>
      )}
    </div>
  );
}

// ===== MembershipTab =====
export function MembershipTab({ data, setShowPlanModal }: { data: any, setShowPlanModal: (v: boolean) => void }) {
  const planColor: Record<string, string> = {
    BASIC: "var(--muted)", STANDARD: "var(--red)", PREMIUM: "#c9a84c",
  };

  return (
    <>
      {data?.membership ? (
        <>
          <div style={{ padding: "3rem", background: "var(--surface)", border: "1px solid var(--border)", position: "relative", overflow: "hidden", marginBottom: "2rem" }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", position: "relative", zIndex: 2 }}>
              <div>
                <div style={{ fontFamily: "Bebas Neue, sans-serif", fontSize: "4rem", lineHeight: 1, marginBottom: "0.5rem", color: planColor[data.membership.type] || "var(--text)", letterSpacing: "0.05em" }}>
                  {data.membership.type} PLAN
                </div>
                <div style={{ fontSize: "0.95rem", color: "var(--muted)", fontFamily: "Cabinet Grotesk, sans-serif", fontWeight: 500, letterSpacing: "0.05em" }}>
                  VALID UNTIL{" "}
                  <span style={{ color: data.daysUntilExpiry !== null && data.daysUntilExpiry < 7 ? "var(--red)" : "var(--text)" }}>
                    {new Date(data.membership.endDate).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }).toUpperCase()}
                  </span>
                  {data.daysUntilExpiry !== null && ` · ${data.daysUntilExpiry} DAYS REMAINING`}
                </div>
              </div>
              <div className="m-badge ACTIVE">ACTIVE</div>
            </div>
            <div className="break-bar" style={{ marginTop: "2rem", height: "6px", background: "var(--bg)", position: "relative", zIndex: 2 }}>
              <motion.div
                className="break-fill"
                style={{ background: "var(--red)" }}
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, Math.max(0, 100 - ((data.daysUntilExpiry ?? 0) / 30) * 100))}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
            </div>
          </div>

          <div className="panel">
            <div className="panel-h">
              <h2 className="panel-title">Plan Details</h2>
              <button className="sp-btn-secondary" style={{ padding: "0.4rem 1rem", fontSize: "0.75rem" }} onClick={() => setShowPlanModal(true)}>
                CHANGE PLAN
              </button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1px", background: "var(--border)" }}>
              {[
                { lbl: "Plan Type",     val: data.membership.type   },
                { lbl: "Plan Name",     val: data.membership.name || "—" },
                { lbl: "Monthly Price", val: `$${data.membership.price}/MO` },
                { lbl: "Status",        val: data.membership.status },
                { lbl: "Expires",       val: new Date(data.membership.endDate).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }).toUpperCase() },
              ].map((r) => (
                <div key={r.lbl} style={{ padding: "1.5rem", background: "var(--bg)" }}>
                  <div style={{ fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--muted)", marginBottom: "0.5rem" }}>{r.lbl}</div>
                  <div style={{ fontFamily: "Bebas Neue, sans-serif", fontSize: "1.5rem", color: "var(--text)", letterSpacing: "0.05em" }}>{r.val}</div>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        <div className="panel">
          <div style={{ padding: "4rem", textAlign: "center", display: "flex", flexDirection: "column", gap: "1rem", alignItems: "center" }}>
            <div style={{ fontFamily: "Bebas Neue, sans-serif", fontSize: "3rem", color: "var(--text)", letterSpacing: "0.05em" }}>NO MEMBERSHIP</div>
            <div style={{ color: "var(--muted)" }}>You don't have an active membership plan.</div>
            <button className="sp-btn-primary" style={{ marginTop: "1rem" }} onClick={() => setShowPlanModal(true)}>VIEW MEMBERSHIP PLANS</button>
          </div>
        </div>
      )}
    </>
  );
}

// ===== OverviewTab =====
export function OverviewTab({ data, setTab }: { data: any | null, setTab: (t: string) => void }) {
  return (
    <>
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-accent" />
          <div className="stat-val">{data?.upcomingBookings?.length ?? 0}</div>
          <div className="stat-lbl">Upcoming Classes</div>
        </div>
        <div className="stat-card">
          <div className="stat-accent" />
          <div className="stat-val">{data?.totalClassesAttended ?? 0}</div>
          <div className="stat-lbl">Classes Attended</div>
        </div>
        <div className="stat-card">
          <div className="stat-accent" />
          <div className="stat-val">{data?.daysUntilExpiry ?? "—"}</div>
          <div className="stat-lbl">Days Left on Plan</div>
        </div>
        <div className="stat-card">
          <div className="stat-accent" />
          <div className="stat-val">{data?.totalPastClasses ?? 0}</div>
          <div className="stat-lbl">Total Classes</div>
        </div>
      </div>

      <div className="dashboard-grid">
        {/* Upcoming bookings */}
        <div className="panel">
          <div className="panel-h">
            <h2 className="panel-title">Upcoming Classes</h2>
            <button className="panel-link-btn" onClick={() => setTab("bookings")}>SEE ALL</button>
          </div>
          <div className="member-list">
            {data?.upcomingBookings?.length ? (
              data.upcomingBookings.slice(0, 4).map((b: any) => (
                <div key={b.id} className="member-row">
                  <div className="m-avatar" style={{ border: "1px solid var(--border)", color: "var(--red)" }}>C</div>
                  <div className="m-info">
                    <div className="m-name">{b.schedule?.gymClass?.name}</div>
                    <div className="m-email">
                      WITH {b.schedule?.gymClass?.trainer?.firstName?.toUpperCase()} · {b.schedule?.gymClass?.duration} MIN
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: "0.8rem", color: "var(--muted)", fontWeight: 500 }}>{new Date(b.schedule?.startsAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</div>
                    <div style={{ fontFamily: "Bebas Neue, sans-serif", fontSize: "1.2rem", color: "var(--red)" }}>{new Date(b.schedule?.startsAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}</div>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ padding: "4rem", textAlign: "center", color: "var(--muted)" }}>
                NO UPCOMING CLASSES BOOKED. TIME TO GET TO WORK.
              </div>
            )}
          </div>
        </div>

        {/* Quick actions */}
        <div className="panel" style={{ height: "fit-content" }}>
          <div className="panel-h"><h2 className="panel-title">Quick Links</h2></div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "1px", background: "var(--border)" }}>
            {[
              { icon: "📅", lbl: "My Bookings",  sub: "View & cancel",    go: "bookings"   },
              { icon: "📊", lbl: "Progress",     sub: "Track your gains", go: "progress"   },
              { icon: "💳", lbl: "Membership",   sub: "Plan & billing",   go: "membership" },
              { icon: "👤", lbl: "Profile",      sub: "Your info",        go: "profile"    },
            ].map((a) => (
              <button key={a.lbl} onClick={() => setTab(a.go)} style={{ background: "var(--surface)", border: "none", padding: "1.5rem", display: "flex", alignItems: "center", gap: "1rem", cursor: "pointer", textAlign: "left", transition: "background 0.2s" }} onMouseEnter={(e) => e.currentTarget.style.background = "var(--bg)"} onMouseLeave={(e) => e.currentTarget.style.background = "var(--surface)"}>
                <span style={{ fontSize: "1.5rem" }}>{a.icon}</span>
                <div>
                  <div style={{ fontFamily: "Bebas Neue, sans-serif", fontSize: "1.2rem", letterSpacing: "0.05em", color: "var(--text)" }}>{a.lbl}</div>
                  <div style={{ fontSize: "0.75rem", color: "var(--muted)", textTransform: "uppercase" }}>{a.sub}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Progress snapshot */}
      {data?.latestProgress && (
        <div className="panel" style={{ marginTop: "2rem" }}>
          <div className="panel-h">
            <h2 className="panel-title">Latest Measurements</h2>
            <button className="panel-link-btn" onClick={() => setTab("progress")}>VIEW DETAILS</button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1px", background: "var(--border)" }}>
            <div style={{ background: "var(--surface)", padding: "2rem 1.5rem", textAlign: "center" }}>
              <div style={{ fontFamily: "Bebas Neue, sans-serif", fontSize: "3rem", color: "var(--text)", lineHeight: 1 }}>{data.latestProgress.weight}<span style={{ fontSize: "1rem", color: "var(--muted)", marginLeft: "0.2rem" }}>kg</span></div>
              <div style={{ fontSize: "0.8rem", fontWeight: 600, textTransform: "uppercase", color: "var(--muted)", marginTop: "0.5rem", letterSpacing: "0.05em" }}>Body Weight</div>
            </div>
            <div style={{ background: "var(--surface)", padding: "2rem 1.5rem", textAlign: "center" }}>
              <div style={{ fontFamily: "Bebas Neue, sans-serif", fontSize: "3rem", color: "var(--text)", lineHeight: 1 }}>{data.latestProgress.bodyFat}<span style={{ fontSize: "1rem", color: "var(--muted)", marginLeft: "0.2rem" }}>%</span></div>
              <div style={{ fontSize: "0.8rem", fontWeight: 600, textTransform: "uppercase", color: "var(--muted)", marginTop: "0.5rem", letterSpacing: "0.05em" }}>Body Fat</div>
            </div>
            <div style={{ background: "var(--surface)", padding: "2rem 1.5rem", textAlign: "center" }}>
              <div style={{ fontFamily: "Bebas Neue, sans-serif", fontSize: "3rem", color: "var(--text)", lineHeight: 1 }}>{data.latestProgress.muscleMass}<span style={{ fontSize: "1rem", color: "var(--muted)", marginLeft: "0.2rem" }}>kg</span></div>
              <div style={{ fontSize: "0.8rem", fontWeight: 600, textTransform: "uppercase", color: "var(--muted)", marginTop: "0.5rem", letterSpacing: "0.05em" }}>Muscle Mass</div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ===== ProfileTab =====
export function ProfileTab({ user, data }: { user: any, data: any }) {
  return (
    <div className="panel">
      <div className="panel-h">
        <h2 className="panel-title">Personal Information</h2>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1px", background: "var(--border)" }}>
        {[
          { lbl: "First Name",   val: data?.member?.firstName || user?.firstName },
          { lbl: "Last Name",    val: data?.member?.lastName  || user?.lastName  },
          { lbl: "Email",        val: data?.member?.email     || user?.email     },
          { lbl: "Role",         val: "MEMBER" },
          { lbl: "Member Since", val: data?.member?.joinedAt  ? new Date(data.member.joinedAt).toLocaleDateString("en-US", { month: "long", year: "numeric" }).toUpperCase() : "—" },
        ].map((r) => (
          <div key={r.lbl} style={{ padding: "1.5rem", background: "var(--bg)" }}>
            <div style={{ fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--muted)", marginBottom: "0.5rem" }}>{r.lbl}</div>
            <div style={{ fontFamily: "Bebas Neue, sans-serif", fontSize: "1.5rem", color: "var(--text)", letterSpacing: "0.05em", wordBreak: "break-all" }}>{r.val ?? "—"}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ===== ProgressTab =====
export function ProgressTab({ data }: { data: any }) {
  return (
    <>
      {data?.latestProgress ? (
        <>
          <div className="panel" style={{ marginBottom: "2rem" }}>
            <div className="panel-h">
              <h2 className="panel-title">Current Stats</h2>
              <span style={{ fontSize: "0.85rem", color: "var(--muted)", fontFamily: "Bebas Neue, sans-serif", letterSpacing: "0.1em" }}>
                RECORDED: {new Date(data.latestProgress.recordedAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }).toUpperCase()}
              </span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1px", background: "var(--border)" }}>
              <div style={{ background: "var(--surface)", padding: "3rem 1.5rem", textAlign: "center" }}>
                <div style={{ fontFamily: "Bebas Neue, sans-serif", fontSize: "4rem", color: "var(--text)", lineHeight: 1 }}>{data.latestProgress.weight}<span style={{ fontSize: "1rem", color: "var(--muted)", marginLeft: "0.2rem" }}>kg</span></div>
                <div style={{ fontSize: "0.8rem", fontWeight: 600, textTransform: "uppercase", color: "var(--muted)", marginTop: "0.5rem", letterSpacing: "0.05em" }}>Body Weight</div>
              </div>
              <div style={{ background: "var(--surface)", padding: "3rem 1.5rem", textAlign: "center" }}>
                <div style={{ fontFamily: "Bebas Neue, sans-serif", fontSize: "4rem", color: "var(--text)", lineHeight: 1 }}>{data.latestProgress.bodyFat}<span style={{ fontSize: "1rem", color: "var(--muted)", marginLeft: "0.2rem" }}>%</span></div>
                <div style={{ fontSize: "0.8rem", fontWeight: 600, textTransform: "uppercase", color: "var(--muted)", marginTop: "0.5rem", letterSpacing: "0.05em" }}>Body Fat</div>
              </div>
              <div style={{ background: "var(--surface)", padding: "3rem 1.5rem", textAlign: "center" }}>
                <div style={{ fontFamily: "Bebas Neue, sans-serif", fontSize: "4rem", color: "var(--text)", lineHeight: 1 }}>{data.latestProgress.muscleMass}<span style={{ fontSize: "1rem", color: "var(--muted)", marginLeft: "0.2rem" }}>kg</span></div>
                <div style={{ fontSize: "0.8rem", fontWeight: 600, textTransform: "uppercase", color: "var(--muted)", marginTop: "0.5rem", letterSpacing: "0.05em" }}>Muscle Mass</div>
              </div>
            </div>
          </div>
          
          <div className="panel">
            <div className="panel-h"><h2 className="panel-title">Attendance Heat</h2></div>
            <div className="panel-b">
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem" }}>
                <span style={{ fontSize: "0.95rem", color: "var(--muted)", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em" }}>TOTAL SESSIONS COMPLETED</span>
                <span style={{ fontFamily: "Bebas Neue, sans-serif", fontSize: "2.5rem", color: "var(--red)", fontWeight: 700, lineHeight: 1 }}>
                  {data?.totalClassesAttended ?? 0}
                </span>
              </div>
              <div className="break-bar" style={{ height: "8px", background: "var(--bg)" }}>
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, (data?.totalClassesAttended ?? 0) * 5)}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="break-fill" 
                  style={{ background: "var(--red)" }}
                />
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="panel">
          <div style={{ padding: "4rem", textAlign: "center", display: "flex", flexDirection: "column", gap: "1rem", alignItems: "center" }}>
            <div style={{ fontFamily: "Bebas Neue, sans-serif", fontSize: "3rem", color: "var(--text)", letterSpacing: "0.05em" }}>NO DATA YET</div>
            <div style={{ color: "var(--muted)", maxWidth: "400px" }}>No progress recorded yet. Step on the InBody scanner at the front desk to get your first reading!</div>
          </div>
        </div>
      )}
    </>
  );
}
