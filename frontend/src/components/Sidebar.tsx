import {
  LayoutDashboard,
  Store,
  Receipt,
  IndianRupee,
  LogOut,
  UtensilsCrossed,
  ClipboardList,
  FileText,
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
    <aside className="w-20 shrink-0 bg-slate-950 text-white min-h-screen p-3 md:w-64 md:p-6">
      <h1 className="mb-8 text-center text-lg font-bold md:mb-10 md:text-left md:text-2xl">
        <span className="md:hidden">ROS</span>
        <span className="hidden md:inline">RestaurantOS</span>
      </h1>

      <nav className="flex flex-col gap-2">
        {role !== "cashier" && (
          <>
            <Link className="flex items-center justify-center gap-3 p-3 rounded-lg hover:bg-slate-800 md:justify-start" to="/dashboard">
              <LayoutDashboard size={18} /> <span className="hidden md:inline">Dashboard</span>
            </Link>

            <Link className="flex items-center justify-center gap-3 p-3 rounded-lg hover:bg-slate-800 md:justify-start" to="/outlets">
              <Store size={18} /> <span className="hidden md:inline">Outlets</span>
            </Link>

            <Link className="flex items-center justify-center gap-3 p-3 rounded-lg hover:bg-slate-800 md:justify-start" to="/menu">
              <UtensilsCrossed size={18} /> <span className="hidden md:inline">Menu</span>
            </Link>

            <Link className="flex items-center justify-center gap-3 p-3 rounded-lg hover:bg-slate-800 md:justify-start" to="/expenses">
              <Receipt size={18} /> <span className="hidden md:inline">Expenses</span>
            </Link>

            <Link className="flex items-center justify-center gap-3 p-3 rounded-lg hover:bg-slate-800 md:justify-start" to="/revenues">
              <IndianRupee size={18} /> <span className="hidden md:inline">Revenue</span>
            </Link>

            <Link className="flex items-center justify-center gap-3 p-3 rounded-lg hover:bg-slate-800 md:justify-start" to="/orders">
              <ClipboardList size={18} /> <span className="hidden md:inline">Orders</span>
            </Link>

            <Link className="flex items-center justify-center gap-3 p-3 rounded-lg hover:bg-slate-800 md:justify-start" to="/bills">
              <FileText size={18} /> <span className="hidden md:inline">Bills</span>
            </Link>
          </>
        )}

        <Link className="flex items-center justify-center gap-3 p-3 rounded-lg hover:bg-slate-800 md:justify-start" to="/pos">
          <UtensilsCrossed size={18} /> <span className="hidden md:inline">POS</span>
        </Link>

        <button
          onClick={handleLogout}
          className="mt-8 flex items-center justify-center gap-3 rounded-lg p-3 text-red-400 hover:bg-red-950 md:justify-start"
        >
          <LogOut size={18} /> <span className="hidden md:inline">Logout</span>
        </button>
      </nav>
    </aside>
  );
}

export default Sidebar;
