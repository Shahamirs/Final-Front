import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { TextField, Button } from '@mui/material';
import { registerUser } from '../services/api';
import { useAuthStore } from '../store/authStore';

interface RegisterForm {
  email: string;
  password: string;
  name: string;
  interests: string;
}

export const Register = () => {
  const { register, handleSubmit } = useForm<RegisterForm>();
  const navigate = useNavigate();
  const setUser = useAuthStore((state) => state.setUser);

  const onSubmit = async (data: RegisterForm) => {
    try {
      const user = await registerUser({
        email: data.email,
        password: data.password,
        name: data.name,
        interests: data.interests.split(',').map((i) => i.trim()),
      });
      setUser(user);
      navigate('/');
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} style={{ padding: '20px' }}>
      <TextField {...register('email')} label="Email" fullWidth margin="normal" />
      <TextField {...register('password')} label="Password" type="password" fullWidth margin="normal" />
      <TextField {...register('name')} label="Name" fullWidth margin="normal" />
      <TextField {...register('interests')} label="Interests (comma separated)" fullWidth margin="normal" />
      <Button type="submit" variant="contained" fullWidth>Register</Button>
    </form>
  );
};