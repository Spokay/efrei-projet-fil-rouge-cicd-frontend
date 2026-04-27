import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import './../styles/Game.css';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../services/api';
import { Table } from '../types';

const GamePage: React.FC = () => {
  const { tableId } = useParams<{ tableId: string }>();
  const [table, setTable] = useState<Table | null>(null);
  const [startingGame, setStartingGame] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [raiseAmount, setRaiseAmount] = useState<number>(0);
  const [processingAction, setProcessingAction] = useState<boolean>(false);
  const navigate = useNavigate();
  const [actionCounter, setActionCounter] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
 const showError = (message: string) => {
    setErrorMessage(message);
    setTimeout(() => setErrorMessage(null), 5000);
  };

  useEffect(() => {
    if (actionCounter >= 4) {
      navigate('/endGame');
    }
  }, [actionCounter, navigate]);

  // Wrap your handleAction to increment the counter
  const handleActionWithCount = async (action: string, amount?: number) => {
    setActionCounter((prev) => prev + 1);
    await handleAction(action, amount);
  };

  useEffect(() => {
    let isMounted = true;

    const fetchTable = async () => {
      if (!tableId) {
        if (isMounted) {
          setError('ID de table non spécifié');
          setLoading(false);
        }
        return;
      }

      try {
        if (isMounted) setLoading(true);
        const response = await fetch(`${API_BASE_URL}/tables/${tableId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });

        if (!response.ok) {
          throw new Error('Impossible de récupérer les détails de la table');
        }

        const data = await response.json();
        if (isMounted) setTable(data);
      } catch (err: any) {
        if (isMounted) setError(err.message);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    void fetchTable();


    return () => {
      isMounted = false;
    };
  }, [tableId]);


  const handleStartGame = async (tableId: number) => {
    let isMounted = true;

    try {
      setStartingGame(true);
      const token = localStorage.getItem('token');

      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/tables/${tableId}/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Impossible de démarrer la partie');
      }

      const updatedTableResponse = await fetch(`${API_BASE_URL}/tables/${tableId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });

      if (updatedTableResponse.ok && isMounted) {
        const updatedData = await updatedTableResponse.json();
        setTable(updatedData);
      }    } catch (err: any) {
      if (isMounted) {
        setError(err.message);
        showError(err.message);
      }
    } finally {
      if (isMounted) {
        setStartingGame(false);
      }
    }

    return () => {
      isMounted = false;
    };
  };

  // Fonction pour gérer les actions du joueur (suivre, relancer, se coucher)
  const handleAction = async (action: string, amount?: number) => {
    if (!tableId || !table || processingAction) return;
    
    let isMounted = true;
    setProcessingAction(true);
    
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        navigate('/login');
        return;
      }
      
      const actionData: { action: string; amount?: number } = { action };

      if (action === 'raise' && amount) {
        actionData.amount = amount;
      }
      
      const response = await fetch(`${API_BASE_URL}/tables/${tableId}/action`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(actionData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Impossible d'effectuer cette action`);
      }
      
      // Mettre à jour l'état de la table après l'action
      const updatedTableResponse = await fetch(`${API_BASE_URL}/tables/${tableId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (updatedTableResponse.ok && isMounted) {
        const updatedData = await updatedTableResponse.json();
        setTable(updatedData);
        
        // Si le joueur se couche, rediriger vers la page de fin de partie
        if (action === 'fold' || table.status === 'Fin de partie') {
            if (isMounted) navigate('/endGame');
        }
      }    } catch (err: any) {
      if (isMounted) {
        setError(err.message);
        showError(err.message);
      }
    } finally {
      if (isMounted) {
        setProcessingAction(false);
        setRaiseAmount(0); 
      }
    }
    
    return () => {
      isMounted = false;
    };
  };
  
  // Fonction pour traiter le changement du montant de relance
  const handleRaiseAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value >= 0) {
      setRaiseAmount(value);
    }
  };
  

  //! ici le return !!!!!
  return (    
    <div className="game-container">
      {errorMessage && (
        <div className="error-notification">
          <span className="message">{errorMessage}</span>
          <button className="close-btn" onClick={() => setErrorMessage(null)}>×</button>
        </div>
      )}
      
      {successMessage && (
        <div className="success-notification">
          <span className="message">{successMessage}</span>
          <button className="close-btn" onClick={() => setSuccessMessage(null)}>×</button>
        </div>
      )}
      
      {loading ? (
        <p>Chargement de la partie...</p>
      ) : error ? (
        <p className="error-message">{error}</p>      ) : !table ? (
        <p>Aucune information disponible pour cette table.</p>
      ) : (
        <>
          <div className="table-header container-block">
            <div className="table-info">
              <h3>{table.name}</h3>
              <div className="table-status">
                {table.status === 'En cours' ? (
                  <span className="status-badge active">Partie en cours</span>
                ) : (
                  <span className="status-badge waiting">En attente</span>
                )}
              </div>
            </div>          <div className="table-stats">
              <div className="stat-item">
                <span className="stat-label">Tour:</span>
                <span className="stat-value">{table.turn}/4</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Pot:</span>
                <span className="stat-value pot">{table.pot}€</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Mise:</span>
                <span className="stat-value bet">{table.currentBet}€</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Blindes:</span>
                <span className="stat-value">{table.smallBlind}€ / {table.bigBlind}€</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Joueurs:</span>
                <span className="stat-value">{table.players.length}/{table.maxPlayers}</span>
              </div>
            </div>
          </div>

          <div className="game-main-content">
            <div className="game-left-column">
              <div className="game-log container-block">
                <h4>Avancement de la partie (Tour {table.turn}/4)</h4>
                <ul className="logs">
                  {table.gameLog && table.gameLog.length > 0 ? (
                    table.gameLog.map((log, index) => (
                      <li key={index}>
                        {typeof log === 'string'
                          ? log
                          : log.message
                            ? `${log.timestamp ? new Date(log.timestamp).toLocaleTimeString() + ' - ' : ''}${log.message}`
                            : JSON.stringify(log)
                        }
                      </li>
                    ))
                  ) : (
                    <li>La partie n'a pas encore commencé</li>
                  )}
                </ul>
              </div>
              
              <div className="cards-container">
                <div className="player-cards container-block">
                  <h4>Vos cartes</h4>
                  <div className="cards">
                    {(table.players.find(p => p.isHuman)?.hand?.length ?? 0) > 0 ? (
                      table.players.find(p => p.isHuman)!.hand.map((card, index) => {
                        let suitSymbol = card.suit;
                        if (card.suit === 'Spade') suitSymbol = '♠';
                        else if (card.suit === 'Heart') suitSymbol = '♥';
                        else if (card.suit === 'Diamond') suitSymbol = '♦';
                        else if (card.suit === 'Clover') suitSymbol = '♣';

                        const isRed = suitSymbol === '♥' || suitSymbol === '♦';

                        return (
                          <div className={`card ${isRed ? 'red-card' : 'black-card'}`} key={index}>
                            <span className="card-value">{card.value}</span>
                            <span className="card-suit">{suitSymbol}</span>
                          </div>
                        );
                      })
                    ) : (
                      <div className="no-cards-message">Vos cartes apparaîtront ici</div>
                    )}
                  </div>
                </div>
                
                <div className="river-cards container-block">
                  <h4>Les cartes de la table</h4>
                  <div className="cards">
                    {table.river && table.river.length > 0 ? (
                      table.river.map((card: any, index: number) => {
                        let suitSymbol = card.suit;
                        if (card.suit === 'Spade') suitSymbol = '♠';
                        else if (card.suit === 'Heart') suitSymbol = '♥';                        else if (card.suit === 'Diamond') suitSymbol = '♦';
                        else if (card.suit === 'Club') suitSymbol = '♣';
                        else if (card.suit === 'Clover') suitSymbol = '♣';

                        const isRed = suitSymbol === '♥' || suitSymbol === '♦';

                        return (
                          <div className={`card ${isRed ? 'red-card' : 'black-card'}`} key={index}>
                            <span className="card-value">{card.value}</span>
                            <span className="card-suit">{suitSymbol}</span>
                          </div>
                        );
                      })
                    ) : (
                      <div className="no-cards-message">Les cartes seront révélées pendant la partie</div>
                    )}
                  </div>
                </div>
              </div>
              <div className="game-actions container-block">
                {table.status === 'En cours' ? (
                    <div className="action-buttons">
                      <button
                        className="action-button check"
                        onClick={() => handleActionWithCount('check')}
                        disabled={processingAction || table.currentBet !== 0}
                      >
                        {processingAction ? 'En cours...' : 'Faire parole'}
                      </button>

                      <button
                        className="action-button follow"
                        onClick={() => handleActionWithCount('call')}
                        disabled={processingAction}
                      >
                        {processingAction ? 'En cours...' : `Suivre (${table.currentBet}€)`}
                      </button>

                      <div className="raise-container">
                        <button
                        className="action-button raise"
                          onClick={() => handleActionWithCount('raise', raiseAmount)}
                          disabled={processingAction || raiseAmount < table.currentBet}
                        >
                          {processingAction ? 'En cours...' : 'Relancer'}
                        </button>
                        <input
                          type="number"
                          min={table.currentBet}
                          step={table.smallBlind}
                          value={raiseAmount}
                          onChange={handleRaiseAmountChange}
                          className="raise-amount"
                          placeholder={`Min ${table.currentBet}€`}
                        />
                      </div>

                      <button
                        className="action-button fold"
                        onClick={() => handleActionWithCount('fold')}
                        disabled={processingAction}
                      >
                        {processingAction ? 'En cours...' : 'Se coucher'}
                      </button>
                    </div>
                  ) : (
                    <button
                      className="action-button start"
                      onClick={() => handleStartGame(table.id)}
                      disabled={startingGame}
                    >
                      {startingGame ? 'Démarrage...' : 'Démarrer la partie'}
                    </button>
                )}
              </div>
            </div>
            
            <div className="players-section container-block">
              <h4>Joueurs à la table</h4>
              <div className="players-list">
                {table.players.map((player, index) => (
                  <div 
                    key={index} 
                    className={`player-item ${player.isCurrentPlayer ? 'current-player' : ''} ${player.hasFolded ? 'folded-player' : ''}`}
                  >
                    <div className="player-info">
                      <span className="player-name">{player.name}</span>
                      <span className="player-chips">{player.chips}€</span>
                      
                      <div className="player-roles">
                        {table.dealerPosition === index && (
                          <span className="player-role dealer">Dealer</span>
                        )}
                        {(table.dealerPosition + 1) % table.players.length === index && (
                          <span className="player-role small-blind">Petite Blinde</span>
                        )}
                        {(table.dealerPosition + 2) % table.players.length === index && (
                          <span className="player-role big-blind">Grande Blinde</span>
                        )}
                        {player.isCurrentPlayer && (
                          <span className="player-role current">Tour actuel</span>
                        )}
                      </div>
                      
                      {player.currentBet > 0 && (
                        <span className="player-bet">Mise: {player.currentBet}€</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default GamePage;
