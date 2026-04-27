import React from 'react';
import './../styles/EndGame.css';
import { useNavigate } from 'react-router-dom';
import cutieCat from '../assets/images/cutie-cat.gif';

const EndGame: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="end-game-wrapper">
      <div className="money-overlay"></div>
      <div className="end-game-container">
        <h1 className="end-game-title">Partie terminée</h1>
        <p className="end-game-message">Merci d'avoir joué!</p>
        <img src={ cutieCat } alt="Chat trop mignon qui brille" />
        <div className="end-game-actions">
          <button className="end-game-button" onClick={() => navigate('/tables')}>
            Jouer !!!
          </button>
          <button className="end-game-button" onClick={() => navigate('/')}>
            Revenir à l'accueil
          </button>
        </div>
      </div>
    </div>
  );
};

export default EndGame;
