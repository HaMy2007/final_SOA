import { Navigate, useLocation } from "react-router-dom";
import React from "react";

interface PrivateRouteProps {
  children: React.ReactNode;
  allowedRoles: string[];
}

const PrivateRoute = ({ children, allowedRoles }: PrivateRouteProps) => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userRole = user.role;
  const location = useLocation();

  if (!user || !userRole) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return allowedRoles.includes(userRole) ? (
    children
  ) : (
    <Navigate to="/unauthorized" replace />
  );
};

export default PrivateRoute;
