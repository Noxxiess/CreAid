import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Topbar.css";

function Topbar() {
  const [showNotif, setShowNotif] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showProfile, setShowProfile] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const navigate = useNavigate();
  const role = localStorage.getItem("role");

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest(".icon-wrapper")) {
        setShowNotif(false);
        setShowProfile(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("role");
    navigate("/");
  };

  return (
    <>
      <header className="topbar">

        <div className="topbar-left">
          <div className="search-box">
            <span className="search-icon">🔍</span>
            <input type="text" placeholder="Search Patient Here" />
          </div>
          <button
            className="new-patient-btn"
            onClick={() => navigate("/patients/new")}
          >
            + New Patient
          </button>
        </div>

        <div className="topbar-right">

          <select className="branch-select">
            <option>All</option>
            <option>Paombong Branch</option>
            <option>Hagonoy Branch</option>
          </select>

          {/* NOTIFICATIONS */}
          <div className="icon-wrapper">
            <button
              className="icon-btn notif-btn"
              onClick={() => {
                setShowNotif(!showNotif);
                setShowProfile(false);
              }}
            >
              🔔
              <span className="dot"></span>
            </button>

            {showNotif && (
              <div className="dropdown notif-dropdown">
                <h4>Notifications</h4>
                <div className="notif-list">
                  <div className="notif-item">No new notifications</div>
                </div>
              </div>
            )}
          </div>

          {/* PROFILE */}
          <div className="icon-wrapper">
            <button
              className="profile-btn"
              onClick={() => {
                setShowProfile(!showProfile);
                setShowNotif(false);
              }}
            >
              <span className="avatar-chip">{role?.charAt(0).toUpperCase()}</span>
              <span className="username">{role}</span>
              <span className="chevron">{showProfile ? "▲" : "▼"}</span>
            </button>

            {showProfile && (
              <div className="dropdown profile-dropdown">
                <div className="dropdown-user-info">
                  <span className="avatar-chip large">{role?.charAt(0).toUpperCase()}</span>
                  <div>
                    <p className="dropdown-role">{role}</p>
                    <p className="dropdown-sub">Logged in</p>
                  </div>
                </div>
                <hr className="dropdown-divider" />
                <div
                  className="dropdown-item"
                  onClick={() => {
                    setShowProfile(false);
                    navigate("/myaccount");
                  }}
                >
                  👤 My Account
                </div>
                <div
                  className="dropdown-item logout"
                  onClick={() => {
                    setShowProfile(false);
                    setShowLogoutConfirm(true);
                  }}
                >
                  🚪 Logout
                </div>
              </div>
            )}
          </div>

        </div>
      </header>

      {/* LOGOUT MODAL — rendered outside header via fragment */}
      {showLogoutConfirm && (
        <div
          className="modal-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowLogoutConfirm(false);
          }}
        >
          <div className="modal">
            <h3>Log Out</h3>
            <p>Are you sure you want to log out?</p>
            <div className="modal-actions">
              <button
                className="btn cancel"
                onClick={() => setShowLogoutConfirm(false)}
              >
                Cancel
              </button>
              <button
                className="btn confirm"
                onClick={handleLogout}
              >
                Yes, Log Out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Topbar;