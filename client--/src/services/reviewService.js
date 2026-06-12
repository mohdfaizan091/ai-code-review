export const testConnection = async () => {
    const response = await fetch('/v1/api/auth/me');
    const data = await response.json();
    console.log(data);
  }