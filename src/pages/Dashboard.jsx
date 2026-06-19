import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import "../styles/dashboard.css";
import {
  getAppointmentStatsApi,
  getTreatmentStatsApi,
  getBalancesApi
} from "../api/appointments";
import { useNavigate } from "react-router-dom";

function Dashboard()
{
  const navigate = useNavigate();
  const { permissions = {} } = useAuth();
  const [period, setPeriod] = useState("Week");
  const [patientsWithBalance, setPatientsWithBalance] = useState([]);
  const [selectedBalance, setSelectedBalance] = useState(null);
  const [treatments, setTreatments] = useState([]);
  const [stats, setStats] = useState({
    scheduled: 0,
    completed: 0,
    cancelled: 0,
    noShow: 0,
    pendingVerification: 0,
    revenue: 0
  });
  const [showAllBalances, setShowAllBalances] = useState(false);

  const can = (module, action) => permissions[module]?.includes(action);

  const fetchStats = async () =>
  {
    try
    {
      const response = await getAppointmentStatsApi();
      setStats(response.stats);
    }
    catch (error)
    {
      console.error(error);
    }
  };

  const fetchTreatments = async () =>
  {
    try
    {
      const response = await getTreatmentStatsApi();
      setTreatments(response.treatments || []);
    }
    catch (error)
    {
      console.error(error);
    }
  };

  const fetchBalances = async () =>
  {
    try
    {
      const response = await getBalancesApi();
      setPatientsWithBalance(response.patients || []);
    }
    catch (error)
    {
      console.error(error);
    }
  };

  useEffect(() =>
  {
    fetchStats();
    fetchTreatments();
    fetchBalances();
  }, [period]);

  const getInitials = (name = "") =>
    name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

  const avatarColors = [
    { bg: "#EEEDFE", color: "#3C3489" },
    { bg: "#FBEAF0", color: "#993556" },
    { bg: "#F4C0D1", color: "#72243E" },
    { bg: "#CECBF6", color: "#26215C" },
  ];

  const getAvatarColor = (index) => avatarColors[index % avatarColors.length];

  const maxCount = treatments.length > 0
    ? Math.max(...treatments.map((t) => t.count), 1)
    : 1;

  return (
    <div className="admin-container">
      <div className="admin-main">
        <div className="dashboard-content">

          {can("dashboard", "view") && (
            <div className="stats-grid">
              <div className="stat-card stat-purple">
                <div className="stat-title">Scheduled</div>
                <div className="stat-value">{stats.scheduled}</div>
                <div className="stat-sub">appointments today</div>
              </div>
              <div className="stat-card stat-pink">
                <div className="stat-title">Completed</div>
                <div className="stat-value">{stats.completed}</div>
                <div className="stat-sub">procedures done</div>
              </div>
              <div className="stat-card stat-lpink">
                <div className="stat-title">Cancelled</div>
                <div className="stat-value">{stats.cancelled}</div>
                <div className="stat-sub">this period</div>
              </div>
              <div className="stat-card stat-lpurp">
                <div className="stat-title">No-shows</div>
                <div className="stat-value">{stats.noShow}</div>
                <div className="stat-sub">missed visits</div>
              </div>
            </div>
          )}

          <div className="main-grid">
            <div className="left-column">

              {can("payments", "view") && (
                <div className="balance-card">
                  <div className="balance-card-header">
                    <h3>Patients w/ Balance</h3>
                    <span className="see-all" onClick={() => setShowAllBalances(true)}>See All</span>
                  </div>

                  {patientsWithBalance.length === 0 ? (
                    <div className="empty-placeholder">No balance data yet</div>
                  ) : (
                    <div className="balance-list">
                      {patientsWithBalance.slice(0, 3).map((p, index) =>
                      {
                        const ac = getAvatarColor(index);
                        return (
                          <div
                            className="balance-item"
                            key={p.id}
                            onClick={() => setSelectedBalance(p)}
                          >
                            <div className="bal-left">
                              <div
                                className="bal-avatar"
                                style={{ background: ac.bg, color: ac.color }}
                              >
                                {getInitials(p.guest_name)}
                              </div>
                              <div>
                                <span className="patient-name">{p.guest_name}</span>
                                <span className="last-visit">Remaining Balance</span>
                              </div>
                            </div>
                            <span className="balance-amount">
                              ₱{Number(p.remaining_balance).toLocaleString()}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              <div className="pending-verification-card">
                <div className="pending-icon-wrap">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#FA1377" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                  </svg>
                </div>
                <div className="pending-info">
                  <div className="pending-header">Pending Payment Verification</div>
                  <div className="pending-count">{stats.pendingVerification}</div>
                </div>
                <button
                  className="pending-review-btn"
                  onClick={() => navigate("/payments")}
                >
                  Review →
                </button>
              </div>

            </div>

            <div className="right-column">

              <div className="chart-card">
                <div className="chart-title">{period} — Treatments</div>

                {treatments.length === 0 ? (
                  <div className="chart-empty">No treatment data yet</div>
                ) : (
                  <div className="css-bar-chart">
                    {treatments.map((t, i) => (
                      <div className="bar-col" key={i}>
                        <div className="bar-tooltip">{t.count}</div>
                        <div
                          className="bar-fill"
                          style={{ height: `${(t.count / maxCount) * 100}%` }}
                        />
                        <div className="bar-label">{t.name}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="sales-card">
                <h4>Total Sales for the {period}</h4>
                <p className="amount">₱{stats.revenue?.toLocaleString()}</p>
                {can("reports", "view") && (
                  <span className="report-link" onClick={() => navigate("/reports")}>
                    Click here for reports →
                  </span>
                )}
              </div>

              <div className="filter-buttons">
                {["Month", "Week", "Day"].map((p) => (
                  <button
                    key={p}
                    className={period === p ? "active" : ""}
                    onClick={() => setPeriod(p)}
                  >
                    {p}
                  </button>
                ))}
              </div>

            </div>
          </div>

          {showAllBalances && (
            <div className="modal-overlay" onClick={() => setShowAllBalances(false)}>
              <div className="balance-modal" onClick={(e) => e.stopPropagation()}>
                <div className="balance-modal-header">
                  <h3>All Patients With Balance</h3>
                  <button className="close-modal" onClick={() => setShowAllBalances(false)}>✕</button>
                </div>
                <div className="balance-modal-list">
                  {patientsWithBalance.map((p, index) =>
                  {
                    const ac = getAvatarColor(index);
                    return (
                      <div
                        key={p.id}
                        className="balance-modal-item"
                        onClick={() =>
                        {
                          setShowAllBalances(false);
                          setSelectedBalance(p);
                        }}
                      >
                        <div className="bal-left">
                          <div
                            className="bal-avatar"
                            style={{ background: ac.bg, color: ac.color }}
                          >
                            {getInitials(p.guest_name)}
                          </div>
                          <div>
                            <div className="patient-name">{p.guest_name}</div>
                            <div className="last-visit">Remaining Balance</div>
                          </div>
                        </div>
                        <div className="balance-amount">
                          ₱{Number(p.remaining_balance).toLocaleString()}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {selectedBalance && (
            <div className="modal-overlay" onClick={() => setSelectedBalance(null)}>
              <div className="payment-modal payment-details-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                  <h3>Payment Details</h3>
                </div>
                <div className="modal-body">
                  <div className="modal-field">
                    <label>Patient</label>
                    <p className="modal-readonly">{selectedBalance.guest_name}</p>
                  </div>
                  <div className="modal-field">
                    <label>Remaining Balance</label>
                    <p className="modal-readonly">₱{Number(selectedBalance.remaining_balance).toLocaleString()}</p>
                  </div>
                  <div className="modal-field">
                    <label>Status</label>
                    <p className="modal-readonly">{selectedBalance.status}</p>
                  </div>
                  <div className="modal-field">
                    <label>Payment Status</label>
                    <p className="modal-readonly">{selectedBalance.payment_status}</p>
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    className="btn-save"
                    onClick={() =>
                    {
                      localStorage.setItem("highlightPaymentId", selectedBalance.id);
                      navigate("/payments");
                    }}
                  >
                    Go To Payment List
                  </button>
                  <button className="btn-cancel-edit" onClick={() => setSelectedBalance(null)}>
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

export default Dashboard;