import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import "../styles/reports.css";

function Reports() 
{
  const [filters, setFilters] = useState({
    clinic: "All",
    from: "",
    to: "",
  });

  const [summary, setSummary] = useState({
    netIncome: "₱ 0.00",
    collectionAmount: "₱ 0.00",
    collectionCount: 0,
    expenseAmount: "₱ 0.00",
    expenseCount: 0,
  });

  const location = useLocation();

  useEffect(() => 
  {
    //backend hereee
  }, [filters]);

  return (
    <div className="users-content">
      <div className="users-page-header">
        <h2>Summary</h2>
      </div>

      <div className="users-page-container">
        <div className="users-filter-container">
          <div className="filter-left">
            <div className="filter-row">
              <span className="filter-label">Clinic</span>
              <select value={filters.clinic} onChange={(e) => setFilters({ ...filters, clinic: e.target.value })}>
                <option>All</option>
                <option>Hagonoy</option>
                <option>Paombong</option>
              </select>
              <span className="filter-label">Date From</span>
              <input type="date" value={filters.from} onChange={(e) => setFilters({ ...filters, from: e.target.value })}/>
              <span className="filter-label">Date To</span>
              <input type="date" value={filters.to} onChange={(e) => setFilters({ ...filters, to: e.target.value })}/>
              <button className="btn-go">Show</button>
            </div>
          </div>
        </div>

        <div className="reports-kpi-grid">
          <div className="reports-kpi-card">
            <div className="reports-kpi-icon" style={{ background: "rgba(250,19,119,0.08)" }}>
              <span style={{ fontSize: 20 }}>💰</span>
            </div>
            <div className="reports-kpi-label">Net Income</div>
            <div className="reports-kpi-value">{summary.netIncome}</div>
          </div>
          <div className="reports-kpi-card">
            <div className="reports-kpi-icon" style={{ background: "rgba(46,125,50,0.08)" }}>
              <span style={{ fontSize: 20 }}>📥</span>
            </div>
            <div className="reports-kpi-label">Collections</div>
            <div className="reports-kpi-value">{summary.collectionAmount}</div>
            <div className="reports-kpi-sub">{summary.collectionCount} transactions</div>
          </div>
          <div className="reports-kpi-card">
            <div className="reports-kpi-icon" style={{ background: "rgba(198,40,40,0.08)" }}>
              <span style={{ fontSize: 20 }}>📤</span>
            </div>
            <div className="reports-kpi-label">Expenses</div>
            <div className="reports-kpi-value">{summary.expenseAmount}</div>
            <div className="reports-kpi-sub">{summary.expenseCount} transactions</div>
          </div>
        </div>

        <div className="reports-charts-grid">
          <div className="reports-chart-card">
            <p className="reports-chart-title">Type of Patient</p>
            <div className="reports-chart-placeholder">
              <span>Chart coming soon</span>
            </div>
          </div>
          <div className="reports-chart-card">
            <p className="reports-chart-title">Expense Categories</p>
            <div className="reports-chart-placeholder">
              <span>Chart coming soon</span>
            </div>
          </div>
          <div className="reports-chart-card">
            <p className="reports-chart-title">Payment Methods</p>
            <div className="reports-chart-placeholder">
              <span>Chart coming soon</span>
            </div>
          </div>
        </div>

        <div className="reports-footer">
          <button className="btn-print">🖨️ Print</button>
        </div>
      </div>
    </div>
  );
}

export default Reports;
