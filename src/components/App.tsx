import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './../styles/App.css';
import Login from './Login';
import Register from './Register';
import UserPage from '../pages/Profile';
import TablesPage from '../pages/Tables';
import GamePage from '../pages/Game';
import Nav from './Nav';
import EndGame from '../pages/EndGame';
import Home from '../pages/Home';

const App: React.FC = () => {
  return (
    <Router>
      <div className="app-container">
        <header>
          <Nav />
        </header>
        <main className="app-main">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/profile" element={<UserPage />} />
            <Route path="/tables" element={<TablesPage />} />
            <Route path="/game/:tableId" element={<GamePage />} />
            <Route path="/endGame" element={<EndGame />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;