import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Trash2, Edit2 } from 'lucide-react';

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [editingUser, setEditingUser] = useState(null);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editRole, setEditRole] = useState('student');
  const [editDept, setEditDept] = useState('');
  const [editError, setEditError] = useState(null);

  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState('faculty');
  const [newDept, setNewDept] = useState('');
  const [createError, setCreateError] = useState(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/users');
      if (response.success) {
        setUsers(response.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch users list');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user? All associate records will remain but access will be revoked.')) return;
    try {
      const response = await api.delete(`/admin/users/${id}`);
      if (response.success) {
        fetchUsers();
      }
    } catch (err) {
      setError(err.message || 'Failed to delete user');
    }
  };

  const handleStartEdit = (user) => {
    setEditingUser(user._id);
    setEditName(user.name);
    setEditEmail(user.email);
    setEditRole(user.role);
    setEditDept(user.department || '');
    setEditError(null);
  };

  const handleCancelEdit = () => {
    setEditingUser(null);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const response = await api.put(`/admin/users/${editingUser}`, {
        name: editName,
        email: editEmail,
        role: editRole,
        department: editDept
      });

      if (response.success) {
        setEditingUser(null);
        fetchUsers();
      }
    } catch (err) {
      setEditError(err.message || 'Failed to update user');
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreateError(null);
    try {
      const response = await api.post('/admin/users', {
        name: newName,
        email: newEmail,
        password: newPassword,
        role: newRole,
        department: newDept
      });
      if (response.success) {
        setNewName('');
        setNewEmail('');
        setNewPassword('');
        setNewDept('');
        fetchUsers();
      }
    } catch (err) {
      setCreateError(err.message || 'Failed to create user');
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading user list...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1>Staff registry</h1>
        <p style={{ color: 'var(--text-muted)' }}>Issue faculty and admin seats. Public signup is students only.</p>
      </div>

      {error && <div className="error-banner">{error}</div>}

      <div className="card mb-6">
        <h3 style={{ fontSize: '1rem', marginBottom: '0.75rem' }}>Issue a seat</h3>
        {createError && <div className="error-banner">{createError}</div>}
        <form onSubmit={handleCreate} style={styles.formGrid}>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Name</label>
            <input className="form-control" value={newName} onChange={(e) => setNewName(e.target.value)} required />
          </div>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Email</label>
            <input type="email" className="form-control" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} required />
          </div>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Temp password</label>
            <input type="text" className="form-control" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} minLength={6} required />
          </div>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Role</label>
            <select className="form-control" value={newRole} onChange={(e) => setNewRole(e.target.value)}>
              <option value="faculty">Faculty</option>
              <option value="admin">Admin</option>
              <option value="student">Student</option>
            </select>
          </div>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Department</label>
            <input className="form-control" value={newDept} onChange={(e) => setNewDept(e.target.value)} />
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <button type="submit" className="btn btn-primary">Create</button>
          </div>
        </form>
      </div>

      {editingUser && (
        <div className="card mb-6">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
            <Edit2 size={18} style={{ color: 'var(--primary)' }} />
            <h3 style={{ fontSize: '1rem', margin: 0 }}>Edit User Details</h3>
          </div>

          {editError && <div className="error-banner">{editError}</div>}

          <form onSubmit={handleUpdate} style={styles.formGrid}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" style={{ fontSize: '0.8rem' }}>Name</label>
              <input 
                type="text" 
                className="form-control" 
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                required
              />
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" style={{ fontSize: '0.8rem' }}>Email</label>
              <input 
                type="email" 
                className="form-control" 
                value={editEmail}
                onChange={(e) => setEditEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" style={{ fontSize: '0.8rem' }}>Role</label>
              <select 
                className="form-control"
                value={editRole}
                onChange={(e) => setEditRole(e.target.value)}
                required
              >
                <option value="student">Student</option>
                <option value="faculty">Faculty</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" style={{ fontSize: '0.8rem' }}>Department</label>
              <input 
                type="text" 
                className="form-control" 
                value={editDept}
                onChange={(e) => setEditDept(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-end', height: '38px', gridColumn: 'span 2' }}>
              <button type="submit" className="btn btn-primary" style={{ flex: 1, padding: '0.5rem' }}>
                Save Changes
              </button>
              <button type="button" onClick={handleCancelEdit} className="btn btn-secondary" style={{ flex: 1, padding: '0.5rem' }}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {users.length === 0 ? (
        <div className="empty-state">
          <p>No accounts.</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Department</th>
                <th>Registered Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u._id}>
                  <td style={{ fontWeight: 600 }}>{u.name}</td>
                  <td>{u.email}</td>
                  <td>
                    <span className={`badge badge-${u.role === 'admin' ? 'reviewed' : u.role === 'faculty' ? 'pending' : 'approved'}`} style={{ fontSize: '0.7rem' }}>
                      {u.role}
                    </span>
                  </td>
                  <td>{u.department || 'N/A'}</td>
                  <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button onClick={() => handleStartEdit(u)} className="btn btn-secondary" style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Edit2 size={12} />
                        <span>Edit</span>
                      </button>
                      <button onClick={() => handleDelete(u._id)} className="btn btn-danger" style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Trash2 size={12} />
                        <span>Delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

const styles = {
  formGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1rem',
  }
};

export default ManageUsers;
