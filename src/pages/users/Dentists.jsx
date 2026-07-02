import { useState, useEffect, useRef } from "react";
import { Icon } from "@iconify/react";
import "../../styles/dentists.css";
import Spinner from "../../components/Spinner";
import { getDentistsApi, saveDentistScheduleApi, getDentistScheduleApi } from "../../api/users";
import { getPatientRecordsApi } from "../../api/patients";
import { getMyPatientsApi, getDentistEarningsApi} from "../../api/appointments";
import { getLeaveRequestsApi, updateLeaveRequestApi } from "../../api/leaveRequest";
import { getMedicalFilesApi, uploadMedicalFileApi, deleteMedicalFileApi, archivePatientFileApi } from "../../api/files";
import { getBillingDocumentsApi, uploadBillingDocumentApi, archiveBillingDocumentApi} from "../../api/files";
import { supabase } from "../../lib/supabase";

const LEAVE_ICON = {
  "Sick Leave": "mdi:emoticon-sick-outline",
  "Vacation Leave": "mdi:palm-tree",
  "Emergency Leave": "mdi:alarm-light-outline",
  "Maternity Leave": "mdi:human-pregnant",
  "Paternity Leave": "mdi:account-child-outline",
  "Medical Leave": "mdi:hospital-building"
};

const DEFAULT_LEAVE_ICON = "mdi:clipboard-text-outline";

const FILE_TYPE_ICON = {
  xray: "mdi:radiology-box-outline",
  lab: "mdi:test-tube",
  clearance: "mdi:clipboard-check-outline",
  consent: "mdi:file-sign",
  receipt: "mdi:receipt-text-outline",
  invoice: "mdi:file-document-outline",
  other: "mdi:folder-open-outline"
};

function IconText({ icon, children, className = "" })
{
  return (
    <span className={`dentists-icon-text${className ? ` ${className}` : ""}`}>
      <Icon icon={icon} aria-hidden="true" />
      {children}
    </span>
  );
}

function Dentists()
{
  const [dentists, setDentists] = useState([]);
  const [myPatients, setMyPatients] = useState([]);
  const [selected, setSelected] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [search, setSearch] = useState("");
  const [patientSearch, setPatientSearch] = useState("");
  const [showFormModal, setShowFormModal] = useState(null);
  const [esignMode, setEsignMode] = useState(false);
  const [signatureText, setSignatureText] = useState("");
  const [signed, setSigned] = useState(false);
  const [showRecordModal, setShowRecordModal] = useState(false);
  const [recordTab, setRecordTab] = useState("info");
  const [selectedTreatment, setSelectedTreatment] = useState(null);
  const [showTreatmentModal, setShowTreatmentModal] = useState(false);
  const [selectedRecordPatient, setSelectedRecordPatient] = useState(null);
  const [patientRecords, setPatientRecords] = useState([]);
  const [requestAction, setRequestAction] = useState({});
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [earnings, setEarnings] = useState([]);
  const [branchFilter, setBranchFilter] = useState("All");
  const [dailyCommission, setDailyCommission] = useState(0);
  const [totalCommission, setTotalCommission] = useState(0);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const printRef = useRef();
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [templateSearch, setTemplateSearch] = useState("");
  const [templateFilter, setTemplateFilter] = useState("all");
  const [showRemarkModal, setShowRemarkModal] = useState(null);
  const [remarkInput, setRemarkInput] = useState("");
  const [lunchBreak, setLunchBreak] = useState({ start: "12:00", end: "13:00", applies_to: "all_days" });
  const [customLunchDays, setCustomLunchDays] = useState([]);
  const [availability, setAvailability] = useState({ status: "Available", note: "" });

  const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  const [medicalFiles, setMedicalFiles] = useState([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedUploadType, setSelectedUploadType] = useState("xray");
  const [selectedUploadFile, setSelectedUploadFile] = useState(null);
  const [billingDocuments, setBillingDocuments] = useState([]);
  const [billingUploadType, setBillingUploadType] = useState("receipt");
  const [archiveRequest, setArchiveRequest] = useState(null);
  const [archivePassword, setArchivePassword] = useState("");
  const [archiveError, setArchiveError] = useState("");
  const [archiveLoading, setArchiveLoading] = useState(false);
  const fileInputRef = useRef(null);
  const [loadingDentists, setLoadingDentists] = useState(true);
  const [loadingDentist, setLoadingDentist] = useState(false);

  const [workingHours, setWorkingHours] = useState(
    DAYS.reduce((acc, day) =>
    {
      acc[day] = { start: "10:00", end: "17:00", is_off: false };
      return acc;
    }, {})
  );

  function toggleCustomLunchDay(day)
  {
    setCustomLunchDays((prev) => prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]);
  }

  function getLunchAppliesToValue()
  {
    if (lunchBreak.applies_to === "custom") return `custom:${customLunchDays.join(",")}`;
    return lunchBreak.applies_to;
  }

  const pendingCount = leaveRequests.filter(r => r.status === "Pending").length;

  const filtered = dentists.filter((d) =>
  {
    const fullName = `${d.first_name || ""} ${d.last_name || ""}`.toLowerCase();
    const matchesSearch = fullName.includes((search || "").toLowerCase());
    const matchesBranch = branchFilter === "All" || d.branch_id === branchFilter;
    return matchesSearch && matchesBranch;
  });

  useEffect(() =>
  {
    loadDentists();
    loadTemplates();
  }, []);

  async function handleLeaveAction(leaveId, status)
  {
    console.log("STATUS BEING SENT:", status);
    await updateLeaveRequestApi(leaveId, { status, staff_note: remarkInput });
  }

  function handlePrint()
  {
    const printContents = printRef.current.innerHTML;
    const printWindow = window.open("", "", "width=900,height=700");
    printWindow.document.write(`<html><head><title>DentConnect Form</title></head><body>${printContents}</body></html>`);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  }

  function formatWorkingHours(hours)
  {
    if (!hours) return "";
    const activeDays = Object.entries(hours).filter(([_, day]) => !day.is_off);
    if (!activeDays.length) return "Unavailable";
    const firstDay = activeDays[0][0];
    const lastDay = activeDays[activeDays.length - 1][0];
    const first = activeDays[0][1];
    function format(time)
    {
      const [h, m] = time.split(":");
      const hour = Number(h);
      const suffix = hour >= 12 ? "PM" : "AM";
      const display = hour > 12 ? hour - 12 : hour;
      return `${display}:${m} ${suffix}`;
    }
    return `${firstDay.slice(0, 3)}–${lastDay.slice(0, 3)} ${format(first.start)}–${format(first.end)}`;
  }

  function handleViewTreatment(record)
  {
    setSelectedTreatment(record);
    setShowTreatmentModal(true);
  }

  async function handleViewRecord(patient)
  {
    setSelectedRecordPatient(patient);
    setRecordTab("info");
    try
    {
      const [recordResponse, fileResponse, billingResponse] = await Promise.all([
        getPatientRecordsApi(patient.id),
        getMedicalFilesApi(patient.id),
        getBillingDocumentsApi(patient.id)
      ]);
      setPatientRecords(recordResponse.records || []);
      setMedicalFiles(fileResponse.files || []);
      setBillingDocuments(billingResponse.documents || []);
    }
    catch (error)
    {
      console.error(error);
      setPatientRecords([]);
      setMedicalFiles([]);
    }
    setShowRecordModal(true);
  }

  async function refreshMedicalFiles()
  {
    if (!selectedRecordPatient) return;
    try
    {
      const response = await getMedicalFilesApi(selectedRecordPatient.id);
      setMedicalFiles(response.files || []);
    }
    catch (error) { console.error(error); }
  }

  async function refreshBillingDocuments()
  {
    if (!selectedRecordPatient) return;
    try
    {
      const response = await getBillingDocumentsApi(selectedRecordPatient.id);
      setBillingDocuments(response.documents || []);
    }
    catch (error) { console.error(error); }
  }

  async function handleDeleteMedicalFile(id)
  {
    if (!window.confirm("Delete this file?")) return;
    try
    {
      await deleteMedicalFileApi(id);
      refreshMedicalFiles();
    }
    catch (error)
    {
      console.error(error);
      alert("Unable to delete file.");
    }
  }

  function requestArchiveMedicalFile(file)
  {
    setArchiveRequest({ type: "medical", id: file.id, name: file.title || file.file_name || "this medical file" });
    setArchivePassword("");
    setArchiveError("");
  }

  function requestArchiveBillingDocument(doc)
  {
    setArchiveRequest({ type: "billing", id: doc.id, name: doc.title || doc.file_name || "this billing document" });
    setArchivePassword("");
    setArchiveError("");
  }

  function cancelArchiveRequest()
  {
    if (archiveLoading) return;
    setArchiveRequest(null);
    setArchivePassword("");
    setArchiveError("");
  }

  async function confirmArchiveRequest()
  {
    if (!archiveRequest) return;
    if (!archivePassword) { setArchiveError("Password is required."); return; }
    try
    {
      setArchiveLoading(true);
      setArchiveError("");
      if (archiveRequest.type === "medical")
      {
        await archivePatientFileApi(archiveRequest.id);
        await refreshMedicalFiles();
      }
      else
      {
        await archiveBillingDocumentApi(archiveRequest.id);
        await refreshBillingDocuments();
      }
      setArchiveRequest(null);
      setArchivePassword("");
    }
    catch (error)
    {
      console.error(error);
      setArchiveError(error.message || "Unable to archive this item.");
    }
    finally { setArchiveLoading(false); }
  }

  async function handleUploadMedicalFile()
  {
    console.log("UPLOAD BUTTON CLICKED");
    const file = selectedUploadFile;
    if (!file || !selectedRecordPatient) { alert("Please choose a file."); return; }
    try
    {
      const filePath = `${selectedRecordPatient.id}/${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage.from("medical-files").upload(filePath, file, { upsert: true });
      if (uploadError) throw uploadError;
      await uploadMedicalFileApi({
        patient_id: selectedRecordPatient.is_guest ? null : selectedRecordPatient.id,
        guest_email: selectedRecordPatient.email,
        guest_contact: selectedRecordPatient.contact_number,
        uploaded_by: selectedDentist?.id || null,
        uploaded_by_role: "staff",
        document_category: selectedUploadType,
        file_type: selectedUploadType,
        file_name: file.name,
        storage_path: filePath,
        mime_type: file.type,
        size_bytes: file.size,
        taken_at: new Date().toISOString()
      });
      await refreshMedicalFiles();
      setSelectedUploadFile(null);
      setShowUploadModal(false);
      alert("Medical file uploaded.");
    }
    catch (error)
    {
      console.error(error);
      alert("Upload failed.");
    }
  }

  async function handleUploadBillingDocument()
  {
    const file = selectedUploadFile;
    if (!file || !selectedRecordPatient) { alert("Please choose a file."); return; }
    try
    {
      const filePath = `${selectedRecordPatient.id}/${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage.from("medical-files").upload(filePath, file, { upsert: true });
      if (uploadError) throw uploadError;
      await uploadBillingDocumentApi({
        patient_id: selectedRecordPatient.is_guest ? null : selectedRecordPatient.id,
        guest_email: selectedRecordPatient.email,
        guest_contact: selectedRecordPatient.contact_number,
        uploaded_by: selectedDentist?.id,
        uploaded_by_role: "staff",
        document_type: billingUploadType,
        file_name: file.name,
        storage_path: filePath,
        mime_type: file.type,
        size_bytes: file.size
      });
      const response = await getBillingDocumentsApi(selectedRecordPatient.id);
      setBillingDocuments(response.documents || []);
      setShowUploadModal(false);
      setSelectedUploadFile(null);
      alert("Billing document uploaded.");
    }
    catch (error)
    {
      console.error(error);
      alert("Upload failed.");
    }
  }

  async function handleDownloadPdf()
  {
    const element = printRef.current;
    const canvas = await html2canvas(element);
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save(`${showFormModal.label}.pdf`);
  }

  async function loadTemplates()
  {
    const { data, error } = await supabase.from("templates").select("*").eq("is_archived", false).order("name");
    if (error) { console.log(error); return; }
    const withUrls = await Promise.all(
      (data || []).map(async (template) =>
      {
        let url = "";
        if (template.file_url)
        {
          const { data: signed } = await supabase.storage.from("template-files").createSignedUrl(template.file_url, 60 * 60);
          url = signed?.signedUrl || "";
        }
        return { ...template, url };
      })
    );
    setTemplates(withUrls);
  }
  
  async function loadDentists()
  {
    try
    {
      setLoadingDentists(true);
      const response = await getDentistsApi();
      console.log("DENTISTS:", response.dentists);
      setDentists(response.dentists || []);
    }
    catch (error) { console.error(error); }
    finally
    {
      setLoadingDentists(false);
    }
  }

  const selectedDentist = dentists.find(d => d.id === selected);

  function handleRequestAction(dentistId, reqId, action)
  {
    setRequestAction((prev) => ({ ...prev, [`${dentistId}-${reqId}`]: action }));
  }

  function handleESign(e)
  {
    e.preventDefault();
    if (signatureText.trim().length > 2) { setSigned(true); setEsignMode(false); }
  }

  async function handleSelectDentist(id)
  {
    setSelected(id);
    setActiveTab("overview");
    setSidebarOpen(false);
    setLoadingDentist(true);
    const leaveResponse = await getLeaveRequestsApi(id);
    console.log("LEAVE RESPONSE:", leaveResponse);
    setLeaveRequests(leaveResponse.requests || []);
    try
    {
      const patientResponse = await getMyPatientsApi(id);
      setMyPatients(patientResponse.patients || []);
      const earningsResponse = await getDentistEarningsApi(id);
      const earningsData = earningsResponse.detailedEarnings || earningsResponse.earnings || [];
      setEarnings(earningsData);
      const leaveResponse2 = await getLeaveRequestsApi(id);
      setLeaveRequests(leaveResponse2.requests || []);
      setTotalCommission(earningsResponse.totalCommission || 0);
      setTotalEarnings(earningsResponse.totalEarnings || 0);
      const today = new Date().toISOString().split("T")[0];
      const todayCommission = earningsData.filter(row => row.appointment_date === today).reduce((sum, row) => sum + Number(row.commission || 0), 0);
      setDailyCommission(todayCommission);
      console.log("PATIENTS:", patientResponse.patients);
      console.log("EARNINGS:", earningsData);
    }
    catch (error) { console.error(error); }
    const scheduleResponse = await getDentistScheduleApi(id);
    if (scheduleResponse.lunch)
    {
      const savedAppliesTo = scheduleResponse.lunch.applies_to || "all_days";
      if (savedAppliesTo.startsWith("custom:"))
      {
        setLunchBreak({ start: scheduleResponse.lunch.lunch_start?.slice(0, 5) || "12:00", end: scheduleResponse.lunch.lunch_end?.slice(0, 5) || "13:00", applies_to: "custom" });
        setCustomLunchDays(savedAppliesTo.replace("custom:", "").split(",").filter(Boolean));
      }
      else
      {
        setLunchBreak({ start: scheduleResponse.lunch.lunch_start?.slice(0, 5) || "12:00", end: scheduleResponse.lunch.lunch_end?.slice(0, 5) || "13:00", applies_to: savedAppliesTo });
        setCustomLunchDays([]);
      }
    }
    else
    {
      setLunchBreak({ start: "12:00", end: "13:00", applies_to: "all_days" });
      setCustomLunchDays([]);
    }
    console.log("SCHEDULE:", scheduleResponse);
    
    if (scheduleResponse.hours?.length)
    {
      const hours = {};
      scheduleResponse.hours.forEach((row) =>
      {
        hours[row.day_name] = { start: row.start_time.slice(0, 5), end: row.end_time.slice(0, 5), is_off: row.is_off };
      });
      setWorkingHours(hours);
    }
    setLoadingDentist(false);
  }

  const STATUS_COLOR = {
    Available: "dentists-status-available",
    Busy: "dentists-status-busy",
    "Off-Duty": "dentists-status-off",
  };

  async function handleSaveSchedule()
  {
    if (!selectedDentist) return;
    try
    {
      console.log("SENDING WORKING HOURS:", workingHours);
      const response = await saveDentistScheduleApi(selectedDentist.id, { workingHours, lunchBreak: { start: lunchBreak.start, end: lunchBreak.end, applies_to: getLunchAppliesToValue() } });
      console.log("SAVE RESPONSE:", response);
      alert("Schedule saved successfully.");
    }
    catch (error)
    {
      console.error(error);
      alert("Failed to save schedule.");
    }
  }

  function downloadTemplate(template)
  {
    const link = document.createElement("a");
    link.href = template.url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.download = template.name || "template";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  function printTemplate(template)
  {
    const printWindow = window.open("", "_blank");
    if (!printWindow) { alert("Please allow pop-ups to print this file."); return; }
    printWindow.document.write(`<html><head><title>${template.name}</title><style>body{margin:0;padding:24px;display:flex;justify-content:center;align-items:center;background:white;}img{max-width:100%;max-height:100vh;object-fit:contain;}</style></head><body><img src="${template.url}" onload="window.focus();window.print();" /></body></html>`);
    printWindow.document.close();
  }

  async function downloadTemplate(template)
  {
    try
    {
      const response = await fetch(template.url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = template.name || "download";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    }
    catch (error) { console.error(error); alert("Unable to download file."); }
  }

  const KNOWN_TEMPLATE_TYPES = ["consent", "clearance", "prescription", "referral", "xray"];

  const filteredTemplates = templates.filter((template) =>
  {
    const matchesSearch = (template.name || "").toLowerCase().includes(templateSearch.toLowerCase());
    const type = (template.type || "").toLowerCase();
    const matchesType = templateFilter === "all" ? true : templateFilter === "other" ? !KNOWN_TEMPLATE_TYPES.includes(type) : type === templateFilter;
    return matchesSearch && matchesType;
  });

  return (
    <div className="dentists-root">
      <div className="dentists-mobile-bar">
        <button className="dentists-sidebar-toggle" onClick={() => setSidebarOpen(true)} aria-label="Open dentist list">
          <Icon icon="mdi:doctor" aria-hidden="true" />Dentists
        </button>
      </div>
      
      <div className="dentists-inner">
        {sidebarOpen && <div className="dentists-sidebar-overlay" onClick={() => setSidebarOpen(false)} />}

        <aside className={`dentists-sidebar${sidebarOpen ? " dentists-sidebar-open" : ""}`}>

          <div className="dentists-sidebar-header">
            <h1 className="dentists-sidebar-title"><Icon icon="mdi:doctor" aria-hidden="true" /> Dentists</h1>
            <select value={branchFilter} onChange={(e) => setBranchFilter(e.target.value)} className="dentists-branch-select">
              <option value="All">All Branches</option>
              <option value="Hagonoy">Hagonoy</option>
              <option value="Paombong">Paombong</option>
            </select>
          </div>

          <div className="dentists-sidebar-search-wrap">
            <Icon icon="mdi:magnify" className="dentists-search-icon" aria-hidden="true" />
            <input className="dentists-search-input" placeholder="Search Dentists" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>

          {loadingDentists? <div className="dentists-list-loading"><Spinner /></div>
            : <ul className="dentists-dentist-list">
            {filtered.map((d) => (
                <li key={d.id} className={`dentists-dentist-item ${selected === d.id ? "dentists-dentist-item-selected" : ""}`} onClick={() => handleSelectDentist(d.id)}>
                  <div className="dentists-dentist-avatar">
                    {d.avatar_url ? <img src={d.avatar_url} alt={`${d.first_name} ${d.last_name}`} className="dentists-dentist-avatar-img" /> : <>{(d.first_name?.[0] || "")}{(d.last_name?.[0] || "")}</>}
                  </div>
                  <div className="dentists-dentist-meta">
                    <span className="dentists-dentist-name">{d.first_name} {d.last_name}</span>
                    <span className="dentists-dentist-spec">Dentist</span>
                  </div>
                  <span className={`dentists-status-pill ${STATUS_COLOR[d.status]}-pill`}>{d.status}</span>
                  <span className={`dentists-active-badge ${d.is_archived ? "dentists-active-inactive" : "dentists-active-active"}`}>{d.is_archived ? "Inactive" : "Active"}</span>
                </li>
              ))}
            </ul>
          }
        </aside>

        <main className="dentists-detail">
          {!selectedDentist ? (
            <div className="dentists-detail-empty">
              <Icon icon="mdi:doctor" className="dentists-empty-icon" aria-hidden="true" />
              <p>Select a dentist to view their profile</p>
            </div>
          ) : loadingDentist ? (
            <div className="dentists-detail-loading"><Spinner /></div>
          ) : (
            <div className="dentists-detail-content">
              <div className="dentists-detail-hero">
                <div className="dentists-dentist-avatar-lg">
                  {selectedDentist.avatar_url ? <img src={selectedDentist.avatar_url} alt={`${selectedDentist.first_name} ${selectedDentist.last_name}`} className="dentists-dentist-avatar-lg-img" /> : <>{(selectedDentist.first_name?.[0] || "")}{(selectedDentist.last_name?.[0] || "")}</>}
                </div>

                <div className="dentists-detail-hero-info">
                  <h2 className="dentists-detail-name">{`${selectedDentist.first_name} ${selectedDentist.last_name}`}</h2>
                  <p className="dentists-detail-spec">Dentist</p>
                  <p className="dentists-detail-sub">{selectedDentist.contact_number || "N/A"} · {selectedDentist.email}</p>
                  <p className="dentists-detail-sub"><IconText icon="mdi:map-marker-outline">{selectedDentist.branch_id} Branch</IconText></p>
                  <p className="dentists-detail-schedule"><IconText icon="mdi:clock-outline">{formatWorkingHours(workingHours)}</IconText></p>
                </div>

                <div className="dentists-detail-hero-right">
                  <span className={`dentists-status-pill ${STATUS_COLOR[selectedDentist.status]}-pill`}>{selectedDentist.status}</span>
                  <span className={`dentists-active-badge ${selectedDentist.is_archived ? "dentists-active-inactive" : "dentists-active-active"}`}>{selectedDentist.is_archived ? "Inactive" : "Active"}</span>
                  
                  <div className="dentists-commission-box">
                    <span className="dentists-commission-label">Today's Commission</span>
                    <span className="dentists-commission-value">₱{Number(dailyCommission || 0).toLocaleString()}</span>
                    <span className="dentists-commission-rate">30% Rate</span>
                  </div>
                </div>
              </div>

              <div className="dentists-detail-tabs">
                <button className={`dentists-tab-btn${activeTab === "overview" ? " dentists-tab-active" : ""}`} onClick={() => setActiveTab("overview")}><Icon icon="mdi:view-dashboard-outline" aria-hidden="true" />Overview</button>
                <button className={`dentists-tab-btn${activeTab === "patients" ? " dentists-tab-active" : ""}`} onClick={() => setActiveTab("patients")}><Icon icon="mdi:account-group-outline" aria-hidden="true" />Patients</button>
                <button className={`dentists-tab-btn${activeTab === "schedule" ? " dentists-tab-active" : ""}`} onClick={() => setActiveTab("schedule")}><Icon icon="mdi:calendar-clock-outline" aria-hidden="true" />Schedule</button>
                <button className={`dentists-tab-btn${activeTab === "forms" ? " dentists-tab-active" : ""}`} onClick={() => setActiveTab("forms")}><Icon icon="mdi:file-document-edit-outline" aria-hidden="true" />Forms</button>
              </div>

              {activeTab === "overview" && (
                <div className="dentists-tab-panel">
                  <div className="dentists-overview-grid">
                    <div className="dentists-ov-card dentists-ov-card-highlight">
                      <span className="dentists-ov-icon"><Icon icon="mdi:cash" aria-hidden="true" /></span>
                      <div>
                        <span className="dentists-ov-value">₱{Number(dailyCommission || 0).toLocaleString()}</span>
                        <span className="dentists-ov-label">Daily Commission</span>
                      </div>
                    </div>
                    <div className="dentists-ov-card">
                      <span className="dentists-ov-icon"><Icon icon="mdi:chart-line" aria-hidden="true" /></span>
                      <div>
                        <span className="dentists-ov-value">₱{Number(totalCommission || 0).toLocaleString()}</span>
                        <span className="dentists-ov-label">Total Commission</span>
                      </div>
                    </div>
                    <div className="dentists-ov-card">
                      <span className="dentists-ov-icon"><Icon icon="mdi:cash" aria-hidden="true" /></span>
                      <div>
                        <span className="dentists-ov-value">₱{Number(totalEarnings || 0).toLocaleString()}</span>
                        <span className="dentists-ov-label">Total Earnings</span>
                      </div>
                    </div>
                    <div className="dentists-ov-card">
                      <span className="dentists-ov-icon"><Icon icon="mdi:account-group-outline" aria-hidden="true" /></span>
                      <div>
                        <span className="dentists-ov-value">{myPatients.length}</span>
                        <span className="dentists-ov-label">Patients Handled</span>
                      </div>
                    </div>
                  </div>
                  <div className="dentists-section-card">
                    <h3 className="dentists-section-title">
                      <IconText icon="mdi:cash-multiple">Commission Breakdown</IconText>
                      <table className="dentists-commission-table">
                        <thead>
                          <tr>
                            <th className="dentists-date-col">Date</th>
                            <th className="dentists-patient-col">Patient</th>
                            <th className="dentists-procedure-col">Treatment</th>
                            <th className="dentists-earnings-col">Amount</th>
                            <th className="dentists-commission-col">Commission</th>
                          </tr>
                        </thead>
                        <tbody>
                          {earnings.map(row => (
                            <tr key={`${row.patient_name}-${row.appointment_date}`}>
                              <td>{row.appointment_date}</td>
                              <td className="dentists-patient-col">{row.patient_name}</td>
                              <td className="dentists-procedure-col">{row.treatments}</td>
                              <td className="dentists-earnings-col">₱{Number(row.earnings).toLocaleString()}</td>
                              <td className="dentists-commission-col">₱{Number(row.commission).toLocaleString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </h3>
                  </div>
                </div>
              )}

              {activeTab === "patients" && (
                <div className="dentists-tab-panel">
                  <div className="dentists-patient-search-wrap">
                    <input className="dentists-patient-search-input" placeholder="Search patient..." value={patientSearch} onChange={(e) => setPatientSearch(e.target.value)} />
                  </div>
                  {myPatients.length === 0 ? (
                    <p className="dentists-no-data-center">No patients handled yet.</p>
                  ) : (
                    <ul className="dentists-handled-list">
                      {myPatients.filter((p) => (p.name || "").toLowerCase().includes(patientSearch.toLowerCase())).map((p) => (
                        <li key={p.id} className="dentists-handled-item">
                          <div className="dentists-handled-avatar">
                            {p.avatar_url ? <img src={p.avatar_url} alt={p.name} className="dentists-handled-avatar-img" /> : p.name?.split(" ").map(n => n[0]).join("").slice(0, 2)}
                          </div>
                          <div className="dentists-handled-meta">
                            <h4 className="dentists-handled-name">{p.name}</h4>
                            <span className="dentists-handled-proc-label">Last Treatment</span>
                            <span className="dentists-handled-proc">{p.reason_for_visit}</span>
                          </div>
                          <div className="dentists-handled-date">
                            <span className="dentists-date-label">Last Visit</span>
                            <span className="dentists-date-val">{p.appointment_date}</span>
                          </div>
                          <button className="dentists-view-record-btn" onClick={() => handleViewRecord(p)}>View Record</button>
                        </li>
                      ))}
                    </ul>
                  )}

                  {showRecordModal && selectedRecordPatient && (
                    <div className="dentists-record-modal-overlay" onClick={() => setShowRecordModal(false)}>
                      <div className="dentists-record-modal" onClick={(e) => e.stopPropagation()}>
                        <button className="dentists-record-modal-close" onClick={() => setShowRecordModal(false)}><Icon icon="mdi:close" aria-hidden="true" /></button>
                        <h2>Patient Record</h2>
                        <div className="dentists-record-tabs">
                          <button className={recordTab === "info" ? "dentists-record-tab dentists-active" : "dentists-record-tab"} onClick={() => setRecordTab("info")}><IconText icon="mdi:clipboard-text-outline">Information</IconText></button>
                          <button className={recordTab === "medical" ? "dentists-record-tab dentists-active" : "dentists-record-tab"} onClick={() => setRecordTab("medical")}><IconText icon="mdi:folder-open-outline">Medical Files</IconText></button>
                          <button className={recordTab === "billing" ? "dentists-record-tab dentists-active" : "dentists-record-tab"} onClick={() => setRecordTab("billing")}><IconText icon="mdi:receipt-text-outline">Billing Documents</IconText></button>
                          <button className={recordTab === "notes" ? "dentists-record-tab dentists-active" : "dentists-record-tab"} onClick={() => setRecordTab("notes")}><IconText icon="mdi:note-text-outline">Treatment History</IconText></button>
                        </div>

                        {recordTab === "info" && (
                          <>
                            <div className="dentists-record-header">
                              <div className="dentists-record-avatar">
                                {selectedRecordPatient.avatar_url ? <img src={selectedRecordPatient.avatar_url} alt="" /> : <span>{selectedRecordPatient.name?.split(" ").map(n => n[0]).join("").slice(0, 2)}</span>}
                              </div>
                              <div className="dentists-record-header-info">
                                <h2 className="dentists-record-patient-name">{selectedRecordPatient.name}</h2>
                                <span className="dentists-record-patient-badge">Registered Patient</span>
                                <div className="dentists-record-contact">
                                  <span><IconText icon="mdi:phone-outline">{selectedRecordPatient.contact_number || "No Contact"}</IconText></span>
                                  <span><IconText icon="mdi:email-outline">{selectedRecordPatient.email}</IconText></span>
                                </div>
                              </div>
                            </div>
                            <div className="dentists-record-stats">
                              <div className="dentists-record-stat">
                                <div className="dentists-record-stat-icon"><Icon icon="mdi:tooth-outline" aria-hidden="true" /></div>
                                <div><h4>Total Visits</h4><p>{patientRecords.length}</p></div>
                              </div>
                              <div className="dentists-record-stat">
                                <div className="dentists-record-stat-icon"><Icon icon="mdi:calendar-outline" aria-hidden="true" /></div>
                                <div><h4>Last Visit</h4><p>{patientRecords[0]?.record_date || "--"}</p></div>
                              </div>
                              <div className="dentists-record-stat">
                                <div className="dentists-record-stat-icon"><Icon icon="mdi:medical-bag" aria-hidden="true" /></div>
                                <div><h4>Latest Treatment</h4><p>{patientRecords[0]?.treatment_name || "--"}</p></div>
                              </div>
                            </div>
                          </>
                        )}

                        {recordTab === "medical" && (
                          <div className="dentists-record-section">
                            <div className="dentists-record-section-header">
                              <h3>Medical Files</h3>
                              <div><button className="dentists-upload-document-btn" onClick={() => setShowUploadModal(true)}>+ Upload Medical File</button></div>
                            </div>
                            {medicalFiles.length === 0 ? (
                              <div className="dentists-empty-record-box"><h4>No Medical Files</h4><p>Uploaded files will appear here.</p></div>
                            ) : (
                              <table className="dentists-record-files-table">
                                <thead><tr><th>File</th><th>Category</th><th>Date</th><th>Actions</th></tr></thead>
                                <tbody>
                                  {medicalFiles.map(file => (
                                    <tr key={file.id}>
                                      <td><IconText icon={FILE_TYPE_ICON[file.file_type] || FILE_TYPE_ICON.other}>{file.title}</IconText></td>
                                      <td><span className={`dentists-file-badge dentists-${file.file_type}`}>{file.file_type === "xray" ? "X-Ray" : file.file_type === "lab" ? "Lab" : file.file_type === "clearance" ? "Clearance" : file.file_type === "consent" ? "Consent" : "Other"}</span></td>
                                      <td>{file.taken_at}</td>
                                      <td className="dentists-file-actions">
                                        <a href={file.file_url} target="_blank" rel="noreferrer" className="dentists-file-btn dentists-view"><IconText icon="mdi:eye-outline">View</IconText></a>
                                        <a href={file.file_url} download className="dentists-file-btn dentists-download"><IconText icon="mdi:download-outline">Download</IconText></a>
                                        <button className="dentists-file-btn dentists-archive" onClick={() => requestArchiveMedicalFile(file)}><IconText icon="mdi:archive-outline">Archive</IconText></button>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            )}
                          </div>
                        )}

                        {recordTab === "billing" && (
                          <div className="dentists-record-section">
                            <div className="dentists-record-section-header">
                              <h3>Billing Documents</h3>
                              <div>
                                <select value={billingUploadType} onChange={(e) => setBillingUploadType(e.target.value)} className="dentists-record-file-filter">
                                  <option value="receipt">Official Receipt</option>
                                  <option value="invoice">Invoice</option>
                                </select>
                                <button className="dentists-upload-document-btn" onClick={() => setShowUploadModal(true)}>+ Upload Billing Document</button>
                              </div>
                            </div>
                            {billingDocuments.length === 0 ? (
                              <div className="dentists-empty-record-box"><h4>No Billing Documents</h4><p>Upload receipts or invoices.</p></div>
                            ) : (
                              <table className="dentists-record-files-table">
                                <thead><tr><th>File</th><th>Type</th><th>Uploaded</th><th>Actions</th></tr></thead>
                                <tbody>
                                  {billingDocuments.map(doc => (
                                    <tr key={doc.id}>
                                      <td><IconText icon={FILE_TYPE_ICON[doc.document_type] || FILE_TYPE_ICON.invoice}>{doc.title}</IconText></td>
                                      <td><span className={`dentists-file-badge dentists-${doc.document_type}`}>{doc.document_type === "receipt" ? "Receipt" : "Invoice"}</span></td>
                                      <td>{new Date(doc.created_at).toLocaleDateString()}</td>
                                      <td className="dentists-file-actions">
                                        <a href={doc.file_url} target="_blank" rel="noreferrer" className="dentists-file-btn dentists-view"><IconText icon="mdi:eye-outline">View</IconText></a>
                                        <a href={doc.file_url} download className="dentists-file-btn dentists-download"><IconText icon="mdi:download-outline">Download</IconText></a>
                                        <button className="dentists-file-btn dentists-archive" onClick={() => requestArchiveBillingDocument(doc)}><IconText icon="mdi:archive-outline">Archive</IconText></button>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            )}
                          </div>
                        )}

                        {recordTab === "notes" && (
                          <>
                            <h3>Treatment History</h3>
                            {patientRecords.length === 0 ? (
                              <p>No records found.</p>
                            ) : (
                              <div className="dentists-record-history">
                                {patientRecords.map(record => (
                                  <div key={record.id} className="dentists-record-card">
                                    <div className="dentists-record-date"><IconText icon="mdi:calendar-outline">{record.record_date}</IconText></div>
                                    <h4><IconText icon="mdi:tooth-outline">{record.treatment_name}</IconText></h4>
                                    <button className="dentists-record-action-btn" onClick={() => handleViewTreatment(record)}>View Record</button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </>
                        )}

                      </div>
                    </div>
                  )}
                </div>
              )}

              {showUploadModal && (
                <div className="dentists-upload-modal-overlay" onClick={() => setShowUploadModal(false)}>
                  <div className="dentists-upload-modal" onClick={(e) => e.stopPropagation()}>
                    <h2>{recordTab === "billing" ? "Upload Billing Document" : "Upload Medical File"}</h2>
                    <label>Category</label>
                    {recordTab === "billing" ? (
                      <select value={billingUploadType} onChange={(e) => setBillingUploadType(e.target.value)}>
                        <option value="receipt">Official Receipt</option>
                        <option value="invoice">Invoice</option>
                      </select>
                    ) : (
                      <select value={selectedUploadType} onChange={(e) => setSelectedUploadType(e.target.value)}>
                        <option value="xray">X-Ray</option>
                        <option value="lab">Laboratory Result</option>
                        <option value="clearance">Medical Clearance</option>
                        <option value="consent">Consent Form</option>
                        <option value="other">Other</option>
                      </select>
                    )}
                    <label>Choose File</label>
                    <input type="file" onChange={(e) => setSelectedUploadFile(e.target.files[0])} />
                    <div className="dentists-upload-modal-actions">
                      <button onClick={() => setShowUploadModal(false)}>Cancel</button>
                      <button onClick={recordTab === "billing" ? handleUploadBillingDocument : handleUploadMedicalFile}>Upload</button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "schedule" && (
                <div className="dentists-tab-panel">
                  <div className="dentists-section-card" style={{ marginBottom: 16 }}>
                    <h3 className="dentists-section-title"><IconText icon="mdi:clock-outline">Working Hours</IconText></h3>
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      {DAYS.map((day) => (
                        <div key={day} className="dentists-dact-day-row">
                          <span className="dentists-dact-day-label">{day}</span>
                          <input type="time" value={workingHours[day]?.start} className="dentists-dact-time-input" onChange={(e) => setWorkingHours((prev) => ({ ...prev, [day]: { ...prev[day], start: e.target.value } }))} />
                          <span className="dentists-dact-time-sep">–</span>
                          <input type="time" value={workingHours[day]?.end} className="dentists-dact-time-input" onChange={(e) => setWorkingHours((prev) => ({ ...prev, [day]: { ...prev[day], end: e.target.value } }))} />
                          <label className="dentists-dact-off-toggle"><input type="checkbox" checked={workingHours[day]?.is_off} onChange={(e) => setWorkingHours((prev) => ({ ...prev, [day]: { ...prev[day], is_off: e.target.checked } }))} />Off</label>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="dentists-section-card" style={{ marginBottom: 16 }}>
                    <h3 className="dentists-section-title"><IconText icon="mdi:silverware-fork-knife">Lunch Break</IconText></h3>
                    <div className="dentists-dact-form-grid">
                      <div className="dentists-dact-form-group">
                        <label>Lunch Start</label>
                        <input type="time" value={lunchBreak.start} onChange={(e) => setLunchBreak({ ...lunchBreak, start: e.target.value })} />
                      </div>
                      <div className="dentists-dact-form-group">
                        <label>Lunch End</label>
                        <input type="time" value={lunchBreak.end} onChange={(e) => setLunchBreak({ ...lunchBreak, end: e.target.value })} />
                      </div>
                      <div className="dentists-dact-form-group dentists-full">
                        <label>Applies To</label>
                        <select value={lunchBreak.applies_to} onChange={(e) => setLunchBreak({ ...lunchBreak, applies_to: e.target.value })}>
                          <option value="all_days">All Days</option>
                          <option value="weekdays">Weekdays Only</option>
                          <option value="custom">Custom</option>
                        </select>
                      </div>
                      {lunchBreak.applies_to === "custom" && (
                        <div className="dentists-dact-form-group dentists-full">
                          <label>Custom Lunch Days</label>
                          <div className="dentists-custom-lunch-days">
                            {DAYS.map((day) => (
                              <label key={day} className="dentists-custom-lunch-day">
                                <input type="checkbox" checked={customLunchDays.includes(day)} onChange={() => toggleCustomLunchDay(day)} />
                                {day}
                              </label>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="dentists-leave-section-card" style={{ marginBottom: 16 }}>
                    <div className="dentists-leave-section-header">
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <h3 className="dentists-section-title" style={{ margin: 0 }}><IconText icon="mdi:calendar-account-outline">Leave Requests</IconText></h3>
                        {pendingCount > 0 && <span className="dentists-leave-pending-badge">{pendingCount} Pending</span>}
                      </div>
                    </div>
                    {leaveRequests.length === 0 ? (
                      <p className="dentists-no-data" style={{ marginTop: 4 }}>No leave requests from this dentist yet.</p>
                    ) : (
                      <ul className="dentists-leave-list">
                        {leaveRequests.map((l) => (
                          <li key={l.id} className={`dentists-leave-item dentists-leave-item-${l.status.toLowerCase()}`}>
                            <div className="dentists-leave-type-badge"><Icon icon={LEAVE_ICON[l.leave_type] || DEFAULT_LEAVE_ICON} aria-hidden="true" /></div>
                            <div className="dentists-leave-meta">
                              <span className="dentists-leave-type-label">{l.leave_type}</span>
                              {l.leave_type === "Others" && l.leave_others && <span className="dentists-leave-reason">"{l.leave_others}"</span>}
                              <span className="dentists-leave-dates"><IconText icon="mdi:calendar-range-outline">{l.leave_from === l.leave_to ? l.leave_from : `${l.leave_from} → ${l.leave_to}`}</IconText></span>
                              {l.reason && <span className="dentists-leave-reason">"{l.reason}"</span>}
                              {l.staff_note && <span className="dentists-leave-remark-display"><IconText icon="mdi:comment-text-outline"><em>{l.staff_note}</em></IconText></span>}
                              {(l.status === "Approved" || l.status === "Declined") && (
                                <>
                                  <span className="dentists-leave-reviewed-by"><IconText icon="mdi:account-check-outline">Reviewed by {l.reviewed_by}</IconText></span>
                                  {l.reviewed_at && <span className="dentists-leave-reviewed-date"><IconText icon="mdi:clock-outline">{new Date(l.reviewed_at).toLocaleDateString("en-PH", { year: "numeric", month: "short", day: "numeric" })}</IconText></span>}
                                </>
                              )}
                              <span className="dentists-leave-submitted-on">Filed {l.submittedOn}</span>
                            </div>
                            <div className="dentists-leave-actions-col">
                              <span className={`dentists-status-pill ${STATUS_COLOR[selectedDentist.status]}-pill`}>{selectedDentist.status}
                                {l.status?.toLowerCase() === "pending" ? <IconText icon="mdi:timer-sand">Pending</IconText> : l.status?.toLowerCase() === "approved" ? <IconText icon="mdi:check-circle-outline">Approved</IconText> : l.status?.toLowerCase() === "declined" ? <IconText icon="mdi:close-circle-outline">Declined</IconText> : l.status?.toLowerCase() === "cancelled" ? <IconText icon="mdi:cancel">Cancelled</IconText> : <IconText icon="mdi:help-circle-outline">{l.status}</IconText>}
                              </span>
                              {l.status?.toLowerCase() === "pending" && (
                                <button className="dentists-leave-review-btn" onClick={() => { setShowRemarkModal({ ...l, dentistId: selectedDentist.id }); setRemarkInput(""); }}>Review →</button>
                              )}
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                  <div style={{ display: "flex", justifyContent: "flex-end" }}>
                    <button className="dentists-dact-btn dentists-dact-primary" onClick={handleSaveSchedule}><IconText icon="mdi:content-save-outline">Save Schedule</IconText></button>
                  </div>
                </div>
              )}

              {activeTab === "forms" && (
                <div className="dentists-tab-panel">
                  <p className="dentists-forms-intro">Prepare and e-sign clinical forms for your patients. Choose a template below.</p>
                  <div className="dentists-forms-toolbar">
                    <input className="dentists-forms-search" placeholder="Search templates..." value={templateSearch} onChange={(e) => setTemplateSearch(e.target.value)} />
                    <select className="dentists-forms-filter" value={templateFilter} onChange={(e) => setTemplateFilter(e.target.value)}>
                      <option value="all">All Templates</option>
                      <option value="consent">Consent Form</option>
                      <option value="clearance">Medical Clearance</option>
                      <option value="prescription">Prescription</option>
                      <option value="referral">Referral Letter</option>
                      <option value="xray">X-Ray Request</option>
                      <option value="other">Others</option>
                    </select>
                  </div>
                  <div className="dentists-forms-list">
                    {filteredTemplates.map((template) => (
                      <div key={template.id} className="dentists-template-row">
                        <div className="dentists-template-left">
                          <div className="dentists-template-icon"><Icon icon="mdi:file-document-outline" aria-hidden="true" /></div>
                          <div>
                            <h3>{template.name}</h3>
                            <span className="dentists-template-type">{template.type}</span>
                          </div>
                        </div>
                        <div className="dentists-template-actions">
                          <a href={template.url} target="_blank" rel="noreferrer" className="dentists-template-btn"><IconText icon="mdi:eye-outline">View</IconText></a>
                          <button className="dentists-template-btn" onClick={() => downloadTemplate(template)}><IconText icon="mdi:download-outline">Download</IconText></button>
                          <button className="dentists-template-btn" onClick={() => printTemplate(template)}><IconText icon="mdi:printer-outline">Print</IconText></button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          )}

          {showFormModal && (
            <div className="dentists-modal-overlay" onClick={() => setShowFormModal(null)}>
              <div className="dentists-form-modal dentists-modal-form-doc" onClick={(e) => e.stopPropagation()}>
                <div className="dentists-modal-header">
                  <h3>{showFormModal.label}</h3>
                  <button className="dentists-modal-close" onClick={() => setShowFormModal(null)}><Icon icon="mdi:close" aria-hidden="true" /></button>
                </div>
                <div className="dentists-form-doc-body">
                  <div className="dentists-doc-preview" ref={printRef}>
                    <div className="dentists-doc-letterhead">
                      <span className="dentists-doc-clinic"><IconText icon="mdi:tooth-outline">Juana Smile Dental Clinic</IconText></span>
                      <span className="dentists-doc-address">DentConnect Patient Forms</span>
                    </div>
                    <div className="dentists-doc-divider" />
                    {showFormModal.id === "reseta" && (
                      <div className="dentists-doc-content">
                        <h4 className="dentists-doc-title">PRESCRIPTION</h4>
                        <div className="dentists-doc-field"><label>Patient Name:</label><div className="dentists-doc-input-line" /></div>
                        <div className="dentists-doc-field"><label>Date:</label><div className="dentists-doc-input-line" /></div>
                        <div className="dentists-doc-rx">℞</div>
                        <div className="dentists-doc-rx-lines">
                          <div className="dentists-doc-input-line dentists-long" />
                          <div className="dentists-doc-input-line dentists-long" />
                          <div className="dentists-doc-input-line dentists-long" />
                        </div>
                      </div>
                    )}
                    {showFormModal.id === "medcert" && (
                      <div className="dentists-doc-content">
                        <h4 className="dentists-doc-title">MEDICAL CERTIFICATE</h4>
                        <p className="dentists-doc-para">To Whom It May Concern:</p>
                        <p className="dentists-doc-para">This is to certify that</p>
                        <div className="dentists-doc-input-line dentists-long" />
                        <p className="dentists-doc-para">was examined and is currently under my care for dental treatment.</p>
                      </div>
                    )}
                    {showFormModal.id === "referral" && (
                      <div className="dentists-doc-content">
                        <h4 className="dentists-doc-title">REFERRAL LETTER</h4>
                        <div className="dentists-doc-field"><label>Patient:</label><div className="dentists-doc-input-line" /></div>
                        <div className="dentists-doc-field"><label>Referred To:</label><div className="dentists-doc-input-line" /></div>
                      </div>
                    )}
                    {showFormModal.id === "xray" && (
                      <div className="dentists-doc-content">
                        <h4 className="dentists-doc-title">X-RAY REQUEST</h4>
                        <div className="dentists-doc-field"><label>Patient:</label><div className="dentists-doc-input-line" /></div>
                      </div>
                    )}
                    <div className="dentists-esign-section">
                      {!signed ? (
                        <>
                          <div className="dentists-esign-label">{selectedDentist?.first_name} {selectedDentist?.last_name}</div>
                          <div className="dentists-esign-title">Dentist</div>
                          {!esignMode ? (
                            <button className="dentists-btn-esign" onClick={() => setEsignMode(true)}><IconText icon="mdi:draw-pen">Add E-Signature</IconText></button>
                          ) : (
                            <form className="dentists-esign-form" onSubmit={handleESign}>
                              <input className="dentists-esign-input" placeholder="Type your full name..." value={signatureText} onChange={(e) => setSignatureText(e.target.value)} />
                              <div className="dentists-esign-btns">
                                <button type="button" className="dentists-btn-esign-cancel" onClick={() => setEsignMode(false)}>Cancel</button>
                                <button type="submit" className="dentists-btn-esign-confirm">Sign Document</button>
                              </div>
                            </form>
                          )}
                        </>
                      ) : (
                        <div className="dentists-signed-stamp">
                          <div className="dentists-signature-text">{signatureText}</div>
                          <div className="dentists-signed-label"><IconText icon="mdi:check-circle-outline">E-Signed</IconText></div>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="dentists-form-doc-actions">
                    <button className="dentists-btn-print" onClick={handlePrint}><IconText icon="mdi:printer-outline">Print</IconText></button>
                    <button className="dentists-btn-download" onClick={handleDownloadPdf}><IconText icon="mdi:download-outline">Download PDF</IconText></button>
                    <button className="dentists-btn-send"><IconText icon="mdi:send-outline">Send to Patient</IconText></button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {showRemarkModal && (
            <div className="dentists-record-modal-overlay" onClick={() => setShowRemarkModal(null)}>
              <div className="dentists-record-modal dentists-leave-review-modal" onClick={(e) => e.stopPropagation()}>
                <h2>Review Leave Request</h2>
                <div className="dentists-leave-review-summary">
                  <div className="dentists-leave-review-icon"><Icon icon={LEAVE_ICON[showRemarkModal.leave_type] || DEFAULT_LEAVE_ICON} aria-hidden="true" /></div>
                  <div className="dentists-leave-review-info">
                    <div className="dentists-leave-review-type">{showRemarkModal.leave_type}</div>
                    <div className="dentists-leave-review-dates">{showRemarkModal.leave_from}{" → "}{showRemarkModal.leave_to}</div>
                    <div className="dentists-leave-review-filed">Filed: {showRemarkModal.submittedOn || showRemarkModal.created_at}</div>
                  </div>
                </div>
                <div className="dentists-leave-review-reason-box">
                  <strong>Reason</strong>
                  <p>{showRemarkModal.reason}</p>
                </div>
                <textarea className="dentists-remark-input" placeholder="Add remarks for the dentist..." value={remarkInput} onChange={(e) => setRemarkInput(e.target.value)} />
                <div className="dentists-leave-review-actions">
                  <button className="dentists-decline-btn" onClick={() => handleLeaveAction(showRemarkModal.id, "declined")}><IconText icon="mdi:close-circle-outline">Decline</IconText></button>
                  <button className="dentists-approve-btn" onClick={() => handleLeaveAction(showRemarkModal.id, "approved")}><IconText icon="mdi:check-circle-outline">Approve</IconText></button>
                </div>
              </div>
            </div>
          )}

          {archiveRequest && (
            <div className="dentists-record-modal-overlay" onClick={cancelArchiveRequest}>
              <div className="dentists-record-modal dentists-archive-confirm-modal" onClick={(e) => e.stopPropagation()}>
                <div className="dentists-modal-header">
                  <h3>Archive {archiveRequest.type === "medical" ? "Medical File" : "Billing Document"}</h3>
                  <button className="dentists-modal-close" onClick={cancelArchiveRequest} disabled={archiveLoading} aria-label="Close archive confirmation"><Icon icon="mdi:close" aria-hidden="true" /></button>
                </div>
                <div className="dentists-archive-confirm-body">
                  <p>Archive <strong>{archiveRequest.name}</strong>? It will no longer appear in the active patient record.</p>
                  <p>For security, please enter your current password to continue.</p>
                  <input type="password" className="dentists-confirm-input" placeholder="Enter your password" value={archivePassword} onChange={(e) => setArchivePassword(e.target.value)} onKeyDown={(e) => e.key === "Enter" && confirmArchiveRequest()} autoFocus disabled={archiveLoading} />
                  {archiveError && <div className="dentists-confirm-error">{archiveError}</div>}
                  <div className="dentists-modal-actions">
                    <button className="dentists-btn-esign-cancel" onClick={cancelArchiveRequest} disabled={archiveLoading}>Cancel</button>
                    <button className="dentists-file-btn dentists-archive" onClick={confirmArchiveRequest} disabled={archiveLoading}>{archiveLoading ? <Spinner size="sm" /> : <IconText icon="mdi:archive-outline">Archive</IconText>}</button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default Dentists;