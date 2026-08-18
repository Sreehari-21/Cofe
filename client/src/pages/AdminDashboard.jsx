import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { Users, BookOpen, Clock, CheckCircle, XCircle } from 'lucide-react';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadAdminData = async () => {
    try {
      setLoading(true);
      const [statsRes, projRes] = await Promise.all([
        api.get('/admin/statistics'),
        api.get('/projects')
      ]);

      if (statsRes.success) setStats(statsRes.data);
      if (projRes.success) setProjects(projRes.data);
    } catch (err) {
      setError(err.message || 'Failed to fetch admin data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading admin stats dashboard...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-gradient">Admin Dashboard</h1>
        <p style={{ color: 'var(--text-muted)' }}>Portal analytics and project overview.</p>
      </div>

      {error && <div className="error-banner">{error}</div>}

      {stats && (
        <div className="grid-cols-3">
          <div className="card" style={styles.statCard}>
            <div style={{ ...styles.statIcon, backgroundColor: 'var(--primary-glow)', color: 'var(--primary)' }}>
              <Users size={24} />
            </div>
            <div>
              <div style={styles.statLabel}>Total Students</div>
              <div style={styles.statValue}>{stats.totalStudents}</div>
            </div>
          </div>

          <div className="card" style={styles.statCard}>
            <div style={{ ...styles.statIcon, backgroundColor: 'var(--secondary-glow)', color: 'var(--secondary)' }}>
              <Users size={24} />
            </div>
            <div>
              <div style={styles.statLabel}>Total Faculty</div>
              <div style={styles.statValue}>{stats.totalFaculty}</div>
            </div>
          </div>

          <div className="card" style={styles.statCard}>
            <div style={{ ...styles.statIcon, backgroundColor: 'var(--info-glow)', color: 'var(--info)' }}>
              <BookOpen size={24} />
            </div>
            <div>
              <div style={styles.statLabel}>Total Projects</div>
              <div style={styles.statValue}>{stats.totalProjects}</div>
            </div>
          </div>

          <div className="card" style={styles.statCard}>
            <div style={{ ...styles.statIcon, backgroundColor: 'var(--warning-glow)', color: 'var(--warning)' }}>
              <Clock size={24} />
            </div>
            <div>
              <div style={styles.statLabel}>Pending Reviews</div>
              <div style={styles.statValue}>{stats.pendingReviews}</div>
            </div>
          </div>

          <div className="card" style={styles.statCard}>
            <div style={{ ...styles.statIcon, backgroundColor: 'var(--success-glow)', color: 'var(--success)' }}>
              <CheckCircle size={24} />
            </div>
            <div>
              <div style={styles.statLabel}>Approved Projects</div>
              <div style={styles.statValue}>{stats.approvedProjects}</div>
            </div>
          </div>

          <div className="card" style={styles.statCard}>
            <div style={{ ...styles.statIcon, backgroundColor: 'var(--danger-glow)', color: 'var(--danger)' }}>
              <XCircle size={24} />
            </div>
            <div>
              <div style={styles.statLabel}>Rejected Projects</div>
              <div style={styles.statValue}>{stats.rejectedProjects}</div>
            </div>
          </div>
        </div>
      )}

      <h2 style={{ fontSize: '1.25rem', marginTop: '2rem', marginBottom: '1rem' }}>Global Projects Overview</h2>
      {projects.length === 0 ? (
        <div className="empty-state">
          <p>No project assignments have been created in the portal yet.</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Project Title</th>
                <th>Assigned Guide</th>
                <th>Students (Team)</th>
                <th>Deadline</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {projects.map(project => (
                <tr key={project._id}>
                  <td style={{ fontWeight: 600 }}>{project.title}</td>
                  <td>{project.guide?.name || 'Unassigned'}</td>
                  <td>{project.students.map(s => s.name).join(', ')}</td>
                  <td>{new Date(project.deadline).toLocaleDateString()}</td>
                  <td>
                    <span className={`badge badge-${project.status}`}>
                      {project.status}
                    </span>
                  </td>
                  <td>
                    <Link to={`/projects/${project._id}`} className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>
                      Details
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

const styles = {
  statCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '1.25rem',
  },
  statIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '48px',
    height: '48px',
    borderRadius: 'var(--radius-sm)',
  },
  statLabel: {
    fontSize: '0.85rem',
    color: 'var(--text-muted)',
    fontWeight: 500,
  },
  statValue: {
    fontSize: '1.5rem',
    fontWeight: '700',
    marginTop: '0.1rem',
  }
};

export default AdminDashboard;
