import { useEffect, useState } from "react";
import api from "../services/api";
import Sidebar from "../components/Sidebar";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line,
} from "recharts";
import { Store, TrendingUp, TrendingDown, Wallet } from "lucide-react";

interface DashboardData {
  total_outlets: number;
  total_revenue: number;
  total_expenses: number;
  profit: number;
}

interface CategorySummary {
  category: string;
  total_amount: number;
}

interface SourceSummary {
  source: string;
  total_amount: number;
}

interface MonthlyRevenue {
  month: string;
  total_amount: number;
}

interface OrderSummary {
  total_orders: number;
  pending_orders: number;
  completed_orders: number;
}

interface TopSellingItem {
  item_name: string;
  total_quantity: number;
  total_sales: number;
}



const COLORS = ["#22c55e", "#ef4444", "#3b82f6", "#f59e0b", "#8b5cf6"];

function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [categoryData, setCategoryData] = useState<CategorySummary[]>([]);
  const [sourceData, setSourceData] = useState<SourceSummary[]>([]);
  const [monthlyRevenue, setMonthlyRevenue] = useState<MonthlyRevenue[]>([]);
  const [orderSummary, setOrderSummary] = useState<OrderSummary | null>(null);
  const [topItems, setTopItems] = useState<TopSellingItem[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const dashboardResponse = await api.get("/dashboard/");
        const categoryResponse = await api.get("/expenses/category-summary");
        const sourceResponse = await api.get("/revenue/source-summary");
        const monthlyResponse = await api.get("/revenue/monthly-summary");
        const orderResponse = await api.get("/orders/summary");
        const topItemsResponse = await api.get("/orders/top-selling-items");


        setData(dashboardResponse.data);
        setCategoryData(categoryResponse.data);
        setSourceData(sourceResponse.data);
        setMonthlyRevenue(monthlyResponse.data);
        setOrderSummary(orderResponse.data);
        setTopItems(topItemsResponse.data);

      } catch (error) {
        console.log("Dashboard loading error:", error);
      }
    };

    fetchData();
  }, []);

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <p className="text-slate-600">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-100">
      <Sidebar />

      <main className="flex-1 p-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-slate-900">Dashboard</h1>
            <p className="text-slate-500 mt-1">
              Track revenue, expenses, and profit across your outlets.
            </p>
          </div>

          <div className="bg-white px-4 py-3 rounded-xl shadow-sm text-sm text-slate-600">
            Restaurant Owner
          </div>
        </div>
        {orderSummary && (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
    <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-100">
      <p className="text-slate-500">Total Orders</p>
      <h2 className="text-3xl font-bold mt-3">
        {orderSummary.total_orders}
      </h2>
    </div>

    <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-100">
      <p className="text-slate-500">Pending Orders</p>
      <h2 className="text-3xl font-bold mt-3 text-yellow-600">
        {orderSummary.pending_orders}
      </h2>
    </div>

    <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-100">
      <p className="text-slate-500">Completed Orders</p>
      <h2 className="text-3xl font-bold mt-3 text-green-600">
        {orderSummary.completed_orders}
      </h2>
    </div>
  </div>
)}
<div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-100 mb-8">
  <h2 className="text-xl font-bold mb-4">Top Selling Menu Items</h2>

  <table className="w-full">
    <thead>
      <tr className="text-left text-slate-500 border-b">
        <th className="pb-3">Item</th>
        <th className="pb-3">Quantity Sold</th>
        <th className="pb-3">Sales</th>
      </tr>
    </thead>

    <tbody>
      {topItems.map((item, index) => (
        <tr key={index} className="border-b">
          <td className="py-3 font-medium">{item.item_name}</td>
          <td className="py-3">{item.total_quantity}</td>
          <td className="py-3 text-green-600 font-semibold">
            ₹{item.total_sales}
          </td>
        </tr>
      ))}
    </tbody>
  </table>
</div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-100">
            <div className="flex justify-between items-center">
              <p className="text-slate-500">Total Outlets</p>
              <Store className="text-blue-600" size={22} />
            </div>
            <h2 className="text-3xl font-bold mt-3">{data.total_outlets}</h2>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-100">
            <div className="flex justify-between items-center">
              <p className="text-slate-500">Revenue</p>
              <TrendingUp className="text-green-600" size={22} />
            </div>
            <h2 className="text-3xl font-bold mt-3 text-green-600">
              ₹{data.total_revenue}
            </h2>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-100">
            <div className="flex justify-between items-center">
              <p className="text-slate-500">Expenses</p>
              <TrendingDown className="text-red-600" size={22} />
            </div>
            <h2 className="text-3xl font-bold mt-3 text-red-600">
              ₹{data.total_expenses}
            </h2>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-100">
            <div className="flex justify-between items-center">
              <p className="text-slate-500">Profit</p>
              <Wallet className="text-blue-600" size={22} />
            </div>
            <h2 className="text-3xl font-bold mt-3 text-blue-600">
              ₹{data.profit}
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-100">
            <h2 className="text-xl font-bold mb-4">Expense Category Breakdown</h2>

            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    dataKey="total_amount"
                    nameKey="category"
                    cx="50%"
                    cy="50%"
                    outerRadius={105}
                    label={({ name, percent }) =>
                      `${name} ${((percent || 0) * 100).toFixed(0)}%`
                    }
                  >
                    {categoryData.map((_, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-100">
            <h2 className="text-xl font-bold mb-4">Revenue Source Breakdown</h2>

            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sourceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="source" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="total_amount" fill="#22c55e" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-100">
          <h2 className="text-xl font-bold mb-4">Monthly Revenue Trend</h2>

          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyRevenue}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="total_amount"
                  stroke="#22c55e"
                  strokeWidth={3}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        
      </main>
    </div>
  );
}

export default Dashboard;