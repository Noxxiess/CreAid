import { useEffect, useState } from "react";
import "../../styles/logs.css";

const PAGE_SIZE = 10;

function Logs() 
{
  const [logs, setLogs] = useState([]);
  const [totalLogs, setTotalLogs] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => 
  {
    fetchLogs();
  }, [page]);

  async function fetchLogs() 
  {
    setLoading(true);
    // waiting sa backend
    setLoading(false);
  }

  const totalPages = Math.ceil(totalLogs / PAGE_SIZE);
  const pageStart = (page - 1) * PAGE_SIZE + 1;
  const pageEnd = Math.min(page * PAGE_SIZE, totalLogs);
  const pageNumbers = Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1);

  return (
    <div className="logs-content">
      <div className="logs-page-header">
        <h2>User Logs</h2>
        <span className="logs-total-badge">{totalLogs} total logs</span>
      </div>

      <div className="logs-page-container">
        <div className="logs-table">
          <div className="logs-table-header">
            <span>#</span>
            <span>Username</span>
            <span>Role</span>
            <span>IP Address</span>
            <span>Action</span>
            <span>Date / Time</span>
          </div>

          {loading ? (
            <div className="logs-empty">Loading logs...</div>
          ) : logs.length === 0 ? (
            <div className="logs-empty">No logs found.</div>
          ) : (
            logs.map((log, i) => (
              <div key={log.id} className="logs-table-row">
                <span className="log-number">{i + 1}</span>
                <span className="logs-link">{log.username}</span>
                <span>
                  <span className={`log-role-badge log-role-${log.role?.toLowerCase()}`}>
                    {log.role}
                  </span>
                </span>
                <span className="log-ip">{log.ip}</span>
                <span>
                  <span className={`log-badge log-badge-${log.action?.toLowerCase()}`}>
                    {log.action}
                  </span>
                </span>
                <span className="logs-text-muted">
                  {new Date(log.created_at).toLocaleString()}
                </span>
              </div>
            ))
          )}
        </div>

        <div className="logs-footer">
          <span className="logs-page-info">
            {totalLogs > 0 ? `Showing ${pageStart}–${pageEnd} of ${totalLogs} logs` : "No logs"}
          </span>
          <div className="logs-pagination">
            <button className={`logs-pagination-btn ${page === 1 ? "logs-pagination-disabled" : ""}`} onClick={() => page > 1 && setPage(page - 1)} disabled={page === 1}>
              ‹
            </button>
            {pageNumbers.map((n) => (
              <button key={n} className={`logs-pagination-btn ${n === page ? "logs-pagination-active" : ""}`} onClick={() => setPage(n)}>
                {n}
              </button>
            ))}
            <button className={`logs-pagination-btn ${page >= totalPages ? "logs-pagination-disabled" : ""}`} onClick={() => page < totalPages && setPage(page + 1)} disabled={page >= totalPages}>
              ›
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Logs;