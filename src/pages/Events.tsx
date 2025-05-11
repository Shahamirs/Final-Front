import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Button, Typography, TextField, List, ListItem, ListItemText } from '@mui/material';
import { getEvents, createEvent, joinEvent } from '../services/api';
import { useAuthStore } from '../store/authStore';
import { Event } from '../types/event';

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
  const navigate = useNavigate();
  const { register, handleSubmit } = useForm<EventForm>();

  useEffect(() => {
    const fetchEvents = async () => {
      const evts = await getEvents();
      setEvents(evts);
      setFilteredEvents(evts);
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
    if (!currentUser) return;
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
    setEvents(evts);
    setFilteredEvents(evts);
  };

  const handleJoinEvent = async (eventId: string) => {
    if (!currentUser) return;
    await joinEvent(eventId, currentUser.id);
    const evts = await getEvents();
    setEvents(evts);
    setFilteredEvents(evts);
  };

  return (
    <div style={{ padding: '20px' }}>
      <Typography variant="h4">Events</Typography>
      <TextField
        label="Search events"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        fullWidth
        margin="normal"
        placeholder="Enter title or keywords"
      />
      <Button onClick={() => setShowCreateEvent(true)} variant="contained" style={{ marginBottom: '20px' }}>
        Create Event
      </Button>
      {showCreateEvent && (
        <form onSubmit={handleSubmit(onCreateEvent)} style={{ marginTop: '20px' }}>
          <TextField {...register('title')} label="Title" fullWidth margin="normal" />
          <TextField {...register('description')} label="Description" fullWidth margin="normal" />
          <TextField {...register('date')} type="date" fullWidth margin="normal" />
          <Button type="submit" variant="contained">Create</Button>
        </form>
      )}
      <List>
        {filteredEvents.map((event) => (
          <ListItem button key={event.id} onClick={() => navigate(`/event/${event.id}`)}>
            <ListItemText primary={`${event.title} - ${event.date}`} />
            {currentUser?.id !== event.creatorId && !event.participants.includes(currentUser?.id || '') && (
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  handleJoinEvent(event.id);
                }}
                variant="contained"
              >
                Join
              </Button>
            )}
          </ListItem>
        ))}
      </List>
    </div>
  );
};