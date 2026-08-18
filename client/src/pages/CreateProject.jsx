import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { FolderPlus } from 'lucide-react';

const CreateProject = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [technologies, setTechnologies] = useState('');
  const [deadline, setDeadline] = useState('');
  const [allowLateSubmission, setAllowLateSubmission] = useState(false);
  const [guide, setGuide] = useState('');
  const [selectedStudents, setSelectedStudents] = useState([]);
  
  const [guidesList, setGuidesList] = useState([]);
  const [studentsList, setStudentsList] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const loadFormOptions = async () => {
      try {
        const guidesRes = await api.get('/projects/guides');
        if (guidesRes.success) {
          setGuidesList(guidesRes.data);
          if (guidesRes.data.length > 0) setGuide(guidesRes.data[0]._id);
        }

        if (user.role !== 'student') {
          const studentsRes = await api.get('/projects/students');
          if (studentsRes.success) {
            setStudentsList(studentsRes.data);
          }
        }
      } catch (err) {
        setError(err.message || 'Failed to load guides or students list');
      } finally {
        setLoading(false);
      }
    };

    loadFormOptions();
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !description || !technologies || !deadline || !guide) {
      setError('Please fill in all required fields');
      return;
    }

    setSubmitting(true);
    setError(null);

    const payload = {
      title,
      description,
      technologies,
      deadline,
      allowLateSubmission,
      guide
    };

    if (user.role !== 'student') {
      if (selectedStudents.length === 0) {
        setError('Please select at least one student team member');
        setSubmitting(false);
        return;
      }
      payload.students = selectedStudents;
    }

    try {
      const response = await api.post('/projects', payload);
      if (response.success) {
        navigate('/');
      }
    } catch (err) {
      setError(err.message || 'Failed to create project');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStudentSelect = (e) => {
    const options = e.target.options;
    const selected = [];
    for (let i = 0; i < options.length; i++) {
      if (options[i].selected) {
        selected.push(options[i].value);
      }
    }
    setSelectedStudents(selected);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading project setup options...</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '640px', margin: '0 auto' }}>
      <div className="mb-6">
        <h1 className="text-gradient">Assign New Project</h1>
        <p style={{ color: 'var(--text-muted)' }}>
          {user.role === 'student' 
            ? 'Propose a new project assignment for your team.' 
            : 'Register a project assignment to student team members.'}
        </p>
      </div>

      {error && <div className="error-banner">{error}</div>}

      <div className="card">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Project Title</label>
            <input 
              type="text" 
              className="form-control" 
              placeholder="e.g. AI Attendance System"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea 
              className="form-control" 
              placeholder="Describe project deliverables, expectations, and scope..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows="4"
              style={{ resize: 'vertical' }}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Technologies (comma-separated)</label>
            <input 
              type="text" 
              className="form-control" 
              placeholder="e.g. React, Node.js, Python, OpenCV"
              value={technologies}
              onChange={(e) => setTechnologies(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Submission Deadline</label>
            <input 
              type="datetime-local" 
              className="form-control"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              required
            />
          </div>

          <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center', gap: '0.75rem', margin: '1.5rem 0' }}>
            <input 
              type="checkbox" 
              id="allowLate"
              style={{ width: '18px', height: '18px', cursor: 'pointer' }}
              checked={allowLateSubmission}
              onChange={(e) => setAllowLateSubmission(e.target.checked)}
            />
            <label htmlFor="allowLate" style={{ fontWeight: 500, cursor: 'pointer', fontSize: '0.95rem' }}>
              Allow Late Submissions
            </label>
          </div>

          {user.role !== 'student' && (
            <div className="form-group">
              <label className="form-label">Assign Student(s) (Hold Ctrl/Cmd to select multiple)</label>
              <select 
                multiple
                className="form-control"
                value={selectedStudents}
                onChange={handleStudentSelect}
                style={{ height: '120px' }}
                required
              >
                {studentsList.map(stud => (
                  <option key={stud._id} value={stud._id}>
                    {stud.name} ({stud.department})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Assigned Faculty Guide</label>
            <select 
              className="form-control"
              value={guide}
              onChange={(e) => setGuide(e.target.value)}
              required
            >
              {guidesList.map(fac => (
                <option key={fac._id} value={fac._id}>
                  {fac.name} - {fac.department}
                </option>
              ))}
            </select>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%', marginTop: '1rem' }}
            disabled={submitting}
          >
            <FolderPlus size={18} />
            <span>{submitting ? 'Creating Project...' : 'Create Project'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateProject;
