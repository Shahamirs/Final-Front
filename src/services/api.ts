import axios from 'axios';
import type { AxiosResponse } from 'axios';
import type { User } from '../types/user';
import type { Message } from '../types/message';
import type { Event } from '../types/event';

// Type for user data in Firebase (without id, as id is the key in the database)
type UserData = Omit<User, 'id'>;
// Type for message data in Firebase
type MessageData = Omit<Message, 'id'>;
// Type for event data in Firebase
type EventData = Omit<Event, 'id'>;

// Type for Firebase response (dictionary or null)
type FirebaseResponse<T> = Record<string, T> | null;

const api = axios.create({
  baseURL: 'https://final-d42fd-default-rtdb.europe-west1.firebasedatabase.app/',
});

export default api;

// Register a user
export const registerUser = async (user: Omit<User, 'id'> & { password: string }): Promise<User> => {
  const id = Math.random().toString(36).substr(2, 9);
  const userData: UserData = {
    email: user.email,
    name: user.name,
    interests: user.interests,
    password: user.password,
  };
  await api.put(`/users/${id}.json`, userData);
  return { id, ...userData };
};

// Login a user
export const loginUser = async (email: string): Promise<User> => {
  const response: AxiosResponse<FirebaseResponse<UserData>> = await api.get('/users.json');
  if (!response.data) throw new Error('No users found');
  const users: User[] = Object.entries(response.data).map(([id, userData]: [string, UserData]) => ({
    id,
    ...userData,
  }));
  const user = users.find((u) => u.email === email);
  if (!user) throw new Error('User not found');
  return user;
};

// Update user data
export const updateUser = async (userId: string, updatedData: Partial<UserData>): Promise<void> => {
  await api.patch(`/users/${userId}.json`, updatedData);
};

// Get all users
export const getUsers = async (): Promise<User[]> => {
  const response: AxiosResponse<FirebaseResponse<UserData>> = await api.get('/users.json');
  if (!response.data) return [];
  return Object.entries(response.data).map(([id, userData]: [string, UserData]) => ({
    id,
    ...userData,
  }));
};

// Get user by ID
export const getUserById = async (userId: string): Promise<User> => {
  const response: AxiosResponse<UserData> = await api.get(`/users/${userId}.json`);
  if (!response.data) throw new Error('User not found');
  return { id: userId, ...response.data };
};

// Send a message
export const sendMessage = async (chatId: string, message: MessageData): Promise<void> => {
  await api.post(`/messages/${chatId}.json`, message);
};

// Get messages for a chat
export const getMessages = async (chatId: string): Promise<Message[]> => {
  const response: AxiosResponse<FirebaseResponse<MessageData>> = await api.get(`/messages/${chatId}.json`);
  if (!response.data) return [];
  return Object.entries(response.data).map(([id, messageData]: [string, MessageData]) => ({
    id,
    ...messageData,
  }));
};

// Get IDs of users with whom there are chats
export const getUserChats = async (userId: string): Promise<string[]> => {
  const response: AxiosResponse<FirebaseResponse<Record<string, MessageData>>> = await api.get('/messages.json');
  if (!response.data) return [];
  const userChats: string[] = [];
  for (const chatId in response.data) {
    if (chatId.includes(userId)) {
      const otherUserId = chatId.split('_').find((id) => id !== userId);
      if (otherUserId) userChats.push(otherUserId);
    }
  }
  return userChats;
};

// Create an event
export const createEvent = async (event: EventData): Promise<Event> => {
  const validatedEvent: EventData = {
    ...event,
    participants: event.participants || [],
  };
  const response: AxiosResponse<{ name: string }> = await api.post('/events.json', validatedEvent);
  const id = response.data.name;
  return { id, ...validatedEvent };
};

// Get all events
export const getEvents = async (): Promise<Event[]> => {
  const response: AxiosResponse<FirebaseResponse<EventData>> = await api.get('/events.json');
  if (!response.data) return [];
  return Object.entries(response.data).map(([id, eventData]: [string, EventData]) => ({
    id,
    ...eventData,
    participants: eventData.participants || [],
  }));
};

// Get event by ID
export const getEvent = async (eventId: string): Promise<Event> => {
  const response: AxiosResponse<EventData> = await api.get(`/events/${eventId}.json`);
  if (!response.data) throw new Error('Event not found');
  return {
    id: eventId,
    ...response.data,
    participants: response.data.participants || [],
  };
};

// Update an event
export const updateEvent = async (eventId: string, updatedData: Partial<EventData>): Promise<void> => {
  await api.patch(`/events/${eventId}.json`, updatedData);
};

// Join an event
export const joinEvent = async (eventId: string, userId: string): Promise<void> => {
  const response: AxiosResponse<EventData> = await api.get(`/events/${eventId}.json`);
  if (!response.data) throw new Error('Event not found');
  const event: EventData = response.data;
  const participants = event.participants || [];
  if (!participants.includes(userId)) {
    participants.push(userId);
    await api.patch(`/events/${eventId}.json`, { participants });
  }
};