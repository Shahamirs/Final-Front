import { useState, type ReactNode } from 'react';
import { AppBar, Toolbar, Typography, Button, IconButton, Drawer, List, ListItem, ListItemText, Box, Container } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export const Layout = ({ children }: { children: ReactNode }) => {
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = () => {
    setUser(null);
    navigate('/login');
  };

  const menuItems = user
    ? [
        { text: 'Home', path: '/' },
        { text: 'Events', path: '/events' },
        { text: 'Chats', path: '/chats' },
        { text: 'Profile', path: '/profile' },
        { text: 'Logout', action: handleLogout },
      ]
    : [
        { text: 'Login', path: '/login' },
        { text: 'Register', path: '/register' },
      ];

  const drawer = (
    <Box onClick={handleDrawerToggle} sx={{ textAlign: 'center' }}>
      <Typography variant="h6" sx={{ my: 2 }}>
        My App
      </Typography>
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.text} onClick={item.action ? item.action : () => navigate(item.path!)}>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            My App
          </Typography>
          <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
            {menuItems.map((item) => (
              <Button
                key={item.text}
                color="inherit"
                onClick={item.action ? item.action : () => navigate(item.path!)}
              >
                {item.text}
              </Button>
            ))}
          </Box>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="end"
            onClick={handleDrawerToggle}
            sx={{ display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
        </Toolbar>
      </AppBar>
      <Drawer
        anchor="right"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{ display: { xs: 'block', sm: 'none' }, '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 240 } }}
      >
        {drawer}
      </Drawer>
      <Container component="main" sx={{ flexGrow: 1, py: { xs: 2, sm: 3 }, maxWidth: 'lg' }}>
        {children}
      </Container>
    </Box>
  );
};