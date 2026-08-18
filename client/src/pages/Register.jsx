import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { DEPARTMENTS } from '../constants/academic.js';

const Register = () => {
  const [portal, setPortal] = useState('student');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [department, setDepartment] = useState(DEPARTMENTS[0]);
  const [deptOther, setDeptOther] = useState('');
  const { register, user, error, setError } = useContext(AuthContext);
  const navigate = useNavigate();
  const isFaculty = portal === 'faculty';

  useEffect(() => {
    setError(null);
    if (user) navigate('/');
  }, [user, navigate, setError]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const resolvedDept = department === '__other' ? deptOther.trim() : department;
    if (!resolvedDept) return;
    const success = await register(name, email, password, resolvedDept, portal);
    if (success) navigate('/');
  };

  return (
    <div className="auth-split">
      <aside className="auth-panel">
        <div>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', letterSpacing: '0.16em', textTransform: 'uppercase', opacity: 0.7 }}>
            {isFaculty ? 'Professor portal' : 'Enrollment slip'}
          </p>
          <h1 className="display" style={{ fontSize: '2.4rem', color: '#f4efe6', marginTop: '0.75rem' }}>
            {isFaculty ? 'Faculty' : 'Student'}
          </h1>
        </div>
      </aside>
      <div className="auth-form-wrap">
        <div className="card" style={{ width: '100%', maxWidth: 420 }}>
          <h2>{isFaculty ? 'Faculty slip' : 'Student slip'}</h2>
          <div style={{ display: 'flex', gap: '0.5rem', margin: '0.75rem 0 1.25rem' }}>
            <button
              type="button"
              className={portal === 'student' ? 'btn btn-primary' : 'btn btn-secondary'}
              onClick={() => setPortal('student')}
              style={{ flex: 1 }}
            >
              Student
            </button>
            <button
              type="button"
              className={isFaculty ? 'btn btn-primary' : 'btn btn-secondary'}
              onClick={() => setPortal('faculty')}
              style={{ flex: 1 }}
            >
              Professor
            </button>
          </div>
          {error && <div className="error-banner">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Full name</label>
              <input className="form-control" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input type="email" className="form-control" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label">Password (min 6)</label>
              <input type="password" className="form-control" value={password} onChange={(e) => setPassword(e.target.value)} minLength={6} required />
            </div>
            <div className="form-group">
              <label className="form-label">Department</label>
              <select className="form-control" value={department} onChange={(e) => setDepartment(e.target.value)} required>
                {DEPARTMENTS.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
                <option value="__other">Other</option>
              </select>
            </div>
            {department === '__other' && (
              <div className="form-group">
                <label className="form-label">Other department</label>
                <input className="form-control" value={deptOther} onChange={(e) => setDeptOther(e.target.value)} required />
              </div>
            )}
            <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
              {isFaculty ? 'Create account' : 'Create account'}
            </button>
          </form>
          <p style={{ marginTop: '1.25rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            <Link to="/login">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
