import { useEffect, useState } from "react";
import "../../styles/expenses.css";
import
{
  getExpensesApi,
  createExpenseApi,
  updateExpenseApi,
  archiveExpenseApi
}
from "../../api/expenses";

const PAGE_SIZE = 10;

const BLANK_FORM =
{
  expense_name: "",
  expense_type: "expense",
  frequency: "one_time",
  category: "Supplies",
  amount: "",
  branch_id: "Hagonoy",
  expense_date: new Date().toISOString().split("T")[0],
  notes: ""
};

function Expenses()
{
  const [clinicFilter, setClinicFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [expenses, setExpenses] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [form, setForm] = useState({ ...BLANK_FORM });
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() =>
  {
    loadExpenses();
  }, []);

  async function loadExpenses()
  {
    try
    {
      const response = await getExpensesApi();
      setExpenses(response.expenses || []);
    }
    catch (error)
    {
      console.error(error);
    }
  }

  async function handleSave()
  {
    try
    {
      if (editingExpense)
      {
        await updateExpenseApi(editingExpense.id, form);
      }
      else
      {
        await createExpenseApi(form);
      }
      closeModal();
      loadExpenses();
    }
    catch (error)
    {
      console.error(error);
    }
  }

  async function handleArchive(id)
  {
    if (!window.confirm("Archive this record?")) return;
    try
    {
      await archiveExpenseApi(id);
      loadExpenses();
    }
    catch (error)
    {
      console.error(error);
    }
  }

  function openAdd()
  {
    setEditingExpense(null);
    setForm({ ...BLANK_FORM });
    setShowModal(true);
  }

  function openEdit(expense)
  {
    setEditingExpense(expense);
    setForm({ ...expense });
    setShowModal(true);
  }

  function closeModal()
  {
    setShowModal(false);
    setEditingExpense(null);
    setForm({ ...BLANK_FORM });
  }

  const filteredExpenses = expenses.filter((expense) =>
  {
    const matchesClinic = clinicFilter === "All" || expense.branch_id === clinicFilter;
    const matchesFrom = !dateFrom || expense.expense_date >= dateFrom;
    const matchesTo = !dateTo || expense.expense_date <= dateTo;
    const matchesSearch = expense.expense_name?.toLowerCase().includes(search.toLowerCase());
    return matchesClinic && matchesFrom && matchesTo && matchesSearch;
  });

  const totalExpenses = filteredExpenses
    .filter((e) => e.expense_type === "expense")
    .reduce((sum, e) => sum + Number(e.amount || 0), 0);

  const totalBills = filteredExpenses
    .filter((e) => e.expense_type === "bill")
    .reduce((sum, e) => sum + Number(e.amount || 0), 0);

  const operatingCost = totalExpenses + totalBills;

  const totalPages = Math.ceil(filteredExpenses.length / PAGE_SIZE) || 1;

  function renderPagination()
  {
    const range = [];
    for (let i = 1; i <= totalPages; i++)
    {
      if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1))
      {
        range.push(i);
      }
    }

    const pages = [];
    let prev = null;
    for (const page of range)
    {
      if (prev !== null && page - prev > 1)
      {
        pages.push(<span key={`e-${page}`} className="exp-page-ellipsis">…</span>);
      }
      pages.push(
        <button
          key={page}
          className={`exp-page-btn${currentPage === page ? " exp-page-active" : ""}`}
          onClick={() => setCurrentPage(page)}
        >{page}</button>
      );
      prev = page;
    }

    return pages;
  }

  const pageStart = (currentPage - 1) * PAGE_SIZE;
  const visibleExpenses = filteredExpenses.slice(pageStart, pageStart + PAGE_SIZE);

  return (
    <div className="exp-root">
      <div className="exp-page-header">
        <h2>Expenses & Bills</h2>
      </div>
      <div className="exp-page-container">
        <div className="exp-filter-container">
          <div className="exp-filter-row">
            <div className="exp-filter-group">
              <span className="exp-filter-label">Clinic</span>
              <select value={clinicFilter} onChange={(e) => { setClinicFilter(e.target.value); setCurrentPage(1); }}>
                <option value="All">All Clinics</option>
                <option value="Hagonoy">Hagonoy</option>
                <option value="Paombong">Paombong</option>
              </select>
            </div>
            <div className="exp-filter-group">
              <span className="exp-filter-label">Date From</span>
              <input type="date" value={dateFrom} onChange={(e) => { setDateFrom(e.target.value); setCurrentPage(1); }} />
            </div>
            <div className="exp-filter-group">
              <span className="exp-filter-label">Date To</span>
              <input type="date" value={dateTo} onChange={(e) => { setDateTo(e.target.value); setCurrentPage(1); }} />
            </div>
            <div className="exp-filter-group exp-filter-grow">
              <span className="exp-filter-label">Search</span>
              <input type="text" placeholder="Search expense…" value={search} onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }} />
            </div>
            <button className="exp-btn-add" onClick={openAdd}>+ Add Expense</button>
          </div>
        </div>
        <div className="exp-kpi-grid">
          <div className="exp-kpi-card exp-kpi-pink">
            <div className="exp-kpi-label">Total Expenses</div>
            <div className="exp-kpi-value">₱ {totalExpenses.toLocaleString()}</div>
          </div>
          <div className="exp-kpi-card exp-kpi-purple">
            <div className="exp-kpi-label">Total Bills</div>
            <div className="exp-kpi-value">₱ {totalBills.toLocaleString()}</div>
          </div>
          <div className="exp-kpi-card exp-kpi-navy">
            <div className="exp-kpi-label">Operating Cost</div>
            <div className="exp-kpi-value">₱ {operatingCost.toLocaleString()}</div>
          </div>
        </div>
        <div className="exp-table-wrap">
          <div className="exp-th">
            <span>Name</span>
            <span>Type</span>
            <span>Frequency</span>
            <span>Category</span>
            <span>Branch</span>
            <span>Date</span>
            <span>Amount</span>
            <span>Actions</span>
          </div>
          {visibleExpenses.length === 0
            ? <div className="exp-empty">No records found</div>
            : visibleExpenses.map((expense) => (
              <div key={expense.id} className="exp-td">
                <span>{expense.expense_name}</span>
                <span>{expense.expense_type}</span>
                <span>{expense.frequency}</span>
                <span>{expense.category}</span>
                <span>{expense.branch_id}</span>
                <span>{expense.expense_date}</span>
                <span>₱ {Number(expense.amount || 0).toLocaleString()}</span>
                <span className="exp-actions">
                  <button className="exp-btn-icon" title="Edit" onClick={() => openEdit(expense)}>✏️</button>
                  <button className="exp-btn-icon" title="Archive" onClick={() => handleArchive(expense.id)}>📦</button>
                </span>
              </div>
            ))
          }
        </div>
        <div className="exp-pagination">
          <span className="exp-page-info">
            {filteredExpenses.length > 0
              ? `Showing ${pageStart + 1}–${Math.min(pageStart + PAGE_SIZE, filteredExpenses.length)} of ${filteredExpenses.length}`
              : "No records"}
          </span>
          <div className="exp-page-controls">
            <button
              className={`exp-page-btn${currentPage === 1 ? " exp-page-disabled" : ""}`}
              onClick={() => currentPage > 1 && setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
            >‹</button>
            {renderPagination()}
            <button
              className={`exp-page-btn${currentPage >= totalPages ? " exp-page-disabled" : ""}`}
              onClick={() => currentPage < totalPages && setCurrentPage(currentPage + 1)}
              disabled={currentPage >= totalPages}
            >›</button>
          </div>
        </div>
      </div>
      {showModal && (
        <div className="exp-modal-overlay" onClick={closeModal}>
          <div className="exp-modal" onClick={(e) => e.stopPropagation()}>
            <div className="exp-modal-header">
              <div className="exp-modal-title">
                <div className="exp-modal-title-icon">₱</div>
                <h3>{editingExpense ? "Edit Expense / Bill" : "Add Expense / Bill"}</h3>
              </div>
              <button className="exp-modal-close" onClick={closeModal}>✕</button>
            </div>
            <div className="exp-modal-body">
              <div className="exp-form-group exp-form-full">
                <label>Expense / Bill Name</label>
                <input placeholder="e.g. Electric Bill June" value={form.expense_name} onChange={(e) => setForm({ ...form, expense_name: e.target.value })} />
              </div>
              <div className="exp-form-group">
                <label>Type</label>
                <select value={form.expense_type} onChange={(e) => setForm({ ...form, expense_type: e.target.value })}>
                  <option value="expense">Expense</option>
                  <option value="bill">Bill</option>
                </select>
              </div>
              <div className="exp-form-group">
                <label>Frequency</label>
                <select value={form.frequency} onChange={(e) => setForm({ ...form, frequency: e.target.value })}>
                  <option value="one_time">One Time</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
              <div className="exp-form-group">
                <label>Category</label>
                <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                  <option>Supplies</option>
                  <option>Utilities</option>
                  <option>Equipment</option>
                  <option>Maintenance</option>
                  <option>Payroll</option>
                  <option>Marketing</option>
                  <option>Others</option>
                </select>
              </div>
              <div className="exp-form-group">
                <label>Branch</label>
                <select value={form.branch_id} onChange={(e) => setForm({ ...form, branch_id: e.target.value })}>
                  <option value="Hagonoy">Hagonoy</option>
                  <option value="Paombong">Paombong</option>
                </select>
              </div>
              <div className="exp-form-group">
                <label>Amount</label>
                <input type="number" placeholder="0.00" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
              </div>
              <div className="exp-form-group">
                <label>Date Recorded</label>
                <input type="date" value={form.expense_date} onChange={(e) => setForm({ ...form, expense_date: e.target.value })} />
              </div>
              <div className="exp-form-group exp-form-full">
                <label>Notes</label>
                <textarea placeholder="Optional notes…" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
              </div>
            </div>
            <div className="exp-modal-footer">
              <button className="exp-btn-cancel" onClick={closeModal}>Cancel</button>
              <button className="exp-btn-save" onClick={handleSave}>{editingExpense ? "Update" : "Save"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Expenses;