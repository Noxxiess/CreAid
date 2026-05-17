import { useState } from "react";
import "../../styles/daily.css";

const stats        = { appointments: 0, recalls: 0, patients: 0 };
const appointments = [];
const procedures   = [];
const overPayment  = [];
const collections  = [];
const expenses     = [];
const income = {
  netIncome:     "---",
  billingAmount: "---",
  billingCount:  "---",
  expenseAmount: "---",
  expenseCount:  "---",
};

function Daily() 
{
  const [filters, setFilters] = useState({ from: "", to: "" });

  return (
    <div className="users-content">
      <div className="users-page-header">
        <h2>Daily Sales Report</h2>
      </div>

      <div className="users-page-container">
        <div className="users-filter-container">
          <div className="filter-row">
            <span className="filter-label">Date From</span>
            <input type="date" value={filters.from} onChange={(e) => setFilters({ ...filters, from: e.target.value })}/>
            <span className="filter-label">Date To</span>
            <input type="date" value={filters.to} onChange={(e) => setFilters({ ...filters, to: e.target.value })}/>
            <button className="btn-go">Show</button>
          </div>
        </div>

        <div className="daily-stat-cards">
          <div className="daily-stat-card daily-stat-pink">
            <div className="daily-stat-icon">🦷</div>
            <div className="daily-stat-info">
              <div className="daily-stat-value">{stats.appointments}</div>
              <div className="daily-stat-label">Appointments</div>
            </div>
          </div>

          <div className="daily-stat-card daily-stat-purple">
            <div className="daily-stat-icon">🔁</div>
            <div className="daily-stat-info">
              <div className="daily-stat-value">{stats.recalls}</div>
              <div className="daily-stat-label">Rebooked</div>
            </div>
          </div>

          <div className="daily-stat-card daily-stat-navy">
            <div className="daily-stat-icon">👤</div>
            <div className="daily-stat-info">
              <div className="daily-stat-value">{stats.patients}</div>
              <div className="daily-stat-label">Patient Invoices</div>
            </div>
          </div>
        </div>

        <div className="daily-tables-grid">
          <div className="daily-table-card full-width">
            <div className="daily-table-title">Patient Appointments</div>
            <div className="users-table">
              <div className="daily-th daily-cols-appointments">
                <span>Date</span><span>Patient Name</span><span>Clinic</span>
                <span>Associate</span><span>Reason</span><span>Status</span>
              </div>
              {appointments.length === 0
                ? <div className="users-empty">No data available</div>
                : appointments.map((r, i) => (
                    <div key={i} className="daily-td daily-cols-appointments">
                      <span>{r.date}</span>
                      <span>{r.patientName}</span>
                      <span>{r.clinic}</span>
                      <span>{r.associate}</span>
                      <span>{r.reason}</span>
                      <span>{r.status}</span>
                    </div>
                  ))
              }
            </div>
            <div className="daily-show-more">Show more</div>
          </div>

          <div className="daily-table-card">
            <div className="daily-table-title">Patient Procedures</div>
            <div className="users-table">
              <div className="daily-th daily-cols-procedures">
                <span>Date</span><span>Patient Name</span><span>Clinic</span>
                <span>Procedure</span><span>Total Bill</span><span>Total Paid</span>
              </div>
              {procedures.length === 0
                ? <div className="users-empty">No data available</div>
                : procedures.map((r, i) => (
                    <div key={i} className="daily-td daily-cols-procedures">
                      <span>{r.date}</span>
                      <span>{r.patientName}</span>
                      <span>{r.clinic}</span>
                      <span>{r.procedure}</span>
                      <span>{r.totalBill}</span>
                      <span>{r.totalPaid}</span>
                    </div>
                  ))
              }
            </div>
            <div className="daily-show-more">Show more</div>
          </div>

          <div className="daily-table-card">
            <div className="daily-table-title">Over Payment</div>
            <div className="users-table">
              <div className="daily-th daily-cols-6-even">
                <span>Date</span>
                <span>Patient</span>
                <span>Credit</span>
                <span>Used</span>
                <span>Balance</span>
                <span>Remarks</span>
              </div>
              {overPayment.length === 0
                ? <div className="users-empty">No data available</div>
                : overPayment.map((r, i) => (
                    <div key={i} className="daily-td daily-cols-6-even">
                      <span>{r.date}</span>
                      <span>{r.patient}</span>
                      <span>{r.creditAmount}</span>
                      <span>{r.usedAmount}</span>
                      <span>{r.balanceAmount}</span>
                      <span>{r.remarks}</span>
                    </div>
                  ))
              }
            </div>
            <div className="daily-show-more">Show more</div>
          </div>

          <div className="daily-table-card">
            <div className="daily-table-title">Collections</div>
            <div className="users-table">
              <div className="daily-th daily-cols-6-even">
                <span>Date</span>
                <span>Patient</span>
                <span>Clinic</span>
                <span>Payment Type</span>
                <span>Amount</span>
                <span>Remarks</span>
              </div>
              {collections.length === 0
                ? <div className="users-empty">No data available</div>
                : collections.map((r, i) => (
                    <div key={i} className="daily-td daily-cols-6-even">
                      <span>{r.date}</span>
                      <span>{r.patient}</span>
                      <span>{r.clinic}</span>
                      <span>{r.paymentType}</span>
                      <span>{r.amount}</span>
                      <span>{r.remarks}</span>
                    </div>
                  ))
              }
            </div>
            <div className="daily-show-more">Show more</div>
          </div>

          <div className="daily-table-card">
            <div className="daily-table-title">Expenses and Bills</div>
            <div className="users-table">
              <div className="daily-th daily-cols-expenses">
                <span>Date</span>
                <span>Clinic</span>
                <span>Description</span>
                <span>Category</span>
                <span>Method</span>
                <span>Amount</span>
              </div>
              {expenses.length === 0
                ? <div className="users-empty">No data available</div>
                : expenses.map((r, i) => (
                    <div key={i} className="daily-td daily-cols-expenses">
                      <span>{r.date}</span>
                      <span>{r.clinic}</span>
                      <span>{r.description}</span>
                      <span>{r.category}</span>
                      <span>{r.method}</span>
                      <span>{r.amount}</span>
                    </div>
                  ))
              }
            </div>
            <div className="daily-show-more">Show more</div>
          </div>
        </div>

        <div className="daily-chart-card">
          <div className="daily-income-card daily-income-card-mb">
            <div className="daily-income-title">Net Income</div>
            <div className="daily-income-value">{income.netIncome}</div>
            <div className="daily-income-divider"/>
            <div className="daily-income-grid">
              <div>
                <div className="daily-income-section-label collection">Billing</div>
                <div className="daily-income-row"><span>Total Amount</span><strong>{income.billingAmount}</strong></div>
                <div className="daily-income-row"><span>Transactions</span><strong>{income.billingCount}</strong></div>
              </div>
              <div>
                <div className="daily-income-section-label expenses">Expenses</div>
                <div className="daily-income-row"><span>Total Amount</span><strong>{income.expenseAmount}</strong></div>
                <div className="daily-income-row"><span>Transactions</span><strong>{income.expenseCount}</strong></div>
              </div>
            </div>
          </div>
          <div className="daily-chart-title">Sales Comparison</div>
          <div className="daily-chart-legend">
            <span className="daily-legend-item"><span className="daily-legend-dot daily-legend-pink"></span>Net Income</span>
            <span className="daily-legend-item"><span className="daily-legend-dot daily-legend-purple"></span>Billing</span>
            <span className="daily-legend-item"><span className="daily-legend-dot daily-legend-orange"></span>Collection</span>
            <span className="daily-legend-item"><span className="daily-legend-dot daily-legend-green"></span>Expenses</span>
          </div>
          <div className="daily-chart-placeholder">Chart coming soon</div>
        </div>

        <div className="reports-footer">
          <button className="btn-print">🖨️ Print</button>
        </div>
      </div>
    </div>
  );
}

export default Daily;
