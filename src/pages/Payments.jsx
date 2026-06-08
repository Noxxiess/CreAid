import { useEffect, useState } from "react";
import "../styles/payment.css";
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
}
from "../api/appointments";

import {
  getServicesApi
}
from "../api/services";

import axios from "axios";

function Payment() 
{
  const [payments, setPayments] = useState([]);
  const [highlightedId, setHighlightedId] =
useState(
  localStorage.getItem(
    "highlightPaymentId"
  )
);
  const [editingPayment, setEditingPayment] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [services, setServices] = useState([]);
  const [viewingPayment, setViewingPayment] = useState(null);
  const [allServices, setAllServices] = useState([]);

  useEffect(() =>
{
  loadPayments();
  loadServices();
}, []);


async function handleMarkPaid()
{
  try
  {
    await markPaymentPaidApi(
      editingPayment.id
    );

    await loadPayments();

    handleCancel();
  }
  catch(error)
  {
    console.error(error);
  }
}

async function handleCancelPayment()
{
  try
  {
    await cancelPaymentApi(
      editingPayment.id
    );

    await loadPayments();

    handleCancel();
  }
  catch(error)
  {
    console.error(error);
  }
}

async function handleNotPerformed(service)
{
  try
  {
    await markServiceNotPerformedApi(service.id);

    const updatedPayments =
      await loadPayments();

    const updatedPayment =
      updatedPayments.find(
        p => p.id === editingPayment.id
      );

    if(updatedPayment)
    {
      await handleEdit(updatedPayment);
    }
  }
  catch(error)
  {
    console.error(error);
  }
}

async function handlePerformed(
  service
)
{
  try
  {
    await markServicePerformedApi(
      service.id
    );

    await handleEdit(
      editingPayment
    );
  }
  catch(error)
  {
    console.error(error);
  }
}

async function loadPayments()
{
  try
  {
    const response =
      await getPaymentsApi();

    const list =
      response.payments || [];

    setPayments(list);

    return list;
  }
  catch(error)
  {
    console.error(error);

    return [];
  }
}

async function loadServices()
{
  try
  {
    const response =
      await axios.get(
        `${import.meta.env.VITE_API_URL}/services`
      );

    setAllServices(
      response.data.services || []
    );
  }
  catch(error)
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
    const response =
      await getAppointmentServicesApi(
        p.id
      );

    console.log(
      "SERVICES:",
      response.services
    );

    setServices(
      response.services || []
    );
  }
  catch(error)
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

  function handleCancel() {
  setEditingPayment(null);
  setEditForm({});
  setServices([]);
}

async function handleUndoPaid()
{
  try
  {
    await undoPaymentPaidApi(
      editingPayment.id
    );

    const updatedPayments =
      await loadPayments();

    const updatedPayment =
      updatedPayments.find(
        p =>
          p.id ===
          editingPayment.id
      );

    if(updatedPayment)
    {
      setEditingPayment(
        updatedPayment
      );

      setEditForm(
        updatedPayment
      );
    }
  }
  catch(error)
  {
    console.error(error);
  }
}

async function handleReinstate()
{
  try
  {
    await reinstatePaymentApi(
      editingPayment.id
    );

    await loadPayments();

    handleCancel();
  }
  catch(error)
  {
    console.error(error);
  }
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
              <div
  key={p.id}
  className={`payment-table-row ${
    highlightedId === p.id
      ? "highlight-payment"
      : ""
  }`}
>
                <span>{p.guest_name}</span>
                <span>{p.invoice}</span>
                <span>
                  ₱{
                  Number(
                    p.total_amount
                  ).toLocaleString()
                  }
                  </span>
                <span>
                  ₱{
                  Number(
                    p.remaining_balance
                  ).toLocaleString()
                  }
                  </span>
                <span>
                  {p.payment_method}
                  </span>
                <span className={`payment-status payment-status-${p.payment_status?.toLowerCase()}`}>
                  {p.payment_status}
                </span>
                <span className="payment-row-actions">
                  <button
  className="btn-edit-icon"
  onClick={(e) => {
    e.stopPropagation();

    localStorage.removeItem(
      "highlightPaymentId"
    );

    setHighlightedId(null);

    handleEdit(p);
  }}
>
  ✏️
</button>
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {editingPayment && (
  <div
    className="modal-overlay"
    onClick={handleCancel}
  >
    <div
  className="payment-modal"
  onClick={(e) => e.stopPropagation()}
>
      <div className="modal-header">
        <h3>Payment Details</h3>
      </div>

      <div className="modal-body">

        <div className="modal-field">
          <label>Patient</label>
          <p className="modal-readonly">
            {editForm.guest_name}
          </p>
        </div>

        <div className="modal-field">
          <label>Total Amount</label>
          <p className="modal-readonly">
            ₱{Number(
              editForm.total_amount || 0
            ).toLocaleString()}
          </p>
        </div>

        <div className="modal-field">
          <label>Amount Paid</label>
          <p className="modal-readonly">
            ₱{Number(
              editForm.amount_paid || 0
            ).toLocaleString()}
          </p>
        </div>

        <div className="modal-field">
          <label>Remaining Balance</label>
          <p className="modal-readonly">
            ₱{Number(
              editForm.remaining_balance || 0
            ).toLocaleString()}
          </p>
        </div>

        <div className="modal-field">
          <label>Mode of Payment</label>

          <select
            className="modal-input"
            value={
              editForm.payment_method || ""
            }
            onChange={(e) =>
              setEditForm({
                ...editForm,
                payment_method:
                  e.target.value
              })
            }
          >
            <option value="Cash">
              Cash
            </option>

            <option value="GCash">
              GCash
            </option>

            <option value="Card">
              Card
            </option>
          </select>
        </div>

        <div className="modal-field">
  <label>Payment Status</label>

  <p
    className={`payment-status-display ${editForm.payment_status?.toLowerCase()}`}
  >
    {editForm.payment_status}
  </p>
</div>

        <div
          className="modal-field"
          style={{
            gridColumn: "1 / -1"
          }}
        >
          <label>
            Services Availed
          </label>

          <div className="services-list">

            {services.filter(
  service =>
    service.service_status !==
    "not_performed"
).length > 0 ? (

  services
    .filter(
      service =>
        service.service_status !==
        "not_performed"
    )
    .map((service) => (
                <div
                  key={service.id}
                  className="service-item"
                >
                  <span>
                    {service.service_name}
                  </span>

                  {editForm.payment_status !== "cancelled" &&
 editForm.payment_status !== "paid" && (

<div className="service-actions">

  <strong>
    ₱{Number(
      service.price
    ).toLocaleString()}
  </strong>

  {editForm.payment_status !== "cancelled" &&
   editForm.payment_status !== "paid" && (

    service.service_status === "not_performed" ? (

      <button
        className="btn-performed"
        onClick={() =>
          handlePerformed(service)
        }
      >
        Undo
      </button>

    ) : (

      <button
        className="btn-not-performed"
        onClick={() =>
          handleNotPerformed(service)
        }
      >
        Not Performed
      </button>

    )

  )}

</div>

)}
                </div>
              ))
            ) : (
              <p>
                No services found.
              </p>
            )}

          </div>
        </div>

      </div>


        <div className="modal-footer">

  {editForm.payment_status !== "cancelled" &&
   editForm.payment_status !== "paid" && (

    <select
      className="modal-input"
      onChange={async (e) =>
      {
        if(!e.target.value)
        {
          return;
        }

        try
        {
          await addServiceToPaymentApi(
            editingPayment.id,
            e.target.value
          );

          await handleEdit(
            editingPayment
          );

          await loadPayments();
        }
        catch(error)
        {
          console.error(error);
        }
      }}
    >
      <option value="">
        + Add Service
      </option>

      {allServices.map(service => (

        <option
          key={service.id}
          value={service.id}
        >
          {service.name}
          {" - ₱"}
          {service.price}
        </option>

      ))}
    </select>

  )}

  {editForm.payment_status === "cancelled" ? (

    <button
      className="btn-reinstate"
      onClick={handleReinstate}
    >
      Reinstate Appointment
    </button>

  ) : (

    editForm.payment_status !== "paid" && (

      <button
        className="btn-cancel-payment"
        onClick={handleCancelPayment}
      >
        Cancel / No Show
      </button>

    )

  )}

  {editForm.payment_status !== "cancelled" && (

    editForm.payment_status === "paid" ? (

      <button
        className="btn-warning"
        onClick={handleUndoPaid}
      >
        Undo Fully Paid
      </button>

    ) : (

      <button
        className="btn-save"
        onClick={handleMarkPaid}
      >
        Mark Fully Paid
      </button>

    )

  )}

  <button
    className="btn-cancel-edit"
    onClick={handleCancel}
  >
    Close
  </button>

</div>

      </div>
    </div>
)}
    </div>
  );
}

export default Payment;