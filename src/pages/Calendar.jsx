import { useState, useEffect } from "react";
import "../styles/calendar.css";

function Calendar() 
{
  const [view, setView] = useState("month"); 
  const [currentDate, setCurrentDate] = useState(new Date());
  const [appointments, setAppointments] = useState([]);

  useEffect(() => 
  {
    //backend pooooo
    setAppointments([]);
  }, [view, currentDate]);

  const year = currentDate.getFullYear();
  const monthIndex = currentDate.getMonth();
  const dayNumber = currentDate.getDate();
  const monthName = currentDate.toLocaleString("default", { month: "long" });
  const weekdayName = currentDate.toLocaleString("default", { weekday: "long" });
  const firstDayOfMonth = new Date(year, monthIndex, 1).getDay();
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
                const hasEvent = false;
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

        {view === "day" && (
          <div className="day-grid">
            {Array.from({ length: 11 }, (_, i) => (
              <div key={i} className="hour-row">{8 + i}:00</div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Calendar;
