import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';

const DashboardLayout = () => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="loading-container" style={{ minHeight: '100vh' }}>
        <div className="spinner"></div>
        <p>Verifying session details...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <div style={{ display: 'flex', flex: 1 }}>
        <Sidebar />
        <main style={{ flex: 1, padding: '2rem', overflowY: 'auto', backgroundColor: 'var(--bg-main)' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
