import React, { useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const onLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav style={styles.bar}>
      <div style={styles.brand}>
        <span style={styles.mark}>Cofe</span>
        <span style={styles.sub}>Dossier</span>
      </div>

      {user && (
        <div style={styles.nav}>
          <NavLink to="/" style={linkStyle} end>Desk</NavLink>
          {user.role === 'admin' && (
            <NavLink to="/users" style={linkStyle}>Registry</NavLink>
          )}
          <NavLink to="/profile" style={linkStyle}>Profile</NavLink>
          <span className="stamp stamp-open" style={{ transform: 'none', marginLeft: '0.5rem' }}>
            {user.role}
          </span>
          <button type="button" onClick={onLogout} className="btn btn-secondary" style={{ padding: '0.35rem 0.7rem' }}>
            Sign out
          </button>
        </div>
      )}
    </nav>
  );
};

const linkStyle = ({ isActive }) => ({
  color: isActive ? 'var(--primary)' : 'var(--text-muted)',
  fontWeight: 600,
  fontSize: '0.9rem',
  textDecoration: isActive ? 'underline' : 'none',
  textUnderlineOffset: '4px'
});

const styles = {
  bar: {
    height: 64,
    background: 'var(--bg-card)',
    borderBottom: '1px solid var(--border-color)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 1.75rem',
    position: 'sticky',
    top: 0,
    zIndex: 50
  },
  brand: { display: 'flex', alignItems: 'baseline', gap: '0.5rem' },
  mark: { fontFamily: 'var(--font-display)', fontSize: '1.45rem', fontWeight: 700 },
  sub: { fontFamily: 'var(--font-mono)', fontSize: '0.7rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--text-muted)' },
  nav: { display: 'flex', alignItems: 'center', gap: '1.1rem' }
};

export default Navbar;
