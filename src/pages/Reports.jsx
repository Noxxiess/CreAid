import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import "../styles/reports.css";

function Reports() {
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

  const [reportType, setReportType] = useState("Summary");
  const location = useLocation();

  useEffect(() => {
    if (location.pathname === "/reports/daily") {
      setReportType("Daily Sales");
    } else if (location.pathname === "/reports/collections") {
      setReportType("Collections");
    } else if (location.pathname === "/reports/expenses") {
      setReportType("Expenses and Bills");
    } else if (location.pathname === "/reports/appointments") {
      setReportType("Patient Appointments");
    } else {
      setReportType("Summary");
    }
  }, [location.pathname]);

  useEffect(() => {
    /*
    getReports(filters).then(res => {
      setSummary(res.summary);
    });
    */
  }, [filters]);

  return (
    <div className="admin-container">
      <Sidebar />
      <div className="admin-main">
        <Topbar />
        <div className="dashboard-content">
          <div className="reports-container">

            {/* TITLE */}
            <h2 className="reports-title">Summary</h2>

            {/* FILTERS */}
            <div className="reports-filters">
              <div className="filter-item">
                <label>Clinic</label>
                <select
                  value={filters.clinic}
                  onChange={(e) => setFilters({ ...filters, clinic: e.target.value })}
                >
                  <option>All</option>
                  <option>Hagonoy</option>
                  <option>Paombong</option>
                </select>
              </div>
              <div className="filter-item">
                <label>Date From</label>
                <input
                  type="date"
                  value={filters.from}
                  onChange={(e) => setFilters({ ...filters, from: e.target.value })}
                />
              </div>
              <div className="filter-item">
                <label>Date To</label>
                <input
                  type="date"
                  value={filters.to}
                  onChange={(e) => setFilters({ ...filters, to: e.target.value })}
                />
              </div>
              <button className="btn-show">Show</button>
            </div>

            {/* SUMMARY */}
            <div className="reports-summary">
              <h2 className="net-income-heading">Net Income: {summary.netIncome}</h2>

              <div className="summary-row">
                <div className="summary-block">
                  <span className="summary-label blue">Collection</span>
                  <p>Total Amount: {summary.collectionAmount}</p>
                  <p>Transactions: {summary.collectionCount}</p>
                </div>
                <div className="summary-block">
                  <span className="summary-label red">Expenses</span>
                  <p>Total Amount: {summary.expenseAmount}</p>
                  <p>Transactions: {summary.expenseCount}</p>
                </div>
              </div>
            </div>

            {/* CHARTS */}
            <div className="reports-charts">
              <div className="chart-card">
                <p className="chart-label">Type of Patient</p>
                <div className="chart-circle"></div>
              </div>
              <div className="chart-card">
                <p className="chart-label">Expense Categories</p>
                <div className="chart-circle"></div>
              </div>
              <div className="chart-card">
                <p className="chart-label">Payment Methods</p>
                <div className="chart-circle"></div>
              </div>
            </div>

            {/* PRINT */}
            <div className="reports-footer">
              <button className="btn-print">Print</button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

export default Reports;
