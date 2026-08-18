import { createContext, useContext, useState, useEffect, useCallback } from "react";
import type React from "react";
import { ENV } from "../utils/config";
import { getUserByToken } from "../pages/Users/_requests";

type AuthContextType = {
  token: string | null;
  userInfo: any | null;
  loading: boolean;
  refreshUserInfo: () => void;
  updateToken: (newToken: string) => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
  const [userInfo, setUserInfo] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const storedToken = localStorage.getItem("admin_token");
    const decryptedToken = storedToken ? ENV.decryptAdminToken(storedToken) : null;
    if (decryptedToken) {
      setToken(decryptedToken);
    }
  }, []);

  const fetchUserInfo = useCallback(() => {
    if (token) {
      setLoading(true);
      getUserByToken(token)
        .then((response: any) => {
          let user = response?.data?.user || {};
          let permissionsArray = user?.role?.permissions || [];
          const permissionsObject = permissionsArray.reduce(
            (acc: any, perm: any) => {
              acc[perm.name] = perm.actions;
              return acc;
            },
            {}
          );
          user.role = permissionsObject;
          setUserInfo(user);
        })
        .catch(() => {
          setUserInfo({});
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [token]);

  useEffect(() => {
    fetchUserInfo();
  }, [fetchUserInfo]);

  const updateToken = useCallback((newToken: string) => {
    setToken(newToken);
  }, []);

  return (
    <AuthContext.Provider value={{ token, userInfo, loading, refreshUserInfo: fetchUserInfo, updateToken }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
