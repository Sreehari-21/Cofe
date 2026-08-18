import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { LogIn } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, user, error, setError } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    setError(null);
    if (user) {
      navigate('/');
    }
  }, [user, navigate, setError]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return;
    const success = await login(email, password);
    if (success) {
      navigate('/');
    }
  };

  return (
    <div style={styles.container}>
      <div className="card" style={styles.card}>
        <div style={styles.header}>
          <h2 className="text-gradient">Welcome Back</h2>
          <p style={{ color: 'var(--text-muted)' }}>Login to access your project submission portal</p>
        </div>

        {error && <div className="error-banner">{error}</div>}

        <form onSubmit={handleSubmit}>
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
            <label className="form-label">Password</label>
            <input 
              type="password" 
              className="form-control" 
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem' }}>
            <LogIn size={18} />
            <span>Sign In</span>
          </button>
        </form>

        <p style={styles.footer}>
          Don't have an account? <Link to="/register">Register here</Link>
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
    marginBottom: '2rem',
  },
  footer: {
    textAlign: 'center',
    marginTop: '1.5rem',
    fontSize: '0.9rem',
    color: 'var(--text-muted)',
  }
};

export default Login;
