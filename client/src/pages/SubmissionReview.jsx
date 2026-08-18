import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import { FileText, ClipboardCheck, ArrowLeft } from 'lucide-react';

const SubmissionReview = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [comments, setComments] = useState('');
  const [marks, setMarks] = useState('');
  const [decision, setDecision] = useState('approved');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchSubmission = async () => {
      try {
        const response = await api.get(`/submissions/${id}`);
        if (response.success) {
          setSubmission(response.data);
        }
      } catch (err) {
        setError(err.message || 'Failed to fetch submission details');
      } finally {
        setLoading(false);
      }
    };
    fetchSubmission();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!comments || marks === '' || !decision) {
      setError('Please provide comments, marks, and decision');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const response = await api.post(`/submissions/${id}/review`, {
        comments,
        marks: Number(marks),
        decision
      });

      if (response.success) {
        navigate('/');
      }
    } catch (err) {
      setError(err.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading submission details...</p>
      </div>
    );
  }

  if (!submission) {
    return (
      <div className="empty-state">
        <p>Submission not found or unauthorized.</p>
        <Link to="/" className="btn btn-primary" style={{ marginTop: '1rem' }}>
          Back to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '640px', margin: '0 auto' }}>
      <div className="mb-6">
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1rem' }}>
          <ArrowLeft size={16} />
          <span>Back to Dashboard</span>
        </Link>
        <h1 className="text-gradient">Review Submission</h1>
        <p style={{ color: 'var(--text-muted)' }}>Evaluate and grade the project document submission.</p>
      </div>

      {error && <div className="error-banner">{error}</div>}

      <div className="card mb-6" style={{ backgroundColor: 'var(--bg-sidebar)' }}>
        <h3 style={{ fontSize: '1rem', marginBottom: '0.75rem', color: 'var(--primary)' }}>Submission Info</h3>
        <div style={styles.infoGrid}>
          <div>
            <div style={styles.infoLabel}>Project Title</div>
            <div style={styles.infoVal}>{submission.projectId.title}</div>
          </div>
          <div>
            <div style={styles.infoLabel}>Student Name</div>
            <div style={styles.infoVal}>{submission.submittedBy.name} ({submission.submittedBy.department})</div>
          </div>
          <div>
            <div style={styles.infoLabel}>Version Submitted</div>
            <div style={styles.infoVal}>v{submission.submissionVersion}</div>
          </div>
          <div>
            <div style={styles.infoLabel}>Document File</div>
            <div style={styles.infoVal}>
              <a 
                href={`http://localhost:5050/uploads/${submission.fileInfo.filename}`}
                target="_blank" 
                rel="noopener noreferrer"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontWeight: 500 }}
              >
                <FileText size={16} />
                <span>{submission.fileInfo.originalName}</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Review comments / Feedback</label>
            <textarea 
              className="form-control" 
              placeholder="Provide constructive feedback for the students..."
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              rows="4"
              style={{ resize: 'vertical' }}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Assigned Marks (0 - 100)</label>
            <input 
              type="number" 
              className="form-control"
              placeholder="85"
              min="0"
              max="100"
              value={marks}
              onChange={(e) => setMarks(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Decision Status</label>
            <select 
              className="form-control"
              value={decision}
              onChange={(e) => setDecision(e.target.value)}
              required
            >
              <option value="approved">Approve Project</option>
              <option value="rejected">Reject Project</option>
            </select>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%', marginTop: '1.25rem' }}
            disabled={submitting}
          >
            <ClipboardCheck size={18} />
            <span>{submitting ? 'Submitting Review...' : 'Submit Evaluation'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};

const styles = {
  infoGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1rem',
  },
  infoLabel: {
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
    fontWeight: 500,
    textTransform: 'uppercase',
  },
  infoVal: {
    fontSize: '0.95rem',
    fontWeight: 600,
    marginTop: '0.15rem',
  }
};

export default SubmissionReview;
