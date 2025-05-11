import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { TextField, Button, Typography } from '@mui/material';
import { updateUser } from '../services/api';
import { useAuthStore } from '../store/authStore';

interface ProfileForm {
  name: string;
  interests: string;
}

export const Profile = () => {
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const [isEditing, setIsEditing] = useState(false);
  const { register, handleSubmit, setValue } = useForm<ProfileForm>({
    defaultValues: {
      name: user?.name,
      interests: user?.interests.join(', '),
    },
  });

  const onSubmit = async (data: ProfileForm) => {
    if (!user) return;
    const updatedUser = {
      name: data.name,
      interests: data.interests.split(',').map((i) => i.trim()),
    };
    await updateUser(user.id, updatedUser);
    setUser({ ...user, ...updatedUser });
    setIsEditing(false);
  };

  return (
    <div style={{ padding: '20px' }}>
      <Typography variant="h4">Profile</Typography>
      {isEditing ? (
        <form onSubmit={handleSubmit(onSubmit)}>
          <TextField {...register('name')} label="Name" fullWidth margin="normal" />
          <TextField {...register('interests')} label="Interests (comma separated)" fullWidth margin="normal" />
          <Button type="submit" variant="contained">Save</Button>
          <Button onClick={() => setIsEditing(false)} variant="outlined" style={{ marginLeft: '10px' }}>
            Cancel
          </Button>
        </form>
      ) : (
        <div>
          <Typography>Name: {user?.name}</Typography>
          <Typography>Interests: {user?.interests.join(', ')}</Typography>
          <Button onClick={() => setIsEditing(true)} variant="contained" style={{ marginTop: '20px' }}>
            Edit Profile
          </Button>
        </div>
      )}
    </div>
  );
};