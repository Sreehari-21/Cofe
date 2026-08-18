import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { LogOut, User as UserIcon, BookOpen } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);

  return (
    <nav style={styles.navbar}>
      <div style={styles.brand}>
        <BookOpen size={24} style={styles.brandIcon} />
        <span style={styles.brandText}>ProjectPortal</span>
      </div>
      
      {user && (
        <div style={styles.userInfo}>
          <div style={styles.profileBadge}>
            <UserIcon size={16} />
            <span>{user.name} ({user.role.toUpperCase()})</span>
          </div>
          <button onClick={logout} style={styles.logoutBtn} title="Logout">
            <LogOut size={18} />
            <span style={styles.logoutText}>Logout</span>
          </button>
        </div>
      )}
    </nav>
  );
};

const styles = {
  navbar: {
    height: '64px',
    backgroundColor: 'var(--bg-sidebar)',
    borderBottom: '1px solid var(--border-color)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 2rem',
    position: 'sticky',
    top: 0,
    zIndex: 100,
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  brandIcon: {
    color: 'var(--primary)',
  },
  brandText: {
    fontSize: '1.25rem',
    fontWeight: '700',
    letterSpacing: '-0.02em',
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '1.5rem',
  },
  profileBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.9rem',
    color: 'var(--text-muted)',
    border: '1px solid var(--border-color)',
    padding: '0.4rem 0.8rem',
    borderRadius: 'var(--radius-sm)',
    backgroundColor: 'var(--bg-main)',
  },
  logoutBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    background: 'none',
    border: 'none',
    color: 'var(--danger)',
    cursor: 'pointer',
    fontSize: '0.9rem',
    padding: '0.4rem',
    transition: 'var(--transition)',
    borderRadius: 'var(--radius-sm)',
  },
  logoutText: {
    fontWeight: 500,
  }
};

export default Navbar;
