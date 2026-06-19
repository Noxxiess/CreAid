import { useState } from "react";
import { Pencil, Archive } from "lucide-react";
import "../../styles/dentists.css";

const SAMPLE_DENTISTS = [
    {
        id: 1,
        name: "Dr. Vannesa Cruz",
        specialty: "General & Cosmetic Dentistry",
        contact: "+63 919 111 2222",
        email: "vannesa.cruz@dentalclinic.com",
        avatar: "VC",
        status: "Available",
        dailyCommission: 3200,
        commissionRate: 0.3,
        patients: [
            { id: 1, name: "Maria Santos Dela Sharmaine", lastVisit: "2025-05-10", procedure: "Cleaning & Polishing", amount: 1450 },
        ],
        pendingRequests: [
            { id: 101, patientName: "Rosa Gomez", message: "Requesting Dr. Cruz for braces consultation.", date: "2025-05-28" },
        ],
        schedule: "Mon–Fri 8AM–5PM",
    },
];

const FORM_TEMPLATES = [
    { id: "reseta",   label: "📋 Prescription (Reseta)", icon: "💊" },
    { id: "xray",     label: "🦷 X-Ray Request",         icon: "🩻" },
    { id: "referral", label: "📨 Referral Letter",        icon: "📨" },
    { id: "medcert",  label: "📄 Medical Certificate",   icon: "📄" },
];

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const SAMPLE_LEAVE_REQUESTS = {
    1: [
        { id: 1, type: "Sick Leave",      from: "2025-06-10", to: "2025-06-11", reason: "Fever and flu symptoms.",   status: "Pending",  remark: "", submittedOn: "2025-06-08" },
        { id: 2, type: "Vacation Leave",  from: "2025-06-20", to: "2025-06-22", reason: "Family trip out of town.",  status: "Pending",  remark: "", submittedOn: "2025-06-09" },
        { id: 3, type: "Emergency Leave", from: "2025-05-30", to: "2025-05-30", reason: "Family emergency.",         status: "Approved", remark: "Approved. Get well soon.", submittedOn: "2025-05-29" },
    ],
};

function Dentists()
{
    const [dentists, setDentists]                       = useState(SAMPLE_DENTISTS);
    const [selected, setSelected]                       = useState(null);
    const [activeTab, setActiveTab]                     = useState("overview");
    const [search, setSearch]                           = useState("");
    const [showFormModal, setShowFormModal]             = useState(null);
    const [esignMode, setEsignMode]                     = useState(false);
    const [signatureText, setSignatureText]             = useState("");
    const [signed, setSigned]                           = useState(false);
    const [requestAction, setRequestAction]             = useState({});
    const [dentistsSidebarOpen, setdentistsSidebarOpen] = useState(false);
    const [showEditModal, setShowEditModal]             = useState(false);
    const [showArchiveConfirm, setShowArchiveConfirm]   = useState(false);
    const [showAddModal, setShowAddModal]               = useState(false);
    const [addForm, setAddForm]                         = useState({ name: "", specialty: "", contact: "", email: "", commissionRate: 30, status: "Available" });
    const [leaveRequests, setLeaveRequests]             = useState(SAMPLE_LEAVE_REQUESTS);
    const [showRemarkModal, setShowRemarkModal]         = useState(null);
    const [remarkInput, setRemarkInput]                 = useState("");

    const filtered        = dentists.filter((d) => d.name.toLowerCase().includes(search.toLowerCase()) || d.specialty.toLowerCase().includes(search.toLowerCase()));
    const selectedDentist = selected ? dentists.find((d) => d.id === selected) : null;
    const currentLeaves   = selectedDentist ? (leaveRequests[selectedDentist.id] || []) : [];
    const pendingCount    = currentLeaves.filter((l) => l.status === "Pending").length;

    function handleRequestAction(dentistId, reqId, action) { setRequestAction((prev) => ({ ...prev, [`${dentistId}-${reqId}`]: action })); }

    function handleESign(e)
    {
        e.preventDefault();
        if (signatureText.trim().length > 2)
        {
            setSigned(true);
            setTimeout(() => { setSigned(false); setEsignMode(false); setSignatureText(""); setShowFormModal(null); }, 2000);
        }
    }

    function handleSelectDentist(id) { setSelected(id); setActiveTab("overview"); setdentistsSidebarOpen(false); }

    function handleAddDentist()
    {
        if (!addForm.name.trim() || !addForm.specialty.trim()) return;
        const initials = addForm.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
        const newD = {
            id: Date.now(), name: addForm.name, specialty: addForm.specialty, contact: addForm.contact,
            email: addForm.email, avatar: initials, status: addForm.status, dailyCommission: 0,
            commissionRate: Number(addForm.commissionRate) / 100, patients: [], pendingRequests: [], schedule: "Mon–Fri 8AM–5PM",
        };
        setDentists((prev) => [newD, ...prev]);
        setSelected(newD.id);
        setActiveTab("overview");
        setShowAddModal(false);
        setAddForm({ name: "", specialty: "", contact: "", email: "", commissionRate: 30, status: "Available" });
    }

    function handleLeaveAction(dentistId, leaveId, action, remark)
    {
        setLeaveRequests((prev) => {
            const list = prev[dentistId] || [];
            return { ...prev, [dentistId]: list.map((l) => l.id === leaveId ? { ...l, status: action, remark: remark || "" } : l) };
        });
    }

    const STATUS_COLOR = 
    { 
        Available: "status-available", 
        Busy: "status-busy", "Off-Duty": "status-off" 
    };
    
    const LEAVE_ICON   = 
    { 
        "Sick Leave": 
        "🤒", "Vacation Leave": "🏖️", 
        "Emergency Leave": "🚨", 
        "Maternity / Paternity Leave": "👶"
    };

    return (
        <div className="dentists-root">

            <button className="dentists-sidebar-toggle" onClick={() => setdentistsSidebarOpen((o) => !o)} aria-label="Toggle dentist list">
                {dentistsSidebarOpen ? "✕" : "👨‍⚕️ Dentists"}
            </button>

            {dentistsSidebarOpen && <div className="dentists-sidebar-overlay" onClick={() => setdentistsSidebarOpen(false)} />}

            <aside className={`dentists-sidebar${dentistsSidebarOpen ? " dentists-sidebar-open" : ""}`}>
                <div className="dentists-sidebar-header">
                    <h1 className="dentists-sidebar-title"><span>👨‍⚕️</span> Dentists</h1>
                </div>
                <div style={{ padding: "10px 16px", borderBottom: "1px solid var(--border)" }}>
                    <button className="dact-btn dact-primary" style={{ width: "100%", justifyContent: "center", display: "flex", alignItems: "center", gap: 6 }} onClick={() => setShowAddModal(true)}>
                        ➕ Add Dentist
                    </button>
                </div>
                <div className="dentists-sidebar-search-wrap">
                    <span className="dentists-search-icon">⌕</span>
                    <input className="dentists-search-input" placeholder="Search dentist or specialty…" value={search} onChange={(e) => setSearch(e.target.value)} />
                </div>
                <ul className="dentist-list">
                    {filtered.map((d) => (
                        <li key={d.id} className={`dentist-item ${selected === d.id ? "dentist-item-selected" : ""}`} onClick={() => handleSelectDentist(d.id)}>
                            <div className="dentist-avatar">{d.avatar}</div>
                            <div className="dentist-meta">
                                <span className="dentist-name">{d.name}</span>
                                <span className="dentist-spec">{d.specialty}</span>
                            </div>
                            <div className="dentist-right">
                                <span className={`status-dot ${STATUS_COLOR[d.status]}`} title={d.status} />
                                {d.pendingRequests.length > 0 && <span className="req-badge">{d.pendingRequests.length}</span>}
                            </div>
                        </li>
                    ))}
                </ul>
            </aside>

            <main className="dentists-detail">
                {!selectedDentist ? (
                    <div className="detail-empty">
                        <div className="empty-icon">👨‍⚕️</div>
                        <p>Select a dentist to view their profile</p>
                    </div>
                ) : (
                    <div className="detail-content">

                        <div className="detail-hero">
                            <div className="dentist-avatar-lg">{selectedDentist.avatar}</div>
                            <div className="detail-hero-info">
                                <h2 className="detail-name">{selectedDentist.name}</h2>
                                <p className="detail-spec">{selectedDentist.specialty}</p>
                                <p className="detail-sub">{selectedDentist.contact} · {selectedDentist.email}</p>
                                <p className="detail-schedule">⏰ {selectedDentist.schedule}</p>
                            </div>
                            <div className="detail-hero-right">
                                <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                                    <span className={`status-pill ${STATUS_COLOR[selectedDentist.status]}-pill`}>{selectedDentist.status}</span>
                                    <button title="Edit Dentist" onClick={() => setShowEditModal(true)} style={{ background: "var(--surface)", border: "1.5px solid var(--border)", borderRadius: "var(--radius-xs)", padding: "5px 7px", cursor: "pointer", display: "flex", alignItems: "center", color: "var(--text-muted)" }} onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--primary)"; e.currentTarget.style.color = "var(--primary)"; e.currentTarget.style.background = "var(--primary-light)"; }} onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text-muted)"; e.currentTarget.style.background = "var(--surface)"; }}>
                                        <Pencil size={14} />
                                    </button>
                                    <button title="Archive Dentist" onClick={() => setShowArchiveConfirm(true)} style={{ background: "var(--red-bg)", border: "1.5px solid transparent", borderRadius: "var(--radius-xs)", padding: "5px 7px", cursor: "pointer", display: "flex", alignItems: "center", color: "var(--red)" }} onMouseEnter={e => { e.currentTarget.style.background = "var(--red)"; e.currentTarget.style.color = "#fff"; }} onMouseLeave={e => { e.currentTarget.style.background = "var(--red-bg)"; e.currentTarget.style.color = "var(--red)"; }}>
                                        <Archive size={14} />
                                    </button>
                                </div>
                                <div className="commission-box">
                                    <span className="commission-label">Today's Commission</span>
                                    <span className="commission-value">₱{selectedDentist.dailyCommission.toLocaleString()}</span>
                                    <span className="commission-rate">{(selectedDentist.commissionRate * 100).toFixed(0)}% rate</span>
                                </div>
                            </div>
                        </div>

                        <div className="detail-tabs">
                            {[
                                { key: "overview", label: "📊 Overview" },
                                { key: "patients", label: `🧑‍🦷 Patients (${selectedDentist.patients.length})` },
                                { key: "requests", label: `📩 Requests${selectedDentist.pendingRequests.length > 0 ? ` (${selectedDentist.pendingRequests.length})` : ""}` },
                                { key: "schedule", label: `🗓️ Schedule${pendingCount > 0 ? ` (${pendingCount})` : ""}` },
                                { key: "forms",    label: "📝 Forms" },
                            ].map(({ key, label }) => (
                                <button key={key} className={`tab-btn ${activeTab === key ? "tab-active" : ""}`} onClick={() => setActiveTab(key)}>{label}</button>
                            ))}
                        </div>

                        {activeTab === "overview" && (
                            <div className="tab-panel">
                                <div className="overview-grid">
                                    <div className="ov-card ov-card-highlight">
                                        <span className="ov-icon">₱</span>
                                        <div><span className="ov-value">₱{selectedDentist.dailyCommission.toLocaleString()}</span><span className="ov-label">Daily Commission</span></div>
                                    </div>
                                    <div className="ov-card">
                                        <span className="ov-icon">🧑‍🦷</span>
                                        <div><span className="ov-value">{selectedDentist.patients.length}</span><span className="ov-label">Handled Patients</span></div>
                                    </div>
                                    <div className="ov-card">
                                        <span className="ov-icon">📩</span>
                                        <div><span className="ov-value">{selectedDentist.pendingRequests.length}</span><span className="ov-label">Patient Requests</span></div>
                                    </div>
                                    <div className="ov-card">
                                        <span className="ov-icon">📊</span>
                                        <div><span className="ov-value">{(selectedDentist.commissionRate * 100).toFixed(0)}%</span><span className="ov-label">Commission Rate</span></div>
                                    </div>
                                </div>
                                <div className="section-card">
                                    <h3 className="section-title">💰 Commission Breakdown</h3>
                                    <div className="commission-table">
                                        <div className="ct-header"><span>Date</span><span>Patient</span><span>Procedure</span><span>Amount</span></div>
                                        {selectedDentist.patients.length === 0 && <p className="no-data">No commission data yet.</p>}
                                        {selectedDentist.patients.map((p) => (
                                            <div key={p.id} className="ct-row">
                                                <span>{p.lastVisit}</span><span>{p.name}</span><span className="ct-procedure">{p.procedure}</span><span className="ct-amount">₱{p.amount.toLocaleString()}</span>
                                            </div>
                                        ))}
                                        {selectedDentist.patients.length > 0 && (
                                            <div className="ct-total"><span /><span /><span>Today's Total</span><span className="ct-amount-total">₱{selectedDentist.dailyCommission.toLocaleString()}</span></div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === "patients" && (
                            <div className="tab-panel">
                                {selectedDentist.patients.length === 0 ? (
                                    <p className="no-data-center">No patients handled yet.</p>
                                ) : (
                                    <ul className="handled-list">
                                        {selectedDentist.patients.map((p) => (
                                            <li key={p.id} className="handled-item">
                                                <div className="handled-avatar">{p.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}</div>
                                                <div className="handled-meta">
                                                    <span className="handled-name">{p.name}</span>
                                                    <span className="handled-proc">{p.procedure}</span>
                                                </div>
                                                <div className="handled-date">
                                                    <span className="date-label">Last Visit</span>
                                                    <span className="date-val">{p.lastVisit}</span>
                                                </div>
                                                <button className="btn-view-patient">View Record</button>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        )}

                        {activeTab === "requests" && (
                            <div className="tab-panel">
                                {selectedDentist.pendingRequests.length === 0 ? (
                                    <p className="no-data-center">No pending patient requests.</p>
                                ) : (
                                    <ul className="request-list">
                                        {selectedDentist.pendingRequests.map((req) => {
                                            const key    = `${selectedDentist.id}-${req.id}`;
                                            const action = requestAction[key];
                                            return (
                                                <li key={req.id} className="request-item">
                                                    <div className="req-avatar">{req.patientName.split(" ").map((n) => n[0]).join("").slice(0, 2)}</div>
                                                    <div className="req-meta">
                                                        <span className="req-patient">{req.patientName}</span>
                                                        <span className="req-message">"{req.message}"</span>
                                                        <span className="req-date">{req.date}</span>
                                                    </div>
                                                    {!action ? (
                                                        <div className="req-actions">
                                                            <button className="btn-accept" onClick={() => handleRequestAction(selectedDentist.id, req.id, "accepted")}>Accept</button>
                                                            <button className="btn-decline" onClick={() => handleRequestAction(selectedDentist.id, req.id, "declined")}>Decline</button>
                                                        </div>
                                                    ) : (
                                                        <span className={`action-tag ${action === "accepted" ? "accepted" : "declined"}`}>
                                                            {action === "accepted" ? "✓ Accepted" : "✗ Declined"}
                                                        </span>
                                                    )}
                                                </li>
                                            );
                                        })}
                                    </ul>
                                )}
                            </div>
                        )}

                        {activeTab === "schedule" && (
                            <div className="tab-panel">
                                <div className="section-card" style={{ marginBottom: 16 }}>
                                    <h3 className="section-title">🟢 Availability</h3>
                                    <div className="dact-form-grid">
                                        <div className="dact-form-group">
                                            <label>Current Status</label>
                                            <select defaultValue={selectedDentist.status}>
                                                <option>Available</option><option>Busy</option><option>Off-Duty</option>
                                            </select>
                                        </div>
                                        <div className="dact-form-group">
                                            <label>Note (optional)</label>
                                            <input placeholder="e.g. On leave until Monday" />
                                        </div>
                                    </div>
                                </div>
                                <div className="section-card" style={{ marginBottom: 16 }}>
                                    <h3 className="section-title">🕐 Working Hours</h3>
                                    <div style={{ display: "flex", flexDirection: "column" }}>
                                        {DAYS.map((day) => (
                                            <div key={day} className="dact-day-row">
                                                <span className="dact-day-label">{day}</span>
                                                <input type="time" defaultValue="08:00" className="dact-time-input" />
                                                <span className="dact-time-sep">–</span>
                                                <input type="time" defaultValue="17:00" className="dact-time-input" />
                                                <label className="dact-off-toggle"><input type="checkbox" /> Off</label>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="section-card" style={{ marginBottom: 16 }}>
                                    <h3 className="section-title">🍽️ Lunch Break</h3>
                                    <div className="dact-form-grid">
                                        <div className="dact-form-group"><label>Lunch Start</label><input type="time" defaultValue="12:00" /></div>
                                        <div className="dact-form-group"><label>Lunch End</label><input type="time" defaultValue="13:00" /></div>
                                        <div className="dact-form-group full">
                                            <label>Applies to</label>
                                            <select><option>All Days</option><option>Weekdays Only</option><option>Custom</option></select>
                                        </div>
                                    </div>
                                </div>

                                <div className="leave-section-card" style={{ marginBottom: 16 }}>
                                    <div className="leave-section-header">
                                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                            <h3 className="section-title" style={{ margin: 0 }}>🏖️ Leave Requests</h3>
                                            {pendingCount > 0 && <span className="leave-pending-badge">{pendingCount} Pending</span>}
                                        </div>
                                    </div>
                                    {currentLeaves.length === 0 ? (
                                        <p className="no-data" style={{ marginTop: 4 }}>No leave requests from this dentist yet.</p>
                                    ) : (
                                        <ul className="leave-list">
                                            {currentLeaves.map((l) => (
                                                <li key={l.id} className={`leave-item leave-item-${l.status.toLowerCase()}`}>
                                                    <div className="leave-type-badge">{LEAVE_ICON[l.type] || "📋"}</div>
                                                    <div className="leave-meta">
                                                        <span className="leave-type-label">{l.type}</span>
                                                        <span className="leave-dates">📅 {l.from} → {l.to}</span>
                                                        {l.reason && <span className="leave-reason">"{l.reason}"</span>}
                                                        {l.remark && <span className="leave-remark-display">💬 <em>{l.remark}</em></span>}
                                                        <span className="leave-submitted-on">Filed {l.submittedOn}</span>
                                                    </div>

                                                    <div className="leave-actions-col">
                                                        <span className={`leave-status-pill leave-status-${l.status.toLowerCase()}`}>
                                                            {l.status === "Pending" ? "⏳ Pending" : l.status === "Approved" ? "✅ Approved" : "❌ Declined"}
                                                        </span>
                                                        {l.status === "Pending" && (
                                                            <button className="leave-review-btn" onClick={() => { setShowRemarkModal({ ...l, dentistId: selectedDentist.id }); setRemarkInput(""); }}>Review →</button>
                                                        )}
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                                    <button className="dact-btn dact-primary">💾 Save Schedule</button>
                                </div>
                            </div>
                        )}

                        {activeTab === "forms" && (
                            <div className="tab-panel">
                                <p className="forms-intro">Prepare and e-sign clinical forms for your patients. Choose a template below.</p>
                                <div className="forms-grid">
                                    {FORM_TEMPLATES.map((f) => (
                                        <div key={f.id} className="form-card" onClick={() => { setShowFormModal(f); setEsignMode(false); setSigned(false); setSignatureText(""); }}>
                                            <span className="form-card-icon">{f.icon}</span>
                                            <span className="form-card-label">{f.label}</span>
                                            <span className="form-card-action">Prepare →</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                    </div>
                )}
            </main>

            {showFormModal && (
                <div className="dentists-modal-overlay" onClick={() => setShowFormModal(null)}>
                    <div className="dentists-modal dentists-modal-form-doc" onClick={(e) => e.stopPropagation()}>
                        <div className="dentists-modal-header">
                            <h3>{showFormModal.icon} {showFormModal.label}</h3>
                            <button className="dentists-modal-close" onClick={() => setShowFormModal(null)}>✕</button>
                        </div>
                        <div className="form-doc-body">
                            <div className="doc-preview">
                                <div className="doc-letterhead">
                                    <span className="doc-clinic">🦷 Bright Smile Dental Clinic</span>
                                    <span className="doc-address">123 Quezon Ave., Quezon City · Tel: (02) 8123-4567</span>
                                </div>
                                <div className="doc-divider" />
                                {showFormModal.id === "reseta" && (
                                    <div className="doc-content">
                                        <h4 className="doc-title">PRESCRIPTION</h4>
                                        <div className="doc-field"><label>Patient Name:</label><div className="doc-input-line" /></div>
                                        <div className="doc-field"><label>Date:</label><div className="doc-input-line" /></div>
                                        <div className="doc-field"><label>Age / Sex:</label><div className="doc-input-line" /></div>
                                        <div className="doc-rx">℞</div>
                                        <div className="doc-rx-lines">
                                            <div className="doc-input-line long" /><div className="doc-input-line long" /><div className="doc-input-line long" />
                                        </div>
                                        <div className="doc-field mt"><label>Sig:</label><div className="doc-input-line" /></div>
                                        <div className="doc-field"><label>Dispense:</label><div className="doc-input-line" /></div>
                                    </div>
                                )}
                                {showFormModal.id === "xray" && (
                                    <div className="doc-content">
                                        <h4 className="doc-title">X-RAY REQUEST FORM</h4>
                                        <div className="doc-field"><label>Patient Name:</label><div className="doc-input-line" /></div>
                                        <div className="doc-field"><label>Date of Birth:</label><div className="doc-input-line" /></div>
                                        <div className="doc-field"><label>Requesting Physician:</label><div className="doc-input-line" /></div>
                                        <div className="doc-section-label">Type of X-Ray Requested:</div>
                                        <div className="doc-checkboxes">
                                            {["Periapical", "Bite-wing", "Panoramic (OPG)", "Occlusal", "Cephalometric"].map((x) => (
                                                <label key={x} className="doc-checkbox-item"><input type="checkbox" /> {x}</label>
                                            ))}
                                        </div>
                                        <div className="doc-field mt"><label>Clinical Indication:</label><div className="doc-input-line long" /></div>
                                    </div>
                                )}

                                {showFormModal.id === "referral" && (
                                    <div className="doc-content">
                                        <h4 className="doc-title">REFERRAL LETTER</h4>
                                        <div className="doc-field"><label>Date:</label><div className="doc-input-line" /></div>
                                        <div className="doc-field"><label>Referred To:</label><div className="doc-input-line" /></div>
                                        <div className="doc-field"><label>Patient:</label><div className="doc-input-line" /></div>
                                        <div className="doc-field"><label>Re:</label><div className="doc-input-line long" /></div>
                                        <div className="doc-para-lines">
                                            {[1,2,3,4].map((i) => <div key={i} className="doc-input-line long" />)}
                                        </div>
                                    </div>
                                )}

                                {showFormModal.id === "medcert" && (
                                    <div className="doc-content">
                                        <h4 className="doc-title">MEDICAL CERTIFICATE</h4>
                                        <p className="doc-para">To Whom It May Concern:</p>
                                        <p className="doc-para">This is to certify that</p>
                                        <div className="doc-input-line long" />
                                        <p className="doc-para">was examined and is currently under my care for dental treatment.</p>
                                        <div className="doc-field"><label>Diagnosis:</label><div className="doc-input-line long" /></div>
                                        <div className="doc-field"><label>Advised rest from:</label><div className="doc-input-line" /></div>
                                    </div>
                                )}
                                <div className="esign-section">
                                    {!signed ? (
                                        <>
                                            <div className="esign-label">{selectedDentist?.name}</div>
                                            <div className="esign-title">{selectedDentist?.specialty}</div>
                                            {!esignMode ? (
                                                <button className="btn-esign" onClick={() => setEsignMode(true)}>✍️ Add E-Signature</button>
                                            ) : (
                                                <form className="esign-form" onSubmit={handleESign}>
                                                    <input className="esign-input" placeholder="Type your full name to sign…" value={signatureText} onChange={(e) => setSignatureText(e.target.value)} autoFocus />
                                                    <div className="esign-btns">
                                                        <button type="button" className="btn-esign-cancel" onClick={() => setEsignMode(false)}>Cancel</button>
                                                        <button type="submit" className="btn-esign-confirm">Sign Document</button>
                                                    </div>
                                                </form>
                                            )}
                                        </>
                                    ) : (
                                        <div className="signed-stamp">
                                            <div className="signature-text">{signatureText}</div>
                                            <div className="signed-label">✅ E-Signed · {new Date().toLocaleDateString()}</div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="form-doc-actions">
                                <button className="btn-print">🖨️ Print</button>
                                <button className="btn-download">⬇️ Download PDF</button>
                                <button className="btn-send">📤 Send to Patient</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {showAddModal && (
                <div className="dentists-modal-overlay" onClick={() => setShowAddModal(false)}>
                    <div className="dentists-modal dact-edit-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="dentists-modal-header">
                            <h3>➕ Add Dentist</h3>
                            <button className="dentists-modal-close" onClick={() => setShowAddModal(false)}>✕</button>
                        </div>

                        <div className="dact-modal-body">
                            <div className="dact-form-grid">
                                <div className="dact-form-group"><label>Full Name *</label><input value={addForm.name} onChange={(e) => setAddForm((f) => ({ ...f, name: e.target.value }))} placeholder="Dr. Full Name" /></div>
                                <div className="dact-form-group"><label>Specialty *</label><input value={addForm.specialty} onChange={(e) => setAddForm((f) => ({ ...f, specialty: e.target.value }))} placeholder="e.g. Orthodontics" /></div>
                                <div className="dact-form-group"><label>Contact</label><input value={addForm.contact} onChange={(e) => setAddForm((f) => ({ ...f, contact: e.target.value }))} placeholder="+63 9XX XXX XXXX" /></div>
                                <div className="dact-form-group"><label>Email</label><input type="email" value={addForm.email} onChange={(e) => setAddForm((f) => ({ ...f, email: e.target.value }))} placeholder="email@clinic.com" /></div>
                                <div className="dact-form-group"><label>Commission Rate (%)</label><input type="number" value={addForm.commissionRate} onChange={(e) => setAddForm((f) => ({ ...f, commissionRate: e.target.value }))} placeholder="30" /></div>
                                <div className="dact-form-group">
                                    <label>Status</label>
                                    <select value={addForm.status} onChange={(e) => setAddForm((f) => ({ ...f, status: e.target.value }))}>
                                        <option>Available</option><option>Busy</option><option>Off-Duty</option>
                                    </select>
                                </div>
                            </div>

                            <div className="dact-modal-actions">
                                <button className="dact-btn dact-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
                                <button className="dact-btn dact-primary" onClick={handleAddDentist}>Add Dentist</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {showEditModal && (
                <div className="dentists-modal-overlay" onClick={() => setShowEditModal(false)}>
                    <div className="dentists-modal dact-edit-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="dentists-modal-header">
                            <h3>✏️ Edit Dentist</h3>
                            <button className="dentists-modal-close" onClick={() => setShowEditModal(false)}>✕</button>
                        </div>

                        <div className="dact-modal-body">
                            <div className="dact-form-grid">
                                <div className="dact-form-group"><label>Full Name</label><input defaultValue={selectedDentist?.name} placeholder="Dr. Full Name" /></div>
                                <div className="dact-form-group"><label>Specialty</label><input defaultValue={selectedDentist?.specialty} placeholder="Specialty" /></div>
                                <div className="dact-form-group"><label>Contact</label><input defaultValue={selectedDentist?.contact} placeholder="+63 9XX XXX XXXX" /></div>
                                <div className="dact-form-group"><label>Email</label><input defaultValue={selectedDentist?.email} placeholder="email@clinic.com" /></div>
                                <div className="dact-form-group"><label>Commission Rate (%)</label><input type="number" defaultValue={(selectedDentist?.commissionRate * 100).toFixed(0)} placeholder="30" /></div>
                                <div className="dact-form-group">
                                    <label>Status</label>
                                    <select defaultValue={selectedDentist?.status}>
                                        <option>Available</option><option>Busy</option><option>Off-Duty</option>
                                    </select>
                                </div>
                            </div>

                            <div className="dact-modal-actions">
                                <button className="dact-btn dact-secondary" onClick={() => setShowEditModal(false)}>Cancel</button>
                                <button className="dact-btn dact-primary" onClick={() => setShowEditModal(false)}>Save Changes</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {showArchiveConfirm && (
                <div className="dentists-modal-overlay" onClick={() => setShowArchiveConfirm(false)}>
                    <div className="dentists-modal dact-confirm-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="dentists-modal-header">
                            <h3>🗃️ Archive Dentist</h3>
                            <button className="dentists-modal-close" onClick={() => setShowArchiveConfirm(false)}>✕</button>
                        </div>

                        <div className="dact-modal-body">
                            <p>Are you sure you want to archive <strong>{selectedDentist?.name}</strong>? They will be hidden from active listings.</p>
                            <div className="dact-modal-actions">
                                <button className="dact-btn dact-secondary" onClick={() => setShowArchiveConfirm(false)}>Cancel</button>
                                <button className="dact-btn dact-danger" onClick={() => setShowArchiveConfirm(false)}>Yes, Archive</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {showRemarkModal && (
                <div className="dentists-modal-overlay" onClick={() => { setShowRemarkModal(null); setRemarkInput(""); }}>
                    <div className="dentists-modal leave-review-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="dentists-modal-header">
                            <h3>📋 Review Leave Request</h3>
                            <button className="dentists-modal-close" onClick={() => { setShowRemarkModal(null); setRemarkInput(""); }}>✕</button>
                        </div>

                        <div className="dact-modal-body">
                            <div className="leave-review-summary">
                                <div className="leave-review-icon">{LEAVE_ICON[showRemarkModal.type] || "📋"}</div>
                                <div className="leave-review-info">
                                    <span className="leave-review-type">{showRemarkModal.type}</span>
                                    <span className="leave-review-dates">📅 {showRemarkModal.from} → {showRemarkModal.to}</span>
                                    <span className="leave-review-filed">Filed on {showRemarkModal.submittedOn}</span>
                                </div>
                            </div>

                            {showRemarkModal.reason && (
                                <div className="leave-review-reason-box">
                                    <span className="leave-review-reason-label">Reason from dentist</span>
                                    <p className="leave-review-reason-text">"{showRemarkModal.reason}"</p>
                                </div>
                            )}
                            <div className="dact-form-group">
                                <label>Your Remark (optional)</label>
                                <input placeholder="e.g. Approved. Please arrange a replacement for those days." value={remarkInput} onChange={(e) => setRemarkInput(e.target.value)} autoFocus />
                            </div>

                            <div className="leave-review-actions">
                                <button className="dact-btn dact-secondary" onClick={() => { setShowRemarkModal(null); setRemarkInput(""); }}>Cancel</button>
                                <button className="leave-btn-decline" onClick={() => { handleLeaveAction(showRemarkModal.dentistId, showRemarkModal.id, "Declined", remarkInput); setShowRemarkModal(null); setRemarkInput(""); }}>✗ Decline Leave</button>
                                <button className="leave-btn-approve" onClick={() => { handleLeaveAction(showRemarkModal.dentistId, showRemarkModal.id, "Approved", remarkInput); setShowRemarkModal(null); setRemarkInput(""); }}>✓ Approve Leave</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Dentists;
