import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Typography, Button, List, ListItem, ListItemText, TextField } from '@mui/material';
import { useForm } from 'react-hook-form';
import { getEvent, joinEvent, getUsers, updateEvent } from '../services/api';
import { useAuthStore } from '../store/authStore';
import type { Event } from '../types/event';
import type { User } from '../types/user';

interface EventForm {
  title: string;
  description: string;
  date: string;
}

export const EventPage = () => {
  const { id } = useParams<{ id: string }>();
  const currentUser = useAuthStore((state) => state.user);
  const [event, setEvent] = useState<Event | null>(null);
  const [participants, setParticipants] = useState<User[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const { register, handleSubmit, reset } = useForm<EventForm>();

  const fetchEvent = async () => {
    if (!id) {
      setError('Event ID is missing');
      return;
    }
    try {
      const evt = await getEvent(id);
      const validatedEvent: Event = {
        ...evt,
        participants: evt.participants || [],
      };
      const users = await getUsers();
      const participantUsers = users.filter((user) =>
        validatedEvent.participants.includes(user.id)
      );
      setEvent(validatedEvent);
      setParticipants(participantUsers);
      // Reset form with current event data
      reset({
        title: validatedEvent.title,
        description: validatedEvent.description,
        date: validatedEvent.date,
      });
      setError(null);
    } catch (err) {
      setError('Failed to load event');
      console.error(err);
    }
  };

  useEffect(() => {
    fetchEvent();
  }, [id]);

  const handleJoinEvent = async () => {
    if (!id || !currentUser) {
      setError('You must be logged in to join an event');
      return;
    }
    try {
      await joinEvent(id, currentUser.id);
      await fetchEvent();
    } catch (err) {
      setError('Failed to join event');
      console.error(err);
    }
  };

  const handleEditEvent = async (data: EventForm) => {
    if (!id || !currentUser || !event) {
      setError('Cannot edit event');
      return;
    }
    if (currentUser.id !== event.creatorId) {
      setError('You are not authorized to edit this event');
      return;
    }
    try {
      await updateEvent(id, {
        title: data.title,
        description: data.description,
        date: data.date,
      });
      setIsEditing(false);
      await fetchEvent();
    } catch (err) {
      setError('Failed to update event');
      console.error(err);
    }
  };

  if (error) {
    return <Typography color="error">{error}</Typography>;
  }

  if (!event) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <Box sx={{ py: { xs: 2, sm: 3 } }}>
      {isEditing ? (
        <Box
          component="form"
          onSubmit={handleSubmit(handleEditEvent)}
          sx={{ mb: 2, display: 'flex', flexDirection: 'column', gap: 2 }}
        >
          <Typography variant="h5" sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' }, mb: 1 }}>
            Edit Event
          </Typography>
          <TextField
            {...register('title')}
            label="Title"
            fullWidth
            required
            defaultValue={event.title}
          />
          <TextField
            {...register('description')}
            label="Description"
            fullWidth
            multiline
            rows={3}
            required
            defaultValue={event.description}
          />
          <TextField
            {...register('date')}
            type="date"
            fullWidth
            required
            defaultValue={event.date}
          />
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              type="submit"
              variant="contained"
              sx={{ width: { xs: '100%', sm: 'auto' } }}
            >
              Save
            </Button>
            <Button
              onClick={() => setIsEditing(false)}
              variant="outlined"
              sx={{ width: { xs: '100%', sm: 'auto' } }}
            >
              Cancel
            </Button>
          </Box>
        </Box>
      ) : (
        <>
          <Typography variant="h4" sx={{ fontSize: { xs: '1.5rem', sm: '2rem' }, mb: 2 }}>
            {event.title}
          </Typography>
          <Typography variant="body1" sx={{ mb: 1 }}>
            {event.description}
          </Typography>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Date: {event.date}
          </Typography>
          <Typography variant="h6" sx={{ mb: 1 }}>
            Participants
          </Typography>
          <List>
            {participants.map((user) => (
              <ListItem key={user.id}>
                <ListItemText primary={user.name} />
              </ListItem>
            ))}
          </List>
          <Box sx={{ display: 'flex', gap: 1, mt: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
            {currentUser?.id !== event.creatorId &&
              !event.participants.includes(currentUser?.id || '') && (
                <Button
                  onClick={handleJoinEvent}
                  variant="contained"
                  sx={{ width: { xs: '100%', sm: 'auto' } }}
                >
                  Join Event
                </Button>
              )}
            {currentUser?.id === event.creatorId && (
              <Button
                onClick={() => setIsEditing(true)}
                variant="contained"
                sx={{ width: { xs: '100%', sm: 'auto' } }}
              >
                Edit Event
              </Button>
            )}
          </Box>
        </>
      )}
    </Box>
  );
};