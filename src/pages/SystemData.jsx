import { useState } from "react";
import "../styles/systemdata.css";

const CATEGORIES = 
[
  {
    key: "hmo",
    label: "HMO",
    icon: "🏥",
    color: "teal",
    pageTitle: "HMO",
    pageSubtitle: "Manage health maintenance organization list.",
    addLabel: "+ New HMO",
    columns: ["#", "Name", "Coverage Details", "Discount %", "Status"],
  },
  {
    key: "services",
    label: "Services",
    icon: "📄",
    color: "blue",
    pageTitle: "Services / Bill Items",
    pageSubtitle: "Manage account services or bill items list.",
    addLabel: "+ New Service / Bill Item",
    columns: ["#", "Name", "Details", "Default Amount", "Auto Add?"],
  },
  {
    key: "medicines",
    label: "Medicines",
    icon: "💊",
    color: "purple",
    pageTitle: "Medicines",
    pageSubtitle: "Manage clinic medicine inventory list.",
    addLabel: "+ New Medicine",
    columns: ["#", "Name", "Generic Name", "Dosage", "Unit", "Stock"],
  },
  {
    key: "templates",
    label: "Templates",
    icon: "🗂️",
    color: "amber",
    pageTitle: "Templates",
    pageSubtitle: "Manage document and prescription templates.",
    addLabel: "+ New Template",
    columns: ["#", "Name", "Type", "Last Updated"],
  },
  {
    key: "dental-habits",
    label: "Dental Habits",
    icon: "🦷",
    color: "coral",
    pageTitle: "Dental Habits",
    pageSubtitle: "Manage dental habit entries for patient records.",
    addLabel: "+ New Dental Habit",
    columns: ["#", "Habit Name", "Description", "Risk Level"],
  },
  {
    key: "medical-conditions",
    label: "Medical Conditions",
    icon: "❤️",
    color: "red",
    pageTitle: "Medical Conditions",
    pageSubtitle: "Manage medical condition entries used in patient charts.",
    addLabel: "+ New Condition",
    columns: ["#", "Condition Name", "ICD Code", "Notes"],
  },
  {
    key: "tooth-items",
    label: "Tooth Items",
    icon: "🦷",
    color: "green",
    pageTitle: "Tooth Items",
    pageSubtitle: "Manage tooth chart item definitions.",
    addLabel: "+ New Tooth Item",
    columns: ["#", "Name", "Abbreviation", "Color Tag", "Category"],
  },
  {
    key: "recall-items",
    label: "Recall Items",
    icon: "🔔",
    color: "pink",
    pageTitle: "Recall Items",
    pageSubtitle: "Manage patient recall and follow-up templates.",
    addLabel: "+ New Recall Item",
    columns: ["#", "Name", "Interval (days)", "Message Template"],
  },
];

function MasterfileTable({ category, onBack }) 
{
  const [search, setSearch] = useState("");
  const [rows] = useState([]); 

  return (
    <div className="mf-table-view">
      <div className="mf-table-top">
        <button className="mf-back-btn" onClick={onBack}>
          ← Back
        </button>
        <div>
          <h2 className="mf-table-title">{category.pageTitle}</h2>
          <p className="mf-table-subtitle">{category.pageSubtitle}</p>
        </div>
      </div>

      <div className="mf-toolbar">
        <div className="mf-search-wrap">
          <span className="mf-search-icon">🔍</span>
          <input className="mf-search" type="text" placeholder="Search here" value={search} onChange={(e) => setSearch(e.target.value)}/>
        </div>
        <button className={`mf-add-btn mf-add-btn--${category.color}`}>
          {category.addLabel}
        </button>
      </div>

      <div className="mf-table-wrap">
        <table className="mf-table">
          <thead>
            <tr>
              <th className="mf-th-actions">Actions</th>
              {category.columns.map((col) => (
                <th key={col}>{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={category.columns.length + 1} className="mf-empty">
                  No records found. Click <strong>{category.addLabel}</strong> to get started.
                </td>
              </tr>
            ) : (
              rows.map((row, i) => (
                <tr key={i}>
                  <td className="mf-actions-cell">
                    <button className="mf-action-edit" title="Edit">✏️</button>
                    <button className="mf-action-del" title="Delete">🗑️</button>
                  </td>
                  {category.columns.map((col) => (
                    <td key={col}>{row[col] ?? "—"}</td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
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
      <div className="admin-container">
        <div className="admin-main">
          <div className="dashboard-content">
            <div className="systemdata-container">
              <MasterfileTable category={category} onBack={() => setActive(null)} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-container">
      <div className="admin-main">
        <div className="dashboard-content">
          <div className="systemdata-container">
            <h2 className="systemdata-title">Masterfiles</h2>

            <div className="masterfiles-grid">
              {CATEGORIES.map((item) => (
                <div key={item.key} className={`masterfile-card masterfile-card--${item.color}`} onClick={() => setActive(item.key)}>
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
