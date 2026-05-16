import { useState } from "react";
import Sidebar from "../../components/Sidebar";
import Topbar from "../../components/Topbar";
import "../../styles/reports.css";

function Daily() 
{
  const [filters, setFilters] = useState({
    clinic: "All Clinics",
    laboratory: "All Laboratories",
    from: "",
    to: "",
  });

  const [stats] = useState({ appointments: 0, recalls: 0, patients: 0 });
  const [appointments] = useState([]);
  const [procedures] = useState([]);
  const [overPayment] = useState([]);
  const [collections] = useState([]);
  const [expenses] = useState([]);
  const [income] = useState({
    netIncome: "₱0.00",
    billingAmount: "₱0.00",
    billingCount: 0,
    expenseAmount: "₱0.00",
    expenseCount: 0,
  });

  return (
    <div className="admin-container">
      <Sidebar />
      <div className="admin-main">
        <Topbar />
        <div className="dashboard-content">
          <div className="reports-container">
            <div className="page-title-row">
              <h2 className="page-main-title">Daily Sales Report</h2>
              <p className="page-subtitle">Detailed Income Sales Report</p>
            </div>

            <div className="reports-filters">
              <div className="filter-item wide">
                <label>Clinic</label>
                <select value={filters.clinic} onChange={(e) => setFilters({ ...filters, clinic: e.target.value })}>
                  <option>All Clinics</option>
                  <option>Hagonoy</option>
                  <option>Paombong</option>
                </select>
              </div>
              <div className="filter-item wide">
                <label>Laboratory</label>
                <select value={filters.laboratory} onChange={(e) => setFilters({ ...filters, laboratory: e.target.value })}>
                  <option>All Laboratories</option>
                </select>
              </div>
              <div className="filter-item">
                <label>Date From</label>
                <input type="date" value={filters.from} onChange={(e) => setFilters({ ...filters, from: e.target.value })}/>
              </div>
              <div className="filter-item">
                <label>Date To</label>
                <input type="date" value={filters.to} onChange={(e) => setFilters({ ...filters, to: e.target.value })}/>
              </div>
              <button className="btn-show">Show</button>
            </div>

            <div className="daily-stats">
              <div className="daily-stat-card teal">
                <span className="daily-stat-icon">🦷</span>
                <div className="daily-stat-info">
                  <span className="daily-stat-value">{stats.appointments}</span>
                  <span className="daily-stat-label">Appointments</span>
                </div>
              </div>
              <div className="daily-stat-card purple">
                <span className="daily-stat-icon">🔁</span>
                <div className="daily-stat-info">
                  <span className="daily-stat-value">{stats.recalls}</span>
                  <span className="daily-stat-label">Rebooked</span>
                </div>
              </div>
              <div className="daily-stat-card amber">
                <span className="daily-stat-icon">👤</span>
                <div className="daily-stat-info">
                  <span className="daily-stat-value">{stats.patients}</span>
                  <span className="daily-stat-label">Patient Invoices</span>
                </div>
              </div>
            </div>

            <div className="daily-tables-grid">
              <div className="daily-table-card full-width">
                <div className="daily-table-header">
                  <span>Patient Appointments</span>
                </div>
                <table>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Patient Name</th>
                      <th>Clinic</th>
                      <th>Associate</th>
                      <th>Appointment Reason</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {appointments.length === 0 ? (
                      <tr className="empty-row">
                        <td colSpan={6}>No data available</td>
                      </tr>
                    ) : (
                      appointments.map((row, i) => (
                        <tr key={i}>
                          <td>{row.date}</td>
                          <td>{row.patientName}</td>
                          <td>{row.clinic}</td>
                          <td>{row.associate}</td>
                          <td>{row.reason}</td>
                          <td>{row.status}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
                <div className="show-more-row"><a>Show more</a></div>
              </div>

              <div className="daily-table-card">
                <div className="daily-table-header">
                  <span>Patient Procedures</span>
                </div>
                <table>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Patient Name</th>
                      <th>Clinic</th>
                      <th>Procedure</th>
                      <th>Total Bill</th>
                      <th>Total Paid</th>
                    </tr>
                  </thead>
                  <tbody>
                    {procedures.length === 0 ? (
                      <tr className="empty-row">
                        <td colSpan={6}>No data available</td>
                      </tr>
                    ) : (
                      procedures.map((row, i) => (
                        <tr key={i}>
                          <td>{row.date}</td>
                          <td>{row.patientName}</td>
                          <td>{row.clinic}</td>
                          <td>{row.procedure}</td>
                          <td>{row.totalBill}</td>
                          <td>{row.totalPaid}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
                <div className="show-more-row"><a>Show more</a></div>
              </div>

              <div className="daily-table-card">
                <div className="daily-table-header">
                  <span>Over Payment</span>
                </div>
                <table>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Patient</th>
                      <th>Credit Amount</th>
                      <th>Used Amount</th>
                      <th>Balance Amount</th>
                      <th>Remarks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {overPayment.length === 0 ? (
                      <tr className="empty-row">
                        <td colSpan={6}>No data available</td>
                      </tr>
                    ) : (
                      overPayment.map((row, i) => (
                        <tr key={i}>
                          <td>{row.date}</td>
                          <td>{row.patient}</td>
                          <td>{row.creditAmount}</td>
                          <td>{row.usedAmount}</td>
                          <td>{row.balanceAmount}</td>
                          <td>{row.remarks}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
                <div className="show-more-row"><a>Show more</a></div>
              </div>

              <div className="daily-table-card">
                <div className="daily-table-header">
                  <span>Collections</span>
                </div>
                <table>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Patient</th>
                      <th>Clinic / Laboratory</th>
                      <th>Payment Type</th>
                      <th>Reference #</th>
                      <th>Amount</th>
                      <th>Remarks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {collections.length === 0 ? (
                      <tr className="empty-row">
                        <td colSpan={7}>No data available</td>
                      </tr>
                    ) : (
                      collections.map((row, i) => (
                        <tr key={i}>
                          <td>{row.date}</td>
                          <td>{row.patient}</td>
                          <td>{row.clinic}</td>
                          <td>{row.paymentType}</td>
                          <td>{row.referenceNo}</td>
                          <td>{row.amount}</td>
                          <td>{row.remarks}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
                <div className="show-more-row"><a>Add more</a></div>
              </div>

              <div className="daily-table-card">
                <div className="daily-table-header">
                  <span>Expenses and Bills</span>
                </div>
                <table>
                  <thead>
                    <tr>
                      <th>Expense Date</th>
                      <th>Clinic</th>
                      <th>Description</th>
                      <th>Category</th>
                      <th>Account</th>
                      <th>Method</th>
                      <th>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {expenses.length === 0 ? (
                      <tr className="empty-row">
                        <td colSpan={7}>No data available</td>
                      </tr>
                    ) : (
                      expenses.map((row, i) => (
                        <tr key={i}>
                          <td>{row.date}</td>
                          <td>{row.clinic}</td>
                          <td>{row.description}</td>
                          <td>{row.category}</td>
                          <td>{row.account}</td>
                          <td>{row.method}</td>
                          <td>{row.amount}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
                <div className="show-more-row"><a>Show more</a></div>
              </div>
            </div>

            <div className="daily-bottom">
              <div className="daily-income-block">
                <h4>Net Income: {income.netIncome}</h4>
                <div className="daily-income-label">Billing</div>
                <p>TOTAL AMOUNT: {income.billingAmount}  TRANSACTIONS: {income.billingCount}</p>
                <div className="daily-income-label expenses-label">Expenses</div>
                <p>TOTAL AMOUNT: {income.expenseAmount}  TRANSACTIONS: {income.expenseCount}</p>
              </div>

              <div className="daily-chart-card">
                <h4>Sales Comparison</h4>
                <div className="chart-legend">
                  <span className="legend-item"><span className="legend-dot" style={{ background: "#e53935" }}></span>Net Income</span>
                  <span className="legend-item"><span className="legend-dot" style={{ background: "#1e88e5" }}></span>Billing</span>
                  <span className="legend-item"><span className="legend-dot" style={{ background: "#ff9800" }}></span>Collection</span>
                  <span className="legend-item"><span className="legend-dot" style={{ background: "#43a047" }}></span>Expenses</span>
                </div>
                <div className="chart-area-placeholder">Sales Comparison Chart</div>
              </div>
            </div>
            <div className="reports-footer" style={{ marginTop: "20px" }}>
              <button className="btn-print">Print</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Daily;
