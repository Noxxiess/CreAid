import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import "../styles/systemdata.css";

function SystemData() {
  const masterfiles = [
    { label: "HMO", icon: "🏥" },
    { label: "Services", icon: "📄" },
    { label: "Medicines", icon: "💊" },
    { label: "Templates", icon: "🗂️" },
    { label: "Dental Habits", icon: "🦷" },
    { label: "Medical Conditions", icon: "❤️" },
    { label: "Tooth Items", icon: "🦷" },
    { label: "Recall Items", icon: "🔔" },
  ];

  return (
    <div className="admin-container">
      <Sidebar />

      <div className="admin-main">
        <Topbar />

        <div className="dashboard-content">
          <div className="systemdata-container">

            <h2 className="systemdata-title">Masterfiles</h2>

            <div className="masterfiles-grid">
              {masterfiles.map((item, index) => (
                <div key={index} className="masterfile-card">
                  <div className="masterfile-icon">{item.icon}</div>
                  <div className="masterfile-label">{item.label}</div>
                </div>
              ))}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

export default SystemData;