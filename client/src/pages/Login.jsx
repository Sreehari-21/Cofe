import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, user, error, setError } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    setError(null);
    if (user) navigate('/');
  }, [user, navigate, setError]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return;
    const success = await login(email, password);
    if (success) navigate('/');
  };

  return (
    <div className="auth-split">
      <aside className="auth-panel">
        <div>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', letterSpacing: '0.16em', textTransform: 'uppercase', opacity: 0.7 }}>Portal</p>
          <h1 className="display" style={{ fontSize: '2.6rem', color: '#f4efe6', marginTop: '0.75rem' }}>Cofe Dossier</h1>
        </div>
      </aside>
      <div className="auth-form-wrap">
        <div className="card" style={{ width: '100%', maxWidth: 420 }}>
          <h2>Sign in</h2>
          {error && <div className="error-banner">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input type="email" className="form-control" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input type="password" className="form-control" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Enter</button>
          </form>
          <p style={{ marginTop: '1.25rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            <Link to="/register">Register</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
