import React, { useState } from 'react';
import './../styles/Nav.css';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/images/logo.png';
import logo2 from '../assets/images/bernard-tapis.png';

const Nav: React.FC = () => {
  const isAuthenticated = !!localStorage.getItem('token');
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  return (
    <nav className="nav-container">
      <a href="/" className="logo-container">
        <img className='app-logo' src={logo} alt="Poker app logo" />
      </a>
      <a href="/" className="logo-container">
        <img className='app-logo-2' src={logo2} alt="Poker app logo typo" />
      </a>

      <div className="hamburger-menu" onClick={toggleMenu}>
        <div className={`hamburger-icon ${menuOpen ? 'open' : ''}`}>
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>

      <div className={`nav-links ${menuOpen ? 'active' : ''}`}>
        <button className="nav-button" onClick={() => navigate('/tables')}>
          Voir les tables
        </button>

        {!isAuthenticated ? (
          <>
            <button className="nav-button" onClick={() => navigate('/login')}>
              Connexion
            </button>
            <button className="nav-button" onClick={() => navigate('/register')}>
              Inscription
            </button>
          </>
        ) : (
          <>
            <button className="nav-button" onClick={() => navigate('/profile')}>
              Profil
            </button>
            <button className="nav-button logout-button" onClick={handleLogout}>
              Déconnexion
            </button>
          </>
        )}
      </div>
    </nav>
  );
};

export default Nav;