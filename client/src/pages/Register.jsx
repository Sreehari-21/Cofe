import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { UserPlus } from 'lucide-react';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
  const [department, setDepartment] = useState('');
  const { register, user, error, setError } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    setError(null);
    if (user) {
      navigate('/');
    }
  }, [user, navigate, setError]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password || !role) return;
    const success = await register(name, email, password, role, department);
    if (success) {
      navigate('/');
    }
  };

  return (
    <div style={styles.container}>
      <div className="card" style={styles.card}>
        <div style={styles.header}>
          <h2 className="text-gradient">Create Account</h2>
          <p style={{ color: 'var(--text-muted)' }}>Register as a student or faculty member</p>
        </div>

        {error && <div className="error-banner">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input 
              type="text" 
              className="form-control" 
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input 
              type="email" 
              className="form-control" 
              placeholder="name@university.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password (Min. 6 characters)</label>
            <input 
              type="password" 
              className="form-control" 
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Portal Role</label>
            <select 
              className="form-control"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              required
            >
              <option value="student">Student</option>
              <option value="faculty">Faculty / Instructor</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Department / School</label>
            <input 
              type="text" 
              className="form-control" 
              placeholder="Computer Science"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem' }}>
            <UserPlus size={18} />
            <span>Create Account</span>
          </button>
        </form>

        <p style={styles.footer}>
          Already have an account? <Link to="/login">Login here</Link>
        </p>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    backgroundColor: 'var(--bg-main)',
    padding: '1rem',
  },
  card: {
    width: '100%',
    maxWidth: '420px',
  },
  header: {
    textAlign: 'center',
    marginBottom: '1.5rem',
  },
  footer: {
    textAlign: 'center',
    marginTop: '1.5rem',
    fontSize: '0.9rem',
    color: 'var(--text-muted)',
  }
};

export default Register;
