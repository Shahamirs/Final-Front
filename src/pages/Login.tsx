import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { TextField, Button } from '@mui/material';
import { loginUser } from '../services/api';
import { useAuthStore } from '../store/authStore';

interface LoginForm {
  email: string;
  password: string;
}

export const Login = () => {
  const { register, handleSubmit } = useForm<LoginForm>();
  const navigate = useNavigate();
  const setUser = useAuthStore((state) => state.setUser);

  const onSubmit = async (data: LoginForm) => {
    try {
      const user = await loginUser(data.email, data.password);
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
      <Button type="submit" variant="contained" fullWidth>Login</Button>
    </form>
  );
};