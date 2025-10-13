import React from "react";
import { Navigate } from "react-router-dom";

const RequireAuth = ({ children }: { children: React.ReactElement }) => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      return <Navigate to="/signin" replace />;
    }
  } catch (e) {
    return <Navigate to="/signin" replace />;
  }
  return children;
};

export default RequireAuth;
