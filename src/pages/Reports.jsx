import { useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import "../styles/reports.css";
import { getReportsSummaryApi } from "../api/reports";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";

const CHART_COLORS = ["#FA1377", "#534AB7", "#150E43", "#F59E0B", "#2E7D32", "#EC4899"];

function Reports()
{
  const [filters, setFilters] = useState({ clinic: "All", from: "", to: "" });
  const [summary, setSummary] = useState({
    netIncome: "₱0",
    collectionAmount: "₱0",
    collectionCount: 0,
    expenseAmount: "₱0",
    expenseCount: 0,
  });
  const [charts, setCharts] = useState({
    patientTypes: [],
    paymentMethods: [],
    expenseCategories: [],
  });

  useEffect(() =>
  {
    loadSummary();
  }, []);

  async function loadSummary()
  {
    try
    {
      const response = await getReportsSummaryApi(filters);
      const data = response.summary;
      setSummary({
        netIncome: `₱${Number(data.netIncome || 0).toLocaleString()}`,
        collectionAmount: `₱${Number(data.collectionAmount || 0).toLocaleString()}`,
        collectionCount: data.collectionCount || 0,
        expenseAmount: `₱${Number((data.expenseAmount || 0) + (data.billAmount || 0)).toLocaleString()}`,
        expenseCount: data.expenseCount || 0,
      });
      setCharts(response.charts || { patientTypes: [], paymentMethods: [], expenseCategories: [] });
    }
    catch (error) { console.error(error); }
  }

  function handlePrint()
  {
    window.print();
  }

  const kpiCards = [
    {
      label: "Net Income",
      value: summary.netIncome,
      icon: "mdi:cash-multiple",
      iconClass: "rep-kpi-icon-net",
    },
    {
      label: "Collections",
      value: summary.collectionAmount,
      sub: `${summary.collectionCount} transactions`,
      icon: "mdi:arrow-down-circle-outline",
      iconClass: "rep-kpi-icon-collections",
    },
    {
      label: "Expenses",
      value: summary.expenseAmount,
      sub: `${summary.expenseCount} transactions`,
      icon: "mdi:arrow-up-circle-outline",
      iconClass: "rep-kpi-icon-expenses",
    },
  ];

  const chartCards = [
    { title: "Type of Patient", data: charts.patientTypes },
    { title: "Expense Categories", data: charts.expenseCategories },
    { title: "Payment Methods", data: charts.paymentMethods },
  ];

  return (
    <div className="rep-root">

      <div className="rep-page-header">
        <h2 className="rep-page-title">Summary</h2>
      </div>

      <div className="rep-page-container">

        <div className="rep-filter-bar">
          <div className="rep-filter-group">
            <span className="rep-filter-label">Clinic</span>
            <select value={filters.clinic} onChange={(e) => setFilters({ ...filters, clinic: e.target.value })}>
              <option value="All">All</option>
              <option value="Hagonoy">Hagonoy</option>
              <option value="Paombong">Paombong</option>
            </select>
          </div>
          <div className="rep-filter-group">
            <span className="rep-filter-label">Date From</span>
            <input type="date" value={filters.from} onChange={(e) => setFilters({ ...filters, from: e.target.value })} />
          </div>
          <div className="rep-filter-group">
            <span className="rep-filter-label">Date To</span>
            <input type="date" value={filters.to} onChange={(e) => setFilters({ ...filters, to: e.target.value })} />
          </div>
          <button className="rep-btn-show" onClick={loadSummary}>
            <Icon aria-hidden="true" />Show
          </button>
        </div>

        <div className="rep-kpi-grid">
          {kpiCards.map(({ label, value, sub, icon, iconClass }) => (
            <div key={label} className="rep-kpi-card">
              <span className={`rep-kpi-icon ${iconClass}`}>
                <Icon icon={icon} aria-hidden="true" />
              </span>
              <div className="rep-kpi-body">
                <span className="rep-kpi-label">{label}</span>
                <span className="rep-kpi-value">{value}</span>
                {sub && <span className="rep-kpi-sub">{sub}</span>}
              </div>
            </div>
          ))}
        </div>

        <div className="rep-charts-grid">
          {chartCards.map(({ title, data }) => (
            <div key={title} className="rep-chart-card">
              <p className="rep-chart-title">{title}</p>
              {data.length === 0
                ? (
                  <div className="rep-chart-empty">
                    <Icon icon="mdi:chart-pie-outline" aria-hidden="true" />
                    <span>No data available</span>
                  </div>
                )
                : (
                  <ResponsiveContainer width="100%" height={240}>
                    <PieChart>
                      <Pie data={data} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90}>
                        {data.map((_, index) => (
                          <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          fontFamily: "'DM Sans', sans-serif",
                          fontSize: "0.78rem",
                          borderRadius: "8px",
                          border: "1px solid #ede9f8",
                          boxShadow: "0 4px 12px rgba(21,14,67,0.10)",
                        }}
                      />
                      <Legend
                        iconType="circle"
                        iconSize={8}
                        wrapperStyle={{
                          fontFamily: "'DM Sans', sans-serif",
                          fontSize: "0.75rem",
                          color: "#6b638f",
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                )
              }
            </div>
          ))}
        </div>

        <div className="rep-footer">
          <button className="rep-btn-print" onClick={handlePrint}>
            <Icon icon="mdi:printer-outline" aria-hidden="true" />Print
          </button>
        </div>

      </div>
    </div>
  );
}

export default Reports;