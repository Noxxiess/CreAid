import { useState } from "react";
import Sidebar from "../../components/Sidebar";
import Topbar from "../../components/Topbar";
import "../../styles/reports.css";

function AppointmentsReport() {
  const [filters, setFilters] = useState({
    associates: "All Associates",
    clinic: "All Clinics",
    status: "All",
    from: "",
    to: "",
    patient: "",
  });

  // backend-ready state stubs
  const [rows] = useState([]);
  const [rowsCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(rowsCount / 20) || 1;

  const renderPagination = () => {
    const pages = [];
    const range = [];

    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
        range.push(i);
      }
    }

    let prev = null;
    for (const page of range) {
      if (prev !== null && page - prev > 1) {
        pages.push(<span key={`e-${page}`} className="page-ellipsis">…</span>);
      }
      pages.push(
        <button
          key={page}
          className={`page-btn ${currentPage === page ? "active" : ""}`}
          onClick={() => setCurrentPage(page)}
        >
          {page}
        </button>
      );
      prev = page;
    }

    return pages;
  };

  const getStatusBadge = (status) => {
    const s = (status || "").toLowerCase();
    if (s === "confirmed") return <span className="badge badge-confirmed">Confirmed</span>;
    if (s === "finished") return <span className="badge badge-finished">Finished</span>;
    if (s === "cancelled") return <span className="badge badge-cancelled">Cancelled</span>;
    return <span className="badge badge-pending">{status}</span>;
  };

  return (
    <div className="admin-container">
      <Sidebar />
      <div className="admin-main">
        <Topbar />
        <div className="dashboard-content">
          <div className="appointments-container">

            {/* TITLE */}
            <div className="page-title-row">
              <h2 className="page-main-title">Patient Appointments Report</h2>
              <p className="page-subtitle">Detailed clinics' appointment report.</p>
            </div>

            {/* FILTERS ROW 1 */}
            <div className="reports-filters">
              <div className="filter-item wide">
                <label>Associates</label>
                <select
                  value={filters.associates}
                  onChange={(e) => setFilters({ ...filters, associates: e.target.value })}
                >
                  <option>All Associates</option>
                </select>
              </div>
              <div className="filter-item wide">
                <label>Clinic</label>
                <select
                  value={filters.clinic}
                  onChange={(e) => setFilters({ ...filters, clinic: e.target.value })}
                >
                  <option>All Clinics</option>
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
            </div>

            {/* FILTERS ROW 2 */}
            <div className="reports-filters" style={{ marginTop: "-8px" }}>
              <div className="filter-item wide">
                <label>Status</label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                >
                  <option>All</option>
                  <option>Confirmed</option>
                  <option>Finished</option>
                  <option>Cancelled</option>
                  <option>Pending</option>
                </select>
              </div>
              <div className="filter-item search-item">
                <label>Patient</label>
                <input
                  type="text"
                  placeholder="Search here"
                  value={filters.patient}
                  onChange={(e) => setFilters({ ...filters, patient: e.target.value })}
                />
              </div>
              <button className="btn-show">Show Report</button>
            </div>

            {/* META ROW */}
            <div className="report-meta-row">
              <p className="rows-count">
                Rows Count: <span>{rowsCount}</span>
              </p>
            </div>

            {/* TABLE */}
            <div className="report-table-wrap">
              <table className="report-table">
                <thead>
                  <tr>
                    <th>Appointment Date/Time</th>
                    <th>Patient</th>
                    <th>Clinic</th>
                    <th>Associate</th>
                    <th>Appointment Reason</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ textAlign: "center", color: "#bbb", fontStyle: "italic", padding: "20px" }}>
                        No records found
                      </td>
                    </tr>
                  ) : (
                    rows.map((row, i) => (
                      <tr key={i}>
                        <td>{row.dateTime}</td>
                        <td>{row.patient}</td>
                        <td>{row.clinic}</td>
                        <td>{row.associate}</td>
                        <td>{row.reason}</td>
                        <td>{getStatusBadge(row.status)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* PAGINATION */}
            <div className="report-pagination">
              <button
                className="page-btn"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
              >
                « Previous
              </button>
              {renderPagination()}
              <button
                className="page-btn"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
              >
                Next »
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

export default AppointmentsReport;
