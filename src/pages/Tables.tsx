import './../styles/Tables.css';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../services/api';
import { Table } from '../types';

const TablesPage: React.FC = () => {
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [joiningTable, setJoiningTable] = useState<boolean>(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTables = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/tables`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Impossible de récupérer les tables');
        }

        const data = await response.json();
        setTables(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTables();
  }, []);

  const handleJoinTable = async (tableId: number) => {
    try {
      setJoiningTable(true);
      const token = localStorage.getItem('token');

      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/tables/${tableId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ action: 'join' })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Impossible de rejoindre la table');
      }
      navigate(`/game/${tableId}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setJoiningTable(false);
    }
  };
  return (
    <div className="tables-container">
      {loading ? (
        <p>Chargement des tables...</p>
      ) : error ? (
        <p className="error-message">{error}</p>
      ) : tables.length === 0 ? (
        <p>Aucune table disponible pour le moment.</p>
      ) : (
        tables.map((table) => (
          <div key={table.id} className="table-card">
            <h3>{table.name}</h3>
            <p>Petite Blind: {table.smallBlind}</p>
            <p>Grosse Blind: {table.bigBlind}</p>
            <p>Joueurs: {table.players.length} / {table.maxPlayers}</p>
            <p>Statut: {table.status}</p>
            <button
              className="join-button"
              onClick={() => handleJoinTable(table.id)}
              disabled={joiningTable}
            >
              {joiningTable ? 'Connexion...' : 'Rejoindre'}
            </button>
          </div>
        ))
      )}
    </div>
  );
};

export default TablesPage;