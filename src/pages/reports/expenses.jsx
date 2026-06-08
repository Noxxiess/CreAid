import { useState } from "react";
import "../../styles/expenses.css";

const rows = [];
const totalAmount = "₱0.00";
const rowsCount = 0;

function Expenses() 
{
    const [filters, setFilters] = useState({
        clinic:          "All Clinics",
        expenseCategory: "All Expense",
        paymentMethod:     "All Payment Method",
        from:            "",
        to:              "",
    });

    const [currentPage, setCurrentPage] = useState(1);
    const totalPages = Math.ceil(rowsCount / 20) || 1;

    const renderPagination = () => 
    {
        const pages = [];
        const range = [];

        for (let i = 1; i <= totalPages; i++) 
        {
            if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) 
            {
                range.push(i);
            }
        }

        let prev = null;

        for (const page of range) 
        {
            if (prev !== null && page - prev > 1) 
            {
                pages.push(<span key={`e-${page}`} className="page-ellipsis">…</span>);
            }
            
            pages.push(
                <button key={page} className={`page-btn ${currentPage === page ? "active" : ""}`} onClick={() => setCurrentPage(page)}>
                    {page}
                </button>
            );
            prev = page;
        }

        return pages;
    };

    return (
        <div className="users-content">
            <div className="users-page-header">
                <h2>Expenses Report</h2>
            </div>

            <div className="users-page-container">
                <div className="users-filter-container">
                    <div className="filter-left">
                        <div className="filter-row">
                            <span className="filter-label">Clinic</span>
                            <select value={filters.clinic} onChange={(e) => setFilters({ ...filters, clinic: e.target.value })}>
                                <option>All Clinics</option>
                                <option>Hagonoy</option>
                                <option>Paombong</option>
                            </select>
                            <span className="filter-label">Expense Category</span>
                            <select value={filters.expenseCategory} onChange={(e) => setFilters({ ...filters, expenseCategory: e.target.value })}>
                                <option>All Expense</option>
                                <option>Rental</option>
                                <option>Electric / Water / Mineral</option>
                                <option>Salary</option>
                                <option>Food</option>
                                <option>Dental Supplies</option>
                                <option>Miscellanous</option>
                            </select>
                            <span className="filter-label">Payment Type</span>
                            <select value={filters.paymentMethod} onChange={(e) => setFilters({ ...filters, paymentMethod: e.target.value })}>
                                <option>All Payment Types</option>
                                <option>Cash</option>
                                <option>GCash</option>
                                <option>Card</option>
                                <option>Bank Transfer</option>
                            </select>
                            <span className="filter-label">Date From</span>
                            <input type="date" value={filters.from} onChange={(e) => setFilters({ ...filters, from: e.target.value })}/>
                            <span className="filter-label">Date To</span>
                            <input type="date" value={filters.to} onChange={(e) => setFilters({ ...filters, to: e.target.value })}/>
                            <button className="btn-go">Show Report</button>
                            <button className="btn-export">Export Report</button>
                        </div>
                    </div>
                </div>

                <div className="report-meta-row">
                    <p className="total-amount">Total Amount: <span>{totalAmount}</span></p>
                    <p className="rows-count">Rows Count: <span>{rowsCount}</span></p>
                </div>

                <div className="report-table-wrap">
                    <table className="report-table">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Clinic</th>
                                <th>Description</th>
                                <th>Category</th>
                                <th>Payment Method</th>                                
                                <th>Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rows.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="table-empty">No records found</td>
                                </tr>
                            ) : (
                            rows.map((row, i) => (
                                <tr key={i}>
                                    <td>{row.date}</td>
                                    <td>{row.clinic}</td>
                                    <td>{row.description}</td>
                                    <td>{row.expenseCategory}</td>
                                    <td>{row.paymentMethod}</td>
                                    <td>{row.amount}</td>
                                </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="report-pagination">
                    <button className="page-btn" disabled={currentPage === 1} onClick={() => setCurrentPage((p) => p - 1)}>
                        « Previous
                    </button>
                    
                    {renderPagination()}

                    <button className="page-btn" disabled={currentPage === totalPages} onClick={() => setCurrentPage((p) => p + 1)}>
                        Next »
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Expenses;