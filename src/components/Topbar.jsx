import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Topbar.css";

function Topbar() {
  const [showNotif, setShowNotif] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showProfile, setShowProfile] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    // future API call
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("role"); // ✅ FIX
    navigate("/");
  };

  const role = localStorage.getItem("role");

  return (
    <>
      <header className="topbar">

        <div className="topbar-left">
          <div className="search-box">
            🔍
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

          {/* 🔔 NOTIFICATIONS */}
          <div className="icon-wrapper">
            <span
              className="icon-btn notification"
              onClick={() => {
                setShowNotif(!showNotif);
                setShowProfile(false);
              }}
            >
              🔔
              <span className="dot"></span>
            </span>

            {showNotif && (
              <div className="dropdown notif-dropdown">
                <h4>Notifications</h4>
                <div className="notif-list">
                  <div className="notif-item">Notification placeholder</div>
                </div>
              </div>
            )}
          </div>

          {/* 👤 PROFILE */}
          <div className="icon-wrapper">
            <div
              className="profile"
              onClick={() => {
                setShowProfile(!showProfile);
                setShowNotif(false);
              }}
            >
              <span className="username">{role}</span>
              <span className="icon-btn">👤</span>
            </div>

            {showProfile && (
              <div className="dropdown profile-dropdown">
                <div className="dropdown-item">Edit Profile</div>
                <div className="dropdown-item">Settings</div>

                <div
                  className="dropdown-item logout"
                  onClick={() => {
                    setShowProfile(false);
                    setShowLogoutConfirm(true);
                  }}
                >
                  Logout
                </div>
              </div>
            )}
          </div>

        </div>
      </header>

      {/* ✅ MODAL */}
      {showLogoutConfirm && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Log Out</h3>
            <p>Are you sure you want to log out?</p>

            <div className="modal-actions">
              <button
                className="btn cancel"
                onClick={() => setShowLogoutConfirm(false)}
              >
                No
              </button>

              <button
                className="btn confirm"
                onClick={handleLogout}
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Topbar;