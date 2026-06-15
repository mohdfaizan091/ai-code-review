const API_URL = import.meta.env.VITE_API_URL || '';

export const login = async (email, password) => {
  const response = await fetch(`${API_URL}/v1/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
      credentials: 'include',
    });
    return response.json();
  };
  
  export const register = async (name, email, password) => {
    const response = await fetch(`${API_URL}/v1/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
      credentials: 'include',
    });
    return response.json();
  };
  
  export const getMe = async () => {
    const response = await fetch(`${API_URL}/v1/api/auth/me`, {
      credentials: 'include',
    });
    return response.json();
  };
  
  export const logout = async () => {
    const response = await fetch(`${API_URL}/v1/api/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    });
    return response.json();
  };