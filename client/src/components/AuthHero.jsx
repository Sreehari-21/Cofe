import React from 'react';

const words = ['study-cofe', 'integrated'];

const AuthHero = () => (
  <div className="auth-hero-block">
    <h1 className="auth-hero">
      {words.map((word) => (
        <span key={word} className="auth-hero-word">
          {word}
        </span>
      ))}
    </h1>
    <p className="auth-hero-sub">Cofe Dossier</p>
  </div>
);

export default AuthHero;
