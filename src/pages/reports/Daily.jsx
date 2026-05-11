
import Sidebar from "../../components/Sidebar";
import Topbar from "../../components/Topbar";
//import "../../styles/daily.css";

function Daily() 
{
  return (
    <div className="admin-container">
      <Sidebar />

      <div className="admin-main">
        <Topbar />

        <div className="dashboard-content">
          <div className="daily-container">

            {/* HEADER */}
            <h2 className="daily-title">
              Daily Sales Report
            </h2>

            {/* FILTERS */}
            <div className="daily-filters">
              <div className="daily-item">
                <label>Clinic</label>
                <select>
                  <option>All Clinics</option>
                </select>
              </div>

              <div className="daily-item">
                <label>Date From</label>
                <input type="date" />
              </div>

              <div className="daily-item">
                <label>Date To</label>
                <input type="date" />
              </div>

              <button className="btn-show">Show</button>
            </div>

            {/* TOP CARDS */}
            <div className="daily-charts">

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
            <div className="daily-table">
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
            <div className="daily-table">
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
            <div className="daily-table">
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
            <div className="daily-table">
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
            <div className="daily-footer">
              <button className="btn-print">Print</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Daily;
