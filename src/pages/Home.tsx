import React from 'react';
import './../styles/Home.css';
import { useNavigate } from 'react-router-dom';
import vegasBaby from '../assets/images/vegas-baby.gif';
import tapinade from '../assets/images/Bernard-Tapis.gif';
import pokerApp from '../assets/images/POKER-APP.png';

const Home: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="home-container">
      <h1>Bienvenue sur...</h1>
      <div className="home-content ">
        <div className="bernard">
          <img className="wordart" src={tapinade} alt="Bernard, Tapis !" />
          <img className="poker-app" src={pokerApp} alt="Poker App" />
        </div>
        <img src={vegasBaby} alt="Vegas dans toute sa splendeur" />
      </div>
      <button className="end-game-button" onClick={() => navigate('/tables')}>
        Jouer !!!
      </button>
    </div>
  );
};

export default Home;
