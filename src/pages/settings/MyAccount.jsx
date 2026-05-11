import { useState } from "react";
import Sidebar from "../../components/Sidebar";
import Topbar from "../../components/Topbar";
import "../../styles/myAccount.css";

function MyAccount() {
  const [form, setForm] = useState({
    email: "",
    password: "",
    fullName: "",
    createdAt: "",
    contact: "",
    role: "",
    address: "",
    sex: ""
  });

  const [settings, setSettings] = useState({
    notification: true,
    darkMode: false
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  return (
    <div className="admin-container">
      <Sidebar />
      <div className="admin-main">
        <Topbar />
        <div className="dashboard-content">
          <div className="account-container">

            <div className="account-card">
              <div className="account-card-header">
                <span className="account-card-icon">👤</span>
                <h2>My Account</h2>
              </div>

              <div className="account-card-body">

                {/* TOP GRID */}
                <div className="account-grid">

                  {/* AVATAR COL */}
                  <div className="avatar-col">
                    <div className="avatar-circle">JD</div>
                    <button className="btn-photo">📷 Change</button>
                  </div>

                  {/* FORM COL */}
                  <div className="profile-form">

                    <p className="section-title">Personal Info</p>
                    <div className="form-grid">
                      <div className="form-group">
                        <label>Full Name</label>
                        <input name="fullName" placeholder="Juan dela Cruz" onChange={handleChange} />
                      </div>
                      <div className="form-group">
                        <label>Email</label>
                        <input name="email" type="email" placeholder="juan@email.com" onChange={handleChange} />
                      </div>
                      <div className="form-group">
                        <label>Contact</label>
                        <input name="contact" placeholder="+63 912 345 6789" onChange={handleChange} />
                      </div>
                      <div className="form-group">
                        <label>Sex</label>
                        <select name="sex" onChange={handleChange}>
                          <option value="" disabled>Select</option>
                          <option>Male</option>
                          <option>Female</option>
                          <option>Prefer not to say</option>
                        </select>
                      </div>
                      <div className="form-group full-width">
                        <label>Address</label>
                        <input name="address" placeholder="Street, City, Province" onChange={handleChange} />
                      </div>
                    </div>

                    <hr className="section-divider" />
                    <p className="section-title">Account</p>
                    <div className="form-grid">
                      <div className="form-group">
                        <label>Password</label>
                        <input name="password" type="password" onChange={handleChange} />
                      </div>
                      <div className="form-group">
                        <label>Role <span className="readonly-badge">Read-only</span></label>
                        <input name="role" value={form.role} readOnly />
                      </div>
                      <div className="form-group">
                        <label>Member Since <span className="readonly-badge">Read-only</span></label>
                        <input name="createdAt" value={form.createdAt} readOnly />
                      </div>
                    </div>

                    <button className="btn-save">💾 Save Changes</button>
                  </div>
                </div>

                {/* PREFERENCES */}
                <hr className="section-divider" />
                <p className="section-title">Preferences</p>
                <div className="settings-row">
                  <div className="toggle-card">
                    <div className="toggle-label">
                      <span className="toggle-icon notif-icon">🔔</span>
                      Notifications
                    </div>
                    <label className="switch">
                      <input
                        type="checkbox"
                        checked={settings.notification}
                        onChange={() => setSettings({ ...settings, notification: !settings.notification })}
                      />
                      <span className="slider"></span>
                    </label>
                  </div>
                  <div className="toggle-card">
                    <div className="toggle-label">
                      <span className="toggle-icon dark-icon">🌙</span>
                      Dark Mode
                    </div>
                    <label className="switch">
                      <input
                        type="checkbox"
                        checked={settings.darkMode}
                        onChange={() => setSettings({ ...settings, darkMode: !settings.darkMode })}
                      />
                      <span className="slider"></span>
                    </label>
                  </div>
                </div>

                {/* EXTRA MENU */}
                <hr className="section-divider" />
                <p className="section-title">More</p>
                <div className="extra-settings">
                  <div className="extra-item"><span>🔒 Privacy Policy</span><span className="chevron">›</span></div>
                  <div className="extra-item"><span>📄 Terms and Conditions</span><span className="chevron">›</span></div>
                  <div className="extra-item"><span>📞 Contacts</span><span className="chevron">›</span></div>
                  <div className="extra-item"><span>💬 Feedback</span><span className="chevron">›</span></div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

export default MyAccount;