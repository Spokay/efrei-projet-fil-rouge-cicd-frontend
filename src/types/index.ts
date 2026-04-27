export interface User {
  id: number;
  pseudo: string;
  email: string;
  bank: number;
  victoryStats: number;
}

export interface Card {
  suit: string;
  value: string;
}

export interface Player {
  name: string;
  chips: number;
  isHuman: boolean;
  isCurrentPlayer: boolean;
  hasFolded: boolean;
  currentBet: number;
  hand: Card[];
}

export type GameLog = string | { message: string; timestamp?: string };

export interface Table {
  id: number;
  name: string;
  status: string;
  round: number;
  turn: number;
  currentBlind: number;
  smallBlind: number;
  bigBlind: number;
  currentBet: number;
  pot: number;
  dealerPosition: number;
  river: Card[];
  players: Player[];
  maxPlayers: number;
  minPlayers: number;
  gameLog: GameLog[];
}

export interface ApiResponse<T> {
  data: T;
  message: string;
  status: number;
}
