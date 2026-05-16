import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Topbar.css";

const BRANCHES = ["All", "Paombong Branch", "Hagonoy Branch"];

function useWindowWidth() 
{
  const [width, setWidth] = useState(window.innerWidth);

  useEffect(() => 
  {
    const handler = () => setWidth(window.innerWidth);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  return width;
}

function Topbar({ onMobileMenuClick, isMobile }) 
{
  const [showNotif, setShowNotif] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showOverflow, setShowOverflow] = useState(false);
  const [branch, setBranch] = useState("All");
  const navigate = useNavigate();
  const role = localStorage.getItem("role");
  const width = useWindowWidth();
  const branchHidden = width <= 900;
  const notifHidden  = width <= 600;
  const showOverflowBtn = branchHidden;

  useEffect(() => 
  {
    const handleClickOutside = (e) => 
    {
      if (!e.target.closest(".icon-wrapper")) 
      {
        setShowNotif(false);
        setShowProfile(false);
        setShowOverflow(false);
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
      
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => 
  {
    localStorage.removeItem("role");
    navigate("/");
  };

  const closeAll = () => 
  {
    setShowNotif(false);
    setShowProfile(false);
    setShowOverflow(false);
  };

  return (
    <>
      <header className="topbar">
        <div className="topbar-left">
        
          {isMobile && (
            <button className="hamburger-btn" onClick={onMobileMenuClick} title="Menu">
              <span /><span /><span />
            </button>
          )}
          <div className="search-box">
            <span className="search-icon">🔍</span>
            <input type="text" placeholder="Search Patient Here" />
          </div>
          <button className="new-patient-btn" onClick={() => navigate("/patients/new")}>
            <span>+ </span>
            <span className="btn-label">New Patient</span>
          </button>
        </div>

        <div className="topbar-right">
          {!branchHidden && (
            <select className="branch-select" value={branch} onChange={(e) => setBranch(e.target.value)}>
              {BRANCHES.map(b => <option key={b}>{b}</option>)}
            </select>
          )}

          {!notifHidden && (
            <div className="icon-wrapper notif-btn-wrapper">
              <button className="icon-btn notif-btn" onClick={() => { setShowNotif(!showNotif); setShowProfile(false); setShowOverflow(false); }}>
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
          )}

          <div className="icon-wrapper">
            <button className="profile-btn" onClick={() => { setShowProfile(!showProfile); setShowNotif(false); setShowOverflow(false); }}>
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
                <div className="dropdown-item" onClick={() => { closeAll(); navigate("/myaccount"); }}>
                  👤 My Account
                </div>
                <div className="dropdown-item logout" onClick={() => { closeAll(); setShowLogoutConfirm(true); }}>
                  🚪 Logout
                </div>
              </div>
            )}
          </div>

          {showOverflowBtn && (
            <div className="icon-wrapper">
              <button className="overflow-btn" onClick={() => { const next = !showOverflow; setShowNotif(false); setShowProfile(false); setShowOverflow(next);}} title="More options">
                •••
              </button>

              {showOverflow && (
                <div className="overflow-dropdown">
                  {branchHidden && (
                    <div className="overflow-item">
                      🏥
                      <select value={branch} onChange={(e) => setBranch(e.target.value)}>
                        {BRANCHES.map(b => <option key={b}>{b}</option>)}
                      </select>
                    </div>
                  )}

                  {notifHidden && (
                    <div className="overflow-item" onClick={() => { setShowOverflow(false); setShowNotif(true); }}>
                      🔔 Notifications
                      <span className="overflow-notif-dot">!</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </header>

      {showLogoutConfirm && (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setShowLogoutConfirm(false); }}>
          <div className="modal">
            <h3>Log Out</h3>
            <p>Are you sure you want to log out?</p>
            <div className="modal-actions">
              <button className="btn cancel" onClick={() => setShowLogoutConfirm(false)}>Cancel</button>
              <button className="btn confirm" onClick={handleLogout}>Yes, Log Out</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Topbar;