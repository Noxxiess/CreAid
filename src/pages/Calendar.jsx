import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import "../styles/calendar.css";

// API later:
// import { getAppointments } from "../api/appointments";

function Calendar() {
  const [view, setView] = useState("month"); // year | month | week | day
  const [currentDate, setCurrentDate] = useState(new Date());
  const [appointments, setAppointments] = useState([]);

  // ✅ API HOOK (READY)
  useEffect(() => {
    /*
    getAppointments({
      view,
      date: currentDate,
    }).then(res => setAppointments(res.data));
    */
    setAppointments([]); // frontend only
  }, [view, currentDate]);

  const year = currentDate.getFullYear();
  const monthIndex = currentDate.getMonth();
  const dayNumber = currentDate.getDate();

  const monthName = currentDate.toLocaleString("default", { month: "long" });
  const weekdayName = currentDate.toLocaleString("default", { weekday: "long" });

  // ✅ MONTH CALCULATIONS
  const firstDayOfMonth = new Date(year, monthIndex, 1).getDay(); // 0 = Sunday
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();

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
    <div className="admin-container">
      <Sidebar />
      <div className="admin-main">
        <Topbar />

        <div className="calendar-content">

          {/* ✅ FLOATING CONTAINER */}
          <div className="calendar-card">

            {/* HEADER */}
            <div className="calendar-header">
              <h2 className="calendar-title">
                {view === "year" && year}
                {view === "month" && `${monthName} ${year}`}
                {(view === "week" || view === "day") &&
                  `${weekdayName}, ${monthName} ${dayNumber}`}
              </h2>

              <div className="calendar-filters">
                {["year", "month", "week", "day"].map(v => (
                  <button
                    key={v}
                    className={view === v ? "active" : ""}
                    onClick={() => setView(v)}
                  >
                    {v.charAt(0).toUpperCase() + v.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* ✅ YEAR VIEW */}
            {view === "year" && (
              <div className="year-grid">
                {Array.from({ length: 12 }, (_, i) => (
                  <div
                    key={i}
                    className="month-card"
                    onClick={() => {
                      setCurrentDate(new Date(year, i, 1));
                      setView("month");
                    }}
                  >
                    {new Date(year, i).toLocaleString("default", {
                      month: "long",
                    })}
                  </div>
                ))}
              </div>
            )}

            {/* ✅ MONTH VIEW */}
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
                    const hasEvent = false;

                    return (
                      <div
                        key={i}
                        className={`calendar-cell ${hasEvent ? "has-event" : ""}`}
                        onClick={() => {
                          setCurrentDate(new Date(year, monthIndex, i + 1));
                          setView("day");
                        }}
                      >
                        {i + 1}
                      </div>
                    );
                  })}

                  {Array.from({ length: (7 - ((firstDayOfMonth + daysInMonth) % 7)) % 7,
                  }).map((_, i) => (
                    <div key={`end-${i}`} className="calendar-cell empty" />
                  ))}
                </div>
              </div>
            )}

            {/* ✅ WEEK VIEW (GRID WITH HOURS) */}
            {view === "week" && (
              <div className="week-calendar">

                {/* WEEK HEADER */}
                <div className="week-header">
                  <div className="time-col-header"></div>

                  {Array.from({ length: 7 }, (_, i) => {
                    const d = new Date(currentDate);
                    d.setDate(dayNumber - d.getDay() + i);

                    return (
                      <div
                        key={i}
                        className={`week-day-header ${
                          d.toDateString() === new Date().toDateString() ? "today" : ""
                        }`}
                      >
                        <strong>{d.toLocaleString("default", { weekday: "long" })}</strong>
                        <div className="week-date">
                          {d.toLocaleString("default", { month: "short" })} {d.getDate()}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* WEEK BODY */}
                <div className="week-body">

                  {/* TIME COLUMN */}
                  <div className="time-column">
                    {Array.from({ length: 16 }, (_, i) => (
                      <div key={i} className="time-cell">
                        {7 + i}:00
                      </div>
                    ))}
                  </div>

                  {/* DAY COLUMNS */}
                  <div className="week-grid-columns">
                    {Array.from({ length: 7 }).map((_, dayIndex) => (
                      <div key={dayIndex} className="week-day-column">
                        {Array.from({ length: 16 }).map((_, hourIndex) => (
                          <div key={hourIndex} className="week-slot"></div>
                        ))}
                      </div>
                    ))}
                  </div>

                </div>
              </div>
            )}

            {/* ✅ DAY VIEW */}
            {view === "day" && (
              <div className="day-grid">
                {Array.from({ length: 11 }, (_, i) => (
                  <div key={i} className="hour-row">
                    {8 + i}:00
                  </div>
                ))}
              </div>
            )}
            </div>
        </div>
      </div>
    </div>
  );
}

export default Calendar;