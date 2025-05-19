import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { TextField, Button, Box, Typography } from '@mui/material';
import { loginUser } from '../services/api';
import { useAuthStore } from '../store/authStore';


interface LoginForm {
  email: string;
  password: string;
}

export const Login = () => {
  const setUser = useAuthStore((state) => state.setUser);
  const navigate = useNavigate();
  const { register, handleSubmit } = useForm<LoginForm>();

  const onSubmit = async (data: LoginForm) => {
    try {
      const user = await loginUser(data.email); // Fixed: pass only email
      setUser(user);
      navigate('/');
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <Box sx={{ maxWidth: 400, mx: 'auto', py: { xs: 2, sm: 3 } }}>
      <Typography variant="h4" sx={{ mb: 2, fontSize: { xs: '1.5rem', sm: '2rem' } }}>
        Login
      </Typography>
      <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <TextField {...register('email')} label="Email" type="email" fullWidth required />
        <TextField {...register('password')} label="Password" type="password" fullWidth required />
        <Button type="submit" variant="contained" fullWidth>
          Login
        </Button>
      </Box>
    </Box>
  );
};