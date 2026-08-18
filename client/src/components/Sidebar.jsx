import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  FolderPlus, 
  Users, 
  UserCircle
} from 'lucide-react';

const Sidebar = () => {
  const { user } = useContext(AuthContext);

  if (!user) return null;

  return (
    <aside style={styles.sidebar}>
      <ul style={styles.navMenu}>
        <li>
          <NavLink 
            to="/" 
            style={({ isActive }) => ({
              ...styles.navLink,
              ...(isActive ? styles.navLinkActive : {})
            })}
          >
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </NavLink>
        </li>
        


        {user.role === 'admin' && (
          <li>
            <NavLink 
              to="/users" 
              style={({ isActive }) => ({
                ...styles.navLink,
                ...(isActive ? styles.navLinkActive : {})
              })}
            >
              <Users size={20} />
              <span>Manage Users</span>
            </NavLink>
          </li>
        )}

        <li>
          <NavLink 
            to="/profile" 
            style={({ isActive }) => ({
              ...styles.navLink,
              ...(isActive ? styles.navLinkActive : {})
            })}
          >
            <UserCircle size={20} />
            <span>Profile</span>
          </NavLink>
        </li>
      </ul>
    </aside>
  );
};

const styles = {
  sidebar: {
    width: '240px',
    backgroundColor: 'var(--bg-sidebar)',
    borderRight: '1px solid var(--border-color)',
    padding: '2rem 1rem',
    minHeight: 'calc(100vh - 64px)',
  },
  navMenu: {
    listStyle: 'none',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  navLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.75rem 1rem',
    borderRadius: 'var(--radius-sm)',
    color: 'var(--text-muted)',
    fontSize: '0.95rem',
    fontWeight: 500,
    transition: 'var(--transition)',
    textDecoration: 'none',
  },
  navLinkActive: {
    backgroundColor: 'var(--bg-hover)',
    color: 'var(--primary)',
    borderLeft: '3px solid var(--primary)',
    paddingLeft: 'calc(1rem - 3px)',
  }
};

export default Sidebar;
