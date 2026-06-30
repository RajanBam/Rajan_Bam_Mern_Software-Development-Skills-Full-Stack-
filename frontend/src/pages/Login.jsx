import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AuthCard, { field } from '../components/AuthCard';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await login(email, password);
      navigate('/app');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthCard
      title="Welcome back"
      subtitle="Sign in to open your boards"
      footer={<>New here? <Link to="/register" style={{ color: 'var(--accent)' }}>Create an account</Link></>}
    >
      <form onSubmit={onSubmit}>
        <input style={field} type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input style={field} type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        {error && <p style={{ color: 'var(--crayon-red)', fontSize: 14, margin: '0 0 12px' }}>{error}</p>}
        <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} disabled={busy}>
          {busy ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
      <p style={{ fontSize: 12, color: 'var(--ink-soft)', textAlign: 'center', marginTop: 16 }}>
        Demo login after seeding: demo@inkboard.app / password123
      </p>
    </AuthCard>
  );
}
