import { Navigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function RequireAdmin({ children }: { children: JSX.Element }) {
  const { user, isAdmin } = useAuth();

  if (!user) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/languages" replace />;

  return children;
}
