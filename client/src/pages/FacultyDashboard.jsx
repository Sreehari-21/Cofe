import React, { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { Filter, Clock, Folder, FileCheck, RefreshCw } from 'lucide-react';

const FacultyDashboard = () => {
  const { user } = useContext(AuthContext);
  const [projects, setProjects] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [filterProject, setFilterProject] = useState('');
  const [filterStudent, setFilterStudent] = useState('');
  const [filterDept, setFilterDept] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterDate, setFilterDate] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const [projRes, subsRes] = await Promise.all([
        api.get('/projects'),
        api.get('/submissions')
      ]);

      if (projRes.success) setProjects(projRes.data);
      if (subsRes.success) setSubmissions(subsRes.data);
    } catch (err) {
      setError(err.message || 'Failed to fetch faculty dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleResetFilters = () => {
    setFilterProject('');
    setFilterStudent('');
    setFilterDept('');
    setFilterStatus('');
    setFilterDate('');
  };

  const filteredSubmissions = submissions.filter(sub => {
    if (filterProject && sub.projectId._id !== filterProject) return false;
    if (filterStudent && !sub.submittedBy.name.toLowerCase().includes(filterStudent.toLowerCase())) return false;
    if (filterDept && !sub.submittedBy.department.toLowerCase().includes(filterDept.toLowerCase())) return false;
    if (filterStatus && sub.status !== filterStatus) return false;
    if (filterDate) {
      const subDate = new Date(sub.submittedAt);
      const targetDate = new Date(filterDate);
      subDate.setHours(0,0,0,0);
      targetDate.setHours(0,0,0,0);
      if (subDate < targetDate) return false;
    }
    return true;
  });

  const pendingCount = submissions.filter(s => s.status === 'pending').length;
  const approvedCount = projects.filter(p => p.status === 'approved').length;

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading faculty dashboard...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex-between mb-6">
        <div>
          <h1 className="text-gradient">Faculty Dashboard</h1>
          <p style={{ color: 'var(--text-muted)' }}>Welcome back, Professor {user.name}. Grade submissions and manage project assignments.</p>
        </div>
        <button onClick={loadData} className="btn btn-secondary" style={{ padding: '0.5rem 1rem' }}>
          <RefreshCw size={16} />
          <span>Refresh</span>
        </button>
      </div>

      {error && <div className="error-banner">{error}</div>}

      <div className="grid-cols-3">
        <div className="card" style={styles.statCard}>
          <div style={{ ...styles.statIcon, backgroundColor: 'var(--primary-glow)', color: 'var(--primary)' }}>
            <Folder size={24} />
          </div>
          <div>
            <div style={styles.statLabel}>Guided Projects</div>
            <div style={styles.statValue}>{projects.length}</div>
          </div>
        </div>

        <div className="card" style={styles.statCard}>
          <div style={{ ...styles.statIcon, backgroundColor: 'var(--warning-glow)', color: 'var(--warning)' }}>
            <Clock size={24} />
          </div>
          <div>
            <div style={styles.statLabel}>Pending Reviews</div>
            <div style={styles.statValue}>{pendingCount}</div>
          </div>
        </div>

        <div className="card" style={styles.statCard}>
          <div style={{ ...styles.statIcon, backgroundColor: 'var(--success-glow)', color: 'var(--success)' }}>
            <FileCheck size={24} />
          </div>
          <div>
            <div style={styles.statLabel}>Approved Projects</div>
            <div style={styles.statValue}>{approvedCount}</div>
          </div>
        </div>
      </div>

      <div className="card mb-6" style={{ padding: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
          <Filter size={18} style={{ color: 'var(--primary)' }} />
          <h3 style={{ fontSize: '1rem', margin: 0 }}>Filter Submissions</h3>
        </div>

        <div style={styles.filterGrid}>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label" style={{ fontSize: '0.8rem', marginBottom: '0.25rem' }}>By Project</label>
            <select 
              className="form-control"
              value={filterProject}
              onChange={(e) => setFilterProject(e.target.value)}
              style={{ padding: '0.5rem 0.75rem', fontSize: '0.9rem' }}
            >
              <option value="">All Projects</option>
              {projects.map(p => (
                <option key={p._id} value={p._id}>{p.title}</option>
              ))}
            </select>
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label" style={{ fontSize: '0.8rem', marginBottom: '0.25rem' }}>By Student</label>
            <input 
              type="text" 
              className="form-control" 
              placeholder="Student name..."
              value={filterStudent}
              onChange={(e) => setFilterStudent(e.target.value)}
              style={{ padding: '0.5rem 0.75rem', fontSize: '0.9rem' }}
            />
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label" style={{ fontSize: '0.8rem', marginBottom: '0.25rem' }}>By Department</label>
            <input 
              type="text" 
              className="form-control" 
              placeholder="e.g. Computer Science..."
              value={filterDept}
              onChange={(e) => setFilterDept(e.target.value)}
              style={{ padding: '0.5rem 0.75rem', fontSize: '0.9rem' }}
            />
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label" style={{ fontSize: '0.8rem', marginBottom: '0.25rem' }}>By Status</label>
            <select 
              className="form-control"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              style={{ padding: '0.5rem 0.75rem', fontSize: '0.9rem' }}
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending Review</option>
              <option value="reviewed">Reviewed</option>
            </select>
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label" style={{ fontSize: '0.8rem', marginBottom: '0.25rem' }}>Submitted Since</label>
            <input 
              type="date" 
              className="form-control"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              style={{ padding: '0.5rem 0.75rem', fontSize: '0.9rem' }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <button onClick={handleResetFilters} className="btn btn-secondary" style={{ width: '100%', padding: '0.5rem', fontSize: '0.9rem', height: '38px' }}>
              Reset Filters
            </button>
          </div>
        </div>
      </div>

      <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Student Submissions</h2>
      {filteredSubmissions.length === 0 ? (
        <div className="empty-state">
          <p>No student submissions match the specified filters.</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Project</th>
                <th>Student</th>
                <th>Department</th>
                <th>Version</th>
                <th>Date Submitted</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredSubmissions.map((sub) => (
                <tr key={sub._id}>
                  <td style={{ fontWeight: 600 }}>
                    <Link to={`/projects/${sub.projectId._id}`}>{sub.projectId.title}</Link>
                  </td>
                  <td>{sub.submittedBy.name}</td>
                  <td>{sub.submittedBy.department}</td>
                  <td>v{sub.submissionVersion}</td>
                  <td>{new Date(sub.submittedAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</td>
                  <td>
                    <span className={`badge badge-${sub.status}`}>
                      {sub.status}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <a 
                        href={`http://localhost:5000/uploads/${sub.fileInfo.filename}`} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="btn btn-secondary" 
                        style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
                      >
                        Download
                      </a>
                      {sub.status === 'pending' ? (
                        <Link 
                          to={`/submissions/${sub._id}/review`} 
                          className="btn btn-primary" 
                          style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
                        >
                          Review
                        </Link>
                      ) : (
                        <span style={{ fontSize: '0.85rem', color: 'var(--success)', padding: '0.4rem', fontWeight: 500 }}>
                          Reviewed
                        </span>
                      )}
                    </div>
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
  },
  filterGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '1rem',
  }
};

export default FacultyDashboard;
