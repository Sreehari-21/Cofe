import React, { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { BookOpen, Plus, FolderSync, Clock, Award, MessageSquare } from 'lucide-react';

const StudentDashboard = () => {
  const { user } = useContext(AuthContext);
  const [courses, setCourses] = useState([]);
  const [projects, setProjects] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Join Course Modal states
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [referenceKey, setReferenceKey] = useState('');
  const [joinLoading, setJoinLoading] = useState(false);
  const [joinError, setJoinError] = useState(null);
  const [joinSuccess, setJoinSuccess] = useState(null);
  const [leaveCourse, setLeaveCourse] = useState(null);
  const [leaveNote, setLeaveNote] = useState('');
  const [leaveLoading, setLeaveLoading] = useState(false);
  const [leaveError, setLeaveError] = useState(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [coursesRes, subsRes, projRes] = await Promise.all([
        api.get('/courses'),
        api.get('/submissions'),
        api.get('/projects')
      ]);
      if (coursesRes.success) setCourses(coursesRes.data);
      if (subsRes.success) setSubmissions(subsRes.data);
      if (projRes.success) setProjects(projRes.data);
    } catch (err) {
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleJoinCourse = async (e) => {
    e.preventDefault();
    setJoinError(null);
    setJoinSuccess(null);

    if (!referenceKey.trim()) {
      setJoinError('Please enter a course reference key');
      return;
    }

    try {
      setJoinLoading(true);
      const res = await api.post('/courses/join', { referenceKey: referenceKey.trim() });
      if (!res.success) {
        setJoinError(res.message || 'Failed to join course');
        return;
      }

      setJoinSuccess(`Successfully joined course: ${res.data.courseName}!`);
      setReferenceKey('');
      setTimeout(() => {
        setShowJoinModal(false);
        setJoinSuccess(null);
      }, 1500);

      // Refresh course list
      const freshCourses = await api.get('/courses');
      if (freshCourses.success) setCourses(freshCourses.data);
    } catch (err) {
      setJoinError(err.message || 'An error occurred while joining');
    } finally {
      setJoinLoading(false);
    }
  };

  const handleLeaveCourse = async (e) => {
    e.preventDefault();
    if (!leaveCourse) return;
    setLeaveError(null);
    try {
      setLeaveLoading(true);
      await api.post(`/courses/${leaveCourse._id}/leave`, { note: leaveNote });
      setLeaveCourse(null);
      setLeaveNote('');
      await fetchDashboardData();
    } catch (err) {
      setLeaveError(err.message || 'Could not leave course');
    } finally {
      setLeaveLoading(false);
    }
  };

  const getLatestFeedback = () => {
    const reviewed = submissions.filter(sub => sub.status === 'reviewed' && sub.facultyFeedback);
    if (reviewed.length === 0) return '—';
    return reviewed[0].facultyFeedback;
  };

  const evaluatedCount = submissions.filter(sub => sub.status === 'reviewed').length;

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
      <div className="flex-between mb-6">
        <div>
          <h1>Your packets</h1>
          <p style={{ color: 'var(--text-muted)' }}>{user.name} · {user.department}</p>
        </div>
        <button onClick={() => setShowJoinModal(true)} className="btn btn-primary">
          <Plus size={16} />
          <span>Enrollment slip</span>
        </button>
      </div>

      {error && <div className="error-banner">{error}</div>}

      <div className="grid-cols-3">
        <div className="card" style={styles.statCard}>
          <div style={{ ...styles.statIcon, backgroundColor: 'var(--primary-glow)', color: 'var(--primary)' }}>
            <BookOpen size={24} />
          </div>
          <div>
            <div style={styles.statLabel}>Enrolled Courses</div>
            <div style={styles.statValue}>{courses.length}</div>
          </div>
        </div>

        <div className="card" style={styles.statCard}>
          <div style={{ ...styles.statIcon, backgroundColor: 'var(--warning-glow)', color: 'var(--warning)' }}>
            <FolderSync size={24} />
          </div>
          <div>
            <div style={styles.statLabel}>Total Submissions</div>
            <div style={styles.statValue}>{submissions.length}</div>
          </div>
        </div>

        <div className="card" style={styles.statCard}>
          <div style={{ ...styles.statIcon, backgroundColor: 'var(--success-glow)', color: 'var(--success)' }}>
            <Award size={24} />
          </div>
          <div>
            <div style={styles.statLabel}>Evaluated Deliverables</div>
            <div style={styles.statValue}>{evaluatedCount}</div>
          </div>
        </div>
      </div>

      <div className="card mb-6" style={styles.feedbackCard}>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
          <MessageSquare size={20} style={{ color: 'var(--secondary)', marginTop: '0.2rem' }} />
          <div>
            <h3 style={{ fontSize: '1rem', marginBottom: '0.25rem' }}>Latest Instructor Feedback</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', fontStyle: 'italic' }}>
              "{getLatestFeedback()}"
            </p>
          </div>
        </div>
      </div>

      <h2 style={{ fontSize: '1.15rem', marginBottom: '0.75rem' }}>Open packets</h2>
      {projects.length === 0 ? (
        <div className="empty-state mb-6">
          <p>No assignments.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2rem' }}>
          {projects.map((project) => {
            const mine = submissions.filter((s) => (s.projectId?._id || s.projectId) === project._id);
            const latest = mine[0];
            let stamp = { cls: 'stamp-open', text: 'Open' };
            if (latest?.status === 'reviewed') stamp = { cls: 'stamp-marked', text: 'Marked' };
            else if (latest) stamp = { cls: 'stamp-pending', text: 'In tray' };
            else if (new Date() > new Date(project.deadline)) stamp = { cls: 'stamp-late', text: 'Late' };
            else if ((new Date(project.deadline) - new Date()) / 86400000 <= 3) stamp = { cls: 'stamp-due', text: 'Due soon' };
            return (
              <div key={project._id} className="packet">
                <div>
                  <span className={`stamp ${stamp.cls}`}>{stamp.text}</span>
                  <h3 style={{ marginTop: '0.5rem' }}>{project.title}</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    {project.courseId?.courseName} · due {new Date(project.deadline).toLocaleDateString()}
                    {latest?.status === 'reviewed' ? ` · ${latest.marks}/${project.maxMarks || 100}` : ''}
                  </p>
                </div>
                <Link to={`/projects/${project._id}`} className="btn btn-secondary">Open</Link>
              </div>
            );
          })}
        </div>
      )}

      <h2 style={{ fontSize: '1.15rem', marginBottom: '0.75rem' }}>Folders</h2>
      {courses.length === 0 ? (
        <div className="empty-state">
          <p>No courses.</p>
        </div>
      ) : (
        <div style={styles.coursesGrid}>
          {courses.map((course) => (
            <div key={course._id} className="card" style={styles.courseCard}>
              <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 600 }}>{course.courseCode}</span>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 600, margin: '0.1rem 0' }}>{course.courseName}</h3>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Instructor: Dr. {course.facultyId?.name}</span>
              </div>
              
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {course.description || '—'}
              </p>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', fontSize: '0.85rem', color: 'var(--text-muted)', gap: '0.5rem' }}>
                <span>{course.semester} • {course.academicYear}</span>
                <div style={{ display: 'flex', gap: '0.4rem' }}>
                  <Link to={`/courses/${course._id}`} className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>
                    Open
                  </Link>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
                    onClick={() => { setLeaveCourse(course); setLeaveNote(''); setLeaveError(null); }}
                  >
                    Leave
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* JOIN COURSE MODAL */}
      {showJoinModal && (
        <div className="modal-backdrop">
          <div className="card" style={styles.modalCard}>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>Join Academic Course</h2>
            
            {joinError && <div className="error-banner mb-4">{joinError}</div>}
            {joinSuccess && <div className="card mb-4" style={{ borderLeft: '4px solid var(--success)', padding: '0.75rem', color: 'var(--success)' }}>{joinSuccess}</div>}

            <form onSubmit={handleJoinCourse}>
              <div className="form-group">
                <label className="form-label">Course Reference Key *</label>
                <input 
                  type="text" 
                  className="form-control" 
                  required 
                  value={referenceKey} 
                  onChange={(e) => setReferenceKey(e.target.value)} 
                  disabled={joinLoading}
                  style={{ textTransform: 'uppercase' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setShowJoinModal(false)} className="btn btn-secondary" disabled={joinLoading}>Cancel</button>
                <button type="submit" disabled={joinLoading} className="btn btn-primary">
                  {joinLoading ? 'Joining...' : 'Join Course'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {leaveCourse && (
        <div className="modal-backdrop">
          <div className="card" style={styles.modalCard}>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>Leave {leaveCourse.courseName}</h2>
            {leaveError && <div className="error-banner">{leaveError}</div>}
            <form onSubmit={handleLeaveCourse}>
              <div className="form-group">
                <label className="form-label">Note (optional)</label>
                <textarea className="form-control" rows="3" value={leaveNote} onChange={(e) => setLeaveNote(e.target.value)} />
              </div>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setLeaveCourse(null)} disabled={leaveLoading}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={leaveLoading}>{leaveLoading ? 'Leaving…' : 'Leave'}</button>
              </div>
            </form>
          </div>
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
  },
  coursesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: '1.5rem',
  },
  courseCard: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    padding: '1.25rem',
  },
  modalCard: {
    width: '100%',
    maxWidth: '420px',
    padding: '1.5rem',
    boxShadow: 'var(--shadow-lg)',
    zIndex: 1000,
  }
};

export default StudentDashboard;
