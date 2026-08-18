import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import DashboardLayout from './layouts/DashboardLayout';
import RequireRole from './components/RequireRole';

import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CourseDetails from './pages/CourseDetails';
import AssignmentDetails from './pages/AssignmentDetails';
import SubmissionReview from './pages/SubmissionReview';
import ManageUsers from './pages/ManageUsers';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route element={<DashboardLayout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/courses/:id" element={<CourseDetails />} />
            <Route path="/projects/:id" element={<AssignmentDetails />} />
            <Route path="/submissions/:id/review" element={<SubmissionReview />} />
            <Route
              path="/users"
              element={
                <RequireRole roles={['admin']}>
                  <ManageUsers />
                </RequireRole>
              }
            />
            <Route path="/profile" element={<Profile />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
