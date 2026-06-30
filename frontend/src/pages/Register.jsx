import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AuthCard, { field } from '../components/AuthCard';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await register(name, email, password);
      navigate('/app');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthCard
      title="Grab a crayon"
      subtitle="Create your free Inkboard account"
      footer={<>Already have one? <Link to="/login" style={{ color: 'var(--accent)' }}>Sign in</Link></>}
    >
      <form onSubmit={onSubmit}>
        <input style={field} type="text" placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} required />
        <input style={field} type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input style={field} type="password" placeholder="Password (min 6 characters)" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
        {error && <p style={{ color: 'var(--crayon-red)', fontSize: 14, margin: '0 0 12px' }}>{error}</p>}
        <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} disabled={busy}>
          {busy ? 'Creating…' : 'Create account'}
        </button>
      </form>
    </AuthCard>
  );
}
