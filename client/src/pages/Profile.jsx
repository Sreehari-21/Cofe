import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { User, Mail, Award, Landmark } from 'lucide-react';

const Profile = () => {
  const { user } = useContext(AuthContext);

  if (!user) return null;

  return (
    <div style={{ maxWidth: '480px', margin: '0 auto' }}>
      <div className="mb-6">
        <h1>Identity card</h1>
        <p style={{ color: 'var(--text-muted)' }}>Account configuration details.</p>
      </div>

      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', alignItems: 'center', textAlign: 'center', padding: '2rem 1.5rem' }}>
        <div style={{ 
          width: '80px', 
          height: '80px', 
          borderRadius: '50%', 
          backgroundColor: 'var(--primary-glow)', 
          color: 'var(--primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <User size={40} />
        </div>

        <div>
          <h2 style={{ fontSize: '1.35rem', marginBottom: '0.25rem' }}>{user.name}</h2>
          <span className={`badge badge-${user.role === 'admin' ? 'reviewed' : user.role === 'faculty' ? 'pending' : 'approved'}`} style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem' }}>
            {user.role}
          </span>
        </div>

        <div style={{ width: '100%', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', textAlign: 'left' }}>
          <div style={styles.profileItem}>
            <Mail size={18} style={{ color: 'var(--text-muted)' }} />
            <div>
              <div style={styles.profileLabel}>Email Address</div>
              <div style={styles.profileVal}>{user.email}</div>
            </div>
          </div>

          {(user.role === 'student' || user.role === 'faculty') && (
            <div style={styles.profileItem}>
              <Landmark size={18} style={{ color: 'var(--text-muted)' }} />
              <div>
                <div style={styles.profileLabel}>Department / School</div>
                <div style={styles.profileVal}>{user.department || 'N/A'}</div>
              </div>
            </div>
          )}

          <div style={styles.profileItem}>
            <Award size={18} style={{ color: 'var(--text-muted)' }} />
            <div>
              <div style={styles.profileLabel}>Access Privileges</div>
              <div style={styles.profileVal}>
                {user.role === 'admin' 
                  ? 'System Administration, Project Management, User management' 
                  : user.role === 'faculty'
                    ? 'Evaluations & Grading, Submission Reviews'
                    : 'Create assignments, Upload deliverables, View feedback'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  profileItem: {
    display: 'flex',
    gap: '0.75rem',
    alignItems: 'center',
  },
  profileLabel: {
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
    fontWeight: 500,
  },
  profileVal: {
    fontSize: '0.95rem',
    fontWeight: 600,
    marginTop: '0.1rem',
  }
};

export default Profile;
