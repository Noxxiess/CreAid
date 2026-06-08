import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/patients.css";

const SAMPLE_PATIENTS = [
  {
    id: 1,
    name: "Maria Santos Dela Sharmaine",
    age: 34,
    contact: "+63 912 345 6769",
    email: "mariaSharmaine@email.com",
    lastVisit: "2025-05-10",
    assignedDentist: "Dr. Vannesa Cruz",
    status: "Active",
    avatar: "MS",
    records: [
        { id: 1, name: "X-Ray_2025-05.jpg",      type: "xray",   date: "2025-05-10", size: "2.4 MB" },
        { id: 2, name: "Previous_Record.pdf",     type: "record", date: "2024-11-20", size: "1.1 MB" },
    ],
    notes: "Allergic to penicillin. Regular cleaning every 6 months.",
  },
];

const FILE_ICON = 
{
  xray:   "🦷",
  record: "📋",
  form:   "📄",
  photo:  "🖼️",
};

function Patients() 
{
  const [patients, setPatients]           = useState(SAMPLE_PATIENTS);
  const [selected, setSelected]           = useState(null);
  const [search, setSearch]               = useState("");
  const [filterStatus, setFilterStatus]   = useState("All");
  const [dragOver, setDragOver]           = useState(false);
  const [activeTab, setActiveTab]         = useState("info");
  const [patientsSidebarOpen, setPatientsSidebarOpen] = useState(false);
    const navigate = useNavigate();
  const fileInputRef = useRef();

  const filtered = patients.filter((p) => 
  {
    const matchSearch =
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.assignedDentist.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "All" || p.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const selectedPatient = selected ? patients.find((p) => p.id === selected) : null;

  function handleFileUpload(files, patientId) 
  {
    if (!files || files.length === 0) return;

    const newRecords = Array.from(files).map((f, i) => (
    {
      id:   Date.now() + i,
      name: f.name,
      type: f.name.match(/\.(jpg|jpeg|png)$/i) ? "xray" : "record",
      date: new Date().toISOString().split("T")[0],
      size: (f.size / (1024 * 1024)).toFixed(1) + " MB",
    }));
    setPatients((prev) =>
      prev.map((p) => p.id === patientId ? { ...p, records: [...p.records, ...newRecords] } : p)
    );
  }

  function handleDrop(e, patientId) 
  {
    e.preventDefault();
    setDragOver(false);
    handleFileUpload(e.dataTransfer.files, patientId);
  }

  function deleteRecord(patientId, recordId) 
  {
    setPatients((prev) =>
        prev.map((p) =>
            p.id === patientId ? { ...p, records: p.records.filter((r) => r.id !== recordId) } : p
        )
    );
  }

  function handleNotesChange(e) 
  {
    const val = e.target.value;
    setPatients((prev) =>
        prev.map((p) => (p.id === selectedPatient.id ? { ...p, notes: val } : p))
    );
  }

  function handleSelectPatient(id) 
  {
    setSelected(id);
    setActiveTab("info");
    setPatientsSidebarOpen(false);
  }

  return (
    <div className="patients-root">

      <button className="patients-sidebar-toggle" onClick={() => setPatientsSidebarOpen((o) => !o)} aria-label="Toggle patient list">
        {patientsSidebarOpen ? "✕" : "🦷 Patients"}
      </button>

      {patientsSidebarOpen && (
        <div className="patients-sidebar-overlay" onClick={() => setPatientsSidebarOpen(false)} />
      )}

      <aside className={`patients-sidebar${patientsSidebarOpen ? " patients-sidebar-open" : ""}`}>
        <div className="patients-sidebar-header">
          <h1 className="patients-sidebar-title">
            <span className="title-icon">🦷</span> Patients
          </h1>
          <button className="patients-btn-add" onClick={() => navigate("/patients/new")}>+ New Patient</button>
        </div>

        <div className="patients-sidebar-filters">
          <div className="patients-search-wrap">
            <span className="patients-search-icon">⌕</span>
            <input className="patients-search-input" placeholder="Search name or dentist…" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <div className="filter-pills">
            {["All", "Active", "Inactive"].map((s) => (
              <button key={s} className={`pill ${filterStatus === s ? "pill-active" : ""}`} onClick={() => setFilterStatus(s)}>
                {s}
              </button>
            ))}
          </div>
        </div>

        <ul className="patient-list">
            {filtered.map((p) => (
                <li key={p.id} className={`patient-item ${selected === p.id ? "patient-item-selected" : ""}`} onClick={() => handleSelectPatient(p.id)}>
                    <div className="patient-avatar">{p.avatar}</div>
                    <div className="patient-meta">
                        <span className="patient-name">{p.name}</span>
                        <span className="patient-sub">{p.assignedDentist}</span>
                    </div>
                    <span className={`status-badge ${p.status === "Active" ? "status-active" : "status-inactive"}`}>
                        {p.status}
                    </span>
                </li>
            ))}
            {filtered.length === 0 && <li className="empty-list">No patients found.</li>}
        </ul>
      </aside>

      <main className="patients-detail">
        {!selectedPatient ? (
          <div className="detail-empty">
            <div className="empty-icon">🦷</div>
            <p>Select a patient to view their profile</p>
          </div>
        ) : (
          <div className="detail-content">
            <div className="detail-hero">
              <div className="detail-avatar">{selectedPatient.avatar}</div>
              <div className="detail-hero-info">
                <h2 className="detail-name">{selectedPatient.name}</h2>
                <p className="detail-sub">Age {selectedPatient.age} · {selectedPatient.contact}</p>
                <p className="detail-sub">{selectedPatient.email}</p>
                <div className="detail-dentist-tag">
                    <span>👨‍⚕️ Assigned:</span> {selectedPatient.assignedDentist}
                </div>
              </div>

              <div className="detail-hero-meta">
                <span className={`status-badge-lg ${selectedPatient.status === "Active" ? "status-active" : "status-inactive"}`}>
                  {selectedPatient.status}
                </span>
                <p className="last-visit">Last Visit: {selectedPatient.lastVisit}</p>
              </div>
            </div>

            <div className="detail-tabs">
              {["info", "records", "notes"].map((tab) => (
                <button key={tab} className={`tab-btn ${activeTab === tab ? "tab-active" : ""}`} onClick={() => setActiveTab(tab)}>
                  {tab === "info"    && "📋 Info"}
                  {tab === "records" && `📁 Files (${selectedPatient.records.length})`}
                  {tab === "notes"   && "📝 Notes"}
                </button>
              ))}
            </div>

            {activeTab === "info" && (
              <div className="tab-panel">
                <div className="info-grid">
                  <div className="info-card"><label>Full Name</label><span>{selectedPatient.name}</span></div>
                  <div className="info-card"><label>Age</label><span>{selectedPatient.age}</span></div>
                  <div className="info-card"><label>Contact</label><span>{selectedPatient.contact}</span></div>
                  <div className="info-card"><label>Email</label><span>{selectedPatient.email}</span></div>
                  <div className="info-card"><label>Retaining Dentist</label><span>{selectedPatient.assignedDentist}</span></div>
                  <div className="info-card"><label>Last Visit</label><span>{selectedPatient.lastVisit}</span></div>
                </div>
              </div>
            )}

            {activeTab === "records" && (
              <div className="tab-panel">
                <div className={`upload-zone ${dragOver ? "upload-zone-drag" : ""}`} onDragOver={(e) => { e.preventDefault(); setDragOver(true); }} onDragLeave={() => setDragOver(false)} onDrop={(e) => handleDrop(e, selectedPatient.id)} onClick={() => fileInputRef.current.click()}>
                  <input type="file" ref={fileInputRef} multiple accept="image/*,.pdf,.doc,.docx" style={{ display: "none" }} onChange={(e) => handleFileUpload(e.target.files, selectedPatient.id)} />
                  <div className="upload-icon">⬆️</div>
                  <p className="upload-text"><strong>Click to upload</strong> or drag and drop</p>
                  <p className="upload-sub">X-rays, records, photos, PDFs</p>
                </div>

                {selectedPatient.records.length === 0 ? (
                  <p className="no-files">No files uploaded yet.</p>
                ) : (
                  <ul className="file-list">
                    {selectedPatient.records.map((r) => (
                      <li key={r.id} className="file-item">
                        <span className="file-type-icon">{FILE_ICON[r.type] || "📎"}</span>
                        
                        <div className="file-meta">
                          <span className="file-name">{r.name}</span>
                          <span className="file-date">{r.date} · {r.size}</span>
                        </div>

                        <div className="file-actions">
                          <button className="file-btn file-btn-view">View</button>
                          <button className="file-btn file-btn-delete" onClick={() => deleteRecord(selectedPatient.id, r.id)}>✕</button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
            </div>
            )}

            {activeTab === "notes" && (
              <div className="tab-panel">
                <textarea className="notes-textarea" placeholder="Clinical notes, allergies, treatment reminders…" value={selectedPatient.notes} onChange={handleNotesChange} />
                <p className="notes-hint">Notes are auto-saved as you type.</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default Patients;