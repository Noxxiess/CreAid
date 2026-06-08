import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Topbar.css";
import { supabase } from "../lib/supabase";
import { getProfileApi } from "../api/profile";

function useWindowWidth() 
{
  const [width, setWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handler = () => setWidth(window.innerWidth);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  return width;
}

function Topbar({ onMobileMenuClick, isMobile }) {
  const [showNotif, setShowNotif]             = useState(false);
  const [showProfile, setShowProfile]         = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showOverflow, setShowOverflow]       = useState(false);
  const [avatarUrl, setAvatarUrl]             = useState("");
  const [fullName, setFullName]               = useState("");

  const navigate = useNavigate();
  const role     = localStorage.getItem("role");
  const width    = useWindowWidth();

  const notifHidden    = width <= 600;
  const showOverflowBtn = width <= 900;

  // FETCH AVATAR & NAME
  useEffect(() => {
    async function fetchAvatar() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const result = await getProfileApi(user.id);
        const data   = result.user;
        setAvatarUrl(data.avatar_url || "");
        setFullName(data.full_name || role || "User");
      } catch (err) {
        console.log(err);
      }
    }
    fetchAvatar();
  }, []);

  // CLOSE DROPDOWNS ON OUTSIDE CLICK
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest(".icon-wrapper")) {
        setShowNotif(false);
        setShowProfile(false);
        setShowOverflow(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // LOGOUT — same pattern as working version (from doc3), plus supabase signOut
  const handleLogout = async () => 
  {
    localStorage.removeItem("role");
    navigate("/");
  };

  const closeAll = () => {
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

        {/* RIGHT */}
        <div className="topbar-right">
          {!notifHidden && (
            <div className="icon-wrapper notif-btn-wrapper">
              <button
                className="icon-btn notif-btn"
                onClick={() => { setShowNotif(!showNotif); setShowProfile(false); setShowOverflow(false); }}
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
          )}

          {/* PROFILE */}
          <div className="icon-wrapper">
            <button
              className="profile-btn"
              onClick={() => { setShowProfile(!showProfile); setShowNotif(false); setShowOverflow(false); }}
            >
              <span className="avatar-chip">
                {avatarUrl
                  ? <img src={avatarUrl} alt="avatar" className="topbar-avatar-image" />
                  : role?.charAt(0).toUpperCase()
                }
              </span>
              <span className="username">{fullName}</span>
              <span className="chevron">{showProfile ? "▲" : "▼"}</span>
            </button>

            {showProfile && (
              <div className="dropdown profile-dropdown">
                <div className="dropdown-user-info">
                  <span className="avatar-chip large">
                    {avatarUrl
                      ? <img src={avatarUrl} alt="avatar" className="topbar-avatar-image" />
                      : role?.charAt(0).toUpperCase()
                    }
                  </span>
                  <div>
                    <p className="dropdown-role">{fullName}</p>
                    <p className="dropdown-sub">{role || "User"}</p>
                  </div>
                </div>

                <hr className="dropdown-divider" />

                <div className="dropdown-item" onClick={() => { closeAll(); navigate("/myaccount"); }}>
                  👤 My Account
                </div>

                {/* Same pattern as doc3's working logout */}
                <div className="dropdown-item logout" onClick={() => { closeAll(); setShowLogoutConfirm(true); }}>
                  🚪 Logout
                </div>
              </div>
            )}
          </div>

          {/* OVERFLOW */}
          {showOverflowBtn && (
            <div className="icon-wrapper">
              <button
                className="overflow-btn"
                onClick={() => { const next = !showOverflow; setShowNotif(false); setShowProfile(false); setShowOverflow(next); }}
                title="More options"
              >
                •••
              </button>

              {showOverflow && (
                <div className="overflow-dropdown">
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