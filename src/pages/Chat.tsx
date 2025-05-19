import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { TextField, Button, Typography } from '@mui/material';
import { sendMessage, getMessages } from '../services/api';
import { useAuthStore } from '../store/authStore';
import type { Message } from '../types/message';

export const Chat = () => {
  const { userId } = useParams<{ userId: string }>();
  const currentUser = useAuthStore((state) => state.user);
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState('');

  useEffect(() => {
    if (!currentUser || !userId) return;
    const chatId = [currentUser.id, userId].sort().join('_');
    const fetchMessages = async () => {
      const msgs = await getMessages(chatId);
      setMessages(msgs);
    };
    fetchMessages();
    const interval = setInterval(fetchMessages, 5000); // Polling каждые 5 секунд
    return () => clearInterval(interval);
  }, [currentUser, userId]);

  const handleSend = async () => {
    if (!currentUser || !userId || !text) return;
    const chatId = [currentUser.id, userId].sort().join('_');
    const message: Omit<Message, 'id'> = {
      senderId: currentUser.id,
      text,
      timestamp: Date.now(),
    };
    await sendMessage(chatId, message);
    setText('');
    const msgs = await getMessages(chatId);
    setMessages(msgs);
  };

  return (
    <div style={{ padding: '20px' }}>
      <Typography variant="h4">Chat with {userId}</Typography>
      <div>
        {messages.map((msg) => (
          <div key={msg.id}>
            <strong>{msg.senderId === currentUser?.id ? 'You' : 'Other'}:</strong> {msg.text}
          </div>
        ))}
      </div>
      <TextField
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Type a message"
        fullWidth
        margin="normal"
      />
      <Button onClick={handleSend} variant="contained">Send</Button>
    </div>
  );
};