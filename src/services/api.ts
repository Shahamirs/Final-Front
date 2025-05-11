import axios from 'axios';

const api = axios.create({
  baseURL: 'https://final-d42fd-default-rtdb.europe-west1.firebasedatabase.app/',
});

export default api;

// Тип пользователя
export interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  interests: string[];
}

// Регистрация пользователя
export const registerUser = async (user: Omit<User, 'id'>) => {
  const response = await api.post('/users.json', user);
  const id = response.data.name; // Firebase возвращает ID в поле name
  return { id, ...user };
};

// Вход пользователя
export const loginUser = async (email: string, password: string) => {
  const response = await api.get('/users.json');
  const users = response.data;
  for (const key in users) {
    if (users[key].email === email && users[key].password === password) {
      return { id: key, ...users[key] };
    }
  }
  throw new Error('Invalid credentials');
};

// Получение списка пользователей
export const getUsers = async () => {
  const response = await api.get('/users.json');
  return Object.entries(response.data).map(([id, user]) => ({ id, ...user }));
};

export const sendMessage = async (chatId: string, message: Omit<Message, 'id'>) => {
  await api.post(`/messages/${chatId}.json`, message);
};

export const getMessages = async (chatId: string) => {
  const response = await api.get(`/messages/${chatId}.json`);
  if (!response.data) return [];
  return Object.entries(response.data).map(([id, message]) => ({ id, ...message }));
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

export const joinEvent = async (eventId: string, userId: string) => {
  const event = await api.get(`/events/${eventId}.json`).then((res) => res.data);
  const participants = event.participants || [];
  if (!participants.includes(userId)) {
    participants.push(userId);
    await api.patch(`/events/${eventId}.json`, { participants });
  }
};

export const updateUser = async (userId: string, updatedData: Partial<User>) => {
  await api.patch(`/users/${userId}.json`, updatedData);
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

export const getEvent = async (eventId: string) => {
  const response = await api.get(`/events/${eventId}.json`);
  return { id: eventId, ...response.data };
};

export const updateEvent = async (eventId: string, updatedData: Partial<Event>) => {
  await api.patch(`/events/${eventId}.json`, updatedData);
};