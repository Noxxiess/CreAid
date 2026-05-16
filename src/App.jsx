import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Myaccount from "./pages/settings/Myaccount";
import Calendar from "./pages/Calendar";
import Userlist from "./pages/Userlist";
import Payments from "./pages/Payments";
import Reports from "./pages/Reports";
import SystemData from "./pages/SystemData";
import Inbox from "./pages/Inbox";
import NewPatient from "./pages/NewPatient";
import Dashboard from "./pages/Dashboard";
import Logs from "./pages/users/Logs";
import Daily from "./pages/reports/Daily"
import Collections from "./pages/reports/Collections";
import Appointments from "./pages/reports/Appointments";
import Layout from "./components/Layout";
import { supabase } from './lib/supabase';

function App() 
{
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route element={<Layout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/myaccount" element={<Myaccount />} />
        <Route path="/calendar" element={<Calendar />} />
        <Route path="/users" element={<Userlist />} /> 
        <Route path="/payments" element={<Payments />} />
        <Route path="/system" element={<SystemData />} />
        <Route path="/inbox" element={<Inbox />} />
        <Route path="/patients/new" element={<NewPatient />} />
        <Route path="/users/logs" element={<Logs />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/reports/daily" element={<Daily />} />
        <Route path="/reports/collections" element={<Collections />} />
        <Route path="/reports/expenses" element={<Reports />} />
        <Route path="/reports/appointments" element={<Reports />} />
      </Route>
    </Routes>
  );
}

export default App; 