import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Home } from './pages/Home';
import { Profile } from './pages/Profile';
import { EventPage } from './pages/EventPage'; // Updated import
import { Chat } from './pages/Chat';
import { Chats } from './pages/Chats';
import { Events } from './pages/Events';
import { UserProfile } from './pages/UserProfile';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
          <Route path="/events" element={<ProtectedRoute><Events /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/event/:id" element={<ProtectedRoute><EventPage /></ProtectedRoute>} /> {/* Updated to EventPage */}
          <Route path="/chat/:userId" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
          <Route path="/chats" element={<ProtectedRoute><Chats /></ProtectedRoute>} />
          <Route path="/user/:userId" element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;