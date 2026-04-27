import React from 'react';
import '../styles/UserCard.css';
import { User } from '../types';

const UserCard: React.FC<{ user: User; error?: string }> = ({ user, error }) => {
  if (error) {
    return (
      <div className="user-card error">
        <p data-testid="user-error" style={{ color: 'red' }}>
          <strong>Erreur:</strong> {error}
        </p>
      </div>
    );
  }

  return (
    <div
      className="user-card"
      style={{
        backgroundImage: `url(${process.env.PUBLIC_URL}/assets/images/tache-jaune.png)`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <h2>{user.pseudo}</h2>
      <p><strong>Email:</strong> {user.email}</p>
      <p data-testid="user-bank"><strong>Bank:</strong> {user.bank}</p>
      <p><strong>Victory Stats:</strong> {user.victoryStats}</p>
    </div>
  );
};

export default UserCard;