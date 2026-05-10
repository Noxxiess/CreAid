
import Sidebar from "../../components/Sidebar";
import Topbar from "../../components/Topbar";
import "../../styles/reports.css";

function Daily() {
  return (
    <div className="admin-container">
      <Sidebar />

      <div className="admin-main">
        <Topbar />

        <div className="dashboard-content">
          <div className="reports-container">

            {/* HEADER */}
            <h2 className="reports-title">
              Daily Sales Report
            </h2>

            {/* FILTERS */}
            <div className="reports-filters">
              <div className="filter-item">
                <label>Clinic</label>
                <select>
                  <option>All Clinics</option>
                </select>
              </div>

              <div className="filter-item">
                <label>Date From</label>
                <input type="date" />
              </div>

              <div className="filter-item">
                <label>Date To</label>
                <input type="date" />
              </div>

              <button className="btn-show">Show</button>
            </div>

            {/* TOP CARDS */}
            <div className="reports-charts">

              <div className="chart-card">
                <p>Appointments</p>
                <h3>0</h3>
              </div>

              <div className="chart-card">
                <p>Rebooked</p>
                <h3>0</h3>
              </div>

            </div>

            {/* APPOINTMENTS TABLE */}
            <div className="report-table">
              <h3>Patient Appointments</h3>
              <table className="users-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Patient Name</th>
                    <th>Clinic</th>
                    <th>Associate</th>
                    <th>Reason</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td colSpan="6" style={{ textAlign: "center" }}>
                      No data available
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* PROCEDURES */}
            <div className="report-table">
              <h3>Patient Procedures</h3>
              <table className="users-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Patient</th>
                    <th>Clinic</th>
                    <th>Procedure</th>
                    <th>Total Bill</th>
                    <th>Total Paid</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td colSpan="6" style={{ textAlign: "center" }}>
                      No data available
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* COLLECTIONS */}
            <div className="report-table">
              <h3>Collections</h3>
              <table className="users-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Patient</th>
                    <th>Payment Type</th>
                    <th>Reference</th>
                    <th>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td colSpan="5" style={{ textAlign: "center" }}>
                      No data available
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* EXPENSES */}
            <div className="report-table">
              <h3>Expenses & Bills</h3>
              <table className="users-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Clinic</th>
                    <th>Description</th>
                    <th>Category</th>
                    <th>Method</th>
                    <th>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td colSpan="6" style={{ textAlign: "center" }}>
                      No data available
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* FOOTER */}
            <div className="reports-footer">
              <button className="btn-print">Print</button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

export default Daily;
