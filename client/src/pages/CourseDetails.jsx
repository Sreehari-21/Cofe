import React, { useEffect, useState, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { AuthContext } from '../context/AuthContext';
import FileDownload from '../components/FileDownload';
import { 
  BookOpen, Users, FileText, CheckSquare, BarChart, 
  Copy, Check, Plus, Calendar, Clock, Trash2
} from 'lucide-react';

const CourseDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [course, setCourse] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Tabs management
  const [activeTab, setActiveTab] = useState('overview'); // overview, students, assignments, submissions, results
  const [copied, setCopied] = useState(false);

  // Create assignment form modal toggler
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [requirements, setRequirements] = useState('');
  const [technologies, setTechnologies] = useState('');
  const [deadline, setDeadline] = useState('');
  const [maxMarks, setMaxMarks] = useState(100);
  const [allowLate, setAllowLate] = useState(false);
  const [lateDeadline, setLateDeadline] = useState('');
  const [formError, setFormError] = useState(null);
  const [createLoading, setCreateLoading] = useState(false);

  // Filters for submissions
  const [filterStudent, setFilterStudent] = useState('');
  const [filterAssignment, setFilterAssignment] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [leaveNote, setLeaveNote] = useState('');
  const [leaveLoading, setLeaveLoading] = useState(false);
  const [leaveError, setLeaveError] = useState(null);

  const loadCourseData = async () => {
    try {
      setLoading(true);
      const courseRes = await api.get(`/courses/${id}`);
      if (!courseRes.success) throw new Error(courseRes.message);
      setCourse(courseRes.data);

      // Fetch projects/assignments in this course
      const projRes = await api.get(`/courses/${id}/projects`);
      if (projRes.success) setAssignments(projRes.data);

      // Fetch submissions (if Faculty or Admin, get all; if Student, gets own submissions)
      const subRes = await api.get('/submissions');
      if (subRes.success) {
        // Filter submissions that belong to this course's assignments
        const courseProjIds = projRes.data.map(p => p._id);
        const courseSubs = subRes.data.filter(s => courseProjIds.includes(s.projectId?._id || s.projectId));
        setSubmissions(courseSubs);
      }
    } catch (err) {
      setError(err.message || 'Failed to load course workspace');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCourseData();
    // Default tab for Student is overview, default for faculty can be overview too
    setActiveTab('overview');
  }, [id]);

  const copyRefKey = () => {
    if (!course) return;
    navigator.clipboard.writeText(course.referenceKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCreateAssignment = async (e) => {
    e.preventDefault();
    setFormError(null);

    if (!title || !description || !technologies || !deadline) {
      setFormError('Please fill out all required fields: Title, Description, Technologies, and Deadline');
      return;
    }

    try {
      setCreateLoading(true);
      const res = await api.post(`/courses/${id}/projects`, {
        title,
        description,
        requirements: requirements ? requirements.split(',').map(r => r.trim()) : [],
        technologies,
        deadline,
        maxMarks: Number(maxMarks),
        allowLateSubmission: allowLate,
        lateSubmissionDeadline: allowLate ? lateDeadline : undefined
      });

      if (!res.success) {
        setFormError(res.message || 'Failed to create assignment');
        return;
      }

      // Refresh assignments
      const projRes = await api.get(`/courses/${id}/projects`);
      if (projRes.success) setAssignments(projRes.data);

      setShowCreateModal(false);
      // Reset form
      setTitle('');
      setDescription('');
      setRequirements('');
      setTechnologies('');
      setDeadline('');
      setMaxMarks(100);
      setAllowLate(false);
      setLateDeadline('');
    } catch (err) {
      setFormError(err.message || 'An error occurred');
    } finally {
      setCreateLoading(false);
    }
  };

  const getDeadlineStatus = (deadlineStr) => {
    const deadlineDate = new Date(deadlineStr);
    const now = new Date();
    const diffTime = deadlineDate - now;
    if (diffTime < 0) return { text: 'Closed', isPassed: true };
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays === 1) return { text: '1 day left', isPassed: false, isUrgent: true };
    return { text: `${diffDays} days left`, isPassed: false, isUrgent: diffDays <= 3 };
  };

  // Get submission status for student
  const getStudentSubmissionStatus = (assignmentId) => {
    const studentSub = submissions.find(s => s.projectId?._id === assignmentId && s.submittedBy?._id === user._id);
    if (!studentSub) return { text: 'Not Submitted', status: 'pending' };
    return { text: studentSub.status === 'reviewed' ? 'Reviewed' : 'Submitted', status: studentSub.status };
  };

  const handleDeleteAssignment = async (assignmentId, title) => {
    if (!window.confirm(`Delete assignment “${title}”? Submissions for it will also be removed.`)) return;
    try {
      await api.delete(`/projects/${assignmentId}`);
      setAssignments((prev) => prev.filter((a) => a._id !== assignmentId));
      setSubmissions((prev) => prev.filter((s) => (s.projectId?._id || s.projectId) !== assignmentId));
    } catch (err) {
      setError(err.message || 'Could not delete assignment');
    }
  };

  const handleLeaveCourse = async (e) => {
    e.preventDefault();
    setLeaveError(null);
    try {
      setLeaveLoading(true);
      await api.post(`/courses/${id}/leave`, { note: leaveNote });
      navigate('/');
    } catch (err) {
      setLeaveError(err.message || 'Could not leave course');
    } finally {
      setLeaveLoading(false);
    }
  };

  // Filtered submissions (Faculty view)
  const filteredSubmissions = submissions.filter(sub => {
    const subProjId = sub.projectId?._id || sub.projectId;
    if (filterAssignment && subProjId !== filterAssignment) return false;
    if (filterStudent && !sub.submittedBy?.name.toLowerCase().includes(filterStudent.toLowerCase())) return false;
    if (filterStatus && sub.status !== filterStatus) return false;
    return true;
  });

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading course workspace...</p>
      </div>
    );
  }

  if (error) {
    return <div className="error-banner">{error}</div>;
  }

  if (!course) {
    return <div className="error-banner">Course not found.</div>;
  }

  const isFaculty = user.role === 'faculty' || user.role === 'admin';

  return (
    <div>
      {/* Course Header */}
      <div className="flex-between mb-6" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '1.5rem' }}>
        <div>
          <span style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            {course.courseCode} • {course.semester}
          </span>
                          <h1 className="text-gradient" style={{ marginTop: '0.25rem', marginBottom: '0.5rem' }}>{course.courseName}</h1>
          <p style={{ color: 'var(--text-muted)', margin: 0 }}>
            Led by <strong>Dr. {course.facultyId?.name}</strong> • {course.academicYear} • {course.department}
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
          {isFaculty ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'var(--card-bg)', border: '1px solid var(--border-color)', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-sm)' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Key:</span>
              <code style={{ fontSize: '0.9rem', color: 'var(--primary)', fontWeight: 'bold' }}>{course.referenceKey}</code>
              <button onClick={copyRefKey} className="btn" style={{ padding: '0.25rem', background: 'transparent', border: 'none', color: 'var(--text-muted)' }}>
                {copied ? <Check size={16} style={{ color: 'var(--success)' }} /> : <Copy size={16} />}
              </button>
            </div>
          ) : (
            <button type="button" className="btn btn-secondary" onClick={() => { setShowLeaveModal(true); setLeaveNote(''); setLeaveError(null); }}>
              Leave
            </button>
          )}
        </div>
      </div>

      {/* Tabs navigation */}
      <div style={styles.tabBar}>
        <button 
          onClick={() => setActiveTab('overview')} 
          style={{ ...styles.tabButton, ...(activeTab === 'overview' ? styles.tabButtonActive : {}) }}
        >
          <BookOpen size={16} />
          <span>Overview</span>
        </button>

        <button 
          onClick={() => setActiveTab('assignments')} 
          style={{ ...styles.tabButton, ...(activeTab === 'assignments' ? styles.tabButtonActive : {}) }}
        >
          <FileText size={16} />
          <span>Assignments</span>
        </button>

        {isFaculty && (
          <>
            <button 
              onClick={() => setActiveTab('students')} 
              style={{ ...styles.tabButton, ...(activeTab === 'students' ? styles.tabButtonActive : {}) }}
            >
              <Users size={16} />
              <span>Students ({course.students?.length || 0})</span>
            </button>

            <button 
              onClick={() => setActiveTab('submissions')} 
              style={{ ...styles.tabButton, ...(activeTab === 'submissions' ? styles.tabButtonActive : {}) }}
            >
              <CheckSquare size={16} />
              <span>Submissions</span>
            </button>

            <button 
              onClick={() => setActiveTab('results')} 
              style={{ ...styles.tabButton, ...(activeTab === 'results' ? styles.tabButtonActive : {}) }}
            >
              <BarChart size={16} />
              <span>Results</span>
            </button>
          </>
        )}
      </div>

      {/* Tab Contents */}

      {/* 1. OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <div className="card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.15rem', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>Course Syllabus & Information</h3>
          <p style={{ color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '1.5rem' }}>
            {course.description || '—'}
          </p>

          <div style={styles.overviewGrid}>
            <div>
              <span style={styles.gridLabel}>Department</span>
              <span style={styles.gridVal}>{course.department}</span>
            </div>
            <div>
              <span style={styles.gridLabel}>Academic Semester</span>
              <span style={styles.gridVal}>{course.semester}</span>
            </div>
            <div>
              <span style={styles.gridLabel}>Academic Year</span>
              <span style={styles.gridVal}>{course.academicYear}</span>
            </div>
            <div>
              <span style={styles.gridLabel}>Reference Key</span>
              <span style={styles.gridVal} className="flex-between">
                <span>{course.referenceKey}</span>
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 2. ASSIGNMENTS TAB */}
      {activeTab === 'assignments' && (
        <div>
          <div className="flex-between mb-4">
            <h2 style={{ fontSize: '1.15rem', margin: 0 }}>Course Deliverables ({assignments.length})</h2>
            {isFaculty && (
              <button onClick={() => setShowCreateModal(true)} className="btn btn-primary" style={{ padding: '0.5rem 1rem' }}>
                <Plus size={16} />
                <span>Create Assignment</span>
              </button>
            )}
          </div>

          {assignments.length === 0 ? (
            <div className="empty-state">
              <p>No assignments.</p>
            </div>
          ) : (
            <div style={styles.assignmentGrid}>
              {assignments.map(assign => {
                const deadStatus = getDeadlineStatus(assign.deadline);
                const subStatus = !isFaculty ? getStudentSubmissionStatus(assign._id) : null;
                return (
                  <div key={assign._id} className="card" style={styles.assignCard}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                      <h3 style={{ fontSize: '1.1rem', margin: 0, fontWeight: 600 }}>{assign.title}</h3>
                      {!isFaculty ? (
                        <span className={`badge badge-${subStatus.status === 'reviewed' ? 'success' : subStatus.status === 'pending' && subStatus.text === 'Submitted' ? 'warning' : 'danger'}`}>
                          {subStatus.text}
                        </span>
                      ) : (
                        <span className="badge badge-secondary" style={{ color: 'var(--text-muted)' }}>
                          Max: {assign.maxMarks} Marks
                        </span>
                      )}
                    </div>
                    
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {assign.description}
                    </p>

                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                      {assign.technologies.map((t, idx) => (
                        <span key={idx} style={styles.techTag}>{t}</span>
                      ))}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem', marginTop: 'auto' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: deadStatus.isPassed ? 'var(--danger)' : deadStatus.isUrgent ? 'var(--warning)' : 'var(--success)', fontSize: '0.8rem', fontWeight: 500 }}>
                        <Calendar size={14} />
                        <span>{deadStatus.text}</span>
                      </div>

                      <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                        {isFaculty && (
                          <button
                            type="button"
                            className="btn btn-danger"
                            style={{ padding: '0.35rem 0.5rem', fontSize: '0.85rem' }}
                            onClick={() => handleDeleteAssignment(assign._id, assign.title)}
                            title="Delete assignment"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                        <Link to={`/projects/${assign._id}`} className="btn btn-secondary" style={{ padding: '0.35rem 0.75rem', fontSize: '0.85rem' }}>
                          {isFaculty ? 'Workspace' : 'View Details'}
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 3. STUDENTS TAB (Faculty only) */}
      {activeTab === 'students' && (
        <div className="card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.15rem', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>Enrolled Student Registry</h3>
          {!course.students || course.students.length === 0 ? (
            <div className="empty-state">
              <p>No students.</p>
            </div>
          ) : (
            <div className="table-container" style={{ margin: 0 }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>Student Name</th>
                    <th>Email Address</th>
                    <th>Department</th>
                    <th>Joined Date</th>
                  </tr>
                </thead>
                <tbody>
                  {course.students.map(student => (
                    <tr key={student._id}>
                      <td style={{ fontWeight: 600 }}>{student.name}</td>
                      <td>{student.email}</td>
                      <td>{student.department}</td>
                      <td>{new Date(course.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {course.leaveRecords && course.leaveRecords.length > 0 && (
            <div style={{ marginTop: '1.5rem' }}>
              <h3 style={{ fontSize: '1.15rem', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>Left</h3>
              <div className="table-container" style={{ margin: 0 }}>
                <table className="table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Note</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {course.leaveRecords.map((rec, idx) => (
                      <tr key={rec._id || idx}>
                        <td style={{ fontWeight: 600 }}>{rec.name || '—'}</td>
                        <td>{rec.note || '—'}</td>
                        <td>{rec.leftAt ? new Date(rec.leftAt).toLocaleDateString() : '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 4. SUBMISSIONS TAB (Faculty only) */}
      {activeTab === 'submissions' && (
        <div>
          {/* Submissions Filter */}
          <div className="card mb-4" style={{ padding: '1rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontSize: '0.8rem', marginBottom: '0.25rem' }}>Assignment</label>
                <select className="form-control" value={filterAssignment} onChange={(e) => setFilterAssignment(e.target.value)} style={{ padding: '0.4rem', fontSize: '0.85rem' }}>
                  <option value="">All Assignments</option>
                  {assignments.map(a => <option key={a._id} value={a._id}>{a.title}</option>)}
                </select>
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontSize: '0.8rem', marginBottom: '0.25rem' }}>Student</label>
                <input type="text" className="form-control" value={filterStudent} onChange={(e) => setFilterStudent(e.target.value)} style={{ padding: '0.4rem', fontSize: '0.85rem' }} />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontSize: '0.8rem', marginBottom: '0.25rem' }}>Status</label>
                <select className="form-control" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} style={{ padding: '0.4rem', fontSize: '0.85rem' }}>
                  <option value="">All Statuses</option>
                  <option value="pending">Pending Review</option>
                  <option value="reviewed">Reviewed</option>
                </select>
              </div>
            </div>
          </div>

          {filteredSubmissions.length === 0 ? (
            <div className="empty-state">
              <p>No submissions.</p>
            </div>
          ) : (
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Assignment</th>
                    <th>Student</th>
                    <th>Submitted Date</th>
                    <th>Version</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSubmissions.map(sub => {
                    const subProj = assignments.find(a => a._id === (sub.projectId?._id || sub.projectId));
                    return (
                      <tr key={sub._id}>
                        <td style={{ fontWeight: 600 }}>{subProj?.title || 'Unknown Assignment'}</td>
                        <td>{sub.submittedBy?.name || 'Unknown Student'}</td>
                        <td>{new Date(sub.submittedAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</td>
                        <td>v{sub.submissionVersion}</td>
                        <td>
                          <span className={`badge badge-${sub.status}`}>
                            {sub.status}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <FileDownload submissionId={sub._id} />
                            {sub.status === 'pending' ? (
                              <Link to={`/submissions/${sub._id}/review`} className="btn btn-primary" style={{ padding: '0.35rem 0.65rem', fontSize: '0.8rem' }}>
                                Review
                              </Link>
                            ) : (
                              <span style={{ fontSize: '0.8rem', color: 'var(--success)', fontWeight: 'bold', alignSelf: 'center' }}>{sub.marks} / {subProj?.maxMarks || 100}</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* 5. RESULTS TAB (Faculty only) */}
      {activeTab === 'results' && (
        <div className="card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.15rem', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>Grade Book</h3>
          {!course.students || course.students.length === 0 ? (
            <div className="empty-state">
              <p>No students.</p>
            </div>
          ) : assignments.length === 0 ? (
            <div className="empty-state">
              <p>No assignments.</p>
            </div>
          ) : (
            <div className="table-container" style={{ margin: 0 }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>Student Name</th>
                    {assignments.map(a => (
                      <th key={a._id} style={{ textAlign: 'center' }}>
                        <div>{a.title}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 400 }}>(Max: {a.maxMarks})</div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {course.students.map(student => (
                    <tr key={student._id}>
                      <td style={{ fontWeight: 600 }}>{student.name}</td>
                      {assignments.map(a => {
                        // Find this student's evaluated submission for this assignment
                        const studentSub = submissions.find(s => (s.projectId?._id || s.projectId) === a._id && (s.submittedBy?._id || s.submittedBy) === student._id);
                        return (
                          <td key={a._id} style={{ textAlign: 'center', fontWeight: 600 }}>
                            {studentSub && studentSub.status === 'reviewed' ? (
                              <span style={{ color: 'var(--success)' }}>{studentSub.marks}</span>
                            ) : studentSub ? (
                              <span style={{ color: 'var(--warning)', fontSize: '0.8rem' }}>Pending</span>
                            ) : (
                              <span style={{ color: 'var(--danger)', fontSize: '0.8rem' }}>N/A</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* CREATE ASSIGNMENT MODAL (Faculty only) */}
      {showCreateModal && (
        <div className="modal-backdrop">
          <div className="card" style={styles.modalCard}>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>Create Assignment</h2>
            
            {formError && <div className="error-banner mb-4">{formError}</div>}

            <form onSubmit={handleCreateAssignment}>
              <div className="form-group">
                <label className="form-label">Assignment Title *</label>
                <input type="text" className="form-control" required value={title} onChange={(e) => setTitle(e.target.value)} />
              </div>

              <div className="form-group">
                <label className="form-label">Description *</label>
                <textarea className="form-control" rows="3" required value={description} onChange={(e) => setDescription(e.target.value)} />
              </div>

              <div className="grid-cols-2">
                <div className="form-group">
                  <label className="form-label">Technologies *</label>
                  <input type="text" className="form-control" required value={technologies} onChange={(e) => setTechnologies(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Maximum Marks</label>
                  <input type="number" className="form-control" value={maxMarks} onChange={(e) => setMaxMarks(e.target.value)} min="1" max="1000" />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Requirements (Comma separated)</label>
                <input type="text" className="form-control" value={requirements} onChange={(e) => setRequirements(e.target.value)} />
              </div>

              <div className="form-group">
                <label className="form-label">Submission Deadline *</label>
                <input type="datetime-local" className="form-control" required value={deadline} onChange={(e) => setDeadline(e.target.value)} />
              </div>

              <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '1rem 0' }}>
                <input type="checkbox" id="allowLate" checked={allowLate} onChange={(e) => setAllowLate(e.target.checked)} />
                <label htmlFor="allowLate" style={{ cursor: 'pointer', fontSize: '0.95rem' }}>Allow Late Submissions</label>
              </div>

              {allowLate && (
                <div className="form-group">
                  <label className="form-label">Late Submission Cut-off Date</label>
                  <input type="datetime-local" className="form-control" value={lateDeadline} onChange={(e) => setLateDeadline(e.target.value)} />
                </div>
              )}

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setShowCreateModal(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" disabled={createLoading} className="btn btn-primary">
                  {createLoading ? 'Publishing...' : 'Publish Assignment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showLeaveModal && (
        <div className="modal-backdrop">
          <div className="card" style={styles.modalCard}>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>Leave course</h2>
            {leaveError && <div className="error-banner">{leaveError}</div>}
            <form onSubmit={handleLeaveCourse}>
              <div className="form-group">
                <label className="form-label">Note (optional)</label>
                <textarea className="form-control" rows="3" value={leaveNote} onChange={(e) => setLeaveNote(e.target.value)} />
              </div>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowLeaveModal(false)} disabled={leaveLoading}>Cancel</button>
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
  tabBar: {
    display: 'flex',
    gap: '0.5rem',
    borderBottom: '1px solid var(--border-color)',
    marginBottom: '1.5rem',
    overflowX: 'auto',
  },
  tabButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    background: 'transparent',
    border: 'none',
    borderBottom: '3px solid transparent',
    color: 'var(--text-muted)',
    padding: '0.75rem 1rem',
    fontSize: '0.95rem',
    fontWeight: 500,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    transition: 'var(--transition)',
  },
  tabButtonActive: {
    color: 'var(--primary)',
    borderBottomColor: 'var(--primary)',
  },
  overviewGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '1.5rem',
    padding: '1.25rem',
    borderRadius: 'var(--radius-sm)',
  },
  gridLabel: {
    display: 'block',
    fontSize: '0.8rem',
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    fontWeight: 600,
    letterSpacing: '0.05em',
    marginBottom: '0.25rem',
  },
  gridVal: {
    fontSize: '1rem',
    fontWeight: 500,
  },
  assignmentGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: '1.5rem',
  },
  assignCard: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    padding: '1.25rem',
  },
  techTag: {
    fontSize: '0.75rem',
    fontWeight: 500,
    backgroundColor: 'var(--primary-glow)',
    color: 'var(--primary)',
    padding: '0.2rem 0.5rem',
    borderRadius: 'var(--radius-sm)',
  },
  modalCard: {
    width: '100%',
    maxWidth: '550px',
    padding: '1.75rem',
    boxShadow: 'var(--shadow-lg)',
    zIndex: 1000,
    maxHeight: '90vh',
    overflowY: 'auto',
  }
};

export default CourseDetails;
