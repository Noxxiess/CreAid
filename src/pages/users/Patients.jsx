import { supabase } from "../../lib/supabase";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Icon } from "@iconify/react";
import Spinner from "../../components/Spinner";
import "../../styles/patients.css";
import { getPatientsApi, getPatientNotesApi, savePatientNotesApi } from "../../api/patients";
import { getPatientLastVisitApi } from "../../api/appointments";
import { savePatientFileApi, getPatientFilesApi, archivePatientFileApi, getBillingDocumentsApi, archiveBillingDocumentApi } from "../../api/files";

function calculateAge(birthdate)
{
  if(!birthdate) return "";
  const today = new Date();
  const birth = new Date(birthdate);
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if(m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

const FILE_ICON =
{
  xray: "healthicons:tooth",
  lab: "healthicons:laboratory",
  clearance: "healthicons:health-facility-outline",
  consent: "mdi:file-sign",
  prescription: "healthicons:medicines",
  referral: "mdi:email-arrow-right-outline",
  other: "mdi:paperclip"
};

function Patients()
{
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [patientFiles, setPatientFiles] = useState([]);
  const [selected, setSelected] = useState(null);
  const [previewFile, setPreviewFile] = useState(null);
  const [lastVisit, setLastVisit] = useState("No visits yet");
  const [selectedFileType, setSelectedFileType] = useState("other");
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [activeTab, setActiveTab] = useState("info");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [billingDocuments, setBillingDocuments] = useState([]);
  const [notes, setNotes] = useState("");
  const [guardian, setGuardian] = useState({ father_name: "", father_occupation: "", father_contact: "", mother_name: "", mother_occupation: "", mother_contact: "", guardian_name: "", guardian_occupation: "", guardian_contact: "" });
  const [medical, setMedical] = useState({ previous_hospitalizations: "", prescribed_medications: "", allergies: "", family_medical_problems: "", other_concerns: "", medical_alert: "", conditions: [], dental_habits: [], diet: "" });
  const [archiveTarget, setArchiveTarget] = useState(null);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [confirmError, setConfirmError] = useState("");
  const [loadingPatients, setLoadingPatients] = useState(true);
  const [loadingPatient, setLoadingPatient] = useState(false);
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [loadingBilling, setLoadingBilling] = useState(false);
  const [notesSaving, setNotesSaving] = useState(false);
  const [archiving, setArchiving] = useState(false);

  useEffect(() =>
  {
    loadPatients();
  }, []);

  async function loadPatients()
  {
    try
    {
      setLoadingPatients(true);
      const response = await getPatientsApi();
      setPatients(response.patients || []);
    }
    catch(error)
    {
      console.error(error);
    }
    finally
    {
      setLoadingPatients(false);
    }
  }

  async function loadLastVisit(patientId)
  {
    try
    {
      const response = await getPatientLastVisitApi(patientId);
      setLastVisit(response.lastVisit || "No visits yet");
    }
    catch(error)
    {
      console.error(error);
      setLastVisit("No visits yet");
    }
  }

  async function loadPatientFiles(patientId)
  {
    try
    {
      setLoadingFiles(true);
      const response = await getPatientFilesApi(patientId);
      const records = (response.files || []).map(f => ({ id: f.id, name: f.file_name, file_name: f.file_name, file_url: f.file_url, mime_type: f.mime_type, type: f.file_type, date: f.created_at?.split("T")[0], size: f.size_bytes ? `${Math.round(f.size_bytes / 1024)} KB` : "" }));
      setPatientFiles(records);
    }
    catch(error)
    {
      console.error(error);
      setPatientFiles([]);
    }
    finally
    {
      setLoadingFiles(false);
    }
  }

  async function loadPatientBillingDocuments(patient)
  {
    try
    {
      setLoadingBilling(true);
      const response = await getBillingDocumentsApi(patient.id);
      setBillingDocuments(response.documents || []);
    }
    catch(error)
    {
      console.error(error);
      setBillingDocuments([]);
    }
    finally
    {
      setLoadingBilling(false);
    }
  }

  async function handleSelectPatient(patientId)
  {
    setSelected(patientId);
    setSidebarOpen(false);
    setActiveTab("info");
    setPatientFiles([]);
    setBillingDocuments([]);
    setNotes("");
    setLastVisit("No visits yet");
    const patient = patients.find(p => p.id === patientId);
    if(!patient) return;
    try
    {
      setLoadingPatient(true);
      const noteResponse = await getPatientNotesApi(patientId);
      if(patient.is_guest)
      {
        setLastVisit("Guest Appointment");
      }
      else
      {
        setNotes(noteResponse.note || "");
        await loadLastVisit(patientId);
      }
      await loadPatientBillingDocuments(patient);
      if(!patient.is_guest) await loadPatientFiles(patientId);
    }
    catch(error)
    {
      console.error(error);
    }
    finally
    {
      setLoadingPatient(false);
    }
  }

  async function savePatientNotes()
  {
    if(!selectedPatient) return;
    if(selectedPatient.is_guest)
    {
      alert("Notes are only available for registered patients.");
      return;
    }
    try
    {
      setNotesSaving(true);
      const response = await savePatientNotesApi(selectedPatient.id, notes);
      if(!response.success) throw new Error(response.message);
      alert("Notes saved successfully.");
    }
    catch(error)
    {
      console.error(error);
      alert("Failed to save notes.");
    }
    finally
    {
      setNotesSaving(false);
    }
  }

  async function handleFileUpload(files, patientId)
  {
    if(!files || files.length === 0) return;
    try
    {
      for(const file of files)
      {
        const filePath = `${patientId}/${Date.now()}-${file.name}`;
        const { error: uploadError } = await supabase.storage.from("medical-files").upload(filePath, file);
        if(uploadError) throw uploadError;
        await savePatientFileApi({ patient_id: patientId, file_name: file.name, storage_path: filePath, mime_type: file.type, size_bytes: file.size, taken_at: new Date().toISOString(), file_type: selectedFileType });
      }
      loadPatientFiles(patientId);
    }
    catch(error)
    {
      console.error(error);
    }
  }

  function requestArchiveFile(file)
  {
    setArchiveTarget({ type: "file", id: file.id, name: file.name });
    setConfirmPassword("");
    setConfirmError("");
  }

  function requestArchiveBillingDocument(doc)
  {
    setArchiveTarget({ type: "billing", id: doc.id, name: doc.title });
    setConfirmPassword("");
    setConfirmError("");
  }

  async function confirmArchiveFile()
  {
    if(!archiveTarget) return;
    if(!confirmPassword)
    {
      setConfirmError("Password is required.");
      return;
    }
    try
    {
      setArchiving(true);
      setConfirmError("");
      if(archiveTarget.type === "billing")
      {
        await archiveBillingDocumentApi(archiveTarget.id);
        await loadPatientBillingDocuments(selectedPatient);
      }
      else
      {
        await archivePatientFileApi(archiveTarget.id);
        await loadPatientFiles(selectedPatient.id);
      }
      setArchiveTarget(null);
      setConfirmPassword("");
    }
    catch(error)
    {
      console.error(error);
      setConfirmError(error.message || "Failed to archive.");
    }
    finally
    {
      setArchiving(false);
    }
  }

  function cancelArchiveFile()
  {
    if(archiving) return;
    setArchiveTarget(null);
    setConfirmPassword("");
    setConfirmError("");
  }

  const filtered = patients.filter((p) =>
  {
    const fullName = `${p.first_name || ""} ${p.last_name || ""}`.toLowerCase();
    const dentistName = (p.dentist_name || p.assigned_dentist || "").toLowerCase();
    const q = (search || "").toLowerCase();
    const matchSearch = fullName.includes(q) || dentistName.includes(q);
    const matchStatus = filterStatus === "All" ? true : filterStatus === "Active" ? !p.is_archived : p.is_archived;
    return matchSearch && matchStatus;
  });

  const selectedPatient = selected ? patients.find((p) => p.id === selected) : null;

  return (
    <div className="patients-root">
      <div className="patients-mobile-bar">
        <button className="patients-sidebar-toggle" onClick={() => setSidebarOpen(true)} aria-label="Open patient list"><Icon icon="healthicons:tooth" />Patients</button>
      </div>
      <div className="patients-inner">
        {sidebarOpen && <div className="patients-sidebar-overlay" onClick={() => setSidebarOpen(false)} />}
        <aside className={`patients-sidebar${sidebarOpen ? " patients-sidebar-open" : ""}`}>
          <div className="patients-sidebar-header">
            <h1 className="patients-sidebar-title"><Icon icon="healthicons:tooth" className="patients-title-icon" />Patients</h1>
            <div className="patients-sidebar-header-actions">
              <button className="patients-btn-add" onClick={() => navigate("/patients/new")}>+ New Patient</button>
              <button className="patients-sidebar-close" onClick={() => setSidebarOpen(false)} aria-label="Close"><Icon icon="mdi:close" /></button>
            </div>
          </div>

          <div className="patients-sidebar-filters">
            <div className="patients-search-wrap">
              <Icon icon="mdi:magnify" className="patients-search-icon" />
              <input className="patients-search-input" placeholder="Search Patient Name" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>

            <div className="patients-filter-pills">
              {["All", "Active", "Inactive"].map((s) => (
                <button key={s} className={`patients-pill${filterStatus === s ? " patients-pill-active" : ""}`} onClick={() => setFilterStatus(s)}>{s}</button>
              ))}
            </div>
          </div>
          {loadingPatients
            ? <div className="patients-list-loading"><Spinner /></div>
            : (
              <ul className="patients-patient-list">
                {filtered.map((p) => (
                  <li key={p.id} className={`patients-patient-item${selected === p.id ? " patients-patient-item-selected" : ""}`} onClick={() => handleSelectPatient(p.id)}>
                    <div className="patients-patient-avatar">{p.avatar_url ? <img src={p.avatar_url} alt={`${p.first_name} ${p.last_name}`} className="patients-patient-avatar-img" onError={(e) => { e.currentTarget.src = "/default-avatar.png"; }} /> : <>{p.first_name?.[0] || ""}{p.last_name?.[0] || ""}</>}</div>
                    <div className="patients-patient-meta">
                      <span className="patients-patient-name">{p.first_name} {p.last_name}</span>
                      <span className="patients-patient-sub">{p.email}</span>
                    </div>
                    {p.is_guest ? <span className="patients-guest-badge">Guest</span> : <span className={`patients-status-badge ${p.is_archived ? "patients-status-inactive" : "patients-status-active"}`}>{p.is_archived ? "Inactive" : "Active"}</span>}
                  </li>
                ))}
                {filtered.length === 0 && <li className="patients-empty-list">No patients found.</li>}
              </ul>
            )
          }
        </aside>
        <main className="patients-detail">
          {!selectedPatient
            ? (
              <div className="patients-detail-empty">
                <Icon icon="healthicons:tooth" className="patients-empty-icon" />
                <p>Select a patient to view their profile</p>
              </div>
            )
            : loadingPatient
            ? (
              <div className="patients-detail-loading"><Spinner /></div>
            )
            : (
              <div className="patients-detail-content">
                <div className="patients-detail-hero">
                  <div className="patients-detail-avatar">{selectedPatient.avatar_url ? <img src={selectedPatient.avatar_url} alt={selectedPatient.full_name} className="patients-detail-avatar-img" /> : <>{selectedPatient.first_name?.[0] || ""}{selectedPatient.last_name?.[0] || ""}</>}</div>
                  <div className="patients-detail-hero-info">
                    <h2 className="patients-detail-name">{selectedPatient.first_name} {selectedPatient.last_name}</h2>
                    <p className="patients-detail-sub">ID No. {selectedPatient.id_no || selectedPatient.id}</p>
                    <p className="patients-detail-sub">Age {calculateAge(selectedPatient.birthdate)} · {selectedPatient.contact_number}</p>
                    <p className="patients-detail-sub">{selectedPatient.email}</p>
                  </div>

                  <div className="patients-detail-hero-meta">
                    <span className={`patients-status-badge-lg ${selectedPatient.is_archived ? "patients-status-inactive" : "patients-status-active"}`}>{selectedPatient.is_archived ? "Inactive" : "Active"}</span>
                    <p className="patients-last-visit">Last Visit: {selectedPatient.is_guest ? "Guest Patient" : lastVisit || "-"}</p>
                  </div>
                </div>

                <div className="patients-detail-tabs">
                  {["info", "medical", "billing", "notes"].map((tab) => (
                    <button key={tab} className={`patients-tab-btn${activeTab === tab ? " patients-tab-active" : ""}`} onClick={() => setActiveTab(tab)}>
                      {tab === "info" && <><Icon icon="mdi:clipboard-text-outline" />Information</>}
                      {tab === "medical" && <><Icon icon="mdi:folder-open-outline" />Medical Files ({patientFiles.length})</>}
                      {tab === "billing" && <><Icon icon="mdi:receipt-text-outline" />Billing Documents</>}
                      {tab === "notes" && <><Icon icon="mdi:note-text-outline" />Notes</>}
                    </button>
                  ))}
                </div>
                {activeTab === "info" && (
                  <div className="patients-tab-panel">
                    <div className="patients-info-section">
                      <div className="patients-modal-section-title">Personal Information</div>
                      
                      <div className="patients-modal-row">
                        <div className="patients-modal-field patients-modal-field-lg"><label>Full Name</label><div className="patients-modal-field-static">{`${selectedPatient.last_name}, ${selectedPatient.first_name}${selectedPatient.middle_name ? " " + selectedPatient.middle_name : ""}` || "—"}</div></div>
                        <div className="patients-modal-field"><label>Birthdate</label><div className="patients-modal-field-static">{selectedPatient.birthdate || "—"}</div></div>
                        <div className="patients-modal-field patients-modal-field-sm"><label>Age</label><div className="patients-modal-field-static">{calculateAge(selectedPatient.birthdate) || "—"}</div></div>
                        <div className="patients-modal-field patients-modal-field-sm"><label>Sex</label><div className="patients-modal-field-static">{selectedPatient.sex || "—"}</div></div>
                      </div>

                      <div className="patients-modal-row">
                        <div className="patients-modal-field patients-modal-field-sm"><label>Blood Type</label><div className="patients-modal-field-static">{selectedPatient.blood_type || "—"}</div></div>
                        <div className="patients-modal-field patients-modal-field-sm"><label>Civil Status</label><div className="patients-modal-field-static">{selectedPatient.civil_status || "—"}</div></div>
                        <div className="patients-modal-field"><label>Occupation</label><div className="patients-modal-field-static">{selectedPatient.occupation || "—"}</div></div>
                        <div className="patients-modal-field"><label>Company</label><div className="patients-modal-field-static">{selectedPatient.company || "—"}</div></div>
                      </div>

                      <div className="patients-modal-row">
                        <div className="patients-modal-field patients-modal-field-lg"><label>Address</label><div className="patients-modal-field-static">{selectedPatient.address || "—"}</div></div>
                        <div className="patients-modal-field"><label>Contact No.</label><div className="patients-modal-field-static">{selectedPatient.contact_number || "—"}</div></div>
                        <div className="patients-modal-field"><label>Email</label><div className="patients-modal-field-static">{selectedPatient.email || "—"}</div></div>
                      </div>

                      <div className="patients-modal-row">
                        <div className="patients-modal-field"><label>Registered Since</label><div className="patients-modal-field-static">{selectedPatient.created_at?.split("T")[0] || "—"}</div></div>
                        <div className="patients-modal-field"><label>Last Visit</label><div className="patients-modal-field-static">{selectedPatient.is_guest ? "Guest Patient" : lastVisit || "—"}</div></div>
                      </div>
                    </div>
                    {!selectedPatient.is_guest && (
                      <>
                        <details className="patients-modal-details">
                          <summary className="patients-modal-section-title">Guardian Information</summary>
                          {[{ label: "Father", prefix: "father" }, { label: "Mother", prefix: "mother" }, { label: "Guardian", prefix: "guardian" }].map(({ label, prefix }) => (
                            <div className="patients-modal-row patients-modal-row-compact" key={prefix}>
                              <div className="patients-modal-field"><label>{label}'s Name</label><div className="patients-modal-field-static">{guardian[`${prefix}_name`] || "—"}</div></div>
                              <div className="patients-modal-field"><label>Occupation</label><div className="patients-modal-field-static">{guardian[`${prefix}_occupation`] || "—"}</div></div>
                              <div className="patients-modal-field"><label>Contact No.</label><div className="patients-modal-field-static">{guardian[`${prefix}_contact`] || "—"}</div></div>
                            </div>
                          ))}
                        </details>

                        <details className="patients-modal-details">
                          <summary className="patients-modal-section-title">Medical Information</summary>
                          <div className="patients-modal-row patients-modal-row-compact">
                            {[{ label: "Previous Hospitalizations", field: "previous_hospitalizations" }, { label: "Prescribed Medications", field: "prescribed_medications" }, { label: "Allergies to Medications", field: "allergies" }, { label: "Family Medical Problems", field: "family_medical_problems" }, { label: "Other Medical Concerns", field: "other_concerns" }, { label: "Medical Alert", field: "medical_alert" }, { label: "Patient's Diet", field: "diet" }].map(({ label, field }) => (
                              <div className="patients-modal-field" key={field}><label>{label}</label><div className="patients-modal-field-static">{medical[field] || "—"}</div></div>
                            ))}
                          </div>
                        </details>

                        <details className="patients-modal-details">
                          <summary className="patients-modal-section-title">Medical Conditions{medical.conditions.length > 0 && <span className="patients-modal-summary-count"> ({medical.conditions.length} reported)</span>}</summary>
                          <div className="patients-modal-tag-group">
                            {medical.conditions.length > 0 ? medical.conditions.map((c) => <span className="patients-modal-tag" key={c}>{c}</span>) : <span className="patients-modal-field-static">None reported</span>}
                          </div>
                        </details>

                        <details className="patients-modal-details">
                          <summary className="patients-modal-section-title">Dental Habits{medical.dental_habits.length > 0 && <span className="patients-modal-summary-count"> ({medical.dental_habits.length} reported)</span>}</summary>
                          <div className="patients-modal-tag-group">
                            {medical.dental_habits.length > 0 ? medical.dental_habits.map((h) => <span className="patients-modal-tag" key={h}>{h}</span>) : <span className="patients-modal-field-static">None reported</span>}
                          </div>
                        </details>
                      </>
                    )}
                  </div>
                )}
                {activeTab === "medical" && (
                  <div className="patients-tab-panel">
                    {loadingFiles
                      ? <div className="patients-tab-loading"><Spinner /></div>
                      : patientFiles.length === 0
                      ? (
                        <div className="patients-billing-empty">
                          <Icon icon="mdi:folder-open-outline" className="patients-billing-icon" />
                          <h3>No Medical Files</h3>
                          <p>Files uploaded by the patient or dentist will appear here.</p>
                        </div>
                      )
                      : (
                        <ul className="patients-file-list">
                          {patientFiles.map((r) => (
                            <li key={r.id} className="patients-file-item">
                              <Icon icon={FILE_ICON[r.type] || "mdi:paperclip"} className="patients-file-type-icon" />
                              <span className={`patients-file-badge patients-${r.type}`}>{r.type}</span>
                              
                              <div className="patients-file-meta">
                                <span className="patients-file-name">{r.name}</span>
                                <span className="patients-file-date">{r.date} · {r.size}</span>
                              </div>

                              <div className="patients-file-actions">
                                <button className="patients-file-btn patients-file-btn-view" onClick={() => setPreviewFile(r)}>View</button>
                                <a href={r.file_url} download className="patients-file-btn">Download</a>
                                <button className="patients-file-btn" onClick={() => { const win = window.open(r.file_url, "_blank"); setTimeout(() => { win?.print(); }, 700); }}>Print</button>
                                <button className="patients-file-btn patients-file-btn-archive" onClick={() => requestArchiveFile(r)}>Archive</button>
                              </div>
                            </li>
                          ))}
                        </ul>
                      )
                    }
                    {previewFile && (
                      <div className="patients-preview-overlay" onClick={() => setPreviewFile(null)}>
                        <div className="patients-preview-modal" onClick={(e) => e.stopPropagation()}>
                          <button className="patients-preview-close" onClick={() => setPreviewFile(null)}><Icon icon="mdi:close" /></button>
                          {previewFile.mime_type?.includes("image") ? <img src={previewFile.file_url} alt={previewFile.file_name} className="patients-preview-image" /> : previewFile.mime_type?.includes("pdf") ? <iframe src={previewFile.file_url} className="patients-preview-pdf" title="PDF Preview"></iframe> : <a href={previewFile.file_url} download className="patients-file-btn">Download File</a>}
                        </div>
                      </div>
                    )}
                  </div>
                )}
                {activeTab === "billing" && (
                  <div className="patients-tab-panel">
                    {loadingBilling
                      ? <div className="patients-tab-loading"><Spinner /></div>
                      : billingDocuments.length === 0
                      ? (
                        <div className="patients-billing-empty">
                          <Icon icon="mdi:receipt-text-outline" className="patients-billing-icon" />
                          <h3>No Billing Documents</h3>
                          <p>Official Receipts and Invoices will appear here.</p>
                        </div>
                      )
                      : (
                        <ul className="patients-file-list">
                          {billingDocuments.map(doc => (
                            <li key={doc.id} className="patients-file-item">
                              <Icon icon="mdi:receipt-text-outline" className="patients-file-type-icon" />
                              <span className={`patients-file-badge patients-${doc.document_type}`}>{doc.document_type === "receipt" ? "Receipt" : "Invoice"}</span>
                              
                              <div className="patients-file-meta">
                                <span className="patients-file-name">{doc.title}</span>
                                <span className="patients-file-date">{new Date(doc.created_at).toLocaleDateString()}</span>
                              </div>

                              <div className="patients-file-actions">
                                <a href={doc.file_url} target="_blank" rel="noreferrer" className="patients-file-btn patients-file-btn-view">View</a>
                                <a href={doc.file_url} download className="patients-file-btn">Download</a>
                                <button className="patients-file-btn patients-file-btn-archive" onClick={() => requestArchiveBillingDocument(doc)}>Archive</button>
                              </div>
                            </li>
                          ))}
                        </ul>
                      )
                    }
                  </div>
                )}
                {activeTab === "notes" && (
                  <div className="patients-tab-panel">
                    <textarea className="patients-notes-textarea" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Write notes about this patient…" />
                    <div className="patients-notes-actions">
                      <button className="patients-save-notes-btn" onClick={savePatientNotes} disabled={notesSaving}>{notesSaving ? <Spinner size="sm" /> : "Save Notes"}</button>
                    </div>
                    <p className="patients-notes-hint">{notesSaving ? "Saving notes…" : "Click Save Notes to save your changes."}</p>
                  </div>
                )}
              </div>
            )
          }
        </main>
      </div>
      {archiveTarget && (
        <div className="patients-modal-overlay" onClick={() => !archiving && cancelArchiveFile()}>
          <div className="patients-modal" onClick={(e) => e.stopPropagation()}>
            <div className="patients-modal-header">
              <h3>Archive {archiveTarget.type === "billing" ? "Billing Document" : "File"}</h3>
              <button className="patients-modal-close" onClick={cancelArchiveFile} disabled={archiving}><Icon icon="mdi:close" /></button>
            </div>
            <div className="patients-modal-form">
              <p className="patients-modal-hint">Archive <strong>{archiveTarget.name}</strong>? It will no longer appear in the patient's active records.</p>
              <p className="patients-modal-hint">For security, please enter your current password to continue.</p>
              <input type="password" className="patients-confirm-input" placeholder="Enter your password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} onKeyDown={(e) => e.key === "Enter" && confirmArchiveFile()} autoFocus disabled={archiving} />
              {confirmError && <div className="patients-confirm-error">{confirmError}</div>}
              <div className="patients-modal-actions">
                <button className="patients-btn-cancel" onClick={cancelArchiveFile} disabled={archiving}>Cancel</button>
                <button className="patients-btn-archive" onClick={confirmArchiveFile} disabled={archiving}>{archiving ? <Spinner size="sm" /> : "Archive"}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Patients;