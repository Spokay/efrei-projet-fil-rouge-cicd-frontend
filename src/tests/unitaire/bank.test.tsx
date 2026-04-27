import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';
import UserCard from '../../components/UserCard';

describe('Bank Component', () => {
  it('should display the correct bank value from the database', () => {
    const mockUser = {
      id: 1,
      pseudo: 'Test User',
      email: 'testuser@example.com',
      bank: 5000,
      victoryStats: 10,
    };

    render(
      <MemoryRouter>
        <UserCard user={mockUser} />
      </MemoryRouter>
    );

    const bankElement = screen.getByTestId('user-bank');
    expect(bankElement).toHaveTextContent('Bank: 5000');
  });

  it('should display an error message if there is an error', () => {
    const mockError = 'Erreur lors de la récupération de la banque';

    render(
      <MemoryRouter>
        <UserCard
          user={{
            id: 1,
            pseudo: 'Test User',
            email: 'testuser@example.com',
            bank: 5000,
            victoryStats: 10,
          }}
          error={mockError}
        />
      </MemoryRouter>
    );

    const errorElement = screen.getByTestId('user-error');
    expect(errorElement).toHaveTextContent(mockError);
  });
});