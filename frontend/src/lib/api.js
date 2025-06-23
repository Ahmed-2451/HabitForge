// API base URL - Use proxy in development, direct URL in production
const API_URL = import.meta.env.DEV ? "/api" : "http://localhost:5000/api";

// Get token from local storage
const getToken = () => localStorage.getItem('token');

// Helper function for making API requests
async function apiRequest(endpoint, options = {}) {
  const url = `${API_URL}${endpoint}`;
  
  // Default options
  const defaultOptions = {
    headers: {
      "Content-Type": "application/json",
    },
  };
  
  // Add authorization header if token exists
  const token = getToken();
  if (token) {
    defaultOptions.headers["Authorization"] = `Bearer ${token}`;
  }
  
  // Merge options
  const fetchOptions = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers,
    },
  };
  
  try {
    const response = await fetch(url, fetchOptions);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || "Something went wrong");
    }
    
    return data;
  } catch (error) {
    console.error(`API request error: ${error.message}`);
    throw error;
  }
}

// Authentication API
export const authApi = {
  // Register a new user
  register: async (userData) => {
    const data = await apiRequest("/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    });
    
    // Save token to local storage
    if (data.token) {
      localStorage.setItem('token', data.token);
    }
    
    return data;
  },
  
  // Login a user
  login: async (credentials) => {
    const data = await apiRequest("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });
    
    // Save token to local storage
    if (data.token) {
      localStorage.setItem('token', data.token);
    }
    
    return data;
  },
  
  // Logout the current user
  logout: () => {
    // Remove token from local storage
    localStorage.removeItem('token');
    return apiRequest("/auth/logout", {
      method: "POST",
    });
  },
  
  // Get current user info
  getCurrentUser: () => {
    return apiRequest("/auth/me");
  },
};

// Habits API
export const habitsApi = {
  // Get all habits for the current user
  getHabits: () => {
    return apiRequest("/habits");
  },
  
  // Create a new habit
  createHabit: (habitData) => {
    return apiRequest("/habits", {
      method: "POST",
      body: JSON.stringify(habitData),
    });
  },
  
  // Get a specific habit by ID
  getHabitById: (id) => {
    return apiRequest(`/habits/${id}`);
  },
  
  // Update a habit
  updateHabit: (id, habitData) => {
    return apiRequest(`/habits/${id}`, {
      method: "PUT",
      body: JSON.stringify(habitData),
    });
  },
  
  // Delete a habit
  deleteHabit: (id) => {
    return apiRequest(`/habits/${id}`, {
      method: "DELETE",
    });
  },
  
  // Toggle habit completion for a specific date
  toggleHabitCompletion: (id, date, completed) => {
    return apiRequest(`/habits/${id}/toggle`, {
      method: "POST",
      body: JSON.stringify({ date, completed }),
    });
  },
  
  // Get habit entries for a specific habit
  getHabitEntries: (id, startDate, endDate) => {
    let endpoint = `/habits/${id}/entries`;
    
    // Add query parameters if provided
    if (startDate || endDate) {
      const params = new URLSearchParams();
      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);
      endpoint = `${endpoint}?${params.toString()}`;
    }
    
    return apiRequest(endpoint);
  },
  
  // Get habit statistics
  getHabitStats: (days = 30) => {
    return apiRequest(`/habits/stats?days=${days}`);
  },
}; 