import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import BoardEditor from './pages/BoardEditor';
import SharedBoard from './pages/SharedBoard';
import NotFound from './pages/NotFound';

// Gate for pages that need a logged-in user.
function Private({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ padding: 80, textAlign: 'center' }} className="hand">loading…</div>;
  return user ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/app" element={<Private><Dashboard /></Private>} />
      <Route path="/board/:id" element={<Private><BoardEditor /></Private>} />
      <Route path="/shared/:shareId" element={<SharedBoard />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
