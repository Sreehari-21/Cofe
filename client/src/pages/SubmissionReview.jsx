import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import FileDownload from '../components/FileDownload';
import { ClipboardCheck, ArrowLeft } from 'lucide-react';

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
        <p>Opening the desk…</p>
      </div>
    );
  }

  if (!submission) {
    return (
      <div className="empty-state">
        <p>Submission not found or unauthorized.</p>
        <Link to="/" className="btn btn-primary" style={{ marginTop: '1rem' }}>Back to desk</Link>
      </div>
    );
  }

  const maxMarks = submission.projectId?.maxMarks || 100;

  return (
    <div>
      <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1rem' }}>
        <ArrowLeft size={16} />
        Tray
      </Link>
      <h1>Stamp this packet</h1>
      {error && <div className="error-banner">{error}</div>}

      <div className="grid-cols-2" style={{ alignItems: 'start' }}>
        <div className="card">
          <span className="stamp stamp-pending">Deliverable</span>
          <h3 style={{ marginTop: '0.75rem' }}>{submission.projectId.title}</h3>
          <p style={{ color: 'var(--text-muted)', margin: '0.5rem 0 0.75rem' }}>
            {submission.submittedBy.name} · {submission.submittedBy.department} · v{submission.submissionVersion}
          </p>
          <p style={{ fontSize: '0.9rem', marginBottom: '0.75rem' }}>{submission.fileInfo.originalName}</p>
          <FileDownload submissionId={submission._id} />
        </div>

        <div className="card">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Comments</label>
              <textarea
                className="form-control"
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                rows="4"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Marks (0 – {maxMarks})</label>
              <input
                type="number"
                className="form-control"
                min="0"
                max={maxMarks}
                value={marks}
                onChange={(e) => setMarks(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Stamp</label>
              <select className="form-control" value={decision} onChange={(e) => setDecision(e.target.value)}>
                <option value="approved">Approve</option>
                <option value="rejected">Return / reject</option>
              </select>
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={submitting}>
              <ClipboardCheck size={18} />
              {submitting ? 'Stamping…' : 'Commit stamp'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SubmissionReview;
