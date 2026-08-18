import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const RequireRole = ({ roles, children }) => {
  const { user } = useContext(AuthContext);
  if (!user || !roles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }
  return children;
};

export default RequireRole;
