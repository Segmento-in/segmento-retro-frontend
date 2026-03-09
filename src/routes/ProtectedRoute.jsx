import { Navigate, useLocation } from "react-router-dom";

/**
 * Wraps route content; redirects to /login if user is not authenticated.
 * Saves the location they were trying to access so we can redirect back after login.
 */
export default function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token");
  const location = useLocation();
  
  if (!token) {
    // Save where they were trying to go
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  return children;
}
