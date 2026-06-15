import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "../pages/login";
import Dashboard from "../pages/Dashboard";
import Outlets from "../pages/Outlets";
import Expenses from "../pages/Expenses";
import Revenue from "../pages/Revenue";
import ProtectedRoute from "./ProtectedRoutes";
import Orders from "../pages/Orders";
import  Menu  from "../pages/Menu";
import POS from "../pages/POS";

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/outlets"
          element={
            <ProtectedRoute>
              <Outlets />
            </ProtectedRoute>
          }
        />

        <Route
          path="/expenses"
          element={
            <ProtectedRoute>
              <Expenses />
            </ProtectedRoute>
          }
        />

        <Route
          path="/revenues"
          element={
            <ProtectedRoute>
              <Revenue />
            </ProtectedRoute>
          }
        />

        <Route
 path="/menu"
 element={
  <ProtectedRoute>
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
  <ProtectedRoute>
   <Orders />
  </ProtectedRoute>
 }
/>
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;