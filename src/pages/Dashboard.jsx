import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import { useAuth } from "../context/AuthContext";
import "../styles/admin.css";

function Dashboard() {
  const { permissions = {} } = useAuth();
  const [period, setPeriod] = useState("Week");
  const [patientsWithBalance, setPatientsWithBalance] = useState([]);

  useEffect(() => {
    setPatientsWithBalance([]);
  }, [period]);

  const can = (module, action) => permissions[module]?.includes(action);

  return (
    <div className="admin-container">
      <Sidebar />
      <div className="admin-main">
        <Topbar />
        <div className="dashboard-content">

          {/* STATS */}
          {can("dashboard", "view") && (
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-title">Scheduled</div>
                <div className="stat-value">-- ({period})</div>
              </div>
              <div className="stat-card">
                <div className="stat-title">Completed</div>
                <div className="stat-value">-- ({period})</div>
              </div>
              <div className="stat-card">
                <div className="stat-title">Reschedule</div>
                <div className="stat-value">-- ({period})</div>
              </div>
              <div className="stat-card">
                <div className="stat-title">No-shows</div>
                <div className="stat-value">-- ({period})</div>
              </div>
            </div>
          )}

          <div className="main-grid">

            {/* BALANCE TABLE */}
            {can("payments", "view") && (
              <div className="balance-card">
                <div className="balance-card-header">
                  <h3>Patients w/ Balance</h3>
                  <span className="see-all">See All</span>
                </div>
                {patientsWithBalance.length === 0 ? (
                  <div className="empty-placeholder">No data available yet</div>
                ) : (
                  <div className="balance-list">
                    {patientsWithBalance.map((p, i) => (
                      <div className="balance-item" key={i}>
                        <div>
                          <span className="patient-name">{p.name}</span>
                          <span className="last-visit">{p.lastVisit}</span>
                        </div>
                        <span className="balance-amount">₱{p.balance}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* RIGHT COLUMN */}
            <div className="right-column">
              <div className="chart-card">
                <div className="chart-title">{period} Number of Treatments</div>
                <div className="chart-placeholder">Pie Chart Placeholder ({period})</div>
              </div>

              <div className="sales-card">
                <h4>Total Sales for the {period}</h4>
                <p className="amount">₱ ---.--</p>
                {can("reports", "view") && (
                  <span className="report-link">Click Here for reports →</span>
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
        </div>
      </div>
    </div>
  );
}

export default Dashboard;