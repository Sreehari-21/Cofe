import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import StudentDashboard from './StudentDashboard';
import FacultyDashboard from './FacultyDashboard';
import AdminDashboard from './AdminDashboard';

const Dashboard = () => {
  const { user } = useContext(AuthContext);

  if (!user) return null;

  switch (user.role) {
    case 'student':
      return <StudentDashboard />;
    case 'faculty':
      return <FacultyDashboard />;
    case 'admin':
      return <AdminDashboard />;
    default:
      return <div className="card">Error: Invalid Role configuration.</div>;
  }
};

export default Dashboard;
