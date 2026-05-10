import { useState } from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import logo from "../assets/logo.png";
import "../styles/Sidebar.css";

function Sidebar() {
  const { permissions = {} } = useAuth(); 
  const [openUsers, setOpenUsers] = useState(false);
  const [openReports, setOpenReports] = useState(false);
  

  const navClass = ({ isActive }) =>
    isActive ? "nav-item active" : "nav-item";

  return (
    <div className="sidebar">
      <img src={logo} alt="Logo" className="sidebar-logo" />

      <nav className="sidebar-nav">
        <NavLink to="/dashboard" className={navClass}>
          Dashboard
        </NavLink>

        {permissions.calendar?.includes("view") && (
          <NavLink to="/calendar" className={navClass}>
            Calendar
          </NavLink>
        )}


        {permissions.users?.includes("view") && (
          <>   
            <div className="nav-item submenu-toggle" onClick={() => setOpenUsers(!openUsers)}>
              Users ▾
            </div>

            {openUsers && (
              <div className="submenu">
                <NavLink to="/users" className={navClass}>
                  All Users
                </NavLink>

                <NavLink to="/users/logs" className={navClass}>
                  User Logs
                </NavLink>
              </div>
            )}
          </>
        )}


        {permissions.payments?.includes("view") && (
          <NavLink to="/payments" className={navClass}>
            Payment
          </NavLink>
        )}

        {permissions.reports?.includes("view") && 
        (
          <>
            <div
              className="nav-item submenu-toggle"
              onClick={() => setOpenReports(!openReports)}
            >
              Reports ▾
            </div>

            {openReports && (
              <div className="submenu">
                <NavLink to="/reports" className={navClass}>
                  Summary
                </NavLink>

                <NavLink to="/reports/daily" className={navClass}>
                  Daily Sales
                </NavLink>

                <NavLink to="/reports/collections" className={navClass}>
                  Collections
                </NavLink>

                <NavLink to="/reports/expenses" className={navClass}>
                  Expenses & Bills
                </NavLink>

                <NavLink to="/reports/appointments" className={navClass}>
                  Patient Appointments
                </NavLink>
              </div>
            )}
          </>
        )}

        {permissions.system?.includes("view") && (
          <NavLink to="/system" className={navClass}>
            System Data
          </NavLink>
        )}

        {permissions.inbox?.includes("view") && (
          <NavLink to="/inbox" className={navClass}>
            Inbox
          </NavLink>
        )}
      </nav>
    </div>
  );
}

export default Sidebar;