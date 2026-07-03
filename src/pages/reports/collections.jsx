import { useEffect, useState } from "react";
import "../../styles/collections.css";
import { getCollectionsReportApi } from "../../api/reports";

const PAGE_SIZE = 5;

function Collections()
{
  const [filters, setFilters] = useState({
    associates: "All Associates",
    clinic: "All Clinics",
    laboratory: "All Laboratories",
    paymentType: "All Payment Types",
    from: "",
    to: "",
    patient: "",
  });

  const [rows, setRows] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [rowsCount, setRowsCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(rowsCount / PAGE_SIZE) || 1;

  useEffect(() =>
  {
    loadCollections();
  }, []);

  async function loadCollections()
  {
    try
    {
      const response = await getCollectionsReportApi(filters);
      setRows(response.collections || []);
      setTotalAmount(response.totalAmount || 0);
      setRowsCount(response.rowsCount || 0);
      setCurrentPage(1);
    }
    catch (error)
    {
      console.error(error);
    }
  }

  function renderPagination()
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
        pages.push(<span key={`e-${page}`} className="col-page-ellipsis">…</span>);
      }
      pages.push(
        <button
          key={page}
          className={`col-page-btn${currentPage === page ? " col-page-active" : ""}`}
          onClick={() => setCurrentPage(page)}
        >{page}</button>
      );
      prev = page;
    }

    return pages;
  }

  const pageStart = (currentPage - 1) * PAGE_SIZE;
  const visibleRows = rows.slice(pageStart, pageStart + PAGE_SIZE);

  return (
    <div className="col-root">
      <div className="col-page-header">
        <h2>Collections Report</h2>
      </div>
      <div className="col-page-container">
        <div className="col-filter-container">
          <div className="col-filter-row">
            <div className="col-filter-group">
              <span className="col-filter-label">Associates</span>
              <select value={filters.associates} onChange={(e) => setFilters({ ...filters, associates: e.target.value })}>
                <option>All Associates</option>
              </select>
            </div>
            <div className="col-filter-group">
              <span className="col-filter-label">Clinic</span>
              <select value={filters.clinic} onChange={(e) => setFilters({ ...filters, clinic: e.target.value })}>
                <option>All Clinics</option>
                <option>Hagonoy</option>
                <option>Paombong</option>
              </select>
            </div>
            <div className="col-filter-group">
              <span className="col-filter-label">Laboratory</span>
              <select value={filters.laboratory} onChange={(e) => setFilters({ ...filters, laboratory: e.target.value })}>
                <option>All Laboratories</option>
              </select>
            </div>
            <div className="col-filter-group">
              <span className="col-filter-label">Payment Type</span>
              <select value={filters.paymentType} onChange={(e) => setFilters({ ...filters, paymentType: e.target.value })}>
                <option>All Payment Types</option>
                <option value="cash">Cash</option>
                <option value="gcash">GCash</option>
                <option value="visa">Visa</option>
                <option value="mastercard">Mastercard</option>
              </select>
            </div>
          </div>
          <div className="col-filter-row">
            <div className="col-filter-group">
              <span className="col-filter-label">Date From</span>
              <input type="date" value={filters.from} onChange={(e) => setFilters({ ...filters, from: e.target.value })} />
            </div>
            <div className="col-filter-group">
              <span className="col-filter-label">Date To</span>
              <input type="date" value={filters.to} onChange={(e) => setFilters({ ...filters, to: e.target.value })} />
            </div>
            <div className="col-filter-group col-filter-grow">
              <span className="col-filter-label">Patient</span>
              <input type="text" placeholder="Search here…" value={filters.patient} onChange={(e) => setFilters({ ...filters, patient: e.target.value })} />
            </div>
            <button className="col-btn-show" onClick={loadCollections}>Show Report</button>
            <button className="col-btn-export">Export Report ▾</button>
          </div>
        </div>
        <div className="col-meta-row">
          <span className="col-meta-item">Total Amount: <strong>₱ {Number(totalAmount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong></span>
          <span className="col-meta-item">Rows Count: <strong>{rowsCount}</strong></span>
        </div>
        <div className="col-table-wrap">
          <div className="col-th">
            <span>Date</span>
            <span>Patient</span>
            <span>Clinic</span>
            <span>Payment Type</span>
            <span>Reference #</span>
            <span>Amount</span>
            <span>Remarks</span>
          </div>
          {visibleRows.length === 0
            ? <div className="col-empty">No records found</div>
            : visibleRows.map((row, i) => (
              <div key={i} className="col-td">
                <span>{row.date}</span>
                <span>{row.patient}</span>
                <span>{row.clinic}</span>
                <span>{row.paymentType}</span>
                <span>{row.referenceNo}</span>
                <span>₱ {Number(row.amount || 0).toLocaleString()}</span>
                <span>{row.remarks ?? "—"}</span>
              </div>
            ))
          }
        </div>
        <div className="col-pagination">
          <span className="col-page-info">
            {rowsCount > 0
              ? `Showing ${pageStart + 1}–${Math.min(pageStart + PAGE_SIZE, rowsCount)} of ${rowsCount}`
              : "No records"}
          </span>
          <div className="col-page-controls">
            <button className={`col-page-btn${currentPage === 1 ? " col-page-disabled" : ""}`} onClick={() => currentPage > 1 && setCurrentPage(currentPage - 1)}disabled={currentPage === 1}>‹</button>
            {renderPagination()}
            <button className={`col-page-btn${currentPage >= totalPages ? " col-page-disabled" : ""}`} onClick={() => currentPage < totalPages && setCurrentPage(currentPage + 1)}disabled={currentPage >= totalPages}>›</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Collections;