import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Typography } from '@mui/material';
import { getUserById } from '../services/api';
import { User } from '../types/user';

export const UserProfile = () => {
  const { userId } = useParams<{ userId: string }>();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      if (userId) {
        const userData = await getUserById(userId);
        setUser(userData);
      }
    };
    fetchUser();
  }, [userId]);

  if (!user) return <div>Loading...</div>;

  return (
    <div style={{ padding: '20px' }}>
      <Typography variant="h4">{user.name}'s Profile</Typography>
      <Typography>Name: {user.name}</Typography>
      <Typography>Interests: {user.interests.join(', ')}</Typography>
    </div>
  );
};