import { useNavigate, useLocation } from "react-router-dom";
import { Icon } from "@iconify/react";
import "../styles/dashboard.css";

function PatientsIcon()
{
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={28} height={28} viewBox="0 0 80 80">
      <g fill="none" strokeLinejoin="round" strokeWidth={4}>
        <path fill="#27014f" stroke="#27014f" strokeLinecap="square" d="M60 70H20a4 4 0 0 1-4-4a15.87 15.87 0 0 1 10.3-14.86l1.23-.462a35.53 35.53 0 0 1 24.94 0l1.23.462A15.87 15.87 0 0 1 64 66a4 4 0 0 1-4 4Z" />
        <path fill="#1f003f" stroke="#1f003f" strokeLinecap="round" d="M33.902 38.867a13.347 13.347 0 0 0 19.15-9.08l.223-1.044a14.2 14.2 0 0 0-2.51-11.466l-.36-.48a12.992 12.992 0 0 0-20.81 0l-.36.48a14.2 14.2 0 0 0-2.51 11.465l.223 1.046a13.35 13.35 0 0 0 6.953 9.08" />
      </g>
    </svg>
  )
}

const MENU_ICONS =
{
  dashboard: "fluent-emoji-flat:bar-chart",
  calendar:  "flat-color-icons:calendar",
  users:     "fluent-emoji-flat:busts-in-silhouette",
  payments:  "fluent-emoji-flat:credit-card",
  reports:   "fluent-emoji-flat:bar-chart",
  system:    "fluent-emoji-flat:card-index-dividers",
  inbox:     "fluent-color:mail-48",
  dentists:  "fluent-emoji-flat:tooth",
  logs:      "fluent-emoji-flat:card-file-box",
  daily:     "fluent-emoji-flat:spiral-calendar",
  collections: "fluent-emoji-flat:money-bag",
  expenses:  "fluent-emoji-flat:receipt",
  appointments: "fluent-emoji-flat:clipboard",
}

const mainMenuItems =
[
  { label: "Calendar", path: "/calendar", color: "menu-calendar", icon: MENU_ICONS.calendar, badge: 3 },
  { label: "Users", path: "/users", color: "menu-users", icon: MENU_ICONS.users, badge: 12 },
  { label: "Payments", path: "/payments", color: "menu-payment", icon: MENU_ICONS.payments, badge: 5 },
  { label: "Reports", path: "/reports", color: "menu-reports", icon: MENU_ICONS.reports, badge: 0 },
  { label: "System Data", path: "/system", color: "menu-system", icon: MENU_ICONS.system, badge: 0 },
  { label: "Inbox", path: "/inbox", color: "menu-inbox", icon: MENU_ICONS.inbox, badge: 9 },
]

const userMenuItems =
[
  { label: "Dashboard", path: "/dashboard", color: "menu-dashboard", icon: MENU_ICONS.dashboard, badge: 0 },
  { label: "All Users", path: "/users/userlist", color: "menu-users", icon: MENU_ICONS.users, badge: 0 },
  { label: "Patients", path: "/users/patients", color: "menu-calendar", icon: null, customIcon: <PatientsIcon />, badge: 0 },
  { label: "Dentists", path: "/users/dentists", color: "menu-payment", icon: MENU_ICONS.dentists, badge: 0 },
  { label: "User Logs", path: "/users/logs", color: "menu-system", icon: MENU_ICONS.logs, badge: 0 },
]

const reportsMenuItems =
[
  { label: "Dashboard", path: "/dashboard", color: "menu-dashboard", icon: MENU_ICONS.dashboard, badge: 0 },
  { label: "Summary", path: "/reports/summary", color: "menu-reports", icon: MENU_ICONS.reports, badge: 0 },
  { label: "Daily Sales", path: "/reports/daily", color: "menu-calendar", icon: MENU_ICONS.daily, badge: 0 },
  { label: "Collections", path: "/reports/collections", color: "menu-payment", icon: MENU_ICONS.collections, badge: 0 },
  { label: "Expenses & Bills", path: "/reports/expenses", color: "menu-system", icon: MENU_ICONS.expenses, badge: 0 },
  { label: "Patient Appointments", path: "/reports/appointments", color: "menu-inbox", icon: MENU_ICONS.appointments, badge: 0 },
]

function getMenuItems(pathname)
{
  if (pathname.startsWith("/users")) return userMenuItems
  if (pathname.startsWith("/reports")) return reportsMenuItems
  return mainMenuItems
}

function Dashboard()
{
  const navigate = useNavigate()
  const location = useLocation()
  const items = getMenuItems(location.pathname)

  return (
    <div className="menu-container">
      <div className="menu-grid">
        {items.map((item) => (
          <button key={item.path} className={`menu-card ${item.color}`} onClick={() => navigate(item.path)}>
            {item.badge > 0 && <span className="menu-badge">{item.badge}</span>}
            <span className="menu-icon">{item.customIcon ? item.customIcon : <Icon icon={item.icon} />}</span>
            <span className="menu-label">{item.label}</span>
            <span className="menu-view">View <span className="menu-view-arrow">→</span></span>
          </button>
        ))}
      </div>
    </div>
  )
}

export default Dashboard;