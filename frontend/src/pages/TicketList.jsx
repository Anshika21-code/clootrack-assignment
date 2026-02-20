import { useEffect, useState } from "react";
import axios from "axios";
import "../App.css";

const API_BASE = "http://127.0.0.1:8000/api";

const PRIORITY_COLORS = {
  low:      "#6b6b80",
  medium:   "#43e97b",
  high:     "#f9a825",
  critical: "#ff6584",
};

const CATEGORY_COLORS = {
  billing:   "#f9a825",
  technical: "#6c63ff",
  account:   "#43e97b",
  general:   "#ff6584",
};

export default function TicketList() {
  // ─── State ──────────────────────────────────────────────
  const [tickets, setTickets]               = useState([]);
  const [stats, setStats]                   = useState(null);
  const [title, setTitle]                   = useState("");
  const [description, setDescription]       = useState("");
  const [category, setCategory]             = useState("general");
  const [priority, setPriority]             = useState("low");
  const [status, setStatus]                 = useState("open");
  const [loadingClassify, setLoadingClassify] = useState(false);
  const [loadingCreate, setLoadingCreate]   = useState(false);
  const [lastClassifiedDesc, setLastClassifiedDesc] = useState("");


  // ─── API Calls ───────────────────────────────────────────
  const fetchTickets = async () => {
    try {
      const res = await axios.get(`${API_BASE}/tickets/`);
      setTickets(res.data);
    } catch (err) {
      console.error("Error fetching tickets:", err);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await axios.get(`${API_BASE}/tickets/stats/`);
      setStats(res.data);
    } catch (err) {
      console.error("Error fetching stats:", err);
    }
  };

  const createTicket = async (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      alert("Title and Description are required!");
      return;
    }
    try {
      setLoadingCreate(true);
      await axios.post(`${API_BASE}/tickets/`, { title, description, category, priority, status });
      setTitle("");
      setDescription("");
      setCategory("general");
      setPriority("low");
      setStatus("open");
      setLastClassifiedDesc("");
      await fetchTickets();
      await fetchStats();
    } catch (err) {
      console.error("Error creating ticket:", err);
    } finally {
      setLoadingCreate(false);
    }
  };

  const handleAutoClassify = async () => {
    const cleanDesc = description.trim();
  
    if (!cleanDesc) return;
  
    // Prevent duplicate API calls for same description
    if (cleanDesc === lastClassifiedDesc) return;
  
    try {
      setLoadingClassify(true);
  
      const res = await axios.post(
        `${API_BASE}/tickets/classify/`,
        { description: cleanDesc }
      );
  
      if (res.data?.suggested_category) {
        setCategory(res.data.suggested_category);
      }
  
      if (res.data?.suggested_priority) {
        setPriority(res.data.suggested_priority);
      }
  
      // Save last classified description
      setLastClassifiedDesc(cleanDesc);
  
    } catch (err) {
      console.error("Auto classify error:", err);
    } finally {
      setLoadingClassify(false);
    }
  };
  

  useEffect(() => {
    fetchTickets();
    fetchStats();
  }, []);

  // ─── Derived values for bar widths ───────────────────────
  const maxPriority = stats
    ? Math.max(...stats.priority_breakdown.map((p) => p.count), 1)
    : 1;

  const maxCategory = stats
    ? Math.max(...stats.category_breakdown.map((c) => c.count), 1)
    : 1;

  // ─── Render ──────────────────────────────────────────────
  return (
    <div className="dashboard">

      {/* ── TOPBAR ── */}
      <header className="topbar">
        <div className="topbar-left">
          <div className="logo-mark">🎫</div>
          <div>
            <h1>Support Tickets</h1>
            <p>AI-powered classification &amp; management</p>
          </div>
        </div>
        <span className="topbar-badge">LLM POWERED</span>
      </header>

      <main className="main">

        {/* ── STATS ROW ── */}
        <div className="stats-row">
          <div className="stat-card">
            <p className="stat-label">Total Tickets</p>
            <p className="stat-value">{stats ? stats.total_tickets : "—"}</p>
          </div>
          <div className="stat-card">
            <p className="stat-label">Open Tickets</p>
            <p className="stat-value">{stats ? stats.open_tickets : "—"}</p>
          </div>
          <div className="stat-card">
            <p className="stat-label">Avg / Day</p>
            <p className="stat-value">{stats ? stats.avg_tickets_per_day : "—"}</p>
          </div>
        </div>

        {/* ── CONTENT GRID ── */}
        <div className="content-grid">

          {/* ── FORM CARD ── */}
          <div className="form-card">
            <div className="card-header">
              <h2>New Ticket</h2>
              <span>Fill in details below</span>
            </div>
            <div className="form-body">
              <form onSubmit={createTicket}>

                <div className="field">
                  <label>Title</label>
                  <input
                    placeholder="e.g. Cannot login after password reset"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>

                <div className="field">
                  <label>Description</label>
                  <textarea
                    placeholder="Explain the issue clearly…"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    onBlur={handleAutoClassify}
                    required
                  />

                </div>

                <div className="two-col">
                  <div className="field">
                    <label>Category</label>
                    <div className="select-wrapper">
                      <select value={category} onChange={(e) => setCategory(e.target.value)}>
                        <option value="billing">Billing</option>
                        <option value="technical">Technical</option>
                        <option value="account">Account</option>
                        <option value="general">General</option>
                      </select>
                    </div>
                  </div>

                  <div className="field">
                    <label>Priority</label>
                    <div className="select-wrapper">
                      <select value={priority} onChange={(e) => setPriority(e.target.value)}>
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="critical">Critical</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="field">
                  <label>Status</label>
                  <div className="select-wrapper">
                    <select value={status} onChange={(e) => setStatus(e.target.value)}>
                      <option value="open">Open</option>
                      <option value="in_progress">In Progress</option>
                      <option value="closed">Closed</option>
                    </select>
                  </div>
                </div>

                <div className="btn-row">
                  <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={handleAutoClassify}
                    disabled={loadingClassify}
                  >
                    {loadingClassify
                      ? <><span className="spinner" />Classifying…</>
                      : "✦ Auto Classify"}
                  </button>

                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={loadingCreate}
                  >
                    {loadingCreate
                      ? <><span className="spinner" />Creating…</>
                      : "Create Ticket"}
                  </button>
                </div>

              </form>
            </div>
          </div>

          {/* ── RIGHT COLUMN ── */}
          <div className="right-col">

            {/* ── BREAKDOWNS ── */}
            {stats && (
              <div className="breakdowns-grid">

                <div className="breakdown-card">
                  <h3>Priority</h3>
                  <ul className="breakdown-list">
                    {stats.priority_breakdown.map((p) => (
                      <li key={p.priority} className="breakdown-item">
                        <span className="breakdown-label">{p.priority}</span>
                        <div className="breakdown-bar-wrap">
                          <div
                            className="breakdown-bar"
                            style={{
                              width: `${(p.count / maxPriority) * 100}%`,
                              background: PRIORITY_COLORS[p.priority] || "#6c63ff",
                            }}
                          />
                        </div>
                        <span className="breakdown-count">{p.count}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="breakdown-card">
                  <h3>Category</h3>
                  <ul className="breakdown-list">
                    {stats.category_breakdown.map((c) => (
                      <li key={c.category} className="breakdown-item">
                        <span className="breakdown-label">{c.category}</span>
                        <div className="breakdown-bar-wrap">
                          <div
                            className="breakdown-bar"
                            style={{
                              width: `${(c.count / maxCategory) * 100}%`,
                              background: CATEGORY_COLORS[c.category] || "#6c63ff",
                            }}
                          />
                        </div>
                        <span className="breakdown-count">{c.count}</span>
                      </li>
                    ))}
                  </ul>
                </div>

              </div>
            )}

            {/* ── TICKET LIST ── */}
            <div className="tickets-card">
              <div className="card-header">
                <h2>All Tickets</h2>
                <span>{tickets.length} total</span>
              </div>

              {tickets.length === 0 ? (
                <div className="empty-state">No tickets yet. Create your first one!</div>
              ) : (
                <div className="ticket-grid">
                  {tickets.map((ticket) => (
                    <div className="ticket-item" key={ticket.id}>
                      <div className="ticket-top">
                        <span className="ticket-title">{ticket.title}</span>
                        <span className={`badge ${ticket.priority}`}>
                          {ticket.priority.toUpperCase()}
                        </span>
                      </div>
                      <p className="ticket-desc">{ticket.description}</p>
                      <div className="ticket-footer">
                        <span className={`pill ${ticket.category}`}>{ticket.category}</span>
                        <span className={`pill status-${ticket.status}`}>
                          {ticket.status.replace("_", " ")}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}