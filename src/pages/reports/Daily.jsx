import "../../styles/daily.css";
import { useEffect, useState } from "react";
import { getDailyReportApi, getMonthlySummaryApi } from "../../api/reports";
import { BarChart, Bar, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const MODAL_PAGE_SIZE = 10;

function Daily()
{
  const [stats, setStats] = useState({ appointments: 0, recalls: 0, patients: 0 });
  const [appointments, setAppointments] = useState([]);
  const [procedures, setProcedures] = useState([]);
  const [collections, setCollections] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [outstandingBalances, setOutstandingBalances] = useState([]);

  const [income, setIncome] = useState({
    netIncome: 0,
    billingAmount: 0,
    billingCount: 0,
    collectionAmount: 0,
    expenseAmount: 0,
    expenseCount: 0,
    billAmount: 0,
    billCount: 0
  });

  const [financialMonth, setFinancialMonth] = useState(new Date().getMonth() + 1);
  const [financialYear, setFinancialYear] = useState(new Date().getFullYear());

  const [monthlySummary, setMonthlySummary] = useState({
    billingAmount: 0,
    collectionAmount: 0,
    expenseAmount: 0,
    billAmount: 0,
    expenseCount: 0,
    billCount: 0,
    operatingCost: 0,
    netIncome: 0
  });

  const [filters, setFilters] = useState({ clinic: "All Clinics", from: "", to: "" });
  const [showAllAppointments, setShowAllAppointments] = useState(false);
  const [showAllProcedures, setShowAllProcedures] = useState(false);
  const [showAllBalances, setShowAllBalances] = useState(false);
  const [showAllCollections, setShowAllCollections] = useState(false);
  const [showAllExpenses, setShowAllExpenses] = useState(false);
  const [expandedTable, setExpandedTable] = useState(null);
  const [modalPage, setModalPage] = useState(1);

  useEffect(() =>
  {
    loadReport();
    loadMonthlySummary();
  }, []);

  function openModal(table)
  {
    setExpandedTable(table);
    setModalPage(1);
  }

  function closeModal()
  {
    setExpandedTable(null);
    setModalPage(1);
  }

  async function loadReport()
  {
    try
    {
      const response = await getDailyReportApi(filters);
      setStats(response.stats || {});
      setAppointments(response.appointments || []);
      setProcedures(response.procedures || []);
      setCollections(response.collections || []);
      setOutstandingBalances(response.outstandingBalances || []);
      setExpenses(response.expenses || []);
      setIncome(response.income || {});
    }
    catch (error)
    {
      console.error(error);
    }
  }

  async function loadMonthlySummary()
  {
    try
    {
      const response = await getMonthlySummaryApi(financialMonth, financialYear, filters.clinic);
      setMonthlySummary(response);
    }
    catch (error)
    {
      console.error(error);
    }
  }

  const visibleAppointments = showAllAppointments ? appointments : appointments.slice(0, 5);
  const visibleProcedures = showAllProcedures ? procedures : procedures.slice(0, 5);
  const visibleBalances = showAllBalances ? outstandingBalances : outstandingBalances.slice(0, 5);
  const visibleCollections = showAllCollections ? collections : collections.slice(0, 5);
  const visibleExpenses = showAllExpenses ? expenses : expenses.slice(0, 5);

  const salesComparisonData = [
    { name: "Net Income",      amount: Number(monthlySummary.netIncome       || 0), color: "#FA1377" },
    { name: "Billing",         amount: Number(monthlySummary.billingAmount    || 0), color: "#534AB7" },
    { name: "Collections",     amount: Number(monthlySummary.collectionAmount || 0), color: "#F59E0B" },
    { name: "Operating Costs", amount: Number(monthlySummary.operatingCost   || 0), color: "#2E7D32" }
  ];

  const modalDataMap = {
    appointments: appointments,
    procedures:   procedures,
    balances:     outstandingBalances,
    collections:  collections,
    expenses:     expenses,
  };

  const modalTotal     = expandedTable ? (modalDataMap[expandedTable]?.length ?? 0) : 0;
  const modalTotalPages = Math.ceil(modalTotal / MODAL_PAGE_SIZE);
  const modalStart     = (modalPage - 1) * MODAL_PAGE_SIZE;
  const modalEnd       = modalStart + MODAL_PAGE_SIZE;

  function pagedSlice(arr)
  {
    return arr.slice(modalStart, modalEnd);
  }

  function renderModalPagination()
  {
    if (modalTotalPages <= 1) return null;

    const pages = Array.from({ length: modalTotalPages }, (_, i) => i + 1);

    return (
      <div className="daily-modal-pagination">
        <button
          className={`daily-mpag-btn${modalPage === 1 ? " daily-mpag-disabled" : ""}`}
          onClick={() => modalPage > 1 && setModalPage(modalPage - 1)}
          disabled={modalPage === 1}
        >‹</button>
        {pages.map((n) => (
          <button
            key={n}
            className={`daily-mpag-btn${n === modalPage ? " daily-mpag-active" : ""}`}
            onClick={() => setModalPage(n)}
          >{n}</button>
        ))}
        <button
          className={`daily-mpag-btn${modalPage >= modalTotalPages ? " daily-mpag-disabled" : ""}`}
          onClick={() => modalPage < modalTotalPages && setModalPage(modalPage + 1)}
          disabled={modalPage >= modalTotalPages}
        >›</button>
      </div>
    );
  }

  return (
    <div className="daily-root">
      <div className="daily-page-header">
        <h2>Operational & Financial Report</h2>
      </div>

      <div className="daily-page-container">

        <div className="daily-filter-container">
          <div className="daily-filter-row">
            <span className="daily-filter-label">Clinic</span>
            <select
              value={filters.clinic}
              onChange={(e) => setFilters({ ...filters, clinic: e.target.value })}
            >
              <option>All Clinics</option>
              <option>Hagonoy</option>
              <option>Paombong</option>
            </select>
            <span className="daily-filter-label">Date From</span>
            <input
              type="date"
              value={filters.from}
              onChange={(e) => setFilters({ ...filters, from: e.target.value })}
            />
            <span className="daily-filter-label">Date To</span>
            <input
              type="date"
              value={filters.to}
              onChange={(e) => setFilters({ ...filters, to: e.target.value })}
            />
            <button className="daily-btn-go" onClick={loadReport}>Show</button>
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

          <div className="daily-table-card daily-full-width">
            <div className="daily-table-title">Patient Appointments</div>
            <div className="daily-table-scroll">
              <div className="daily-th daily-cols-appointments">
                <span>Date</span>
                <span>Patient Name</span>
                <span>Clinic</span>
                <span>Associate</span>
                <span>Reason</span>
                <span>Status</span>
              </div>
              {appointments.length === 0
                ? <div className="daily-empty">No data available</div>
                : visibleAppointments.map((r, i) => (
                    <div
                      key={i}
                      className={`daily-td daily-cols-appointments${r.status === "rejected" ? " daily-row-rejected" : ""}`}
                    >
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
            <div className="daily-show-more" onClick={() => openModal("appointments")}>Show More</div>
          </div>

          <div className="daily-table-card">
            <div className="daily-table-title">Patient Procedures</div>
            <div className="daily-table-scroll">
              <div className="daily-th daily-cols-procedures">
                <span>Date</span>
                <span>Patient Name</span>
                <span>Clinic</span>
                <span>Procedure</span>
                <span>Total Bill</span>
                <span>Total Paid</span>
              </div>
              {procedures.length === 0
                ? <div className="daily-empty">No data available</div>
                : visibleProcedures.map((r, i) => (
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
            <div className="daily-show-more" onClick={() => openModal("procedures")}>Show More</div>
          </div>

          <div className="daily-table-card">
            <div className="daily-table-title">Outstanding Balances</div>
            <div className="daily-table-scroll">
              <div className="daily-th daily-cols-overpayment">
                <span>Date</span>
                <span>Patient</span>
                <span>Total Bill</span>
                <span>Amount Paid</span>
                <span>Balance</span>
                <span>Status</span>
              </div>
              {outstandingBalances.length === 0
                ? <div className="daily-empty">No outstanding balances</div>
                : visibleBalances.map((r, i) => (
                    <div key={i} className="daily-td daily-cols-overpayment">
                      <span>{r.date}</span>
                      <span>{r.patient}</span>
                      <span>₱ {Number(r.totalBill || 0).toLocaleString()}</span>
                      <span>₱ {Number(r.amountPaid || 0).toLocaleString()}</span>
                      <span style={{ color: "#dc2626", fontWeight: 700 }}>
                        ₱ {Number(r.balance || 0).toLocaleString()}
                      </span>
                      <span style={{ color: "#f59e0b", fontWeight: 600 }}>{r.status}</span>
                    </div>
                  ))
              }
            </div>
            <div className="daily-show-more" onClick={() => openModal("balances")}>Show More</div>
          </div>

          <div className="daily-table-card">
            <div className="daily-table-title">Collections</div>
            <div className="daily-table-scroll">
              <div className="daily-th daily-cols-6-even">
                <span>Date</span>
                <span>Patient</span>
                <span>Clinic</span>
                <span>Payment Type</span>
                <span>Amount</span>
                <span>Remarks</span>
              </div>
              {collections.length === 0
                ? <div className="daily-empty">No data available</div>
                : visibleCollections.map((r, i) => (
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
            <div className="daily-show-more" onClick={() => openModal("collections")}>Show More</div>
          </div>

          <div className="daily-table-card">
            <div className="daily-table-title">Expenses and Bills</div>
            <div className="daily-table-scroll">
              <div className="daily-th daily-cols-expenses">
                <span>Date</span>
                <span>Clinic</span>
                <span>Description</span>
                <span>Type</span>
                <span>Category</span>
                <span>Amount</span>
              </div>
              {expenses.length === 0
                ? <div className="daily-empty">No data available</div>
                : visibleExpenses.map((r, i) => (
                    <div key={i} className="daily-td daily-cols-expenses">
                      <span>{r.date}</span>
                      <span>{r.clinic}</span>
                      <span>{r.description}</span>
                      <span>{r.type}</span>
                      <span>{r.category}</span>
                      <span>{r.amount}</span>
                    </div>
                  ))
              }
            </div>
            <div className="daily-show-more" onClick={() => openModal("expenses")}>Show More</div>
          </div>

        </div>

        <div className="daily-chart-card">
          <div className="daily-chart-inner">

            <div className="daily-income-card">
              <div className="daily-income-title">Net Income</div>
              <div className="daily-income-value">
                ₱ {Number(monthlySummary.netIncome || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className="daily-income-divider" />

              <div>
                <div className="daily-income-section-label daily-label-collection">Billing</div>
                <div className="daily-income-row">
                  <span>Total Amount</span>
                  <strong>₱ {Number(monthlySummary.billingAmount || 0).toLocaleString()}</strong>
                </div>
                <div className="daily-income-row">
                  <span>Transactions</span>
                  <strong>{income.billingCount}</strong>
                </div>
              </div>

              <div>
                <div className="daily-income-section-label daily-label-collection">Collections</div>
                <div className="daily-income-row">
                  <span>Total Amount</span>
                  <strong>₱ {Number(monthlySummary.collectionAmount || 0).toLocaleString()}</strong>
                </div>
                <div className="daily-income-row">
                  <span>Transactions</span>
                  <strong>{income.billingCount}</strong>
                </div>
              </div>

              <div>
                <div className="daily-income-section-label daily-label-expenses">Operating Costs</div>
                <div className="daily-income-row">
                  <span>Total Amount</span>
                  <strong>₱ {Number(monthlySummary.operatingCost || 0).toLocaleString()}</strong>
                </div>
                <div className="daily-income-row">
                  <span>Expenses</span>
                  <strong>{monthlySummary.expenseCount}</strong>
                </div>
                <div className="daily-income-row">
                  <span>Bills</span>
                  <strong>{monthlySummary.billCount}</strong>
                </div>
              </div>
            </div>

            <div className="daily-chart-right">
              <div className="daily-chart-title">Sales Comparison</div>
              <div className="daily-chart-legend">
                <span className="daily-legend-item"><span className="daily-legend-dot daily-legend-pink"></span>Net Income</span>
                <span className="daily-legend-item"><span className="daily-legend-dot daily-legend-purple"></span>Billing</span>
                <span className="daily-legend-item"><span className="daily-legend-dot daily-legend-orange"></span>Collection</span>
                <span className="daily-legend-item"><span className="daily-legend-dot daily-legend-green"></span>Operating Costs</span>
              </div>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={salesComparisonData}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => `₱ ${Number(value).toLocaleString()}`} />
                  <Bar dataKey="amount" radius={[8, 8, 0, 0]}>
                    {salesComparisonData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

          </div>

        </div>

        <div className="daily-footer">
          <button className="daily-btn-print">🖨️ Print</button>
        </div>

        {expandedTable && (
          <div className="daily-modal-overlay" onClick={closeModal}>
            <div className="daily-modal" onClick={(e) => e.stopPropagation()}>

              <div className="daily-modal-header">
                <h3>
                  {expandedTable === "appointments" ? "Patient Appointments"
                    : expandedTable === "procedures"   ? "Patient Procedures"
                    : expandedTable === "balances"     ? "Outstanding Balances"
                    : expandedTable === "collections"  ? "Collections"
                    : "Expenses & Bills"}
                </h3>
                <button className="daily-modal-close" onClick={closeModal}>✕</button>
              </div>

              <div className="daily-modal-body">

                {expandedTable === "appointments" && (
                  <div className="daily-table-scroll">
                    <div className="daily-th daily-cols-appointments">
                      <span>Date</span><span>Patient Name</span><span>Clinic</span>
                      <span>Associate</span><span>Reason</span><span>Status</span>
                    </div>
                    {pagedSlice(appointments).map((r, i) => (
                      <div key={i} className={`daily-td daily-cols-appointments${r.status === "rejected" ? " daily-row-rejected" : ""}`}>
                        <span>{r.date}</span>
                        <span>{r.patientName}</span>
                        <span>{r.clinic}</span>
                        <span>{r.associate}</span>
                        <span>{r.reason}</span>
                        <span>{r.status}</span>
                      </div>
                    ))}
                  </div>
                )}

                {expandedTable === "procedures" && (
                  <div className="daily-table-scroll">
                    <div className="daily-th daily-cols-procedures">
                      <span>Date</span><span>Patient Name</span><span>Clinic</span>
                      <span>Procedure</span><span>Total Bill</span><span>Total Paid</span>
                    </div>
                    {pagedSlice(procedures).map((r, i) => (
                      <div key={i} className="daily-td daily-cols-procedures">
                        <span>{r.date}</span>
                        <span>{r.patientName}</span>
                        <span>{r.clinic}</span>
                        <span>{r.procedure}</span>
                        <span>{r.totalBill}</span>
                        <span>{r.totalPaid}</span>
                      </div>
                    ))}
                  </div>
                )}

                {expandedTable === "balances" && (
                  <div className="daily-table-scroll">
                    <div className="daily-th daily-cols-overpayment">
                      <span>Date</span><span>Patient</span><span>Total Bill</span>
                      <span>Amount Paid</span><span>Balance</span><span>Status</span>
                    </div>
                    {pagedSlice(outstandingBalances).map((r, i) => (
                      <div key={i} className="daily-td daily-cols-overpayment">
                        <span>{r.date}</span>
                        <span>{r.patient}</span>
                        <span>₱ {Number(r.totalBill || 0).toLocaleString()}</span>
                        <span>₱ {Number(r.amountPaid || 0).toLocaleString()}</span>
                        <span style={{ color: "#dc2626", fontWeight: 700 }}>₱ {Number(r.balance || 0).toLocaleString()}</span>
                        <span>{r.status}</span>
                      </div>
                    ))}
                  </div>
                )}

                {expandedTable === "collections" && (
                  <div className="daily-table-scroll">
                    <div className="daily-th daily-cols-6-even">
                      <span>Date</span><span>Patient</span><span>Clinic</span>
                      <span>Payment Type</span><span>Amount</span><span>Remarks</span>
                    </div>
                    {pagedSlice(collections).map((r, i) => (
                      <div key={i} className="daily-td daily-cols-6-even">
                        <span>{r.date}</span>
                        <span>{r.patient}</span>
                        <span>{r.clinic}</span>
                        <span>{r.paymentType}</span>
                        <span>{r.amount}</span>
                        <span>{r.remarks}</span>
                      </div>
                    ))}
                  </div>
                )}

                {expandedTable === "expenses" && (
                  <div className="daily-table-scroll">
                    <div className="daily-th daily-cols-expenses">
                      <span>Date</span><span>Clinic</span><span>Description</span>
                      <span>Type</span><span>Category</span><span>Amount</span>
                    </div>
                    {pagedSlice(expenses).map((r, i) => (
                      <div key={i} className="daily-td daily-cols-expenses">
                        <span>{r.date}</span>
                        <span>{r.clinic}</span>
                        <span>{r.description}</span>
                        <span>{r.type}</span>
                        <span>{r.category}</span>
                        <span>₱ {Number(r.amount || 0).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                )}

              </div>

              <div className="daily-modal-footer">
                <span className="daily-modal-page-info">
                  {modalTotal > 0
                    ? `Showing ${modalStart + 1}–${Math.min(modalEnd, modalTotal)} of ${modalTotal}`
                    : "No records"}
                </span>
                {renderModalPagination()}
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default Daily;