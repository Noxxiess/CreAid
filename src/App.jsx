import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
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

import { supabase } from './lib/supabase'

async function testConnection() {
  const { data, error } = await supabase.auth.getSession()
  console.log('SESSION:', data)
  console.log('ERROR:', error)
}

testConnection()


function App() 
{
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/calendar" element={<Calendar />} />
      <Route path="/users" element={<Userlist />} /> 
      <Route path="/payments" element={<Payments />} />
      <Route path="/system" element={<SystemData />} />
      <Route path="/inbox" element={<Inbox />} />
      <Route path="/patients/new" element={<NewPatient />} />
      <Route path="/users/logs" element={<Logs />} />
      <Route path="/reports" element={<Reports />} />
      <Route path="/reports/daily" element={<Daily />} />
      <Route path="/reports/collections" element={<Reports />} />
      <Route path="/reports/expenses" element={<Reports />} />
      <Route path="/reports/appointments" element={<Reports />} />
    </Routes>
  );
}

export default App; 