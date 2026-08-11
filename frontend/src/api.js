const API = 'http://127.0.0.1:8000';

export const getToken = () => localStorage.getItem('token');
export const getRole = () => localStorage.getItem('role');
export const getEmail = () => localStorage.getItem('email');

export const apiFetch = async (path, options = {}) => {
  const token = getToken();
  let res;
  try {
    res = await fetch(`${API}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        ...(options.headers || {}),
      },
    });
  } catch (err) {
    throw new Error('Network error. Backend might be down.');
  }

  if (res.status === 401) {
    localStorage.clear();
    window.location.href = '/auth';
    throw new Error('Unauthorized');
  }

  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || 'Request failed');
  return data;
};

export default API;
