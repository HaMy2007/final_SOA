import { Navigate, useLocation } from "react-router-dom";
import { Role } from "../types/auth";

interface PrivateRouteProps {
  children: React.ReactNode;
  allowedRoles: Role[];
}

const PrivateRoute = ({ children, allowedRoles }: PrivateRouteProps) => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const location = useLocation();

  if (!user || !user.role) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};

export default PrivateRoute;
