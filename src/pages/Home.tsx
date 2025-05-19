import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Typography, List, ListItem, ListItemText } from '@mui/material';
import { getUsers } from '../services/api';
import { useAuthStore } from '../store/authStore';
import type { User } from '../types/user';

export const Home = () => {
  const currentUser = useAuthStore((state) => state.user);
  const [users, setUsers] = useState<User[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      const allUsers = await getUsers();
      const similarUsers = allUsers.filter(
        (user) =>
          user.id !== currentUser?.id &&
          user.interests.some((interest) => currentUser?.interests.includes(interest))
      );
      setUsers(similarUsers);
    };
    fetchUsers();
  }, [currentUser]);

  return (
    <div style={{ padding: '20px' }}>
      <Typography variant="h4">People with similar interests</Typography>
      <List>
        {users.map((user) => (
          <ListItem key={user.id}>
            <ListItemText
              primary={`${user.name} - ${user.interests.join(', ')}`}
              onClick={() => navigate(`/user/${user.id}`)}
              style={{ cursor: 'pointer' }}
            />
            <Button onClick={() => navigate(`/chat/${user.id}`)}>Chat</Button>
          </ListItem>
        ))}
      </List>
    </div>
  );
};