import { createContext, useContext, useEffect, useState } from 'react';
import { getToken, setToken } from '../api/client';
import { fetchMe, loginUser, registerUser } from '../api/auth';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On first load, if we have a token, ask the server who we are.
  useEffect(() => {
    let active = true;
    async function boot() {
      if (!getToken()) {
        setLoading(false);
        return;
      }
      try {
        const { user } = await fetchMe();
        if (active) setUser(user);
      } catch {
        setToken(null); // token expired / invalid
      } finally {
        if (active) setLoading(false);
      }
    }
    boot();
    return () => {
      active = false;
    };
  }, []);

  async function login(email, password) {
    const { token, user } = await loginUser(email, password);
    setToken(token);
    setUser(user);
  }

  async function register(name, email, password) {
    const { token, user } = await registerUser(name, email, password);
    setToken(token);
    setUser(user);
  }

  function logout() {
    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
