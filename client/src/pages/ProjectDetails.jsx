import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { FileUp, Calendar, ShieldAlert, Award, FileText, HelpCircle } from 'lucide-react';

const ProjectDetails = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(null);

  const fetchProjectData = async () => {
    try {
      const [projRes, subsRes] = await Promise.all([
        api.get(`/projects/${id}`),
        api.get('/submissions')
      ]);

      if (projRes.success) {
        setProject(projRes.data);
      }
      if (subsRes.success) {
        const projectSubs = subsRes.data.filter(sub => sub.projectId._id === id);
        setSubmissions(projectSubs);
      }
    } catch (err) {
      setError(err.message || 'Failed to load project details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectData();
  }, [id]);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;

    setUploading(true);
    setError(null);
    setUploadSuccess(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await api.post(`/projects/${id}/submit`, formData);
      if (response.success) {
        setUploadSuccess('Project document submitted successfully!');
        setFile(null);
        document.getElementById('fileInput').value = '';
        fetchProjectData();
      }
    } catch (err) {
      setError(err.message || 'File upload failed');
    } finally {
      setUploading(false);
    }
  };

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

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading project details...</p>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="empty-state">
        <p>Project details not found or you are not authorized to view this project.</p>
        <Link to="/" className="btn btn-primary" style={{ marginTop: '1rem' }}>
          Back to Dashboard
        </Link>
      </div>
    );
  }

  const deadlineStatus = getDeadlineStatus(project.deadline);
  const isSubmissionBlocked = deadlineStatus.isPassed && !project.allowLateSubmission;

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto' }}>
      <div className="flex-between mb-6">
        <div>
          <h1 className="text-gradient">{project.title}</h1>
          <p style={{ color: 'var(--text-muted)' }}>Guided by: {project.guide?.name || 'Unassigned'}</p>
        </div>
        <span className={`badge badge-${project.status}`} style={{ fontSize: '0.9rem', padding: '0.4rem 1rem' }}>
          {project.status}
        </span>
      </div>

      {error && <div className="error-banner">{error}</div>}
      {uploadSuccess && <div className="card" style={{ borderLeft: '4px solid var(--success)', marginBottom: '1.5rem', padding: '1rem', color: 'var(--success)' }}>{uploadSuccess}</div>}

      <div className="grid-cols-3 mb-6" style={{ gridTemplateColumns: '2fr 1fr' }}>
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Project Description</h3>
            <p style={{ color: 'var(--text-muted)', whiteSpace: 'pre-wrap' }}>{project.description}</p>
          </div>

          <div>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Technologies Used</h3>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {project.technologies.map((tech, idx) => (
                <span key={idx} style={{ 
                  backgroundColor: 'var(--bg-sidebar)', 
                  border: '1px solid var(--border-color)', 
                  padding: '0.3rem 0.6rem', 
                  borderRadius: 'var(--radius-sm)', 
                  fontSize: '0.85rem' 
                }}>
                  {tech}
                </span>
              ))}
            </div>
          </div>

          <div>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Team Members</h3>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              {project.students.map((stud) => (
                <li key={stud._id} style={{ fontSize: '0.95rem', color: 'var(--text-muted)' }}>
                  <strong style={{ color: 'var(--text-main)' }}>{stud.name}</strong> - {stud.email} ({stud.department})
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="card" style={{ borderLeft: `4px solid ${deadlineStatus.isPassed ? 'var(--danger)' : deadlineStatus.isUrgent ? 'var(--warning)' : 'var(--success)'}` }}>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.5rem' }}>
              <Calendar size={18} style={{ color: 'var(--text-muted)' }} />
              <h3 style={{ fontSize: '1rem', margin: 0 }}>Submission Deadline</h3>
            </div>
            <p style={{ fontWeight: 600 }}>
              {new Date(project.deadline).toLocaleString(undefined, { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </p>
            <p style={{ 
              fontSize: '0.85rem', 
              marginTop: '0.25rem',
              color: deadlineStatus.isPassed ? 'var(--danger)' : deadlineStatus.isUrgent ? 'var(--warning)' : 'var(--success)'
            }}>
              {deadlineStatus.text}
            </p>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
              Late submissions: {project.allowLateSubmission ? 'Enabled' : 'Disabled'}
            </p>
          </div>

          {user.role === 'student' && (
            <div className="card">
              <h3 style={{ fontSize: '1rem', marginBottom: '0.75rem' }}>Submit Deliverables</h3>
              
              {isSubmissionBlocked ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', color: 'var(--danger)' }}>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <ShieldAlert size={18} />
                    <strong style={{ fontSize: '0.9rem' }}>Submission Closed</strong>
                  </div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>The deadline has passed and late submissions are not allowed for this assignment.</p>
                  <button className="btn btn-primary" disabled style={{ marginTop: '0.5rem', width: '100%' }}>Submission Closed</button>
                </div>
              ) : (
                <form onSubmit={handleUploadSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {deadlineStatus.isPassed && (
                    <div style={{ display: 'flex', gap: '0.4rem', color: 'var(--warning)', fontSize: '0.8rem' }}>
                      <ShieldAlert size={14} style={{ marginTop: '0.1rem' }} />
                      <span>Warning: Submitting past the deadline. This will be marked late.</span>
                    </div>
                  )}
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" style={{ fontSize: '0.8rem' }}>Project Document (PDF, ZIP, DOC, DOCX, PPT)</label>
                    <input 
                      type="file" 
                      id="fileInput"
                      className="form-control" 
                      onChange={handleFileChange}
                      accept=".pdf,.zip,.doc,.docx,.ppt,.pptx"
                      required
                    />
                  </div>
                  <button 
                    type="submit" 
                    className="btn btn-primary" 
                    disabled={uploading || !file}
                  >
                    <FileUp size={16} />
                    <span>{uploading ? 'Uploading...' : 'Submit File'}</span>
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </div>

      <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Submission History</h2>
      {submissions.length === 0 ? (
        <div className="empty-state">
          <p>No documents have been submitted for this project yet.</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Version</th>
                <th>Submitted Date</th>
                <th>File Name</th>
                <th>Size</th>
                <th>Feedback / Marks</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {submissions.map((sub) => (
                <tr key={sub._id}>
                  <td style={{ fontWeight: 600 }}>v{sub.submissionVersion}</td>
                  <td>{new Date(sub.submittedAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                      <FileText size={16} style={{ color: 'var(--primary)' }} />
                      <span title={sub.fileInfo.originalName} style={{ maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {sub.fileInfo.originalName}
                      </span>
                    </div>
                  </td>
                  <td>{(sub.fileInfo.size / (1024 * 1024)).toFixed(2)} MB</td>
                  <td>
                    {sub.status === 'reviewed' ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.85rem' }}>
                          <Award size={14} style={{ color: 'var(--warning)' }} />
                          <strong>Marks: {sub.marks !== undefined ? sub.marks : 'N/A'}</strong>
                        </div>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic', maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block', whiteSpace: 'nowrap' }}>
                          "{sub.facultyFeedback}"
                        </span>
                      </div>
                    ) : (
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <HelpCircle size={14} />
                        Pending review
                      </span>
                    )}
                  </td>
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
                        style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem' }}
                      >
                        Download
                      </a>
                      {user.role === 'faculty' && sub.status === 'pending' && (
                        <Link 
                          to={`/submissions/${sub._id}/review`} 
                          className="btn btn-primary" 
                          style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem' }}
                        >
                          Review
                        </Link>
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

export default ProjectDetails;
