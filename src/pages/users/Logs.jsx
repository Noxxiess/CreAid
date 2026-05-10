
import { useEffect, useState } from "react";
import Sidebar from "../../components/Sidebar";
import Topbar from "../../components/Topbar";
import "../../styles/users.css";

function Logs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // ✅ PLACEHOLDER FOR BACKEND API
    // setLoading(true);
    // fetch("/api/logs")
    //   .then(res => res.json())
    //   .then(data => setLogs(data))
    //   .catch(err => console.error(err))
    //   .finally(() => setLoading(false));
  }, []);

  return (
    <div className="admin-container">
      <Sidebar />

      <div className="admin-main">
        <Topbar />

        <div className="users-container">
          <div className="users-header">
            <h2>User Logs</h2>
          </div>

          <div className="users-table-container">
            <table className="users-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Username</th>
                  <th>Role</th>
                  <th>IP Address</th>
                  <th>Action</th>
                  <th>Date / Time</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: "center" }}>
                      Loading logs...
                    </td>
                  </tr>
                ) : logs.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: "center" }}>
                      No logs found
                    </td>
                  </tr>
                ) : (
                  logs.map((log, index) => (
                    <tr key={log.id}>
                      <td>{index + 1}</td>
                      <td>{log.username}</td>
                      <td>{log.role}</td>
                      <td>{log.ip}</td>
                      <td>{log.action}</td>
                      <td>{log.date}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Logs;
``
