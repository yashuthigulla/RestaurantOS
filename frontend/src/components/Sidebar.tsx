import {
  LayoutDashboard,
  Store,
  Receipt,
  IndianRupee,
  LogOut,
  UtensilsCrossed,
  ClipboardList,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

function Sidebar() {
  const navigate = useNavigate();
  const role = localStorage.getItem("role");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/");
  };

  return (
    <aside className="w-64 bg-slate-950 text-white min-h-screen p-6">
      <h1 className="text-2xl font-bold mb-10">RestaurantOS</h1>

      <nav className="flex flex-col gap-2">
        {role !== "cashier" && (
          <>
            <Link className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-800" to="/dashboard">
              <LayoutDashboard size={18} /> Dashboard
            </Link>

            <Link className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-800" to="/outlets">
              <Store size={18} /> Outlets
            </Link>

            <Link className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-800" to="/menu">
              <UtensilsCrossed size={18} /> Menu
            </Link>

            <Link className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-800" to="/expenses">
              <Receipt size={18} /> Expenses
            </Link>

            <Link className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-800" to="/revenues">
              <IndianRupee size={18} /> Revenue
            </Link>
          </>
        )}

        <Link className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-800" to="/pos">
          <UtensilsCrossed size={18} /> POS
        </Link>

        <Link className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-800" to="/orders">
          <ClipboardList size={18} /> Orders
        </Link>

        <button
          onClick={handleLogout}
          className="flex items-center gap-3 p-3 rounded-lg text-red-400 hover:bg-red-950 mt-8"
        >
          <LogOut size={18} /> Logout
        </button>
      </nav>
    </aside>
  );
}

export default Sidebar;