import React, { useEffect, useState } from 'react';
import { API_BASE_URL } from '../services/api';
import UserCard from '../components/UserCard';
import { User } from '../types';

const UserPage: React.FC = () => {
  const token = localStorage.getItem('token');
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
   

    fetch(`${API_BASE_URL}/users/profile`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  })
      .then((response) => response.json())
      .then((data) => {
        setUser(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching user:', error);
        setLoading(false);
      });
  }, [token]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <div>user inconnu</div>;
  }

  return (
    <div>
      <h1>Profile de {user.pseudo}</h1>
      <UserCard user={user} />
    </div>
  );
};


export default UserPage;

