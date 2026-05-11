import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import "../styles/users.css";
import { supabase } from "../lib/supabase";

function Userlist() {

  // ✅ backend-ready state
  const [users, setUsers] = useState([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [page, setPage] = useState(1);

  // ✅ filters (backend-ready)
  const [filters, setFilters] = useState({
    name: "",
    year: "",
    type: "",
    tags: ""
  });

  // ✅ API PLACEHOLDER
 useEffect(() => {
  fetchUsers();
}, [page, filters]);

async function fetchUsers() {
  const { data, error } = await supabase
    .from("users")
    .select("*");

  if (error) {
    console.error("Supabase error:", error);
    return;
  }

  console.log(data);

  const formattedUsers = data.map((u) => ({
    id: u.id,
    name: `${u.last_name}, ${u.first_name} ${u.middle_name || ""}`,
    address: u.address,
    mobile: u.contact_number,
    created: new Date(u.created_at).toLocaleDateString(),
    lastOnline: "Online",
    balance: "₱0.00"
  }));

  setUsers(formattedUsers);
  setTotalUsers(data.length);
}

  return (
    <div className="admin-container">
      <Sidebar />

      <div className="admin-main">
        <Topbar />

        <div className="dashboard-content">
          
          {/* HEADER */}
          <div className="users-page-header">
            <div>
              <h2>Users List</h2>
            </div>
          </div>
          
          <div className="users-page-container">

            {/* ✅ FILTER BAR*/}
            <div className="users-filter-container">

              {/* LEFT SIDE */}
              <div className="filter-left">

                {/* ROW 1 */}
                <div className="filter-row">
                  <span className="filter-label">Filter by</span>
                  <input
                    type="text"
                    placeholder="Lastname, Firstname"
                    value={filters.name}
                    onChange={(e) =>
                      setFilters({ ...filters, name: e.target.value })
                    }
                  />
                </div>

                {/* ROW 2 */}
                <div className="filter-row">
                  <span className="filter-label">Patient of</span>

                  <input
                    type="text"
                    placeholder="Year"
                    value={filters.year}
                    onChange={(e) =>
                      setFilters({ ...filters, year: e.target.value })
                    }
                  />

                  <select
                    value={filters.type}
                    onChange={(e) =>
                      setFilters({ ...filters, type: e.target.value })
                    }
                  >
                    <option value="">Type</option>
                    <option value="Patient">Patient</option>
                    <option value="Staff">Staff</option>
                    <option value="Dentist">Dentist</option>
                  </select>

                  <button className="btn-go">Go</button>
                  <button
                    className="btn-clear"
                    onClick={() =>
                      setFilters({ name: "", year: "", type: "", tags: "" })
                    }
                  >
                    Clear
                  </button>
                </div>
              </div>

              {/* RIGHT SIDE */}
              <div className="filter-right">
                <span className="filter-label">Filter by Tags</span>
                <input
                  type="text"
                  placeholder="Search tags..."
                  value={filters.tags}
                  onChange={(e) =>
                    setFilters({ ...filters, tags: e.target.value })
                  }
                />
              </div>
            </div>

            {/* TABLE */}
            <div className="users-table">

              <div className="users-table-header">
                <span></span>
                <span>ID</span>
                <span>Name</span>
                <span>Address</span>
                <span>Mobile</span>
                <span>Account Created</span>
                <span>Last Online</span>
                <span>Balance</span>
              </div>

              {users.map((u, i) => (
                <div key={i} className="users-table-row">
                  <span className="row-actions">✏️ 🗑</span>
                  <span>{u.id}</span>
                  <span className="link">{u.name}</span>
                  <span>{u.address}</span>
                  <span>{u.mobile}</span>
                  <span>{u.created}</span>
                  <span>{u.lastOnline}</span>
                  <span>{u.balance}</span>
                </div>
              ))}
            </div>

            {/* FOOTER */}
            <div className="users-footer">
              <div className="pagination">
                « Previous <strong>{page}</strong> Next »
              </div>
              <div>Total Users: {totalUsers}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Userlist;
