import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => (
  <div className="empty-state" style={{ margin: '4rem auto', maxWidth: 480 }}>
    <p className="display" style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Page not in this dossier</p>
    <p>That route does not exist.</p>
    <Link to="/" className="btn btn-primary" style={{ marginTop: '1rem' }}>Back to desk</Link>
  </div>
);

export default NotFound;
