import { useEffect, useState } from "react";
import "../../styles/appointments.css";
import { getAppointmentsReportApi } from "../../api/reports";

const PAGE_SIZE = 20;

const Appointments = () =>
{
  const [filters, setFilters] = useState(
  {
    associates: "All Associates",
    clinic: "All Clinics",
    status: "All",
    from: "",
    to: "",
    patient: "",
  });

  const [rows, setRows] = useState([]);
  const [rowsCount, setRowsCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(rowsCount / PAGE_SIZE) || 1;
  const pageStart = (currentPage - 1) * PAGE_SIZE;
  const visibleRows = rows.slice(pageStart, pageStart + PAGE_SIZE);

  useEffect(() =>
  {
    loadAppointments();
  }, []);

  const loadAppointments = async () =>
  {
    try
    {
      const response = await getAppointmentsReportApi(filters);
      setRows(response.appointments || []);
      setRowsCount(response.rowsCount || 0);
      setCurrentPage(1);
      console.log("APPOINTMENTS RESPONSE:", response);
    }
    catch (error)
    {
      console.error(error);
    }
  };

  const renderPagination = () =>
  {
    const range = [];
    for (let i = 1; i <= totalPages; i++)
    {
      if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1))
      {
        range.push(i);
      }
    }

    const pages = [];
    let prev = null;
    for (const page of range)
    {
      if (prev !== null && page - prev > 1)
      {
        pages.push(<span key={`e-${page}`} className="appoint-page-ellipsis">…</span>);
      }
      pages.push(
        <button
          key={page}
          className={`appoint-page-btn${currentPage === page ? " appoint-page-active" : ""}`}
          onClick={() => setCurrentPage(page)}
        >{page}</button>
      );
      prev = page;
    }

    return pages;
  };

  const getStatusBadge = (status) =>
  {
    const s = (status || "").trim().toLowerCase();

    if (s === "scheduled") return <span className="appoint-badge appoint-badge-confirmed">Scheduled</span>;
    if (s === "completed") return <span className="appoint-badge appoint-badge-finished">Completed</span>;
    if (s === "cancelled") return <span className="appoint-badge appoint-badge-cancelled">Cancelled</span>;
    if (s === "pending_verification") return <span className="appoint-badge appoint-badge-pending">Pending Verification</span>;
    if (s === "no_show") return <span className="appoint-badge appoint-badge-cancelled">No Show</span>;
    if (s === "rejected") return <span className="appoint-badge appoint-badge-cancelled">Rejected</span>;

    return <span className="appoint-badge appoint-badge-pending">{status}</span>;
  };

  return (
    <div className="appoint-root">
      <div className="appoint-page-header">
        <h2>Patient Appointments Report</h2>
      </div>
      <div className="appoint-page-container">
        <div className="appoint-filter-container">
          <div className="appoint-filter-row">
            <div className="appoint-filter-group">
              <span className="appoint-filter-label">Associates</span>
              <select value={filters.associates} onChange={(e) => setFilters({ ...filters, associates: e.target.value })}>
                <option>All Associates</option>
              </select>
            </div>
            <div className="appoint-filter-group">
              <span className="appoint-filter-label">Clinic</span>
              <select value={filters.clinic} onChange={(e) => setFilters({ ...filters, clinic: e.target.value })}>
                <option>All Clinics</option>
                <option>Hagonoy</option>
                <option>Paombong</option>
              </select>
            </div>
            <div className="appoint-filter-group">
              <span className="appoint-filter-label">Date From</span>
              <input type="date" value={filters.from} onChange={(e) => setFilters({ ...filters, from: e.target.value })} />
            </div>
            <div className="appoint-filter-group">
              <span className="appoint-filter-label">Date To</span>
              <input type="date" value={filters.to} onChange={(e) => setFilters({ ...filters, to: e.target.value })} />
            </div>
          </div>
          <div className="appoint-filter-row">
            <div className="appoint-filter-group">
              <span className="appoint-filter-label">Status</span>
              <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
                <option value="All">All</option>
                <option value="scheduled">Scheduled</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
                <option value="pending_verification">Pending Verification</option>
                <option value="no_show">No Show</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            <div className="appoint-filter-group appoint-filter-grow">
              <span className="appoint-filter-label">Patient</span>
              <input type="text" placeholder="Search here…" value={filters.patient} onChange={(e) => setFilters({ ...filters, patient: e.target.value })} />
            </div>
            <button className="appoint-btn-show" onClick={loadAppointments}>Show Report</button>
          </div>
        </div>
        <div className="appoint-meta-row">
          <span className="appoint-meta-item">Rows Count: <strong>{rowsCount}</strong></span>
        </div>
        <div className="appoint-table-wrap">
          <div className="appoint-th">
            <span>Appointment Date/Time</span>
            <span>Patient</span>
            <span>Clinic</span>
            <span>Associate</span>
            <span>Appointment Reason</span>
            <span>Status</span>
          </div>
          {visibleRows.length === 0
            ? <div className="appoint-empty">No records found</div>
            : visibleRows.map((row, i) => (
              <div key={i} className="appoint-td">
                <span>{row.dateTime}</span>
                <span>{row.patient}</span>
                <span>{row.clinic}</span>
                <span>{row.associate}</span>
                <span>{row.reason}</span>
                <span>{getStatusBadge(row.status)}</span>
              </div>
            ))
          }
        </div>
        <div className="appoint-pagination">
          <span className="appoint-page-info">
            {rowsCount > 0
              ? `Showing ${pageStart + 1}–${Math.min(pageStart + PAGE_SIZE, rowsCount)} of ${rowsCount}`
              : "No records"}
          </span>
          <div className="appoint-page-controls">
            <button
              className={`appoint-page-btn${currentPage === 1 ? " appoint-page-disabled" : ""}`}
              onClick={() => currentPage > 1 && setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
            >‹</button>
            {renderPagination()}
            <button className={`appoint-page-btn${currentPage >= totalPages ? " appoint-page-disabled" : ""}`} onClick={() => currentPage < totalPages && setCurrentPage(currentPage + 1)} disabled={currentPage >= totalPages}>›</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Appointments;