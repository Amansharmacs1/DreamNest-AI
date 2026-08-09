import { create } from 'zustand';

interface User {
  id: string;
  email: string;
  name?: string;
  preferences?: {
    theme?: string;
    units?: string;
  };
}

interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
}

const getStoredToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
};

const getStoredUser = () => {
  if (typeof window !== 'undefined') {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch (e) {
        return null;
      }
    }
  }
  return null;
};

export const useAuthStore = create<AuthState>((set) => ({
  token: getStoredToken(),
  user: getStoredUser(),
  isAuthenticated: !!getStoredToken(),
  
  login: (token, user) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    set({ token, user, isAuthenticated: true });
  },
  
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    set({ token: null, user: null, isAuthenticated: false });
  },
  
  updateUser: (updatedFields) => {
    set((state) => {
      if (!state.user) return state;
      const newUser = { ...state.user, ...updatedFields };
      localStorage.setItem('user', JSON.stringify(newUser));
      return { user: newUser };
    });
  }
}));
