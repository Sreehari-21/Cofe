const BASE_URL = 'http://localhost:5000/api';

const apiRequest = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token');
  const headers = {};
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  const config = {
    ...options,
    headers: {
      ...headers,
      ...options.headers
    }
  };

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, config);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Something went wrong');
    }
    
    return data;
  } catch (error) {
    console.error('API Request Error:', error);
    throw error;
  }
};

export const api = {
  get: (endpoint, options) => apiRequest(endpoint, { method: 'GET', ...options }),
  post: (endpoint, body, options) => apiRequest(endpoint, { method: 'POST', body: body instanceof FormData ? body : JSON.stringify(body), ...options }),
  put: (endpoint, body, options) => apiRequest(endpoint, { method: 'PUT', body: body instanceof FormData ? body : JSON.stringify(body), ...options }),
  delete: (endpoint, options) => apiRequest(endpoint, { method: 'DELETE', ...options })
};
