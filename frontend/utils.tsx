import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
const API = import.meta.env.VITE_API_BASE_URL;
import axios from "axios";

interface User {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone?: string;
  timezone?: string;
  preferredName?: string;
  profileImage?: string | null;
  last4?: any;
  subscription?: any;
  paymentMethodId?: any;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isLoggedIn: boolean;
  setUser: (user: User | null) => void;
  refreshUser: () => Promise<void>;
  logout: () => void;
  token: any | null;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isLoggedIn: false,
  setUser: () => {},
  refreshUser: async () => {},
  logout: () => {},
  token: null,
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<any | null>(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      setLoading(true);

      const storedToken = localStorage.getItem("authToken");
      const user: any = localStorage.getItem("user");

      if (!storedToken || !user) {
        // No token, clear everything
        setUser(null);
        localStorage.removeItem("authToken");
        localStorage.removeItem("user");
        // localStorage.removeItem("chatId");
        localStorage.removeItem("threadId");
        localStorage.removeItem("searchQuery");
        return;
      }

      setToken(storedToken);
      let parsedUser = JSON.parse(user);
      const { data } = await axios.get(`${API}/auth/${parsedUser.id}`, {
        headers: {
          Authorization: `Bearer ${storedToken}`,
        },
      });
      if (data.user) {
        setUser(data.user);
        localStorage.setItem("user", JSON.stringify(data.user));
      }
    } catch (err) {
      console.error("Auth check failed:", err);

      // Clear local storage on failure
      setUser(null);
      localStorage.removeItem("authToken");
      localStorage.removeItem("user");
      localStorage.removeItem("chatId");
      localStorage.removeItem("threadId");
      localStorage.removeItem("searchQuery");
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    localStorage.removeItem("threadId");
    localStorage.removeItem("searchQuery");
    localStorage.removeItem("chatId");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isLoggedIn: !!user,
        setUser,
        refreshUser: fetchUser,
        logout,
        token,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
