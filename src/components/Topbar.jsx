import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Topbar.css";
import { supabase } from "../lib/supabase";
import { getProfileApi } from "../api/profile";
import { Icon } from "@iconify/react";

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
  const [showNotif,        setShowNotif]        = useState(false);
  const [showProfile,      setShowProfile]      = useState(false);
  const [showLogout,       setShowLogout]       = useState(false);
  const [showOverflow,     setShowOverflow]     = useState(false);
  const [avatarUrl,        setAvatarUrl]        = useState("");
  const [fullName,         setFullName]         = useState("");

  const navigate = useNavigate();
  const role     = localStorage.getItem("role");
  const width    = useWindowWidth();

  const notifHidden     = width <= 600;
  const showOverflowBtn = width <= 900;

  useEffect(() =>
  {
    async function fetchAvatar()
    {
      try
      {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const result = await getProfileApi(user.id);
        const data   = result.user;
        setAvatarUrl(data.avatar_url || "");
        setFullName(data.full_name || role || "User");
      }
      catch (err) { console.log(err); }
    }
    fetchAvatar();
  }, []);

  useEffect(() =>
  {
    const handleClickOutside = (e) =>
    {
      if (!e.target.closest(".topnav-profile-wrapper") && !e.target.closest(".topnav-icon-wrapper"))
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
      <header className="topnav-topbar">

        <div className="topnav-topbar-left">
          {isMobile && <button className="topnav-hamburger-btn" onClick={onMobileMenuClick} title="Menu"><span /><span /><span /></button>}
          <div className="topnav-search-box">
            <span className="topnav-search-icon"><Icon icon="glyphs-poly:search-1" width="25" height="25" /></span>
            <input type="text" placeholder="Search Patient Here" />
          </div>
          <button className="topnav-new-patient-btn" onClick={() => navigate("/patients/new")}><span>+</span><span className="topnav-btn-label"> New Patient</span></button>
        </div>

        <div className="topnav-topbar-right">

          {!notifHidden && (
            <div className="topnav-icon-wrapper topnav-notif-btn-wrapper">
              <button className="topnav-notif-btn" onClick={() => { setShowNotif(!showNotif); setShowProfile(false); setShowOverflow(false); }}><Icon icon="glyphs-poly:bell" width="35" height="30" /><span className="topnav-dot" /></button>
              {showNotif && (
                <div className="topnav-notif-dropdown">
                  <h4>Notifications</h4>
                  <div className="topnav-notif-list">
                    <div className="topnav-notif-item">No new notifications</div>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="topnav-profile-wrapper">
            <button className={`topnav-profile-btn${showProfile ? " active" : ""}`} onClick={() => { setShowProfile(!showProfile); setShowNotif(false); setShowOverflow(false); }}>
              <span className="topnav-avatar-chip">{avatarUrl ? <img src={avatarUrl} alt="avatar" className="topnav-avatar-image" /> : role?.charAt(0).toUpperCase()}</span>
              <span className="topnav-username">{fullName || role || "..."}</span>
              <span className="topnav-chevron">{showProfile ? "▲" : "▼"}</span>
            </button>

            {showProfile && (
              <div className="topnav-profile-dropdown">
                <hr className="topnav-dropdown-divider" />
                <div className="topnav-dropdown-item" onClick={() => { closeAll(); navigate("/myaccount"); }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width={15} height={15} viewBox="0 0 80 80">
                    <g fill="none" strokeLinejoin="round" strokeWidth={4}>
                      <path fill="#27014f" stroke="#27014f" strokeLinecap="square" d="M60 70H20a4 4 0 0 1-4-4a15.87 15.87 0 0 1 10.3-14.86l1.23-.462a35.53 35.53 0 0 1 24.94 0l1.23.462A15.87 15.87 0 0 1 64 66a4 4 0 0 1-4 4Z" />
                      <path fill="#1f003f" stroke="#1f003f" strokeLinecap="round" d="M33.902 38.867a13.347 13.347 0 0 0 19.15-9.08l.223-1.044a14.2 14.2 0 0 0-2.51-11.466l-.36-.48a12.992 12.992 0 0 0-20.81 0l-.36.48a14.2 14.2 0 0 0-2.51 11.465l.223 1.046a13.35 13.35 0 0 0 6.953 9.08" />
                    </g>
                  </svg>
                  My Account
                </div>
                <div className="topnav-dropdown-item logout" onClick={() => { closeAll(); setShowLogout(true); }}><Icon icon="noto:door" width="15" height="15" /> Logout</div>
              </div>
            )}
          </div>

          {showOverflowBtn && (
            <div className="topnav-icon-wrapper">
              <button className="topnav-overflow-btn" onClick={() => { const next = !showOverflow; setShowNotif(false); setShowProfile(false); setShowOverflow(next); }} title="More options">•••</button>
              {showOverflow && (
                <div className="topnav-overflow-dropdown">
                  {notifHidden && <div className="topnav-overflow-item" onClick={() => { setShowOverflow(false); setShowNotif(true); }}><Icon icon="glyphs-poly:bell" width="35" height="30" /> Notifications<span className="topnav-overflow-notif-dot">!</span></div>}
                </div>
              )}
            </div>
          )}

        </div>
      </header>

      {showLogout && (
        <div className="topnav-modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setShowLogout(false); }}>
          <div className="topnav-modal">
            <h3>Log Out</h3>
            <p>Are you sure you want to log out?</p>
            <div className="topnav-modal-actions">
              <button className="topnav-btn cancel" onClick={() => setShowLogout(false)}>Cancel</button>
              <button className="topnav-btn confirm" onClick={handleLogout}>Yes, Log Out</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Topbar;