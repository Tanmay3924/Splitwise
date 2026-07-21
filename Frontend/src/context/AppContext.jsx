import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [globalError, setGlobalError] = useState(null);
  const [toast, setToast] = useState({ message: null, type: "success" });

  // Notification logic
  const showToast = useCallback((message, type = "success") => {
    setToast({ message, type });
    // Auto-clear toast after 3 seconds
    setTimeout(() => setToast({ message: null, type: "success" }), 3000);
  }, []);

  // Auth check logic
  const checkAuth = async () => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_backendUrl}/api/auth/me`,
        {
          credentials: "include",
        },
      );
      if (res.ok) {
        const data = await res.json();
        setUser(data);
      } else {
        setUser(null);
      }
    } catch {
      setGlobalError({
        title: "Server error",
        message: "Something went wrong. Please try again later.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const logout = async () => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_backendUrl}/api/auth/logout`,
        {
          method: "POST",
          credentials: "include",
        },
      );

      // We clear the user state regardless of res.ok to ensure the UI is locked
      setUser(null);
      if (res.ok) {
        showToast("Logged out successfully");
      }
    } catch {
      setUser(null); // Force logout locally even if server is unreachable
      showToast("Logged out locally, server unreachable", "error");
    }
  };

  const value = {
    user,
    setUser,
    loading,
    globalError,
    setGlobalError,
    toast,
    showToast,
    logout,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => useContext(AppContext);
