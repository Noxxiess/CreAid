import { useEffect, useState } from "react";
import "../styles/users.css";
import { supabase } from "../lib/supabase";

const PAGE_SIZE = 5;

function Userlist() 
{
  const [users, setUsers] = useState([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [page, setPage] = useState(1);

  const [filters, setFilters] = useState({
    name: "",
    year: "",
    type: ""
  });

  const [appliedFilters, setAppliedFilters] = useState({
    name: "",
    year: "",
    type: ""
  });

  useEffect(() => 
  {
    fetchUsers();
  }, [page, appliedFilters]);

  async function fetchUsers() 
  {
    const from = (page - 1) * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    let query = supabase.from("users").select("*", { count: "exact" });

    if (appliedFilters.name) 
    {
      const parts = appliedFilters.name.split(",").map((s) => s.trim());
      const lastName = parts[0] || "";
      const firstName = parts[1] || "";

      if (lastName && firstName) 
      {
        query = query
          .ilike("last_name", `%${lastName}%`)
          .ilike("first_name", `%${firstName}%`);
      } 
      else if (lastName) 
      {
        query = query.or(
          `last_name.ilike.%${lastName}%,first_name.ilike.%${lastName}%,middle_name.ilike.%${lastName}%`
        );
      }
    }

    if (appliedFilters.type) 
    {
      query = query.ilike("role", appliedFilters.type);
    }

    if (appliedFilters.year) 
    {
      const year = appliedFilters.year.trim();
      query = query
        .gte("created_at", `${year}-01-01`)
        .lte("created_at", `${year}-12-31`);
    }

    const { data, error, count } = await query.range(from, to);

    if (error) 
    {
      console.error("Supabase error:", error);
      return;
    }

    const formattedUsers = data.map((u) => ({
      id: u.id,
      name: `${u.last_name}, ${u.first_name} ${u.middle_name || ""}`,
      address: u.address,
      mobile: u.contact_number,
      created: new Date(u.created_at).toLocaleDateString(),
      lastOnline: "Online",
    }));

    setUsers(formattedUsers);
    setTotalUsers(count ?? 0);
  }

  function handleGo() 
  {
    setPage(1);
    setAppliedFilters({ ...filters });
  }

  function handleClear() 
  {
    const empty = { name: "", year: "", type: "" };
    setFilters(empty);
    setAppliedFilters(empty);
    setPage(1);
  }

  const totalPages = Math.ceil(totalUsers / PAGE_SIZE);

  return (
    <div className="users-content">

      <div className="users-page-header">
        <h2>Users List</h2>
      </div>

      <div className="users-page-container">
        <div className="users-filter-container">
          <div className="filter-left">
            <div className="filter-row">
              <span className="filter-label">Filter by</span>
              <input
                type="text"
                placeholder="Lastname, Firstname"
                value={filters.name}
                onChange={(e) => setFilters({ ...filters, name: e.target.value })}
              />
            </div>

            <div className="filter-row">
              <span className="filter-label">Patient of</span>
              <input
                type="text"
                placeholder="Year"
                value={filters.year}
                onChange={(e) => setFilters({ ...filters, year: e.target.value })}
              />
              <select
                value={filters.type}
                onChange={(e) => setFilters({ ...filters, type: e.target.value })}
              >
                <option value="">Type</option>
                <option value="Patient">Patient</option>
                <option value="Staff">Staff</option>
                <option value="Dentist">Dentist</option>
              </select>
              <button className="btn-go" onClick={handleGo}>Go</button>
              <button className="btn-clear" onClick={handleClear}>Clear</button>
            </div>
          </div>
        </div>

        <div className="users-table">
          <div className="users-table-header">
            <span></span>
            <span>ID</span>
            <span>Name</span>
            <span>Address</span>
            <span>Mobile</span>
            <span>Account Created</span>
            <span>Last Online</span>
          </div>

          {users.length === 0 ? (
            <div className="users-empty">No users found.</div>
          ) : (
            users.map((u, i) => (
              <div key={i} className="users-table-row">
                <span className="row-actions">✏️</span>
                <span>{u.id}</span>
                <span className="link">{u.name}</span>
                <span>{u.address}</span>
                <span>{u.mobile}</span>
                <span>{u.created}</span>
                <span>{u.lastOnline}</span>
              </div>
            ))
          )}
        </div>

        <div className="users-footer">
          <div className="pagination">
            <span
              className={page === 1 ? "pagination-disabled" : "pagination-btn"}
              onClick={() => page > 1 && setPage(page - 1)}
            >
              « Previous
            </span>
            <strong>{page}</strong>
            <span
              className={page >= totalPages ? "pagination-disabled" : "pagination-btn"}
              onClick={() => page < totalPages && setPage(page + 1)}
            >
              Next »
            </span>
          </div>
          <div>Total Users: {totalUsers}</div>
        </div>
      </div>
    </div>
  );
}

export default Userlist;
