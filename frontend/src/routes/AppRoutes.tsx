import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "../pages/login";
import Dashboard from "../pages/Dashboard";
import Outlets from "../pages/Outlets";
import Expenses from "../pages/Expenses";
import Revenue from "../pages/Revenue";
import ProtectedRoute from "./ProtectedRoutes";
import Orders from "../pages/Orders";
import Menu from "../pages/Menu";
import POS from "../pages/POS";
import Register from "../pages/Register";
import NotFound from "../pages/NotFound";
import Bills from "../pages/Bills";

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute ownerOnly>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/outlets"
          element={
            <ProtectedRoute ownerOnly>
              <Outlets />
            </ProtectedRoute>
          }
        />

        <Route
          path="/expenses"
          element={
            <ProtectedRoute ownerOnly>
              <Expenses />
            </ProtectedRoute>
          }
        />

        <Route
          path="/revenues"
          element={
            <ProtectedRoute ownerOnly>
              <Revenue />
            </ProtectedRoute>
          }
        />

        <Route
          path="/menu"
          element={
            <ProtectedRoute ownerOnly>
              <Menu />
            </ProtectedRoute>
          }
        />

        <Route
          path="/pos"
          element={
            <ProtectedRoute>
              <POS />
            </ProtectedRoute>
          }
        />

        <Route
          path="/orders"
          element={
            <ProtectedRoute ownerOnly>
              <Orders />
            </ProtectedRoute>
          }
        />

        <Route
          path="/bills"
          element={
            <ProtectedRoute ownerOnly>
              <Bills />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;
