import { Navigate } from "react-router-dom";

interface ProtectedRouteProps {
  children: React.ReactNode;
  ownerOnly?: boolean;
}

function ProtectedRoute({ children, ownerOnly = false }: ProtectedRouteProps) {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  if (!token) {
    return <Navigate to="/" replace />;
  }

  if (ownerOnly && role !== "owner") {
    return <Navigate to="/pos" replace />;
  }

  return children;
}

export default ProtectedRoute;
