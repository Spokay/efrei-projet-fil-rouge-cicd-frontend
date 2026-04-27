import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Login from '../../components/Login';
import { jest } from '@jest/globals';
import { MemoryRouter } from 'react-router-dom';

beforeAll(() => {
  process.env.REACT_APP_API_BASE_URL = 'http://localhost:3000';
});

global.fetch = jest.fn() as unknown as jest.Mock;

describe('Login Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    window.alert = jest.fn();
  });

  it('should log in the user successfully with valid credentials', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ token: 'mocked-jwt-token' }),
    });

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText(/Pseudo/i), { target: { value: 'lallie' } });
    fireEvent.change(screen.getByLabelText(/Mot de passe/i), { target: { value: 'test1234' } });

    fireEvent.click(screen.getByText(/Connexion/i));

  const successMessage = await screen.findByText('Connexion réussie !');
  expect(successMessage).toBeInTheDocument();

    expect(fetch).toHaveBeenCalledWith(`${process.env.REACT_APP_API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
       body: JSON.stringify({
        pseudo: 'lallie', 
        password: 'test1234',
      }),
    });
  });

  it('should display an error message with invalid credentials', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: async () => ({ message: 'Identifiants invalides' }),
    });

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );


    fireEvent.change(screen.getByLabelText(/Pseudo/i), { target: { value: 'wronglolilol' } });
    fireEvent.change(screen.getByLabelText(/Mot de passe/i), { target: { value: 'wrongpassword' } });

    fireEvent.click(screen.getByText(/Connexion/i));

    const errorMessage = await screen.findByText('Identifiants invalides');
    expect(errorMessage).toBeInTheDocument();
  });
});