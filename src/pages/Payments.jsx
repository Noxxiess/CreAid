import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import "../styles/payment.css";

function Payment() {
  // ✅ backend-ready state
  const [payments, setPayments] = useState([]);

  useEffect(() => 
  {
    /*
    getPayments().then(res => {
      setPayments(res.data);
    });
    */

    // TEMP PLACEHOLDER DATA
    setPayments([
      {
        name: "— — —",
        invoice: "— — —",
        amount: "₱ 0.00",
        mode: "— — —",
        status: "— — —"
      }
    ]);
  }, []);

  return (
    <div className="admin-container">
      <Sidebar />

      <div className="admin-main">
        <Topbar />

        <div className="dashboard-content">
          <div className="payment-page-container">

            <h2 className="payment-title">Payment</h2>

            <div className="payment-table">

              {/* HEADER */}
              <div className="payment-header">
                <span>Name</span>
                <span>Invoice</span>
                <span>Amount</span>
                <span>Mode of Payment</span>
                <span>Status</span>
                <span></span>
              </div>

              {/* ROWS */}
              {payments.map((p, i) => (
                <div key={i} className="payment-row">
                  <span>{p.name}</span>
                  <span>{p.invoice}</span>
                  <span>{p.amount}</span>
                  <span>{p.mode}</span>
                  <span className={`status ${p.status?.toLowerCase()}`}>
                    {p.status}
                  </span>
                  <span className="actions">✏️ 🗑</span>
                </div>
              ))}

            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

export default Payment;