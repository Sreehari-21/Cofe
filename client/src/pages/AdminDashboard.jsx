import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { Users, BookOpen, Clock, CheckCircle, XCircle, FileText, FolderSync } from 'lucide-react';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [courses, setCourses] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Tabs for lists: courses, assignments
  const [activeListTab, setActiveListTab] = useState('courses');

  const loadAdminData = async () => {
    try {
      setLoading(true);
      const [statsRes, coursesRes, projRes] = await Promise.all([
        api.get('/admin/statistics'),
        api.get('/courses'),
        api.get('/projects')
      ]);

      if (statsRes.success) setStats(statsRes.data);
      if (coursesRes.success) setCourses(coursesRes.data);
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
        <p style={{ color: 'var(--text-muted)' }}>Portal analytics, course registries, and project overview.</p>
      </div>

      {error && <div className="error-banner">{error}</div>}

      {stats && (
        <div className="grid-cols-3" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
          <div className="card" style={styles.statCard}>
            <div style={{ ...styles.statIcon, backgroundColor: 'var(--primary-glow)', color: 'var(--primary)' }}>
              <Users size={20} />
            </div>
            <div>
              <div style={styles.statLabel}>Total Students</div>
              <div style={styles.statValue}>{stats.totalStudents}</div>
            </div>
          </div>

          <div className="card" style={styles.statCard}>
            <div style={{ ...styles.statIcon, backgroundColor: 'var(--secondary-glow)', color: 'var(--secondary)' }}>
              <Users size={20} />
            </div>
            <div>
              <div style={styles.statLabel}>Total Faculty</div>
              <div style={styles.statValue}>{stats.totalFaculty}</div>
            </div>
          </div>

          <div className="card" style={styles.statCard}>
            <div style={{ ...styles.statIcon, backgroundColor: 'var(--info-glow)', color: 'var(--info)' }}>
              <BookOpen size={20} />
            </div>
            <div>
              <div style={styles.statLabel}>Total Courses</div>
              <div style={styles.statValue}>{stats.totalCourses}</div>
            </div>
          </div>

          <div className="card" style={styles.statCard}>
            <div style={{ ...styles.statIcon, backgroundColor: 'var(--primary-glow)', color: 'var(--primary)' }}>
              <FileText size={20} />
            </div>
            <div>
              <div style={styles.statLabel}>Total Projects</div>
              <div style={styles.statValue}>{stats.totalProjects}</div>
            </div>
          </div>

          <div className="card" style={styles.statCard}>
            <div style={{ ...styles.statIcon, backgroundColor: 'var(--warning-glow)', color: 'var(--warning)' }}>
              <FolderSync size={20} />
            </div>
            <div>
              <div style={styles.statLabel}>Total Submissions</div>
              <div style={styles.statValue}>{stats.totalSubmissions}</div>
            </div>
          </div>

          <div className="card" style={styles.statCard}>
            <div style={{ ...styles.statIcon, backgroundColor: 'var(--warning-glow)', color: 'var(--warning)' }}>
              <Clock size={20} />
            </div>
            <div>
              <div style={styles.statLabel}>Pending Reviews</div>
              <div style={styles.statValue}>{stats.pendingReviews}</div>
            </div>
          </div>

          <div className="card" style={styles.statCard}>
            <div style={{ ...styles.statIcon, backgroundColor: 'var(--success-glow)', color: 'var(--success)' }}>
              <CheckCircle size={20} />
            </div>
            <div>
              <div style={styles.statLabel}>Approved Projects</div>
              <div style={styles.statValue}>{stats.approvedProjects}</div>
            </div>
          </div>

          <div className="card" style={styles.statCard}>
            <div style={{ ...styles.statIcon, backgroundColor: 'var(--danger-glow)', color: 'var(--danger)' }}>
              <XCircle size={20} />
            </div>
            <div>
              <div style={styles.statLabel}>Rejected Projects</div>
              <div style={styles.statValue}>{stats.rejectedProjects}</div>
            </div>
          </div>
        </div>
      )}

      {/* List selection tabs */}
      <div style={styles.tabBar}>
        <button 
          onClick={() => setActiveListTab('courses')}
          style={{ ...styles.tabButton, ...(activeListTab === 'courses' ? styles.tabButtonActive : {}) }}
        >
          Courses ({courses.length})
        </button>
        <button 
          onClick={() => setActiveListTab('assignments')}
          style={{ ...styles.tabButton, ...(activeListTab === 'assignments' ? styles.tabButtonActive : {}) }}
        >
          Assignments ({projects.length})
        </button>
      </div>

      {/* Global Lists */}
      {activeListTab === 'courses' ? (
        <div>
          <h2 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>Global Courses Registry</h2>
          {courses.length === 0 ? (
            <div className="empty-state">
              <p>No courses have been created in the portal yet.</p>
            </div>
          ) : (
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Course Code</th>
                    <th>Course Name</th>
                    <th>Department</th>
                    <th>Instructor (Faculty)</th>
                    <th>Students Enrolled</th>
                    <th>Reference Key</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {courses.map(course => (
                    <tr key={course._id}>
                      <td style={{ fontWeight: 'bold', color: 'var(--primary)' }}>{course.courseCode}</td>
                      <td style={{ fontWeight: 600 }}>{course.courseName}</td>
                      <td>{course.department}</td>
                      <td>Dr. {course.facultyId?.name || 'Unassigned'}</td>
                      <td>{course.students?.length || 0} students</td>
                      <td><code>{course.referenceKey}</code></td>
                      <td>
                        <Link to={`/courses/${course._id}`} className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>
                          Inspect
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        <div>
          <h2 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>Global Projects / Assignments Overview</h2>
          {projects.length === 0 ? (
            <div className="empty-state">
              <p>No project assignments have been created in the portal yet.</p>
            </div>
          ) : (
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Assignment Title</th>
                    <th>Parent Course</th>
                    <th>Assigned Guide</th>
                    <th>Target Students</th>
                    <th>Deadline</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {projects.map(project => (
                    <tr key={project._id}>
                      <td style={{ fontWeight: 600 }}>{project.title}</td>
                      <td>{project.courseId ? `${project.courseId.courseName} (${project.courseId.courseCode})` : 'N/A'}</td>
                      <td>Dr. {project.guide?.name || 'Unassigned'}</td>
                      <td>{project.students?.length || 0} students</td>
                      <td>{new Date(project.deadline).toLocaleDateString()}</td>
                      <td>
                        <span className={`badge badge-${project.status}`}>
                          {project.status}
                        </span>
                      </td>
                      <td>
                        <Link to={`/projects/${project._id}`} className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>
                          Inspect
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const styles = {
  statCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    padding: '1rem',
  },
  statIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '40px',
    height: '40px',
    borderRadius: 'var(--radius-sm)',
  },
  statLabel: {
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.02em',
  },
  statValue: {
    fontSize: '1.35rem',
    fontWeight: '700',
    marginTop: '0.1rem',
  },
  tabBar: {
    display: 'flex',
    gap: '0.5rem',
    borderBottom: '1px solid var(--border-color)',
    marginBottom: '1.5rem',
    marginTop: '1.5rem',
  },
  tabButton: {
    background: 'transparent',
    border: 'none',
    borderBottom: '3px solid transparent',
    color: 'var(--text-muted)',
    padding: '0.75rem 1.25rem',
    fontSize: '0.95rem',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all var(--transition-speed) ease',
  },
  tabButtonActive: {
    color: 'var(--primary)',
    borderBottomColor: 'var(--primary)',
  }
};

export default AdminDashboard;
