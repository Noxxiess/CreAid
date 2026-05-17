import { useEffect, useState } from "react";
import "../styles/payment.css";

function Payment() 
{
  const [payments, setPayments] = useState([]);
  const [editingPayment, setEditingPayment] = useState(null);
  const [editForm, setEditForm] = useState({});

  useEffect(() => 
  {
    // Backend po
    setPayments([
      { id: 1, name: "— — —", invoice: "— — —", amount: "₱ 0.00", balance: "₱ 0.00", mode: "— — —", status: "Pending" },
    ]);
  }, []);

  function handleEdit(p) 
  {
    setEditingPayment(p);
    setEditForm({ ...p });
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
  }

  return (
    <div className="users-content">
      <div className="users-page-header">
        <h2>Payment</h2>
      </div>

      <div className="users-page-container">
        <div className="payment-table">
          <div className="payment-table-header">
            <span>Name</span>
            <span>Invoice</span>
            <span>Amount</span>
            <span>Balance</span>
            <span>Mode of Payment</span>
            <span>Status</span>
            <span></span>
          </div>

          {payments.length === 0 ? (
            <div className="users-empty">No payments found.</div>
          ) : (
            payments.map((p) => (
              <div key={p.id} className="payment-table-row">
                <span>{p.name}</span>
                <span>{p.invoice}</span>
                <span>{p.amount}</span>
                <span>{p.balance}</span>
                <span>{p.mode}</span>
                <span className={`payment-status payment-status-${p.status?.toLowerCase()}`}>
                  {p.status}
                </span>
                <span className="payment-row-actions">
                  <button className="btn-edit-icon" onClick={() => handleEdit(p)}>✏️</button>
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {editingPayment && (
        <div className="modal-overlay" onClick={handleCancel}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Edit Payment</h3>
            </div>

            <div className="modal-body">
              <div className="modal-field">
                <label>Name</label>
                <p className="modal-readonly">{editForm.name}</p>
              </div>
              <div className="modal-field">
                <label>Invoice</label>
                <p className="modal-readonly">{editForm.invoice}</p>
              </div>
              <div className="modal-field">
                <label>Amount</label>
                <p className="modal-readonly">{editForm.amount}</p>
              </div>
              <div className="modal-field">
                <label>Balance</label>
                <p className="modal-readonly">{editForm.balance}</p>
              </div>
              <div className="modal-field">
                <label>Mode of Payment</label>
                <select className="modal-input" placeholder="---" value={editForm.mode}  onChange={e => setEditForm({ ...editForm, mode: e.target.value })}>
                  <option>Cash</option>
                  <option>GCash</option>
                  <option>Card</option>s
                </select>
              </div>
              <div className="modal-field">
                <label>Status</label>
                <select className="modal-input" value={editForm.status} onChange={e => setEditForm({ ...editForm, status: e.target.value })}>
                  <option>Paid</option>
                  <option>Pending</option>
                  <option>Cancelled</option>
                </select>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-cancel-edit" onClick={handleCancel}>Cancel</button>
              <button className="btn-save" onClick={handleSave}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Payment;
