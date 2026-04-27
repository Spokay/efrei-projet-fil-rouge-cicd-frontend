import React, { useState } from 'react';
import './../styles/Login.css';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../services/api';

const Register: React.FC = () => {
  const [pseudo, setPseudo] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_BASE_URL}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ pseudo, email, password }),
      });

      if (!response.ok) {
        throw new Error('Inscription échouée');
      }

      setSuccess('Inscription réussie !');
      setTimeout(() => navigate('/login'), 1500);
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    
    <div className="login-container">
      <div className="login-box">
        <h2 className="login-title">Inscription</h2>
        <form onSubmit={handleRegister} className="login-form">
          <div className="form-group">
            <label htmlFor="pseudo">Pseudo</label>
            <input
              id="pseudo"
              type="text"
              placeholder="Entrer votre pseudo"
              value={pseudo}
              onChange={(e) => setPseudo(e.target.value)}
              className="form-input"
            />
          </div>

        <div className="form-group">
            <label htmlFor="email">Email</label>
                <input
                id="email"
                type="email"
                placeholder="Entrer votre email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-input"
                />
        </div>

          <div className="form-group">
            <label htmlFor="password">Mot de passe</label>
            <input
              id="password"
              type="password"
              placeholder="Entrer votre mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-input"
            />
          </div>
          <button type="submit" className="login-button">S'inscrire</button>
        </form>
        {success && <p className="success-message">{success}</p>}
        {error && <p className="error-message">{error}</p>}
      </div>
    </div>
  );
};

export default Register;