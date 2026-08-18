import React, { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { Folder, Clock, CheckCircle, XCircle, MessageSquare } from 'lucide-react';

const StudentDashboard = () => {
  const { user } = useContext(AuthContext);
  const [projects, setProjects] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [projRes, subRes] = await Promise.all([
          api.get('/projects'),
          api.get('/submissions')
        ]);
        if (projRes.success) setProjects(projRes.data);
        if (subRes.success) setSubmissions(subRes.data);
      } catch (err) {
        setError(err.message || 'Failed to fetch dashboard data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getDeadlineStatus = (deadlineStr) => {
    const deadline = new Date(deadlineStr);
    const now = new Date();
    const diffTime = deadline - now;
    
    if (diffTime < 0) {
      return { text: 'Deadline Passed', isPassed: true };
    }
    
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays === 1) {
      return { text: '1 day remaining', isPassed: false, isUrgent: true };
    }
    return { text: `${diffDays} days remaining`, isPassed: false, isUrgent: diffDays <= 3 };
  };

  const getLatestFeedback = () => {
    const reviewed = submissions.filter(sub => sub.status === 'reviewed' && sub.facultyFeedback);
    if (reviewed.length === 0) return 'No feedback received yet';
    return reviewed[0].facultyFeedback;
  };

  const pendingSubmissions = projects.length - submissions.length; 
  const approvedCount = projects.filter(p => p.status === 'approved').length;
  const rejectedCount = projects.filter(p => p.status === 'rejected').length;

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading student dashboard...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-gradient">Student Dashboard</h1>
        <p style={{ color: 'var(--text-muted)' }}>Welcome back, {user.name}. Track your team projects and submission reviews.</p>
      </div>

      {error && <div className="error-banner">{error}</div>}

      <div className="grid-cols-3">
        <div className="card" style={styles.statCard}>
          <div style={{ ...styles.statIcon, backgroundColor: 'var(--primary-glow)', color: 'var(--primary)' }}>
            <Folder size={24} />
          </div>
          <div>
            <div style={styles.statLabel}>My Projects</div>
            <div style={styles.statValue}>{projects.length}</div>
          </div>
        </div>

        <div className="card" style={styles.statCard}>
          <div style={{ ...styles.statIcon, backgroundColor: 'var(--warning-glow)', color: 'var(--warning)' }}>
            <Clock size={24} />
          </div>
          <div>
            <div style={styles.statLabel}>Pending Submissions</div>
            <div style={styles.statValue}>{pendingSubmissions < 0 ? 0 : pendingSubmissions}</div>
          </div>
        </div>

        <div className="card" style={styles.statCard}>
          <div style={{ ...styles.statIcon, backgroundColor: 'var(--success-glow)', color: 'var(--success)' }}>
            <CheckCircle size={24} />
          </div>
          <div>
            <div style={styles.statLabel}>Approved</div>
            <div style={styles.statValue}>{approvedCount}</div>
          </div>
        </div>

        <div className="card" style={styles.statCard}>
          <div style={{ ...styles.statIcon, backgroundColor: 'var(--danger-glow)', color: 'var(--danger)' }}>
            <XCircle size={24} />
          </div>
          <div>
            <div style={styles.statLabel}>Rejected</div>
            <div style={styles.statValue}>{rejectedCount}</div>
          </div>
        </div>
      </div>

      <div className="card mb-6" style={styles.feedbackCard}>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
          <MessageSquare size={20} style={{ color: 'var(--secondary)', marginTop: '0.2rem' }} />
          <div>
            <h3 style={{ fontSize: '1rem', marginBottom: '0.25rem' }}>Latest Feedback</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', fontStyle: 'italic' }}>
              "{getLatestFeedback()}"
            </p>
          </div>
        </div>
      </div>

      <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Project Assignments</h2>
      {projects.length === 0 ? (
        <div className="empty-state">
          <p>You are not currently assigned to any projects.</p>
          <p style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>You can create a project assignment proposal using the "Create Project" button in the sidebar.</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Project Title</th>
                <th>Faculty Guide</th>
                <th>Deadline</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((project) => {
                const deadlineStatus = getDeadlineStatus(project.deadline);
                return (
                  <tr key={project._id}>
                    <td style={{ fontWeight: 600 }}>{project.title}</td>
                    <td>{project.guide?.name || 'Unassigned'}</td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span>{new Date(project.deadline).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                        <span style={{ 
                          fontSize: '0.8rem', 
                          fontWeight: 500,
                          color: deadlineStatus.isPassed 
                            ? 'var(--danger)' 
                            : deadlineStatus.isUrgent 
                              ? 'var(--warning)' 
                              : 'var(--success)'
                        }}>
                          {deadlineStatus.text}
                        </span>
                      </div>
                    </td>
                    <td>
                      <span className={`badge badge-${project.status}`}>
                        {project.status}
                      </span>
                    </td>
                    <td>
                      <Link to={`/projects/${project._id}`} className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>
                        View / Submit
                      </Link>
                    </td>
                  </tr>
                );
              })}
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
  },
  feedbackCard: {
    borderLeft: '4px solid var(--secondary)',
  }
};

export default StudentDashboard;
