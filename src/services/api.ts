import axios from 'axios';
import { User } from '../types/user';
import { Message } from '../types/message';
import { Event } from '../types/event';

const api = axios.create({
  baseURL: 'https://final-d42fd-default-rtdb.europe-west1.firebasedatabase.app/',
});

export default api;

export const registerUser = async (user: Omit<User, 'id'> & { password: string }) => {
  const id = Math.random().toString(36).substr(2, 9); // Генерация случайного ID
  const userData = { email: user.email, name: user.name, interests: user.interests };
  await api.put(`/users/${id}.json`, userData);
  return { id, ...userData };
};

export const loginUser = async (email: string) => {
  const response = await api.get('/users.json');
  const users = Object.entries(response.data).map(([id, user]) => ({ id, ...user }));
  const user = users.find((u) => u.email === email);
  if (!user) throw new Error('User not found');
  return user;
};

export const updateUser = async (userId: string, updatedData: Partial<User>) => {
  await api.patch(`/users/${userId}.json`, updatedData);
};

export const getUsers = async () => {
  const response = await api.get('/users.json');
  return Object.entries(response.data).map(([id, user]) => ({ id, ...user }));
};

export const getUserById = async (userId: string) => {
  const response = await api.get(`/users/${userId}.json`);
  return { id: userId, ...response.data };
};

export const sendMessage = async (chatId: string, message: Omit<Message, 'id'>) => {
  await api.post(`/messages/${chatId}.json`, message);
};

export const getMessages = async (chatId: string) => {
  const response = await api.get(`/messages/${chatId}.json`);
  if (!response.data) return [];
  return Object.entries(response.data).map(([id, message]) => ({ id, ...message }));
};

export const getUserChats = async (userId: string) => {
  const response = await api.get('/messages.json');
  const chats: { [key: string]: Message[] } = response.data;
  const userChats: string[] = [];
  for (const chatId in chats) {
    if (chatId.includes(userId)) {
      const otherUserId = chatId.split('_').find((id) => id !== userId);
      if (otherUserId) userChats.push(otherUserId);
    }
  }
  return userChats;
};

export const createEvent = async (event: Omit<Event, 'id'>) => {
  const response = await api.post('/events.json', event);
  const id = response.data.name;
  return { id, ...event };
};

export const getEvents = async () => {
  const response = await api.get('/events.json');
  if (!response.data) return [];
  return Object.entries(response.data).map(([id, event]) => ({ id, ...event }));
};

export const getEvent = async (eventId: string) => {
  const response = await api.get(`/events/${eventId}.json`);
  return { id: eventId, ...response.data };
};

export const updateEvent = async (eventId: string, updatedData: Partial<Event>) => {
  await api.patch(`/events/${eventId}.json`, updatedData);
};

export const joinEvent = async (eventId: string, userId: string) => {
  const event = await api.get(`/events/${eventId}.json`).then((res) => res.data);
  const participants = event.participants || [];
  if (!participants.includes(userId)) {
    participants.push(userId);
    await api.patch(`/events/${eventId}.json`, { participants });
  }
};