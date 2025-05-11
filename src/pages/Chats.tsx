import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Typography, List, ListItem, ListItemText, Button } from '@mui/material';
import { getUserChats, getUsers } from '../services/api';
import { useAuthStore } from '../store/authStore';
import { User } from '../types/user';

export const Chats = () => {
  const currentUser = useAuthStore((state) => state.user);
  const [chatUsers, setChatUsers] = useState<User[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchChats = async () => {
      if (!currentUser) return;
      const chatUserIds = await getUserChats(currentUser.id);
      const allUsers = await getUsers();
      const users = allUsers.filter((user) => chatUserIds.includes(user.id));
      setChatUsers(users);
    };
    fetchChats();
  }, [currentUser]);

  return (
    <div style={{ padding: '20px' }}>
      <Typography variant="h4">Chats</Typography>
      <List>
        {chatUsers.map((user) => (
          <ListItem key={user.id}>
            <ListItemText
              primary={user.name}
              onClick={() => navigate(`/user/${user.id}`)}
              style={{ cursor: 'pointer' }}
            />
            <Button onClick={() => navigate(`/chat/${user.id}`)}>Continue Chat</Button>
          </ListItem>
        ))}
      </List>
    </div>
  );
};