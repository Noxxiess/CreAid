import { useState, useEffect } from "react";
import "../styles/systemdata.css";
import { supabase } from "../lib/supabase";

const PAGE_SIZE = 10;

const CATEGORIES = [
  {
    key: "hmo",
    label: "HMO",
    icon: "🏥",
    color: "teal",
    pageTitle: "HMO",
    pageSubtitle: "Manage health maintenance organization list.",
    addLabel: "+ New HMO",
    columns: ["Name", "Coverage Details", "Discount %", "Status"],
  },
  {
    key: "services",
    label: "Services",
    icon: "📄",
    color: "blue",
    pageTitle: "Services / Bill Items",
    pageSubtitle: "Manage account services or bill items list.",
    addLabel: "+ New Service",
    columns: ["Name", "Details", "Default Amount", "Duration"],
  },
  {
    key: "medicines",
    label: "Medicines",
    icon: "💊",
    color: "purple",
    pageTitle: "Medicines",
    pageSubtitle: "Manage clinic medicine inventory list.",
    addLabel: "+ New Medicine",
    columns: ["Name", "Generic Name", "Dosage", "Unit", "Stock"],
  },
  {
    key: "templates",
    label: "Templates",
    icon: "🗂️",
    color: "amber",
    pageTitle: "Templates",
    pageSubtitle: "Manage document and prescription templates.",
    addLabel: "+ New Template",
    columns: ["Name", "Type", "Last Updated"],
  },
  {
    key: "dental-habits",
    label: "Dental Habits",
    icon: "🦷",
    color: "coral",
    pageTitle: "Dental Habits",
    pageSubtitle: "Manage dental habit entries for patient records.",
    addLabel: "+ New Dental Habit",
    columns: ["Habit Name", "Description", "Risk Level"],
  },
  {
    key: "medical-conditions",
    label: "Medical Conditions",
    icon: "❤️",
    color: "red",
    pageTitle: "Medical Conditions",
    pageSubtitle: "Manage medical condition entries used in patient charts.",
    addLabel: "+ New Condition",
    columns: ["Condition Name", "ICD Code", "Notes"],
  },
  {
    key: "tooth-items",
    label: "Tooth Items",
    icon: "🦷",
    color: "green",
    pageTitle: "Tooth Items",
    pageSubtitle: "Manage tooth chart item definitions.",
    addLabel: "+ New Tooth Item",
    columns: ["Name", "Abbreviation", "Color Tag", "Category"],
  },
  {
    key: "recall-items",
    label: "Recall Items",
    icon: "🔔",
    color: "pink",
    pageTitle: "Recall Items",
    pageSubtitle: "Manage patient recall and follow-up templates.",
    addLabel: "+ New Recall Item",
    columns: ["Name", "Interval (days)", "Message Template"],
  },
];

const FIELD_MAP =
{
  "Name":             "name",
  "Generic Name":     "generic_name",
  "Dosage":           "dosage",
  "Unit":             "unit",
  "Stock":            "stock",
  "Details":          "description",
  "Default Amount":   "price",
  "Duration":         "duration",
  "Coverage Details": "coverage_details",
  "Discount %":       "discount_percent",
  "Status":           "status",
  "Habit Name":       "name",
  "Description":      "description",
  "Risk Level":       "risk_level",
  "Condition Name":   "name",
  "ICD Code":         "icd_code",
  "Notes":            "notes",
  "Abbreviation":     "abbreviation",
  "Color Tag":        "color_tag",
  "Category":         "category",
  "Type":             "type",
  "Last Updated":     "updated_at",
  "Interval (days)":  "interval_days",
  "Message Template": "message_template",
};

function StatusBadge({ value })
{
  const isActive = value?.toLowerCase() === "active";
  return (
    <span style={{
      display: "inline-flex",
      alignItems: "center",
      padding: "3px 10px",
      borderRadius: "20px",
      fontSize: "12px",
      fontWeight: 600,
      background: isActive ? "rgba(22,163,74,0.1)" : "rgba(156,163,175,0.15)",
      color: isActive ? "#15803d" : "#6b7280",
    }}>
      {value || "—"}
    </span>
  );
}

function RiskBadge({ value })
{
  const map =
  {
    Low:      { bg: "rgba(22,163,74,0.1)",   color: "#15803d" },
    Moderate: { bg: "rgba(234,179,8,0.12)",  color: "#a16207" },
    High:     { bg: "rgba(220,38,38,0.1)",   color: "#b91c1c" },
  };
  const style = map[value] || { bg: "#f3f4f6", color: "#6b7280" };
  return (
    <span style={{
      display: "inline-flex",
      alignItems: "center",
      padding: "3px 10px",
      borderRadius: "20px",
      fontSize: "12px",
      fontWeight: 600,
      background: style.bg,
      color: style.color,
    }}>
      {value || "—"}
    </span>
  );
}

function MasterfileTable({ category, onBack })
{
  const [search,          setSearch]          = useState("");
  const [rows,            setRows]            = useState([]);
  const [currentPage,     setCurrentPage]     = useState(1);
  const [showModal,       setShowModal]       = useState(false);
  const [editingRow,      setEditingRow]      = useState(null);

  const [name,            setName]            = useState("");
  const [coverageDetails, setCoverageDetails] = useState("");
  const [discountPercent, setDiscountPercent] = useState("");
  const [status,          setStatus]          = useState("Active");
  const [details,         setDetails]         = useState("");
  const [defaultAmount,   setDefaultAmount]   = useState("");
  const [autoAdd,         setAutoAdd]         = useState(false);
  const [durationMinutes, setDurationMinutes] = useState("");
  const [genericName,     setGenericName]     = useState("");
  const [dosage,          setDosage]          = useState("");
  const [unit,            setUnit]            = useState("");
  const [stock,           setStock]           = useState("");
  const [description,     setDescription]     = useState("");
  const [riskLevel,       setRiskLevel]       = useState("Low");
  const [icdCode,         setIcdCode]         = useState("");
  const [notes,           setNotes]           = useState("");
  const [abbreviation,    setAbbreviation]    = useState("");
  const [colorTag,        setColorTag]        = useState("#534AB7");
  const [toothCategory,   setToothCategory]   = useState("");
  const [templateType,    setTemplateType]    = useState("");
  const [templateFile,    setTemplateFile]    = useState(null);

  useEffect(() => { fetchRows(); }, [category]);

  const TABLE_MAP =
  {
    medicines:            "medicines",
    services:             "services",
    hmo:                  "hmo",
    "dental-habits":      "dental_habits",
    "medical-conditions": "medical_conditions",
    "tooth-items":        "tooth_items",
    templates:            "templates",
  };

  async function fetchRows()
  {
    const tableName = TABLE_MAP[category.key];
    if (!tableName) return;

    let query = supabase.from(tableName).select("*");

    if (category.key === "services")
    {
      query = query.eq("active", true);
    }
    else
    {
      query = query.eq("is_archived", false);
    }

    const { data, error } = await query;
    if (error) console.error(error);
    else setRows(data);
  }

  async function handleArchive(id)
  {
    const tableName = TABLE_MAP[category.key];
    const field     = category.key === "services" ? "active" : "is_archived";
    const value     = category.key === "services" ? false : true;

    const { error } = await supabase.from(tableName).update({ [field]: value }).eq("id", id);
    if (error) { console.error(error); alert("Archive failed"); return; }
    fetchRows();
  }

  function resetForm()
  {
    setName(""); setCoverageDetails(""); setDiscountPercent(""); setStatus("Active");
    setDetails(""); setDefaultAmount(""); setAutoAdd(false); setDurationMinutes("");
    setGenericName(""); setDosage(""); setUnit(""); setStock("");
    setDescription(""); setRiskLevel("Low");
    setIcdCode(""); setNotes("");
    setAbbreviation(""); setColorTag("#534AB7"); setToothCategory("");
    setTemplateType(""); setTemplateFile(null);
  }

  function openAdd()
  {
    setEditingRow(null);
    resetForm();
    setShowModal(true);
  }

  function handleEdit(row)
  {
    setEditingRow(row);
    setName(row.name || "");
    setCoverageDetails(row.coverage_details || "");
    setDiscountPercent(row.discount_percent || "");
    setStatus(row.status || "Active");
    setDetails(row.description || "");
    setDefaultAmount(row.price || "");
    setAutoAdd(row.auto_add || false);
    setDurationMinutes(row.duration_minutes || "");
    setGenericName(row.generic_name || "");
    setDosage(row.dosage || "");
    setUnit(row.unit || "");
    setStock(row.stock || "");
    setDescription(row.description || "");
    setRiskLevel(row.risk_level || "Low");
    setIcdCode(row.icd_code || "");
    setNotes(row.notes || "");
    setAbbreviation(row.abbreviation || "");
    setColorTag(row.color_tag || "#534AB7");
    setToothCategory(row.category || "");
    setTemplateType(row.type || "");
    setShowModal(true);
  }

  function closeModal()
  {
    setEditingRow(null);
    setShowModal(false);
    resetForm();
  }

  async function handleUpdate()
  {
    const tableName = TABLE_MAP[category.key];
    let payload = {};

    if (category.key === "medicines")
      payload = { name, generic_name: genericName, dosage, unit, stock };
    else if (category.key === "services")
      payload = { name, description: details, price: defaultAmount, duration_minutes: durationMinutes, duration: `${durationMinutes} mins` };
    else if (category.key === "hmo")
      payload = { name, coverage_details: coverageDetails, discount_percent: discountPercent, status };
    else if (category.key === "dental-habits")
      payload = { name, description, risk_level: riskLevel };
    else if (category.key === "medical-conditions")
      payload = { name, icd_code: icdCode, notes };
    else if (category.key === "tooth-items")
      payload = { name, abbreviation, color_tag: colorTag, category: toothCategory };
    else if (category.key === "templates")
      payload = { name, type: templateType };

    const { error } = await supabase.from(tableName).update(payload).eq("id", editingRow.id);
    if (error) { console.error(error); alert("Update failed"); return; }
    closeModal();
    fetchRows();
  }

  async function handleAddMedicine()
  {
    const { error } = await supabase.from("medicines").insert([{ name, generic_name: genericName, dosage, unit, stock }]);
    if (error) { console.error(error); alert("Failed to add medicine"); return; }
    closeModal(); fetchRows();
  }

  async function handleAddService()
  {
    const { error } = await supabase.from("services").insert([{
      name, description: details, price: defaultAmount,
      duration_minutes: durationMinutes, duration: `${durationMinutes} mins`,
      icon: "🦷", active: true,
    }]);
    if (error) { console.error(error); alert("Failed to add service"); return; }
    closeModal(); fetchRows();
  }

  async function handleAddHMO()
  {
    const { error } = await supabase.from("hmo").insert([{ name, coverage_details: coverageDetails, discount_percent: discountPercent, status }]);
    if (error) { console.error(error); alert("Failed to add HMO"); return; }
    closeModal(); fetchRows();
  }

  async function handleAddDentalHabit()
  {
    const { error } = await supabase.from("dental_habits").insert([{ name, description, risk_level: riskLevel }]);
    if (error) { console.error(error); alert("Failed to add dental habit"); return; }
    closeModal(); fetchRows();
  }

  async function handleAddMedicalCondition()
  {
    const { error } = await supabase.from("medical_conditions").insert([{ name, icd_code: icdCode, notes }]);
    if (error) { console.error(error); alert("Failed to add medical condition"); return; }
    closeModal(); fetchRows();
  }

  async function handleAddToothItem()
  {
    const { error } = await supabase.from("tooth_items").insert([{ name, abbreviation, color_tag: colorTag, category: toothCategory }]);
    if (error) { console.error(error); alert("Failed to add tooth item"); return; }
    closeModal(); fetchRows();
  }

  async function handleAddTemplate()
  {
    let filePath = null;

    if (templateFile)
    {
      const fileName = `${Date.now()}-${templateFile.name}`;
      const { error: uploadError } = await supabase.storage.from("template-files").upload(fileName, templateFile);
      if (uploadError) { console.error(uploadError); alert("File upload failed"); return; }
      filePath = fileName;
    }

    const { error } = await supabase.from("templates").insert([{
      name, type: templateType, file_url: filePath,
      is_archived: false, updated_at: new Date().toISOString(),
    }]);
    if (error) { console.error(error); alert("Failed to add template"); return; }
    closeModal(); fetchRows();
  }

  function handleSave()
  {
    if (editingRow) { handleUpdate(); return; }
    const map =
    {
      medicines:            handleAddMedicine,
      services:             handleAddService,
      hmo:                  handleAddHMO,
      "dental-habits":      handleAddDentalHabit,
      "medical-conditions": handleAddMedicalCondition,
      "tooth-items":        handleAddToothItem,
      templates:            handleAddTemplate,
    };
    map[category.key]?.();
  }

  const filtered = rows.filter((r) =>
    Object.values(r).some((v) =>
      String(v ?? "").toLowerCase().includes(search.toLowerCase())
    )
  );

  const totalPages  = Math.ceil(filtered.length / PAGE_SIZE) || 1;
  const pageStart   = (currentPage - 1) * PAGE_SIZE;
  const visibleRows = filtered.slice(pageStart, pageStart + PAGE_SIZE);

  function handleSearch(val)
  {
    setSearch(val);
    setCurrentPage(1);
  }

  function renderPagination()
  {
    const range = [];
    for (let i = 1; i <= totalPages; i++)
    {
      if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1))
      {
        range.push(i);
      }
    }

    const pages = [];
    let prev = null;
    for (const page of range)
    {
      if (prev !== null && page - prev > 1)
      {
        pages.push(<span key={`e-${page}`} className="mf-page-ellipsis">…</span>);
      }
      pages.push(
        <button
          key={page}
          className={`mf-page-btn${currentPage === page ? " mf-page-active" : ""}`}
          onClick={() => setCurrentPage(page)}
        >
          {page}
        </button>
      );
      prev = page;
    }

    return pages;
  }

  const MODAL_TITLES =
  {
    hmo:                  ["Add HMO",         "Edit HMO"],
    services:             ["Add Service",      "Edit Service"],
    medicines:            ["Add Medicine",     "Edit Medicine"],
    templates:            ["Add Template",     "Edit Template"],
    "dental-habits":      ["Add Dental Habit", "Edit Dental Habit"],
    "medical-conditions": ["Add Condition",    "Edit Condition"],
    "tooth-items":        ["Add Tooth Item",   "Edit Tooth Item"],
    "recall-items":       ["Add Recall Item",  "Edit Recall Item"],
  };

  const modalTitle = MODAL_TITLES[category.key]?.[editingRow ? 1 : 0] ?? (editingRow ? "Edit" : "Add");

  function renderCell(col, row)
  {
    const value = row[FIELD_MAP[col]];

    if (col === "Color Tag")
    {
      return (
        <td key={col}><div className="mf-color-box" style={{ backgroundColor: value || "#ccc" }} /></td>
      );
    }
    if (col === "Status")
    {
      return <td key={col}><StatusBadge value={value} /></td>;
    }
    if (col === "Risk Level")
    {
      return <td key={col}><RiskBadge value={value} /></td>;
    }
    if (col === "Last Updated" && value)
    {
      return <td key={col}>{new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</td>;
    }
    return <td key={col}>{value ?? "—"}</td>;
  }

  function ModalForm()
  {
    const key = category.key;

    if (key === "hmo") return (
      <>
        <input type="text" placeholder="HMO Name" value={name} onChange={(e) => setName(e.target.value)} />
        <textarea placeholder="Coverage details…" value={coverageDetails} onChange={(e) => setCoverageDetails(e.target.value)} />
        <input type="number" placeholder="Discount %" value={discountPercent} onChange={(e) => setDiscountPercent(e.target.value)} />
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </select>
      </>
    );

    if (key === "services") return (
      <>
        <input type="text" placeholder="Service name" value={name} onChange={(e) => setName(e.target.value)} />
        <textarea placeholder="Service description…" value={details} onChange={(e) => setDetails(e.target.value)} />
        <input type="number" placeholder="Default amount (₱)" value={defaultAmount} onChange={(e) => setDefaultAmount(e.target.value)} />
        <input type="number" placeholder="Duration (minutes)" value={durationMinutes} onChange={(e) => setDurationMinutes(e.target.value)} />
        <label className="mf-checkbox">
          <input type="checkbox" checked={autoAdd} onChange={(e) => setAutoAdd(e.target.checked)} />
          Auto-add to new appointments
        </label>
      </>
    );

    if (key === "medicines") return (
      <>
        <input type="text" placeholder="Medicine name" value={name} onChange={(e) => setName(e.target.value)} />
        <input type="text" placeholder="Generic name" value={genericName} onChange={(e) => setGenericName(e.target.value)} />
        <input type="text" placeholder="Dosage (e.g. 500mg)" value={dosage} onChange={(e) => setDosage(e.target.value)} />
        <input type="text" placeholder="Unit (e.g. tablet, ml)" value={unit} onChange={(e) => setUnit(e.target.value)} />
        <input type="number" placeholder="Current stock" value={stock} onChange={(e) => setStock(e.target.value)} />
      </>
    );

    if (key === "templates") return (
      <>
        <input type="text" placeholder="Template name" value={name} onChange={(e) => setName(e.target.value)} />
        <select value={templateType} onChange={(e) => setTemplateType(e.target.value)}>
          <option value="">Select type…</option>
          <option value="xray">X-Ray Request</option>
          <option value="lab">Laboratory Result</option>
          <option value="clearance">Medical Clearance</option>
          <option value="consent">Consent Form</option>
          <option value="prescription">Prescription</option>
          <option value="referral">Referral Letter</option>
          <option value="other">Other</option>
        </select>
        <div className="mf-file-wrap">
          <label className="mf-file-label">
            📎 {templateFile ? templateFile.name : "Attach file (optional)"}
            <input type="file" className="mf-file-input" onChange={(e) => setTemplateFile(e.target.files[0])} />
          </label>
          {templateFile && <div className="mf-file-name">✓ {templateFile.name}</div>}
        </div>
      </>
    );

    if (key === "dental-habits") return (
      <>
        <input type="text" placeholder="Habit name" value={name} onChange={(e) => setName(e.target.value)} />
        <textarea placeholder="Description…" value={description} onChange={(e) => setDescription(e.target.value)} />
        <select value={riskLevel} onChange={(e) => setRiskLevel(e.target.value)}>
          <option value="Low">Low risk</option>
          <option value="Moderate">Moderate risk</option>
          <option value="High">High risk</option>
        </select>
      </>
    );

    if (key === "medical-conditions") return (
      <>
        <input type="text" placeholder="Condition name" value={name} onChange={(e) => setName(e.target.value)} />
        <input type="text" placeholder="ICD Code (e.g. K02.1)" value={icdCode} onChange={(e) => setIcdCode(e.target.value)} />
        <textarea placeholder="Clinical notes…" value={notes} onChange={(e) => setNotes(e.target.value)} />
      </>
    );

    if (key === "tooth-items") return (
      <>
        <input type="text" placeholder="Item name" value={name} onChange={(e) => setName(e.target.value)} />
        <input type="text" placeholder="Abbreviation (e.g. CAR)" value={abbreviation} onChange={(e) => setAbbreviation(e.target.value)} />
        <div className="mf-color-picker">
          <label>Color Tag</label>
          <div className="mf-color-row">
            <input type="color" value={colorTag} onChange={(e) => setColorTag(e.target.value)} />
            <input type="text" className="mf-color-hex" value={colorTag} onChange={(e) => setColorTag(e.target.value)} maxLength={7} />
          </div>
        </div>
        <select value={toothCategory} onChange={(e) => setToothCategory(e.target.value)}>
          <option value="">Select category…</option>
          <option value="Condition">Condition</option>
          <option value="Restoration">Restoration</option>
          <option value="Treatment">Treatment</option>
          <option value="Prosthesis">Prosthesis</option>
          <option value="Surgery">Surgery</option>
        </select>
      </>
    );

    return null;
  }

  return (
    <div className="mf-table-view">

      {showModal && (
        <div className="mf-modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}>
          <div className="mf-modal">
            <h2>{modalTitle}</h2>
            <div className="mf-modal-form"><ModalForm /></div>
            <div className="mf-modal-actions">
              <button className="mf-cancel-btn" onClick={closeModal}>Cancel</button>
              <button className="mf-save-btn" onClick={handleSave}>{editingRow ? "Save changes" : "Add"}</button>
            </div>
          </div>
        </div>
      )}

      <div className="mf-table-top">
        <button className="mf-back-btn" onClick={onBack}>← Back</button>
        <div>
          <h2 className="mf-table-title">{category.pageTitle}</h2>
          <p className="mf-table-subtitle">{category.pageSubtitle}</p>
        </div>
      </div>

      <div className="mf-toolbar">
        <div className="mf-search-wrap">
          <span className="mf-search-icon">🔍</span>
          <input
            className="mf-search"
            type="text"
            placeholder="Search records…"
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>
        <button className={`mf-add-btn mf-add-btn--${category.color}`} onClick={openAdd}>{category.addLabel}</button>
      </div>

      <div className="mf-table-wrap">
        <table className="mf-table">
          <thead>
            <tr>
              <th className="mf-th-actions">Actions</th>
              {category.columns.map((col) => <th key={col}>{col}</th>)}
            </tr>
          </thead>
          <tbody>
            {visibleRows.length === 0
              ? (
                <tr>
                  <td colSpan={category.columns.length + 1} className="mf-empty">
                    {search
                      ? <>No results for <strong>"{search}"</strong></>
                      : <>No records yet. Click <strong>{category.addLabel}</strong> to get started.</>
                    }
                  </td>
                </tr>
              )
              : visibleRows.map((row, i) => (
                <tr key={row.id ?? i}>
                  <td className="mf-actions-cell">
                    <button className="mf-action-edit" title="Edit" onClick={() => handleEdit(row)}>✏️</button>
                    <button className="mf-action-del" title="Archive" onClick={() => handleArchive(row.id)}>📦</button>
                    {row.file_url && (
                      <a
                        className="mf-action-edit"
                        title="View file"
                        href={supabase.storage.from("template-files").getPublicUrl(row.file_url).data.publicUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        View
                      </a>
                    )}
                  </td>
                  {category.columns.map((col) => renderCell(col, row))}
                </tr>
              ))
            }
          </tbody>
        </table>
      </div>

      <div className="mf-pagination">
        <span className="mf-page-info">
          {filtered.length > 0
            ? `Showing ${pageStart + 1}–${Math.min(pageStart + PAGE_SIZE, filtered.length)} of ${filtered.length}`
            : "No records"}
        </span>
        <div className="mf-page-controls">
          <button
            className={`mf-page-btn${currentPage === 1 ? " mf-page-disabled" : ""}`}
            onClick={() => currentPage > 1 && setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
          >
            ‹
          </button>
          {renderPagination()}
          <button
            className={`mf-page-btn${currentPage >= totalPages ? " mf-page-disabled" : ""}`}
            onClick={() => currentPage < totalPages && setCurrentPage(currentPage + 1)}
            disabled={currentPage >= totalPages}
          >
            ›
          </button>
        </div>
      </div>

    </div>
  );
}

function SystemData()
{
  const [active, setActive] = useState(null);

  if (active)
  {
    const category = CATEGORIES.find((c) => c.key === active);
    return (
      <div className="systemdata-container">
        <MasterfileTable category={category} onBack={() => setActive(null)} />
      </div>
    );
  }

  return (
    <div className="systemdata-container">
      <div className="systemdata-header">
        <div>
          <h2 className="systemdata-title">Masterfiles</h2>
          <p className="systemdata-subtitle">Manage clinic reference data used across the system.</p>
        </div>
      </div>
      <div className="masterfiles-grid">
        {CATEGORIES.map((item) => (
          <div
            key={item.key}
            className={`masterfile-card masterfile-card--${item.color}`}
            onClick={() => setActive(item.key)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && setActive(item.key)}
          >
            <div className="masterfile-icon">{item.icon}</div>
            <div className="masterfile-label">{item.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default SystemData;