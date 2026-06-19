import { useEffect, useState } from "react";
import "../styles/payment.css";
import
{
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
import axios from "axios";

const AVATAR_PALETTES = [
  { bg: "#fce4ec", color: "#c62828" },
  { bg: "#e8eaf6", color: "#283593" },
  { bg: "#e8f5e9", color: "#2e7d32" },
  { bg: "#fff8e1", color: "#f57f17" },
  { bg: "#e3f2fd", color: "#1565c0" },
  { bg: "#f3e5f5", color: "#6a1b9a" },
];

const PAGE_SIZE = 6;

function getInitials(name = "")
{
  return name.trim().split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase();
}

function getAvatarPalette(name = "")
{
  const idx = name.charCodeAt(0) % AVATAR_PALETTES.length;
  return AVATAR_PALETTES[idx];
}

const METHOD_LABELS = 
{
  gcash: "GCash",
  mastercard: "Mastercard",
  visa: "Visa",
  jcb: "JCB",
  cash: "Cash",
  card: "Card",
};

function normalizeMethod(method = "")
{
  return METHOD_LABELS[method.toLowerCase()] || method;
}

function Payment()
{
  const [payments, setPayments] = useState([]);
  const [highlightedId, setHighlightedId] = useState(localStorage.getItem("highlightPaymentId"));
  const [editingPayment, setEditingPayment] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [services, setServices] = useState([]);
  const [viewingPayment, setViewingPayment] = useState(null);
  const [allServices, setAllServices] = useState([]);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterMethod, setFilterMethod] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() =>
  {
    loadPayments();
    loadServices();
  }, []);

  useEffect(() =>
  {
    setCurrentPage(1);
  }, [search, filterStatus, filterMethod]);

  async function handleMarkPaid()
  {
    try
    {
      await markPaymentPaidApi(editingPayment.id);
      await loadPayments();
      handleCancel();
    }
    catch (error) 
    { 
      console.error(error); 

    }
  }

  async function handleCancelPayment()
  {
    try
    {
      await cancelPaymentApi(editingPayment.id);
      await loadPayments();
      handleCancel();
    }
    catch (error) 
    { 
      console.error(error); 
    }
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
    catch (error) 
    { 
      console.error(error); 
    }
  }

  async function handlePerformed(service)
  {
    try
    {
      await markServicePerformedApi(service.id);
      await handleEdit(editingPayment);
    }
    catch (error) 
    { 
      console.error(error); 
    }
  }

  async function loadPayments()
  {
    try
    {
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
  }

  async function loadServices()
  {
    try
    {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/services`);
      setAllServices(response.data.services || []);
    }
    catch (error) 
    { 
      console.error(error); 
    }
  }

  async function handleEdit(p)
  {
    setEditingPayment(p);
    setEditForm({ ...p });
    try
    {
      const response = await getAppointmentServicesApi(p.id);
      setServices(response.services || []);
    }
    catch (error)
    {
      console.error(error);
      setServices([]);
    }
  }

  function handleSave()
  {
    setPayments(payments.map(p => p.id === editingPayment.id ? { ...editForm } : p));
    setEditingPayment(null);
    setEditForm({});
  }

  function handleCancel()
  {
    setEditingPayment(null);
    setEditForm({});
    setServices([]);
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
    catch (error)
    { 
      console.error(error); 
    }
  }

  async function handleReinstate()
  {
    try
    {
      await reinstatePaymentApi(editingPayment.id);
      await loadPayments();
      handleCancel();
    }
    catch (error) 
    { 
      console.error(error); 
    }
  }

  const filtered = payments.filter(p =>
  {
    const q = search.toLowerCase();
    const matchName = !q || (p.guest_name || "").toLowerCase().includes(q);
    const matchStatus = !filterStatus || (p.payment_status || "").toLowerCase() === filterStatus;
    const matchMethod = !filterMethod || (p.payment_method || "").toLowerCase() === filterMethod;
    return matchName && matchStatus && matchMethod;
  });

  const totalCollected = filtered
    .filter(p => p.payment_status?.toLowerCase() === "paid")
    .reduce((a, p) => a + Number(p.total_amount || 0), 0);

  const totalOutstanding = filtered.reduce((a, p) => a + Number(p.remaining_balance || 0), 0);
  const paidCount = filtered.filter(p => p.payment_status?.toLowerCase() === "paid").length;
  const cancelledCount = filtered.filter(p => p.payment_status?.toLowerCase() === "cancelled").length;

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const paginated = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  function getPageNumbers()
  {
    const pages = [];
    const windowSize = 1;

    for (let i = 1; i <= totalPages; i++)
    {
      if (i === 1 || i === totalPages || Math.abs(i - safePage) <= windowSize)
      {
        pages.push(i);
      }
      else if (pages[pages.length - 1] !== "...")
      {
        pages.push("...");
      }
    }

    return pages;
  }

  return (
    <div className="users-content">
      <div className="users-page-header"><h2>Payment</h2></div>

      <div className="users-page-container">
        <div className="payment-top-bar">
          <div className="payment-search-wrap">
            <svg className="payment-search-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input className="payment-search-input" type="text" placeholder="Search patient name…" value={search} onChange={e => setSearch(e.target.value)}/>
          </div>

          <select className="payment-filter-select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="">All statuses</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <select className="payment-filter-select" value={filterMethod} onChange={e => setFilterMethod(e.target.value)}>
            <option value="">All methods</option>
            <option value="gcash">GCash</option>
            <option value="cash">Cash</option>
            <option value="mastercard">Mastercard</option>
            <option value="visa">Visa</option>
            <option value="jcb">JCB</option>
            <option value="card">Card</option>
          </select>
        </div>

        <div className="payment-metrics">
          <div className="payment-metric-card">
            <div className="pmc-label">Total collected</div>
            <div className="pmc-value">₱{totalCollected.toLocaleString()}</div>
            <div className="pmc-sub">{paidCount} paid {paidCount === 1 ? "record" : "records"}</div>
          </div>

          <div className="payment-metric-card">
            <div className="pmc-label">Outstanding</div>
            <div className={`pmc-value ${totalOutstanding > 0 ? "pmc-value--danger" : ""}`}>₱{totalOutstanding.toLocaleString()}</div>
            <div className="pmc-sub">{filtered.filter(p => Number(p.remaining_balance) > 0).length} with balance</div>
          </div>

          <div className="payment-metric-card">
            <div className="pmc-label">Total records</div>
            <div className="pmc-value">{filtered.length}</div>
            <div className="pmc-sub">of {payments.length} total</div>
          </div>

          <div className="payment-metric-card">
            <div className="pmc-label">Cancelled</div>
            <div className="pmc-value">{cancelledCount}</div>
            <div className="pmc-sub">{cancelledCount === 1 ? "record" : "records"}</div>
          </div>
        </div>

        <div className="payment-table">
          <div className="payment-table-header">
            <span>Patient</span>
            <span>Invoice</span>
            <span>Amount</span>
            <span>Balance</span>
            <span>Mode of payment</span>
            <span>Status</span>
            <span></span>
          </div>

          {paginated.length === 0 ? (
            <div className="users-empty">No payments found.</div>
          ) : (
            paginated.map(p =>
            {
              const palette = getAvatarPalette(p.guest_name || "");
              return (
                <div key={p.id} className={`payment-table-row ${highlightedId === p.id ? "highlight-payment" : ""}`}>
                  <span className="payment-name-cell">
                    <span className="payment-avatar" style={{ background: palette.bg, color: palette.color }}>
                      {getInitials(p.guest_name)}
                    </span>
                    <span className="payment-name-text">{p.guest_name}</span>
                  </span>
                  <span className="payment-invoice-text">{p.invoice}</span>
                  <span className="payment-amount-text">₱{Number(p.total_amount).toLocaleString()}</span>
                  <span className={Number(p.remaining_balance) > 0 ? "payment-balance--due" : "payment-balance--zero"}>
                    ₱{Number(p.remaining_balance).toLocaleString()}
                  </span>
                  <span>
                    <span className="payment-method-chip">{normalizeMethod(p.payment_method)}</span>
                  </span>
                  <span>
                    <span className={`payment-status payment-status-${p.payment_status?.toLowerCase()}`}>
                      {p.payment_status}
                    </span>
                  </span>
                  <span className="payment-row-actions">
                    <button className="btn-edit-icon"
                      onClick={(e) =>
                      {
                        e.stopPropagation();
                        localStorage.removeItem("highlightPaymentId");
                        setHighlightedId(null);
                        handleEdit(p);
                      }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    </button>
                  </span>
                </div>
              );
            })
          )}
        </div>

        {filtered.length > 0 && (
          <div className="payment-pagination">
            <span className="payment-pagination-info">
              Showing {(safePage - 1) * PAGE_SIZE + 1}–{Math.min(safePage * PAGE_SIZE, filtered.length)} of {filtered.length}
            </span>

            <div className="payment-pagination-controls">
              <button
                className="payment-page-btn"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={safePage === 1}
              >
                ‹
              </button>

              {getPageNumbers().map((page, idx) =>
                page === "..." ? (
                  <span key={`ellipsis-${idx}`} className="payment-page-ellipsis">…</span>
                ) : (
                  <button
                    key={page}
                    className={`payment-page-btn ${page === safePage ? "active" : ""}`}
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </button>
                )
              )}

              <button
                className="payment-page-btn"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={safePage === totalPages}
              >
                ›
              </button>
            </div>
          </div>
        )}
      </div>

      {editingPayment && (
        <div className="modal-overlay" onClick={handleCancel}>
          <div className="payment-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-header-left">
                <span className="modal-avatar" style={{ background: getAvatarPalette(editForm.guest_name || "").bg, color: getAvatarPalette(editForm.guest_name || "").color,}}>
                  {getInitials(editForm.guest_name)}
                </span>

                <div>
                  <h3>{editForm.guest_name}</h3>
                  <span className="modal-invoice-tag">{editForm.invoice}</span>
                </div>
              </div>

              <span className={`payment-status payment-status-${editForm.payment_status?.toLowerCase()}`}>
                {editForm.payment_status}
              </span>
            </div>

            <div className="modal-body">
              <div className="modal-field">
                <label>Total amount</label>
                <p className="modal-readonly">₱{Number(editForm.total_amount || 0).toLocaleString()}</p>
              </div>

              <div className="modal-field">
                <label>Amount paid</label>
                <p className="modal-readonly">₱{Number(editForm.amount_paid || 0).toLocaleString()}</p>
              </div>

              <div className="modal-field">
                <label>Remaining balance</label>
                <p className={`modal-readonly ${Number(editForm.remaining_balance) > 0 ? "modal-readonly--danger" : ""}`}>
                  ₱{Number(editForm.remaining_balance || 0).toLocaleString()}
                </p>
              </div>

              <div className="modal-field">
                <label>Mode of payment</label>
                <select className="modal-input" value={editForm.payment_method || ""} onChange={(e) => setEditForm({ ...editForm, payment_method: e.target.value })}>
                  <option value="Cash">Cash</option>
                  <option value="GCash">GCash</option>
                  <option value="Card">Card</option>
                </select>
              </div>

              {services.length > 0 && (
                <div className="modal-field modal-field--full">
                  <label>Services</label>
                  <div className="services-list">
                    {services.map(service => (
                      <div key={service.id} className="service-item">
                        <span>{service.name}</span>
                        <div className="service-actions">
                          <strong>₱{Number(service.price).toLocaleString()}</strong>
                          {editForm.payment_status !== "cancelled" && editForm.payment_status !== "paid" && (
                            service.performed
                              ? <button className="btn-not-performed" onClick={() => handleNotPerformed(service)}>Mark not performed</button>
                              : <button className="btn-performed" onClick={() => handlePerformed(service)}>Mark performed</button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="modal-footer">
              {editForm.payment_status !== "cancelled" && editForm.payment_status !== "paid" && (
                <select className="modal-input" onChange={async (e) =>
                  {
                    if (!e.target.value) return;
                    
                    try
                    {
                      await addServiceToPaymentApi(editingPayment.id, e.target.value);
                      await handleEdit(editingPayment);
                      await loadPayments();
                    }
                    catch (error) { console.error(error); }
                  }}
                >
                  <option value="">+ Add service</option>
                  {allServices.map(service => (
                    <option key={service.id} value={service.id}>
                      {service.name} — ₱{service.price}
                    </option>
                  ))}
                </select>
              )}

              {editForm.payment_status === "cancelled" ? (
                <button className="btn-reinstate" onClick={handleReinstate}>Reinstate appointment</button>
              ) : (
                editForm.payment_status !== "paid" &&
                <button className="btn-cancel-payment" onClick={handleCancelPayment}>Cancel / No show</button>
              )}

              {editForm.payment_status !== "cancelled" && (
                editForm.payment_status === "paid"
                  ? <button className="btn-warning" onClick={handleUndoPaid}>Undo fully paid</button>
                  : <button className="btn-save" onClick={handleMarkPaid}>Mark fully paid</button>
              )}

              <button className="btn-cancel-edit" onClick={handleCancel}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Payment;