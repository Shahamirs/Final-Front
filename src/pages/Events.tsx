import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Button, Typography, TextField, List, ListItem, ListItemText, Box } from '@mui/material';
import { getEvents, createEvent, joinEvent } from '../services/api';
import { useAuthStore } from '../store/authStore';
import type { Event } from '../types/event';

interface EventForm {
  title: string;
  description: string;
  date: string;
}

export const Events = () => {
  const currentUser = useAuthStore((state) => state.user);
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateEvent, setShowCreateEvent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { register, handleSubmit } = useForm<EventForm>();

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const evts = await getEvents();
        // Validate event data
        const validatedEvents = evts.map((evt) => ({
          ...evt,
          participants: evt.participants || [],
        }));
        setEvents(validatedEvents);
        setFilteredEvents(validatedEvents);
        setError(null);
      } catch (err) {
        setError('Failed to load events');
        console.error(err);
      }
    };
    fetchEvents();
  }, []);

  useEffect(() => {
    const filtered = events.filter(
      (event) =>
        event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredEvents(filtered);
  }, [searchQuery, events]);

  const onCreateEvent = async (data: EventForm) => {
    if (!currentUser) {
      setError('You must be logged in to create an event');
      return;
    }
    try {
      const event: Omit<Event, 'id'> = {
        title: data.title,
        description: data.description,
        date: data.date,
        creatorId: currentUser.id,
        participants: [],
      };
      await createEvent(event);
      setShowCreateEvent(false);
      const evts = await getEvents();
      const validatedEvents = evts.map((evt) => ({
        ...evt,
        participants: evt.participants || [],
      }));
      setEvents(validatedEvents);
      setFilteredEvents(validatedEvents);
      setError(null);
    } catch (err) {
      setError('Failed to create event');
      console.error(err);
    }
  };

  const handleJoinEvent = async (eventId: string) => {
    if (!currentUser) {
      setError('You must be logged in to join an event');
      return;
    }
    try {
      await joinEvent(eventId, currentUser.id);
      const evts = await getEvents();
      const validatedEvents = evts.map((evt) => ({
        ...evt,
        participants: evt.participants || [],
      }));
      setEvents(validatedEvents);
      setFilteredEvents(validatedEvents);
      setError(null);
    } catch (err) {
      setError('Failed to join event');
      console.error(err);
    }
  };

  if (error) {
    return <Typography color="error">{error}</Typography>;
  }

  return (
    <Box sx={{ py: { xs: 2, sm: 3 } }}>
      <Typography variant="h4" sx={{ fontSize: { xs: '1.5rem', sm: '2rem' }, mb: 2 }}>
        Events
      </Typography>
      <TextField
        label="Search events"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        fullWidth
        margin="normal"
        placeholder="Enter title or keywords"
        sx={{ mb: 2 }}
      />
      <Button
        onClick={() => setShowCreateEvent(true)}
        variant="contained"
        fullWidth
        sx={{ mb: 2, maxWidth: { xs: '100%', sm: '200px' } }}
        disabled={!currentUser}
      >
        Create Event
      </Button>
      {showCreateEvent && (
        <Box
          component="form"
          onSubmit={handleSubmit(onCreateEvent)}
          sx={{ mb: 2, display: 'flex', flexDirection: 'column', gap: 2 }}
        >
          <TextField {...register('title')} label="Title" fullWidth required />
          <TextField
            {...register('description')}
            label="Description"
            fullWidth
            multiline
            rows={3}
            required
          />
          <TextField {...register('date')} type="date" fullWidth required />
          <Button type="submit" variant="contained" fullWidth sx={{ maxWidth: { xs: '100%', sm: '200px' } }}>
            Create
          </Button>
        </Box>
      )}
      <List>
        {filteredEvents.map((event) => (
          <ListItem
            key={event.id}
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              alignItems: { xs: 'flex-start', sm: 'center' },
              gap: 1,
              py: 1,
            }}
            onClick={() => navigate(`/event/${event.id}`)}
          >
            <ListItemText
              primary={`${event.title} - ${event.date}`}
              sx={{ cursor: 'pointer', fontSize: { xs: '0.9rem', sm: '1rem' } }}
            />
            {currentUser?.id !== event.creatorId &&
              !event.participants.includes(currentUser?.id || '') && (
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleJoinEvent(event.id);
                  }}
                  variant="contained"
                  size="small"
                  sx={{ width: { xs: '100%', sm: 'auto' } }}
                >
                  Join
                </Button>
              )}
          </ListItem>
        ))}
      </List>
    </Box>
  );
};