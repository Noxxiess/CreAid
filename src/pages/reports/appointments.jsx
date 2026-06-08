import { useState } from "react";
import "../../styles/collections.css";

const rows = [];
const totalAmount = "₱0.00";
const rowsCount = 0;

function Collections() 
{
  const [filters, setFilters] = useState({
    associates:  "All Associates",
    clinic:      "All Clinics",
    laboratory:  "All Laboratories",
    paymentType: "All Payment Types",
    from:        "",
    to:          "",
    patient:     "",
  });

  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(rowsCount / 20) || 1;

  const renderPagination = () => 
  {
    const pages = [];
    const range = [];

    for (let i = 1; i <= totalPages; i++) 
    {
      if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) 
      {
        range.push(i);
      }
    }

    let prev = null;

    for (const page of range) 
    {
      if (prev !== null && page - prev > 1) 
      {
        pages.push(<span key={`e-${page}`} className="page-ellipsis">…</span>);
      }
      pages.push(
        <button key={page} className={`page-btn ${currentPage === page ? "active" : ""}`} onClick={() => setCurrentPage(page)}>
          {page}
        </button>
      );
      prev = page;
    }

    return pages;
  };

  return (
    <div className="users-content">
      <div className="users-page-header">
        <h2>Patients Appointment Report</h2>
      </div>

      <div className="users-page-container">
        <div className="users-filter-container">
          <div className="filter-left">
            <div className="filter-row">
              <span className="filter-label">Associates</span>
              <select value={filters.associates} onChange={(e) => setFilters({ ...filters, associates: e.target.value })}>
                <option>All Associates</option>
              </select>
              <span className="filter-label">Clinic</span>
              <select value={filters.clinic} onChange={(e) => setFilters({ ...filters, clinic: e.target.value })}>
                <option>All Clinics</option>
                <option>Hagonoy</option>
                <option>Paombong</option>
              </select>
            </div>

            <div className="filter-row">
              <span className="filter-label">Date From</span>
              <input type="date" value={filters.from} onChange={(e) => setFilters({ ...filters, from: e.target.value })}/>
              <span className="filter-label">Date To</span>
              <input type="date" value={filters.to} onChange={(e) => setFilters({ ...filters, to: e.target.value })}/>
            </div>
          </div>
        </div>


        <div className="report-meta-row">
          <p className="total-amount">Total Amount: <span>{totalAmount}</span></p>
          <p className="rows-count">Rows Count: <span>{rowsCount}</span></p>
        </div>

        <div className="report-table-wrap">
          <table className="report-table">
            <thead>
              <tr>
                <th>Date</th>
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
                  <td colSpan={6} className="table-empty">No records found</td>
                </tr>
              ) : (
                rows.map((row, i) => (
                  <tr key={i}>
                    <td>{row.date}</td>
                    <td>{row.patient}</td>
                    <td>{row.clinic}</td>
                    <td>{row.referenceNo}</td>
                    <td>{row.amount}</td>
                    <td>{row.remarks ?? "-"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="report-pagination">
          <button className="page-btn" disabled={currentPage === 1} onClick={() => setCurrentPage((p) => p - 1)}>
            « Previous
          </button>

          {renderPagination()}
          
          <button className="page-btn" disabled={currentPage === totalPages} onClick={() => setCurrentPage((p) => p + 1)}>
            Next »
          </button>
        </div>

      </div>
    </div>
  );
}

export default Collections;