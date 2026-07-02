import { useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import "../styles/payment.css";
import Spinner from "../components/Spinner";
import {
  getPaymentsApi,
  getAppointmentServicesApi,
  markPaymentPaidApi,
  cancelPaymentApi,
  undoPaymentPaidApi,
  reinstatePaymentApi,
  addServiceToPaymentApi,
  markServiceNotPerformedApi,
  markServicePerformedApi
} from "../api/appointments";
import { getServicesApi } from "../api/services";
import { jsPDF } from "jspdf";
import axios from "axios";

const AVATAR_PALETTES = [
  { bg: "#fce4ec", color: "#c62828" },
  { bg: "#e8eaf6", color: "#283593" },
  { bg: "#e8f5e9", color: "#2e7d32" },
  { bg: "#fff8e1", color: "#f57f17" },
  { bg: "#e3f2fd", color: "#1565c0" },
  { bg: "#f3e5f5", color: "#6a1b9a" },
];

function formatStatus(status = "")
{
  switch (status.toLowerCase())
  {
    case "downpayment_paid": return "Downpayment";
    case "pending_verification": return "For Verification";
    case "no_show": return "No Show";
    case "cancelled": return "Cancelled";
    case "paid": return "Paid";
    case "pending": return "Pending";
    default: return status;
  }
}

function getStatusClass(status = "")
{
  switch (status.toLowerCase())
  {
    case "paid": return "pay-status-paid";
    case "pending": return "pay-status-pending";
    case "downpayment_paid": return "pay-status-downpayment";
    case "cancelled": return "pay-status-cancelled";
    case "no_show": return "pay-status-noshow";
    case "pending_verification": return "pay-status-verification";
    default: return "pay-status-pending";
  }
}

function getInitials(name = "")
{
  return name.trim().split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase();
}

function getAvatarPalette(name = "")
{
  return AVATAR_PALETTES[name.charCodeAt(0) % AVATAR_PALETTES.length];
}

const PAGE_SIZE = 6;

function Payment()
{
  const [payments, setPayments] = useState([]);
  const [loadingPayments, setLoadingPayments] = useState(true);
  const [loadingServices, setLoadingServices] = useState(false);
  const [highlightedId, setHighlightedId] = useState(localStorage.getItem("highlightPaymentId"));
  const [showReceipt, setShowReceipt] = useState(false);
  const [clinicFilter, setClinicFilter] = useState("All");
  const [editingPayment, setEditingPayment] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [services, setServices] = useState([]);
  const [allServices, setAllServices] = useState([]);
  const [filterStatus, setFilterStatus] = useState("");
  const [filterMethod, setFilterMethod] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() =>
  {
    loadPayments();
    loadServices();
  }, []);

  async function loadPayments()
  {
    try
    {
      setLoadingPayments(true);
      const response = await getPaymentsApi();
      const list = response.payments || [];
      setPayments(list);
      return list;
    }
    catch (error)
    {
      console.error(error);
      return [];
    }
    finally
    {
      setLoadingPayments(false);
    }
  }

  async function loadServices()
  {
    try
    {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/services`);
      setAllServices(response.data.services || []);
    }
    catch (error) { console.error(error); }
  }

  async function handleEdit(p)
  {
    setEditingPayment(p);
    setEditForm({ ...p });
    try
    {
      setLoadingServices(true);
      const response = await getAppointmentServicesApi(p.id);
      setServices(response.services || []);
    }
    catch (error)
    {
      console.error(error);
      setServices([]);
    }
    finally
    {
      setLoadingServices(false);
    }
  }

  function handleCancel()
  {
    setEditingPayment(null);
    setEditForm({});
    setServices([]);
  }

  async function handleMarkPaid()
  {
    try
    {
      await markPaymentPaidApi(editingPayment.id);
      await loadPayments();
      handleCancel();
    }
    catch (error) { console.error(error); }
  }

  async function handleCancelPayment()
  {
    try
    {
      await cancelPaymentApi(editingPayment.id);
      await loadPayments();
      handleCancel();
    }
    catch (error) { console.error(error); }
  }

  async function handleNotPerformed(service)
  {
    try
    {
      await markServiceNotPerformedApi(service.id);
      const updatedPayments = await loadPayments();
      const updatedPayment = updatedPayments.find(p => p.id === editingPayment.id);
      if (updatedPayment) await handleEdit(updatedPayment);
    }
    catch (error) { console.error(error); }
  }

  async function handlePerformed(service)
  {
    try
    {
      await markServicePerformedApi(service.id);
      await handleEdit(editingPayment);
    }
    catch (error) { console.error(error); }
  }

  async function handleUndoPaid()
  {
    try
    {
      await undoPaymentPaidApi(editingPayment.id);
      const updatedPayments = await loadPayments();
      const updatedPayment = updatedPayments.find(p => p.id === editingPayment.id);
      if (updatedPayment)
      {
        setEditingPayment(updatedPayment);
        setEditForm(updatedPayment);
      }
    }
    catch (error) { console.error(error); }
  }

  async function handleReinstate()
  {
    try
    {
      await reinstatePaymentApi(editingPayment.id);
      await loadPayments();
      handleCancel();
    }
    catch (error) { console.error(error); }
  }

  function handleGenerateInvoice()
  {
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text("JUANA SMILE DENTAL CLINIC", 20, 20);
    doc.setFontSize(14);
    doc.text("INVOICE", 20, 30);
    doc.line(20, 35, 190, 35);
    let y = 50;
    doc.text(`Invoice #: ${editForm.invoice_number || `INV-${editForm.id?.slice(0, 8).toUpperCase()}`}`, 20, y); y += 10;
    doc.text(`Patient: ${editForm.guest_name}`, 20, y); y += 10;
    doc.text(`Clinic: ${editForm.branch_id}`, 20, y); y += 10;
    doc.text(`Date: ${editForm.appointment_date}`, 20, y); y += 15;
    doc.text("Services", 20, y); y += 10;
    services.forEach(s => { doc.text(`${s.service_name}`, 20, y); doc.text(`PHP ${Number(s.price).toLocaleString()}`, 140, y); y += 8; });
    y += 10;
    doc.text(`Total Amount: PHP ${Number(editForm.total_amount || 0).toLocaleString()}`, 20, y); y += 10;
    doc.text(`Amount Paid: PHP ${Number(editForm.amount_paid || 0).toLocaleString()}`, 20, y); y += 10;
    doc.text(`Remaining Balance: PHP ${Number(editForm.remaining_balance || 0).toLocaleString()}`, 20, y);
    doc.save(`Invoice-${editForm.guest_name?.replaceAll(" ", "-")}.pdf`);
  }

  function handleGenerateOfficialReceipt()
  {
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text("JUANA SMILE DENTAL CLINIC", 20, 20);
    doc.setFontSize(14);
    doc.text("OFFICIAL RECEIPT", 20, 30);
    doc.line(20, 35, 190, 35);
    let y = 50;
    doc.text(`Receipt No: OR-${editForm.id?.slice(0, 8).toUpperCase()}`, 20, y); y += 10;
    doc.text(`Patient: ${editForm.guest_name}`, 20, y); y += 10;
    doc.text(`Branch: ${editForm.branch_id}`, 20, y); y += 10;
    doc.text(`Payment Method: ${editForm.payment_method}`, 20, y); y += 10;
    doc.text(`Date Paid: ${new Date().toLocaleDateString()}`, 20, y); y += 15;
    doc.setFontSize(16);
    doc.text(`Amount Received: PHP ${Number(editForm.total_amount || 0).toLocaleString()}`, 20, y); y += 20;
    doc.setFontSize(12);
    doc.text("Payment received in full for dental services rendered.", 20, y); y += 30;
    doc.text("________________________", 20, y); y += 10;
    doc.text("Authorized Signature", 20, y);
    doc.save(`Official-Receipt-${editForm.guest_name?.replaceAll(" ", "-")}.pdf`);
  }

  const filteredPayments = payments.filter(payment =>
  {
    if (clinicFilter !== "All" && payment.branch_id !== clinicFilter) return false;
    const q = searchTerm.toLowerCase();
    const matchesSearch =
      payment.guest_name?.toLowerCase().includes(q) ||
      payment.payment_method?.toLowerCase().includes(q) ||
      payment.payment_status?.toLowerCase().includes(q) ||
      payment.status?.toLowerCase().includes(q);
    if (!matchesSearch) return false;
    let matchesStatus = true;
    if (filterStatus === "today") matchesStatus = payment.appointment_date === new Date().toISOString().split("T")[0];
    else if (filterStatus === "pending") matchesStatus = ["pending", "downpayment_paid"].includes(payment.payment_status?.toLowerCase());
    else if (filterStatus) matchesStatus = payment.payment_status?.toLowerCase() === filterStatus;
    const matchesMethod = !filterMethod || payment.payment_method?.toLowerCase() === filterMethod;
    return matchesStatus && matchesMethod;
  });

  const totalPages = Math.max(1, Math.ceil(filteredPayments.length / PAGE_SIZE));
  const paginatedPayments = filteredPayments.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const totalCollected = filteredPayments.reduce((sum, p) => sum + Number(p.amount_paid || 0), 0);
  const totalOutstanding = filteredPayments.reduce((sum, p) => sum + Number(p.remaining_balance || 0), 0);
  const paidCount = filteredPayments.filter(p => p.payment_status?.toLowerCase() === "paid").length;
  const cancelledCount = filteredPayments.filter(p => p.payment_status?.toLowerCase() === "cancelled").length;

  const isCancelled = editForm.payment_status === "cancelled";
  const isPaid = editForm.payment_status === "paid";
  const isRejected = editForm.status === "rejected";
  const isEditable = !isCancelled && !isPaid && !isRejected;

  const activeServices = services.filter(s => s.service_status !== "not_performed");

  return (
    <div className="pay-root">

      <div className="pay-page-header">
        <h2 className="pay-page-title">Payments</h2>
        <span className="pay-total-badge">{filteredPayments.length} records</span>
      </div>

      <div className="pay-page-container">

        <div className="pay-metrics">
          <div className="pay-metric-card">
            <span className="pay-metric-icon"><Icon icon="mdi:cash-multiple" aria-hidden="true" /></span>
            <div className="pay-metric-body">
              <span className="pay-metric-value">₱{totalCollected.toLocaleString()}</span>
              <span className="pay-metric-label">Total Collected</span>
              <span className="pay-metric-sub">{paidCount} paid records</span>
            </div>
          </div>
          <div className="pay-metric-card">
            <span className="pay-metric-icon"><Icon icon="mdi:alert-circle-outline" aria-hidden="true" /></span>
            <div className="pay-metric-body">
              <span className="pay-metric-value pay-metric-value-danger">₱{totalOutstanding.toLocaleString()}</span>
              <span className="pay-metric-label">Outstanding</span>
              <span className="pay-metric-sub">Remaining balances</span>
            </div>
          </div>
          <div className="pay-metric-card">
            <span className="pay-metric-icon"><Icon icon="mdi:receipt-text-outline" aria-hidden="true" /></span>
            <div className="pay-metric-body">
              <span className="pay-metric-value">{filteredPayments.length}</span>
              <span className="pay-metric-label">Total Records</span>
              <span className="pay-metric-sub">Payment entries</span>
            </div>
          </div>
          <div className="pay-metric-card">
            <span className="pay-metric-icon"><Icon icon="mdi:close-circle-outline" aria-hidden="true" /></span>
            <div className="pay-metric-body">
              <span className="pay-metric-value">{cancelledCount}</span>
              <span className="pay-metric-label">Cancelled</span>
              <span className="pay-metric-sub">Cancelled records</span>
            </div>
          </div>
        </div>

        <div className="pay-toolbar">
          <div className="pay-search-wrap">
            <span className="pay-search-icon"><Icon icon="mdi:magnify" aria-hidden="true" /></span>
            <input className="pay-search-input" placeholder="Search patient, method, or status…" value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }} />
          </div>
          <select className="pay-select" value={clinicFilter} onChange={(e) => { setClinicFilter(e.target.value); setCurrentPage(1); }}>
            <option value="All">All Clinics</option>
            <option value="Hagonoy">Hagonoy</option>
            <option value="Paombong">Paombong</option>
          </select>
          <select className="pay-select" value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }}>
            <option value="">All Statuses</option>
            <option value="today">Today</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <select className="pay-select" value={filterMethod} onChange={(e) => { setFilterMethod(e.target.value); setCurrentPage(1); }}>
            <option value="">All Methods</option>
            <option value="gcash">GCash</option>
            <option value="cash">Cash</option>
            <option value="visa">Visa</option>
            <option value="mastercard">Mastercard</option>
            <option value="jcb">JCB</option>
            <option value="card">Card</option>
          </select>
        </div>

        <div className="pay-table-wrap">
          <div className="pay-table-header">
            <span>Patient</span>
            <span>Clinic</span>
            <span>Invoice</span>
            <span>Amount</span>
            <span>Balance</span>
            <span>Method</span>
            <span>Status</span>
            <span></span>
          </div>
          {loadingPayments
            ? <div className="pay-empty"><Spinner /></div>
            : paginatedPayments.length === 0
            ? <div className="pay-empty">No payments found.</div>
            : paginatedPayments.map((p) =>
            {
              const palette = getAvatarPalette(p.guest_name || "");
              const statusKey = p.status === "cancelled" && p.rejection_reason ? "rejected" : p.payment_status?.toLowerCase();
              return (
                <div key={p.id} className={`pay-table-row${highlightedId === p.id ? " pay-row-highlight" : ""}`}>
                  <span className="pay-name-cell">
                    <span className="pay-avatar" style={{ background: palette.bg, color: palette.color }}>{getInitials(p.guest_name)}</span>
                    <span className="pay-name-text">{p.guest_name}</span>
                  </span>
                  <span>{p.branch_id || "—"}</span>
                  <span className="pay-mono">{p.invoice_number || "—"}</span>
                  <span className="pay-mono">₱{Number(p.total_amount).toLocaleString()}</span>
                  <span className="pay-mono">₱{Number(p.remaining_balance).toLocaleString()}</span>
                  <span>{p.payment_method}</span>
                  <span><span className={`pay-status-pill ${getStatusClass(p.payment_status || "")}`}>{p.status === "cancelled" && p.rejection_reason ? "Rejected" : formatStatus(p.payment_status)}</span></span>
                  <span>
                    <button className="pay-edit-btn" onClick={(e) => { e.stopPropagation(); localStorage.removeItem("highlightPaymentId"); setHighlightedId(null); handleEdit(p); }} aria-label="Edit payment">
                      <Icon icon="mdi:pencil-outline" aria-hidden="true" />
                    </button>
                  </span>
                </div>
              );
            })
          }
        </div>

        <div className="pay-pagination">
          <span className="pay-pagination-info">
            Showing {Math.min((currentPage - 1) * PAGE_SIZE + 1, filteredPayments.length)}–{Math.min(currentPage * PAGE_SIZE, filteredPayments.length)} of {filteredPayments.length}
          </span>
          <div className="pay-pagination-controls">
            <button className="pay-page-btn" disabled={currentPage === 1} onClick={() => setCurrentPage(currentPage - 1)}>‹</button>
            <span className="pay-page-info">Page {currentPage} / {totalPages}</span>
            <button className="pay-page-btn" disabled={currentPage === totalPages} onClick={() => setCurrentPage(currentPage + 1)}>›</button>
          </div>
        </div>

        {editingPayment && (
          <div className="pay-modal-overlay" onClick={handleCancel}>
            <div className="pay-modal" onClick={(e) => e.stopPropagation()}>

              <div className="pay-modal-header">
                <h3>Payment Details</h3>
                <button className="pay-modal-close" onClick={handleCancel} aria-label="Close"><Icon icon="mdi:close" aria-hidden="true" /></button>
              </div>

              <div className="pay-modal-body">
                <div className="pay-modal-field">
                  <label>Patient</label>
                  <p className="pay-modal-readonly">{editForm.guest_name}</p>
                </div>
                <div className="pay-modal-field">
                  <label>Payment Status</label>
                  <p className={`pay-status-display ${editForm.payment_status?.toLowerCase()}`}>{editForm.payment_status}</p>
                </div>
                <div className="pay-modal-field">
                  <label>Total Amount</label>
                  <p className="pay-modal-readonly pay-modal-readonly-mono">₱{Number(editForm.total_amount || 0).toLocaleString()}</p>
                </div>
                <div className="pay-modal-field">
                  <label>Amount Paid</label>
                  <p className="pay-modal-readonly pay-modal-readonly-mono">₱{Number(editForm.amount_paid || 0).toLocaleString()}</p>
                </div>
                <div className="pay-modal-field">
                  <label>Remaining Balance</label>
                  <p className="pay-modal-readonly pay-modal-readonly-mono">₱{Number(editForm.remaining_balance || 0).toLocaleString()}</p>
                </div>
                <div className="pay-modal-field">
                  <label>Mode of Payment</label>
                  {isRejected
                    ? <p className="pay-modal-readonly">{editForm.payment_method}</p>
                    : (
                      <select className="pay-modal-select" value={editForm.payment_method || ""} onChange={(e) => setEditForm({ ...editForm, payment_method: e.target.value })}>
                        <option value="Cash">Cash</option>
                        <option value="GCash">GCash</option>
                        <option value="Card">Card</option>
                      </select>
                    )
                  }
                </div>

                <div className="pay-modal-field pay-modal-field-full">
                  <label>Services Availed</label>
                  {loadingServices
                    ? <div style={{ padding: "20px 0", display: "flex", justifyContent: "center" }}><Spinner /></div>
                    : activeServices.length === 0
                    ? <p className="pay-service-no-data">No services found.</p>
                    : (
                      <div className="pay-services-list">
                        {activeServices.map((service) => (
                          <div key={service.id} className="pay-service-item">
                            <span className="pay-service-name">{service.service_name}</span>
                            {isEditable && (
                              <div className="pay-service-actions">
                                <span className="pay-service-price">₱{Number(service.price).toLocaleString()}</span>
                                {service.service_status === "not_performed"
                                  ? <button className="pay-btn-performed" onClick={() => handlePerformed(service)}>Undo</button>
                                  : <button className="pay-btn-not-performed" onClick={() => handleNotPerformed(service)}>Not Performed</button>
                                }
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )
                  }
                </div>
              </div>

              <div className="pay-modal-footer">
                {isEditable && (
                  <select className="pay-modal-select" onChange={async (e) => { if (!e.target.value) return; try { await addServiceToPaymentApi(editingPayment.id, e.target.value); await handleEdit(editingPayment); await loadPayments(); } catch (error) { console.error(error); } }}>
                    <option value="">+ Add Service</option>
                    {allServices.map(s => <option key={s.id} value={s.id}>{s.name} — ₱{s.price}</option>)}
                  </select>
                )}

                {isCancelled
                  ? <button className="pay-btn pay-btn-green" onClick={handleReinstate}><Icon icon="mdi:restore" aria-hidden="true" />Reinstate</button>
                  : isEditable && <button className="pay-btn pay-btn-danger" onClick={handleCancelPayment}><Icon icon="mdi:cancel" aria-hidden="true" />Cancel / No Show</button>
                }

                {!isCancelled && !isRejected && (
                  isPaid
                    ? <button className="pay-btn pay-btn-warning" onClick={handleUndoPaid}><Icon icon="mdi:undo" aria-hidden="true" />Undo Fully Paid</button>
                    : <button className="pay-btn pay-btn-primary" onClick={handleMarkPaid}><Icon icon="mdi:check-circle-outline" aria-hidden="true" />Mark Fully Paid</button>
                )}

                <button className="pay-btn pay-btn-secondary" onClick={handleGenerateInvoice}><Icon icon="mdi:download-outline" aria-hidden="true" />Invoice PDF</button>

                {isPaid && <button className="pay-btn pay-btn-secondary" onClick={handleGenerateOfficialReceipt}><Icon icon="mdi:receipt-text-outline" aria-hidden="true" />Official Receipt</button>}

                <button className="pay-btn pay-btn-secondary" onClick={() => setShowReceipt(true)}><Icon icon="mdi:image-outline" aria-hidden="true" />Downpayment Receipt</button>

                <button className="pay-btn pay-btn-secondary" onClick={handleCancel}><Icon icon="mdi:close" aria-hidden="true" />Close</button>
              </div>

            </div>

            {showReceipt && (
              <div className="pay-modal-overlay" onClick={() => setShowReceipt(false)}>
                <div className="pay-modal pay-receipt-modal" onClick={(e) => e.stopPropagation()}>
                  <div className="pay-modal-header">
                    <h3>Downpayment Receipt</h3>
                    <button className="pay-modal-close" onClick={() => setShowReceipt(false)} aria-label="Close receipt"><Icon icon="mdi:close" aria-hidden="true" /></button>
                  </div>
                  <div className="pay-receipt-body">
                    <img
                      src={`${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/receipts/${editForm.receipt_url}`}
                      alt="Downpayment receipt"
                      className="pay-receipt-img"
                      onClick={() => window.open(`${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/receipts/${editForm.receipt_url}`, "_blank")}
                    />
                  </div>
                  <div className="pay-modal-footer">
                    <a href={`${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/receipts/${editForm.receipt_url}`} download target="_blank" rel="noopener noreferrer" className="pay-btn pay-btn-primary"><Icon icon="mdi:download-outline" aria-hidden="true" />Download Receipt</a>
                    <button className="pay-btn pay-btn-secondary" onClick={() => setShowReceipt(false)}><Icon icon="mdi:close" aria-hidden="true" />Close</button>
                  </div>
                </div>
              </div>
            )}

          </div>
        )}
      </div>
    </div>
  );
}

export default Payment;