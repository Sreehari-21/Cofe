import React, { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { BookOpen, Users, Clock, Plus, Copy, Check, RefreshCw } from 'lucide-react';

const FacultyDashboard = () => {
  const { user } = useContext(AuthContext);
  const [courses, setCourses] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Create Course Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [courseName, setCourseName] = useState('');
  const [courseCode, setCourseCode] = useState('');
  const [description, setDescription] = useState('');
  const [department, setDepartment] = useState('');
  const [semester, setSemester] = useState('');
  const [academicYear, setAcademicYear] = useState('');
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState(null);
  
  // Ref key display modal states
  const [createdCourse, setCreatedCourse] = useState(null);
  const [copied, setCopied] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [coursesRes, subsRes] = await Promise.all([
        api.get('/courses'),
        api.get('/submissions')
      ]);

      if (coursesRes.success) setCourses(coursesRes.data);
      if (subsRes.success) setSubmissions(subsRes.data);
    } catch (err) {
      setError(err.message || 'Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    setCreateError(null);

    if (!courseName || !courseCode || !department || !semester || !academicYear) {
      setCreateError('Please fill out all required fields');
      return;
    }

    try {
      setCreateLoading(true);
      const res = await api.post('/courses', {
        courseName,
        courseCode,
        description,
        department,
        semester,
        academicYear
      });

      if (!res.success) {
        setCreateError(res.message || 'Failed to create course');
        return;
      }

      setCreatedCourse(res.data);
      setShowCreateModal(false);

      // Reset form
      setCourseName('');
      setCourseCode('');
      setDescription('');
      setDepartment('');
      setSemester('');
      setAcademicYear('');

      // Refresh list
      const freshCourses = await api.get('/courses');
      if (freshCourses.success) setCourses(freshCourses.data);
    } catch (err) {
      setCreateError(err.message || 'An error occurred during creation');
    } finally {
      setCreateLoading(false);
    }
  };

  const copyRefKey = () => {
    if (!createdCourse) return;
    navigator.clipboard.writeText(createdCourse.referenceKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Calculate unique student count across all owned courses
  const getUniqueStudentCount = () => {
    const studentIds = new Set();
    courses.forEach(course => {
      if (course.students) {
        course.students.forEach(student => {
          studentIds.add(student._id || student);
        });
      }
    });
    return studentIds.size;
  };

  // Submissions that belong to assignments guided by this instructor
  const getPendingReviewCount = () => {
    return submissions.filter(sub => sub.status === 'pending').length;
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading instructor dashboard...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex-between mb-6">
        <div>
          <h1 className="text-gradient">Faculty Dashboard</h1>
          <p style={{ color: 'var(--text-muted)' }}>Welcome back, Professor {user.name}. Manage academic courses and grade deliverables.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={loadData} className="btn btn-secondary" style={{ padding: '0.5rem' }}>
            <RefreshCw size={16} />
          </button>
          <button onClick={() => setShowCreateModal(true)} className="btn btn-primary" style={{ padding: '0.5rem 1rem' }}>
            <Plus size={16} />
            <span>Create Course</span>
          </button>
        </div>
      </div>

      {error && <div className="error-banner">{error}</div>}

      <div className="grid-cols-3">
        <div className="card" style={styles.statCard}>
          <div style={{ ...styles.statIcon, backgroundColor: 'var(--primary-glow)', color: 'var(--primary)' }}>
            <BookOpen size={24} />
          </div>
          <div>
            <div style={styles.statLabel}>Active Courses</div>
            <div style={styles.statValue}>{courses.length}</div>
          </div>
        </div>

        <div className="card" style={styles.statCard}>
          <div style={{ ...styles.statIcon, backgroundColor: 'var(--warning-glow)', color: 'var(--warning)' }}>
            <Users size={24} />
          </div>
          <div>
            <div style={styles.statLabel}>Enrolled Students</div>
            <div style={styles.statValue}>{getUniqueStudentCount()}</div>
          </div>
        </div>

        <div className="card" style={styles.statCard}>
          <div style={{ ...styles.statIcon, backgroundColor: 'var(--success-glow)', color: 'var(--success)' }}>
            <Clock size={24} />
          </div>
          <div>
            <div style={styles.statLabel}>Pending Reviews</div>
            <div style={styles.statValue}>{getPendingReviewCount()}</div>
          </div>
        </div>
      </div>

      <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>My Courses</h2>
      {courses.length === 0 ? (
        <div className="empty-state">
          <p>You have not created any courses yet.</p>
          <p style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>Click "Create Course" to get started and invite students to your space.</p>
        </div>
      ) : (
        <div style={styles.coursesGrid}>
          {courses.map((course) => (
            <div key={course._id} className="card" style={styles.courseCard}>
              <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 600 }}>{course.courseCode}</span>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 600, margin: '0.1rem 0' }}>{course.courseName}</h3>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Students Enrolled: {course.students?.length || 0}</span>
              </div>
              
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {course.description || 'No syllabus description provided.'}
              </p>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', backgroundColor: 'var(--bg-sidebar)', padding: '0.25rem 0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                  <code style={{ fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--primary)' }}>{course.referenceKey}</code>
                </div>
                <Link to={`/courses/${course._id}`} className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>
                  Manage Course
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CREATE COURSE MODAL */}
      {showCreateModal && (
        <div className="modal-backdrop">
          <div className="card" style={styles.modalCard}>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>Create Course Workspace</h2>
            
            {createError && <div className="error-banner mb-4">{createError}</div>}

            <form onSubmit={handleCreateCourse}>
              <div className="form-group">
                <label className="form-label">Course Name *</label>
                <input type="text" className="form-control" required value={courseName} onChange={(e) => setCourseName(e.target.value)} placeholder="e.g. Web Technologies" />
              </div>

              <div className="grid-cols-2">
                <div className="form-group">
                  <label className="form-label">Course Code *</label>
                  <input type="text" className="form-control" required value={courseCode} onChange={(e) => setCourseCode(e.target.value)} placeholder="e.g. 21CS52" />
                </div>
                <div className="form-group">
                  <label className="form-label">Department *</label>
                  <input type="text" className="form-control" required value={department} onChange={(e) => setDepartment(e.target.value)} placeholder="e.g. Computer Science" />
                </div>
              </div>

              <div className="grid-cols-2">
                <div className="form-group">
                  <label className="form-label">Semester *</label>
                  <input type="text" className="form-control" required value={semester} onChange={(e) => setSemester(e.target.value)} placeholder="e.g. 5th Semester" />
                </div>
                <div className="form-group">
                  <label className="form-label">Academic Year *</label>
                  <input type="text" className="form-control" required value={academicYear} onChange={(e) => setAcademicYear(e.target.value)} placeholder="e.g. 2026-2027" />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Course Syllabus / Description</label>
                <textarea className="form-control" rows="3" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Enter details about modules and learning outcomes..." />
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setShowCreateModal(false)} className="btn btn-secondary" disabled={createLoading}>Cancel</button>
                <button type="submit" disabled={createLoading} className="btn btn-primary">
                  {createLoading ? 'Creating...' : 'Create Course'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATED COURSE REF KEY NOTIFIER MODAL */}
      {createdCourse && (
        <div className="modal-backdrop">
          <div className="card text-center" style={{ ...styles.modalCard, maxWidth: '400px', padding: '2rem' }}>
            <h2 style={{ color: 'var(--success)', fontSize: '1.4rem', marginBottom: '0.5rem' }}>Course Created!</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '1.5rem' }}>
              Your course <strong>{createdCourse.courseName}</strong> was created successfully.
            </p>

            <div className="mb-6" style={{ backgroundColor: 'var(--bg-sidebar)', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px dashed var(--primary)', display: 'inline-flex', flexDirection: 'column', gap: '0.5rem', width: '100%', alignItems: 'center' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>COURSE REFERENCE KEY</span>
              <code style={{ fontSize: '1.6rem', fontWeight: 'bold', color: 'var(--primary)', letterSpacing: '0.05em' }}>{createdCourse.referenceKey}</code>
            </div>

            <button onClick={copyRefKey} className="btn btn-primary" style={{ width: '100%', padding: '0.6rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              {copied ? <Check size={16} /> : <Copy size={16} />}
              <span>{copied ? 'Copied to Clipboard!' : 'Copy Reference Key'}</span>
            </button>

            <button onClick={() => setCreatedCourse(null)} className="btn btn-secondary" style={{ width: '100%', padding: '0.6rem' }}>
              Close & Go to Dashboard
            </button>
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
    maxWidth: '500px',
    padding: '1.5rem',
    boxShadow: 'var(--shadow-lg)',
    zIndex: 1000,
  }
};

export default FacultyDashboard;
