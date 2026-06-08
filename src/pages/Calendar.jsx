import { useState, useEffect } from "react";
import "../styles/calendar.css";
import {
  getAppointmentsApi,
  updateAppointmentStatusApi,
  confirmDownpaymentApi,
  getAppointmentServicesApi
} from "../api/appointments";
import { supabase } from '../lib/supabase'
import {
  useNavigate
}
from "react-router-dom";

function Calendar() 
{
  const navigate = useNavigate();
  const [view, setView] = useState("month"); 
  const [currentDate, setCurrentDate] = useState(new Date());
  const [appointments, setAppointments] = useState([]);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [appointmentServices, setAppointmentServices] = useState([]);

  useEffect(() =>
{
  fetchAppointments();
}, []);

async function loadAppointmentServices(
  appointmentId
)
{
  try
  {
    const response =
      await getAppointmentServicesApi(
        appointmentId
      );

    console.log(
      "CALENDAR SERVICES:",
      response
    );

    setAppointmentServices(
      response.services || []
    );
  }
  catch(error)
  {
    console.error(error);

    setAppointmentServices([]);
  }
}

const markAsNoShow = async () => {
  const confirmNoShow =
    window.confirm(
      "Are you sure you want to mark this appointment as No Show?"
    );

  if (!confirmNoShow) return;

  try {
    await updateAppointmentStatusApi(
      selectedAppointment.id,
      "no_show"
    );

    await fetchAppointments();
    setSelectedAppointment(null);
  } catch (err) {
    console.error(err);
  }
};

const undoNoShow =
async () =>
{
  try
  {
    await confirmDownpaymentApi(
  selectedAppointment.id
);

    setAppointments(prev =>
      prev.map(appt =>
        appt.id ===
        selectedAppointment.id
          ? {
              ...appt,
              status:
                "scheduled"
            }
          : appt
      )
    );

    setSelectedAppointment(
      null
    );
  }
  catch(err)
  {
    console.error(err);
  }
};

const markAsDone =
async () =>
{
  try
  {
    await updateAppointmentStatusApi(
      selectedAppointment.id,
      "completed"
    );

    setAppointments(prev =>
      prev.map(appt =>
        appt.id ===
        selectedAppointment.id
          ? {
              ...appt,
              status:
                "completed"
            }
          : appt
      )
    );

    setSelectedAppointment(
      null
    );
  }
  catch(err)
  {
    console.error(err);
  }
};

const markAsIncomplete =
async () =>
{
  try
  {
    await confirmDownpaymentApi(
  selectedAppointment.id
);

    setAppointments(prev =>
      prev.map(appt =>
        appt.id ===
        selectedAppointment.id
          ? {
              ...appt,
              status:
                "scheduled"
            }
          : appt
      )
    );

    setSelectedAppointment(
      null
    );
  }
  catch(err)
  {
    console.error(err);
  }
};

const cancelAppointment =
async () =>
{
  const confirmCancel =
    window.confirm(
      "Are you sure you want to cancel this appointment?"
    );

  if (!confirmCancel) return;

  try
  {
    await updateAppointmentStatusApi(
      selectedAppointment.id,
      "cancelled"
    );

    await fetchAppointments();

    setSelectedAppointment(null);
  }
  catch(err)
  {
    console.error(err);
  }
};

const undoCancel =
async () =>
{
  try
  {
    await confirmDownpaymentApi(
  selectedAppointment.id
);

    await fetchAppointments();

    setSelectedAppointment(null);
  }
  catch(err)
  {
    console.error(err);
  }
};

const fetchAppointments =
async () =>
{
  try
  {
    const result =
      await getAppointmentsApi();

    console.log(
  "APPOINTMENTS:",
  result.appointments
);

    setAppointments(
      result.appointments || []
    );
  }
  catch(err)
  {
    console.error(err);
  }
};

  const year = currentDate.getFullYear();
  const monthIndex = currentDate.getMonth();
  const dayNumber = currentDate.getDate();
  const monthName = currentDate.toLocaleString("default", { month: "long" });
  const weekdayName = currentDate.toLocaleString("default", { weekday: "long" });
  const firstDayOfMonth = new Date(year, monthIndex, 1).getDay();
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();

  const getStatusClass = (
  status
) => {

  switch(status){

    case "pending_payment":
      return "pending-payment";

    case "pending_verification":
      return "pending-verification";

    case "scheduled":
      return "scheduled";

    case "completed":
      return "completed";

    case "cancelled":
      return "cancelled";

    case "no_show":
      return "no-show";

    default:
      return "";

  }

};

  const weekDays = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  return (
    <div className="calendar-content">
      <div className="calendar-card">
        <div className="calendar-header">
          <h2 className="calendar-title">
            {view === "year" && year}
            {view === "month" && `${monthName} ${year}`}
            {(view === "week" || view === "day") &&
              `${weekdayName}, ${monthName} ${dayNumber}`}
          </h2>

          <div className="calendar-filters">
            {["year", "month", "week", "day"].map(v => (
              <button key={v} className={view === v ? "active" : ""} onClick={() => setView(v)}>
                {v.charAt(0).toUpperCase() + v.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {view === "year" && (
          <div className="year-grid">
            {Array.from({ length: 12 }, (_, i) => (
              <div key={i} className="month-card" onClick={() => { setCurrentDate(new Date(year, i, 1)); setView("month"); }}>
                {new Date(year, i).toLocaleString("default", { month: "long" })}
              </div>
            ))}
          </div>
        )}

        {view === "month" && (
          <div className="month-calendar">
            <div className="weekday-row">
              {weekDays.map(d => (
                <div key={d} className="weekday-cell">{d}</div>
              ))}
            </div>

            <div className="calendar-grid">
              {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                <div key={`start-${i}`} className="calendar-cell empty" />
              ))}

              {Array.from({ length: daysInMonth }, (_, i) => {
                const dateString =
  `${year}-${String(monthIndex + 1).padStart(2, "0")}-${String(i + 1).padStart(2, "0")}`;

      const hasEvent =
  appointments.some(appt => {
    console.log(
      "COMPARE:",
      appt.appointment_date,
      dateString
    );

    return (
      appt.appointment_date ===
      dateString
    );
  });
                return (
                  <div
                    key={i}
                    className={`calendar-cell ${hasEvent ? "has-event" : ""}`}
                    onClick={() => { setCurrentDate(new Date(year, monthIndex, i + 1)); setView("day"); }}
                  >
                    {i + 1}
                  </div>
                );
              })}

              {Array.from({ length: (7 - ((firstDayOfMonth + daysInMonth) % 7)) % 7 }).map((_, i) => (
                <div key={`end-${i}`} className="calendar-cell empty" />
              ))}
            </div>
          </div>
        )}

        {view === "week" && (
          <div className="week-calendar">
            <div className="week-header">
              <div className="time-col-header"></div>

              {Array.from({ length: 7 }, (_, i) => {
                const d = new Date(currentDate);
                d.setDate(dayNumber - d.getDay() + i);
                return (
                  <div
                    key={i}
                    className={`week-day-header ${d.toDateString() === new Date().toDateString() ? "today" : ""}`}
                  >
                    <strong>{d.toLocaleString("default", { weekday: "long" })}</strong>
                    <div className="week-date">
                      {d.toLocaleString("default", { month: "short" })} {d.getDate()}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="week-body">
              <div className="time-column">
                {Array.from({ length: 16 }, (_, i) => (
                  <div key={i} className="time-cell">{7 + i}:00</div>
                ))}
              </div>

              <div className="week-grid-columns">

  {Array.from({ length: 7 }).map((_, dayIndex) => {

    const dayDate = new Date(currentDate);

    dayDate.setDate(
      currentDate.getDate() -
      currentDate.getDay() +
      dayIndex
    );

    const dateString =
      `${dayDate.getFullYear()}-${String(
        dayDate.getMonth() + 1
      ).padStart(2, "0")}-${String(
        dayDate.getDate()
      ).padStart(2, "0")}`;

    const dayAppointments =
      appointments.filter(
        appt =>
          appt.appointment_date ===
          dateString
      );

    return (
      <div
        key={dayIndex}
        className="week-day-column"
      >

        {dayAppointments.map(
          appt => (
            <div
  key={appt.id}
  className={`week-appointment ${
  getStatusClass(
    appt.status
  )
}`}
  onClick={() => {

  setSelectedAppointment(
    appt
  );

  loadAppointmentServices(
    appt.id
  );

}}
>
  <strong>
  {appt.appointment_time}
</strong>

<div>
  {appt.patient?.full_name ||
   appt.guest_name}
</div>

<div>
  {appt.service?.name}
</div>
</div>
          )
        )}

      </div>
    );
  })}

</div>
            </div>
          </div>
        )}

        {view === "day" && (
  <div className="day-grid">

    {appointments
      .filter(appt => {

        const selectedDate =
          `${currentDate.getFullYear()}-${String(
            currentDate.getMonth() + 1
          ).padStart(2, "0")}-${String(
            currentDate.getDate()
          ).padStart(2, "0")}`;

        return (
          appt.appointment_date ===
          selectedDate
        );
      })
      .map(appt => (
        <div
  key={appt.id}
  className={`hour-row ${
  getStatusClass(
    appt.status
  )
}`}
  onClick={() => {

  setSelectedAppointment(
    appt
  );

  loadAppointmentServices(
    appt.id
  );

}}
>
          <strong>
  {appt.appointment_time}
</strong>

{" - "}

{
  appt.patient?.full_name ||
  appt.guest_name
}

{" - "}

{
  appt.service?.name ||
  "Service"
}
        </div>
      ))
    }

  </div>
)}
{selectedAppointment && (
  <div className="appointment-modal-overlay">
    <div className="appointment-modal">
      <div className="modal-header">
        <h2>Appointment Details</h2>
      </div>

      <div className="modal-layout">
        <div className="modal-left">
          <div className="detail-item">
            <span className="detail-label">Patient</span>
            <span className="detail-value">
              {selectedAppointment.patient?.full_name || selectedAppointment.guest_name}
            </span>
          </div>

          <div className="detail-item">
            <span className="detail-label">Email</span>
            <span className="detail-value">
              {selectedAppointment.patient?.email || selectedAppointment.guest_email || "N/A"}
            </span>
          </div>

          <div className="detail-item">
            <span className="detail-label">Contact Number</span>
            <span className="detail-value">
              {selectedAppointment.patient?.contact_number || selectedAppointment.guest_contact}
            </span>
          </div>

          <div className="detail-item">
            <span className="detail-label">Dentist</span>
            <span className="detail-value">
              {selectedAppointment.dentist?.full_name}
            </span>
          </div>

          <div className="detail-item">
            <span className="detail-label">Date</span>
            <span className="detail-value">
              {selectedAppointment.appointment_date}
            </span>
          </div>

          <div className="detail-item">
            <span className="detail-label">Time</span>
            <span className="detail-value">
              {selectedAppointment.appointment_time}
            </span>
          </div>

          <div className="detail-item">
            <span className="detail-label">Additional Notes</span>
            <span className="detail-value">
              {selectedAppointment.notes || "No notes provided"}
            </span>
          </div>
        </div>

        <div className="modal-right">
          {!selectedAppointment.patient_id && (
            <div className="detail-item">
              <span className="guest-badge">
                Guest Booking
              </span>
            </div>
          )}

          <div className="detail-item">
            <span className="detail-label">Status</span>
            <span className={`status-pill ${getStatusClass(selectedAppointment.status)}`}>
              {selectedAppointment.status?.replaceAll("_", " ")}
            </span>
          </div>

          <div className="detail-item">
            <span className="detail-label">Payment Status</span>
            <span className="detail-value">
              {selectedAppointment.payment_status}
            </span>

            {selectedAppointment.receipt_url && (
              <a
                href={
                  supabase.storage
                    .from("receipts")
                    .getPublicUrl(selectedAppointment.receipt_url)
                    .data.publicUrl
                }
                target="_blank"
                rel="noopener noreferrer"
                className="receipt-link"
              >
                📄 View Receipt
              </a>
            )}

            <a
              href="#"
              className="receipt-link"
              onClick={(e) => {
                e.preventDefault();

                localStorage.setItem(
                  "highlightPaymentId",
                  selectedAppointment.id
                );

                navigate("/payments");
              }}
            >
              💳 View Payment Details
            </a>
          </div>

          <div className="detail-item">
            <span className="detail-label">Payment Method</span>
            <span className="detail-value">
              {selectedAppointment.payment_method}
            </span>
          </div>

          <div className="detail-item">
            <span className="detail-label">Reason for Visit</span>
            <span className="detail-value">
              {selectedAppointment.reason_for_visit || "Not provided"}
            </span>
          </div>
        </div>
      </div>

      <div className="detail-item services-calendar-section">
        <span className="detail-label">Services Availed</span>

        <div className="services-list">
          {appointmentServices
  .filter(
    service =>
      service.service_status !==
      "not_performed"
  )
  .length > 0 ? (

  appointmentServices
    .filter(
      service =>
        service.service_status !==
        "not_performed"
    )
    .map((service) => (
              <div key={service.id} className="service-item">
                <span>{service.service_name}</span>

                <strong>
                  ₱{Number(service.price).toLocaleString()}
                </strong>
              </div>
            ))
          ) : (
            <span className="detail-value">
              No services found
            </span>
          )}
        </div>
      </div>

      <div className="appointment-modal-actions">
        {selectedAppointment.status === "pending_verification" && (
          <button
            className="btn-confirm-payment"
            onClick={async () => {
              try {
                await confirmDownpaymentApi(selectedAppointment.id);
                fetchAppointments();
                setSelectedAppointment(null);
              } catch (err) {
                console.error(err);
              }
            }}
          >
            Confirm Payment
          </button>
        )}

        {selectedAppointment.status === "scheduled" && (
          <>
            <button className="btn-done" onClick={markAsDone}>
              Mark as Done
            </button>

            <button className="btn-no-show" onClick={markAsNoShow}>
              No Show
            </button>

            <button className="btn-cancel-b" onClick={cancelAppointment}>
              Cancel
            </button>
          </>
        )}

        {selectedAppointment.status === "cancelled" && (
          <button className="btn-incomplete" onClick={undoCancel}>
            Undo Cancel
          </button>
        )}

        {selectedAppointment.status === "completed" && (
          <button className="btn-incomplete" onClick={markAsIncomplete}>
            Mark as Incomplete
          </button>
        )}

        {selectedAppointment.status === "no_show" && (
          <button className="btn-incomplete" onClick={undoNoShow}>
            Undo No Show
          </button>
        )}

        <button
          className="modal-close-btn"
          onClick={() => setSelectedAppointment(null)}
        >
          Close
        </button>
      </div>
    </div>
  </div>
)}
      </div>
    </div>
  );
}

export default Calendar;