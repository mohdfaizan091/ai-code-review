import { createContext, useContext, useState, useEffect } from 'react';
import { getMe } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const data = await getMe();
      if (data.success) {
        setUser(data.user);
      } else {
        setUser(null);
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);