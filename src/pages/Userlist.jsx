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
  const [showArchived, setShowArchived] = useState(false);

  // ✅ filters (backend-ready)
  const [filters, setFilters] = useState({
    name: "",
    year: "",
    type: "",
    tags: ""
  });

  const [editingUser, setEditingUser] = useState(null);
const [editForm, setEditForm] = useState({
  first_name: "",
  middle_name: "",
  last_name: "",
  address: "",
  contact_number: ""
});

  // ✅ API PLACEHOLDER
  useEffect(() => {
    fetchUsers();
  }, [page, filters, showArchived]);

  async function fetchUsers() {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("is_archived", showArchived);

    if (error) {
      console.error("Supabase error:", error);
      return;
    }

    console.log(data);

    const formattedUsers = data.map((u) => ({
  id: u.id,
  first_name: u.first_name,
  middle_name: u.middle_name,
  last_name: u.last_name,
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

  async function archiveUser(id) {
    const confirmArchive = window.confirm("Archive this user?");

    if (!confirmArchive) return;

    const { error } = await supabase
      .from("users")
      .update({ is_archived: true })
      .eq("id", id);

    if (error) {
      console.error("Archive error:", error);
      alert("Failed to archive user");
      return;
    }

    fetchUsers();
  }

  async function restoreUser(id) {
    const confirmRestore = window.confirm("Restore this user?");

    if (!confirmRestore) return;

    const { error } = await supabase
      .from("users")
      .update({ is_archived: false })
      .eq("id", id);

    if (error) {
      console.error("Restore error:", error);
      alert("Failed to restore user");
      return;
    }

    fetchUsers();
  }

  function editUser(user) {
  setEditingUser(user);
  setEditForm({
    first_name: user.first_name || "",
    middle_name: user.middle_name || "",
    last_name: user.last_name || "",
    address: user.address || "",
    contact_number: user.mobile || ""
  });
}

async function saveEditUser() {
  const { error } = await supabase
    .from("users")
    .update({
      first_name: editForm.first_name,
      middle_name: editForm.middle_name,
      last_name: editForm.last_name,
      address: editForm.address,
      contact_number: editForm.contact_number
    })
    .eq("id", editingUser.id);

  if (error) {
    console.error("Edit error:", error);
    alert("Failed to update user");
    return;
  }

  setEditingUser(null);
  fetchUsers();
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
              <h2>
                {showArchived ? "Archived Users" : "Users List"}
              </h2>
            </div>

            <button
              className="btn-go"
              onClick={() => setShowArchived(!showArchived)}
            >
              {showArchived
                ? "Show Active Users"
                : "Show Archived Users"}
            </button>
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
                  <span className="row-actions">
                    <button onClick={() => editUser(u)}>✏️</button>

                    {showArchived ? (
                      <button onClick={() => restoreUser(u.id)}>↩️</button>
                    ) : (
                      <button onClick={() => archiveUser(u.id)}>🗑</button>
                    )}
                  </span>

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
          {editingUser && (
  <div className="edit-modal-overlay">
    <div className="edit-modal">
      <h3>Edit User</h3>

      <label>First Name</label>
      <input
        value={editForm.first_name}
        onChange={(e) =>
          setEditForm({ ...editForm, first_name: e.target.value })
        }
      />

      <label>Middle Name</label>
      <input
        value={editForm.middle_name}
        onChange={(e) =>
          setEditForm({ ...editForm, middle_name: e.target.value })
        }
      />

      <label>Last Name</label>
      <input
        value={editForm.last_name}
        onChange={(e) =>
          setEditForm({ ...editForm, last_name: e.target.value })
        }
      />

      <label>Address</label>
      <input
        value={editForm.address}
        onChange={(e) =>
          setEditForm({ ...editForm, address: e.target.value })
        }
      />

      <label>Contact Number</label>
      <input
        value={editForm.contact_number}
        onChange={(e) =>
          setEditForm({ ...editForm, contact_number: e.target.value })
        }
      />

      <div className="edit-modal-actions">
        <button className="btn-clear" onClick={() => setEditingUser(null)}>
          Cancel
        </button>

        <button className="btn-go" onClick={saveEditUser}>
          Save Changes
        </button>
      </div>
    </div>
  </div>
)}
        </div>
      </div>
    </div>
  );
}

export default Userlist;
