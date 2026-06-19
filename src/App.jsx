import { Routes, Route } from "react-router-dom";
import Home from "./guest/Home";
import Services from "./guest/Services";
import Aboutus from "./guest/Aboutus";
import Contact from "./guest/Contact";
import Terms from "./guest/Terms";
import Scroll from "./guest/Scroll";
import Navbar from "./guest/Navbar";
import Appointment from "./guest/Appointment";

import MyAccount from "./pages/settings/MyAccount";
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
import Patients from "./pages/users/Patients";
import Dentists from "./pages/users/Dentists";
import Daily from "./pages/reports/Daily";
import Collections from "./pages/reports/Collections";
import Appointments from "./pages/reports/Appointments";
import Expenses from "./pages/reports/Expenses";
import Layout from "./components/Layout";
import { supabase } from './lib/supabase';

async function testConnection() 
{
  const { data, error } = await supabase.auth.getSession()
  console.log('SESSION:', data)
  console.log('ERROR:', error)
}

testConnection()

function App() 
{

  return (

    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/services" element={<Services />} />
      <Route path="/aboutus" element={<Aboutus />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/terms" element={<Terms />} />
      <Route path="/appointment" element={<Appointment />} />

      <Route path="/login" element={<Login />} />

      <Route element={<Layout />}>
        <Route path="/myaccount" element={<MyAccount />} />
        <Route path="/patients/new" element={<NewPatient />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/calendar" element={<Calendar />} />
        <Route path="/users" element={<Userlist />} /> 
        <Route path="/payments" element={<Payments />} />
        <Route path="/system" element={<SystemData />} />
        <Route path="/inbox" element={<Inbox />} />
        <Route path="/users/logs" element={<Logs />} />
        <Route path="/users/patients" element={<Patients />} />
        <Route path="/users/dentists" element={<Dentists />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/reports/daily" element={<Daily />} />
        <Route path="/reports/collections" element={<Collections />} />
        <Route path="/reports/appointments" element={<Appointments />} /> 
        <Route path="/reports/expenses" element={<Expenses />} />
      </Route>
    </Routes>
  );
}

export default App; 

