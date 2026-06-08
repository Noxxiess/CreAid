import { useState, useEffect } from "react";
import "../../styles/myAccount.css";
import { supabase } from "../../lib/supabase";
import { getProfileApi, updateProfileApi } from "../../api/profile";

function MyAccount()
{
  const [form, setForm] = useState({
    email: "",
    password: "",
    firstName: "",
    middleName: "",
    lastName: "",
    fullName: "",
    createdAt: "",
    contact: "",
    role: "",
    address: "",
    sex: "",
    avatarUrl: ""
  });

  const [settings, setSettings] = useState({
    notification: true,
    darkMode: false
  });

  const [loading, setLoading] = useState(true);

  useEffect(() =>
  {
    fetchUserData();
  }, []);

  async function fetchUserData()
  {
    try
    {
      const { data: sessionData } = await supabase.auth.getSession();
      const user = sessionData?.session?.user;

      if (!user)
      {
        setLoading(false);
        return;
      }

      const result = await getProfileApi(user.id);
      const data = result.user;

      setForm({
        email: user.email || "",
        password: "",
        firstName: data.first_name || "",
        middleName: data.middle_name || "",
        lastName: data.last_name || "",
        fullName: data.full_name || "",
        createdAt: data.created_at ? new Date(data.created_at).toLocaleDateString() : "",
        contact: data.contact_number || "",
        role: data.role || "",
        address: data.address || "",
        sex: data.sex || "",
        avatarUrl: data.avatar_url || ""
      });
    }
    catch (err)
    {
      console.log("FETCH ERROR:", err);
    }
    finally
    {
      setLoading(false);
    }
  }

  const handleChange = (e) =>
  {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  async function handleAvatarUpload(e)
  {
    try
    {
      const file = e.target.files[0];
      if (!file) return;

      const { data: { user } } = await supabase.auth.getUser();
      const fileExt = file.name.split(".").pop();
      const filePath = `${user.id}-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage.from("avatars").upload(filePath, file, { upsert: true });

      if (uploadError)
      {
        alert("Upload failed");
        return;
      }

      const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);
      const publicUrl = data.publicUrl;

      const { error: dbError } = await supabase.from("users").update({ avatar_url: publicUrl }).eq("id", user.id);

      if (dbError)
      {
        alert("Database update failed");
        return;
      }

      setForm((prev) => ({ ...prev, avatarUrl: publicUrl }));
      alert("Avatar updated!");
    }
    catch (err)
    {
      console.log(err);
    }
  }

  async function handleSave()
  {
    try
    {
      const { data: { user } } = await supabase.auth.getUser();

      await updateProfileApi(user.id, {
        first_name: form.firstName,
        middle_name: form.middleName,
        last_name: form.lastName,
        contact_number: form.contact,
        address: form.address,
        sex: form.sex
      });

      if (form.password.trim() !== "")
      {
        const { error: passwordError } = await supabase.auth.updateUser({ password: form.password });

        if (passwordError)
        {
          alert(passwordError.message);
          return;
        }
      }

      await fetchUserData();
      alert("Profile updated successfully!");
    }
    catch (err)
    {
      console.log(err);
      alert("Something went wrong");
    }
  }

  if (loading) return <h2>Loading...</h2>;

  return (
    <div className="account-container">
      <div className="account-card">
        <div className="account-card-header">
          <span className="account-card-icon">👤</span>
          <h2>My Account</h2>
        </div>

        <div className="account-card-body">
          <div className="account-grid">
            <div className="avatar-col">
              <div className="avatar-circle">
                {form.avatarUrl ? (
                  <img src={form.avatarUrl} alt="avatar" className="avatar-image" />
                ) : (
                  form.fullName ? form.fullName.substring(0, 2).toUpperCase() : "JD"
                )}
              </div>
              <input type="file" accept="image/*" capture="environment" id="avatar-upload" hidden onChange={handleAvatarUpload} />
              <label htmlFor="avatar-upload" className="btn-photo">📷 Change</label>
            </div>

            <div className="profile-form">
              <p className="section-title">Personal Info</p>
              <div className="form-grid">
                <div className="form-group">
                  <label>First Name</label>
                  <input name="firstName" value={form.firstName} onChange={handleChange} />
                </div>

                <div className="form-group">
                  <label>Middle Name</label>
                  <input name="middleName" value={form.middleName} onChange={handleChange} />
                </div>

                <div className="form-group">
                  <label>Last Name</label>
                  <input name="lastName" value={form.lastName} onChange={handleChange} />
                </div>

                <div className="form-group">
                  <label>Email</label>
                  <input name="email" type="email" value={form.email} readOnly />
                </div>

                <div className="form-group">
                  <label>Contact</label>
                  <input name="contact" value={form.contact} onChange={handleChange} />
                </div>

                <div className="form-group">
                  <label>Sex</label>
                  <select name="sex" value={form.sex} onChange={handleChange}>
                    <option value="">Select</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                </div>
                
                <div className="form-group full-width">
                  <label>Address</label>
                  <input name="address" value={form.address} onChange={handleChange} />
                </div>
              </div>

              <hr className="section-divider" />
              <p className="section-title">Account</p>
              <div className="form-grid">
                <div className="form-group">
                  <label>Password</label>
                  <input name="password" type="password" placeholder="New password" value={form.password} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label>Full Name <span className="readonly-badge">Auto-generated</span></label>
                  <input value={form.fullName} readOnly />
                </div>
                <div className="form-group">
                  <label>Role <span className="readonly-badge">Read-only</span></label>
                  <input value={form.role} readOnly />
                </div>
                <div className="form-group">
                  <label>Member Since <span className="readonly-badge">Read-only</span></label>
                  <input value={form.createdAt} readOnly />
                </div>
              </div>

              <button className="btn-save" onClick={handleSave}>💾 Save Changes</button>
            </div>
          </div>

          <hr className="section-divider" />
          <p className="section-title">Preferences</p>
          <div className="settings-row">
            <div className="toggle-card">
              <div className="toggle-label">
                <span className="toggle-icon notif-icon">🔔</span>
                Notifications
              </div>

              <label className="switch">
                <input type="checkbox" checked={settings.notification} onChange={() => setSettings({ ...settings, notification: !settings.notification })} />
                <span className="slider"></span>
              </label>
            </div>

            <div className="toggle-card">
              <div className="toggle-label">
                <span className="toggle-icon dark-icon">🌙</span>
                Dark Mode
              </div>

              <label className="switch">
                <input type="checkbox" checked={settings.darkMode} onChange={() => setSettings({ ...settings, darkMode: !settings.darkMode })} />
                <span className="slider"></span>
              </label>
            </div>
          </div>

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
  );
}

export default MyAccount;