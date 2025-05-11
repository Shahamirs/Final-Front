import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { TextField, Button, Typography, List, ListItem, ListItemText } from '@mui/material';
import { getEvent, updateEvent, getUsers, joinEvent } from '../services/api';
import { useAuthStore } from '../store/authStore';
import { Event as EventType } from '../types/event';
import { User } from '../types/user';

interface EventForm {
  title: string;
  description: string;
  date: string;
}

export const Event = () => {
  const { id } = useParams<{ id: string }>();
  const currentUser = useAuthStore((state) => state.user);
  const [event, setEvent] = useState<EventType | null>(null);
  const [participants, setParticipants] = useState<User[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const { register, handleSubmit, setValue } = useForm<EventForm>();

  useEffect(() => {
    const fetchEvent = async () => {
      if (!id) return;
      const evt = await getEvent(id);
      setEvent(evt);
      const allUsers = await getUsers();
      const participantUsers = allUsers.filter((user) => evt.participants.includes(user.id));
      setParticipants(participantUsers);
      setValue('title', evt.title);
      setValue('description', evt.description);
      setValue('date', evt.date);
    };
    fetchEvent();
  }, [id, setValue]);

  const onSubmit = async (data: EventForm) => {
    if (!event || !currentUser || event.creatorId !== currentUser.id) return;
    const updatedEvent = {
      title: data.title,
      description: data.description,
      date: data.date,
    };
    await updateEvent(event.id, updatedEvent);
    setEvent({ ...event, ...updatedEvent });
    setIsEditing(false);
  };

  const handleJoin = async () => {
    if (!event || !currentUser || event.participants.includes(currentUser.id)) return;
    await joinEvent(event.id, currentUser.id);
    const allUsers = await getUsers();
    const participantUsers = allUsers.filter((user) => event.participants.includes(user.id));
    setParticipants(participantUsers);
    setEvent({ ...event, participants: [...event.participants, currentUser.id] });
  };

  if (!event) return <div>Loading...</div>;

  const isCreator = currentUser?.id === event.creatorId;
  const isParticipant = currentUser && event.participants.includes(currentUser.id);

  return (
    <div style={{ padding: '20px' }}>
      <Typography variant="h4">{event.title}</Typography>
      <Typography>Description: {event.description}</Typography>
      <Typography>Date: {event.date}</Typography>
      <Typography>Participants: {participants.length}</Typography>

      {isCreator && (
        <Button onClick={() => setIsEditing(true)} variant="contained" style={{ marginTop: '20px' }}>
          Edit Event
        </Button>
      )}
      {!isCreator && !isParticipant && (
        <Button onClick={handleJoin} variant="contained" style={{ marginTop: '20px' }}>
          Join Event
        </Button>
      )}

      {isEditing && isCreator && (
        <form onSubmit={handleSubmit(onSubmit)} style={{ marginTop: '20px' }}>
          <TextField {...register('title')} label="Title" fullWidth margin="normal" />
          <TextField {...register('description')} label="Description" fullWidth margin="normal" />
          <TextField {...register('date')} type="date" fullWidth margin="normal" />
          <Button type="submit" variant="contained">Save</Button>
          <Button onClick={() => setIsEditing(false)} variant="outlined" style={{ marginLeft: '10px' }}>
            Cancel
          </Button>
        </form>
      )}

      <Typography variant="h5" style={{ marginTop: '20px' }}>Participants</Typography>
      <List>
        {participants.map((participant) => (
          <ListItem key={participant.id}>
            <ListItemText primary={participant.name} />
          </ListItem>
        ))}
      </List>
    </div>
  );
};