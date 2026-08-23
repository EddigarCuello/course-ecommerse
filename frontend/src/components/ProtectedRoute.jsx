import { Navigate } from "react-router-dom";
import { useAuthStore } from "../hooks/useAuthStore.js";

export default function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  return children;
}
