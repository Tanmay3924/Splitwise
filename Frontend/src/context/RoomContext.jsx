import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useApp } from "./AppContext";

const RoomContext = createContext();

export const RoomProvider = ({ children }) => {
  const { roomId } = useParams();
  const { showToast, setUser } = useApp();
  const navigate = useNavigate();

  // Meta State
  const [roomMeta, setRoomMeta] = useState(null);
  const [metaLoading, setMetaLoading] = useState(true);
  const [metaError, setMetaError] = useState("");

  // Members State
  const [members, setMembers] = useState([]);
  const [membersLoading, setMembersLoading] = useState(false);
  const [memberTabError, setMemberTabError] = useState("");

  // Expenses State
  const [expenses, setExpenses] = useState([]);
  const [expensesLoading, setExpensesLoading] = useState(false);
  const [expensesError, setExpensesError] = useState(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchError, setSearchError] = useState("");

  const [addingMember, setAddingMember] = useState(false);
  const [removingMember, setRemovingMember] = useState(false);

  const [deletingRoom, setDeletingRoom] = useState(false);

  const fetchMeta = useCallback(async () => {
    try {
      setMetaLoading(true);
      const res = await fetch(
        `${import.meta.env.VITE_backendUrl}/api/rooms/${roomId}/meta`,
        {
          credentials: "include",
        },
      );
      if (res.status === 401) return setUser(null);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Access denied");
      setRoomMeta(data);
    } catch (err) {
      setMetaError(err.message || "Network failure");
    } finally {
      setMetaLoading(false);
    }
  }, [roomId, setUser]);

  const fetchMembers = useCallback(async () => {
    setMembersLoading(true);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_backendUrl}/api/rooms/${roomId}/members`,
        { credentials: "include" },
      );
      const data = await res.json();
      if (res.ok) {
        setMembers(data.members);
      } else {
        setMemberTabError(data.message || "Could not load members list");
      }
    } catch (err) {
      setMemberTabError("Failed to load members");
    } finally {
      setMembersLoading(false);
    }
  }, [roomId, showToast]);

  const fetchExpenses = useCallback(async () => {
    setExpensesLoading(true);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_backendUrl}/api/rooms/${roomId}/expenses`,
        { credentials: "include" },
      );
      const data = await res.json();
      if (res.ok) setExpenses(data.expenses);
    } catch (err) {
      showToast("Failed to load expenses", "error");
    } finally {
      setExpensesLoading(false);
    }
  }, [roomId, showToast]);
  const handleRemoveMember = useCallback(
    async (userId) => {
      try {
        setRemovingMember(true);
        const res = await fetch(
          `${import.meta.env.VITE_backendUrl}/api/rooms/${roomId}/members/${userId}`,
          {
            method: "DELETE",
            credentials: "include",
          },
        );
        if (res.ok) {
          setMembers((prev) => prev.filter((m) => m._id !== userId));
          showToast("Member removed", "success");
          setSearchQuery("");
        } else {
          const data = await res.json();
          showToast(data.message || "Failed to remove member", "error");
        }
      } finally {
        setRemovingMember(false);
      }
    },
    [roomId, showToast],
  );

  const handleAddMember = useCallback(
    async (userId) => {
      try {
        setAddingMember(true);
        const res = await fetch(
          `${import.meta.env.VITE_backendUrl}/api/rooms/${roomId}/members`,
          {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId }),
          },
        );
        const data = await res.json();
        if (res.ok) {
          setMembers((prev) => [...prev, data.addedMember]);
          setSearchResults((prev) => prev.filter((u) => u._id !== userId));
          showToast("Member added!", "success");
        } else {
          showToast(data.message, "error");
        }
      } finally {
        setAddingMember(false);
      }
    },
    [roomId, showToast],
  );

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_backendUrl}/api/rooms/${roomId}/users/search?query=${searchQuery}`,
          {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
          },
        );
        const data = await res.json();
        if (res.ok) setSearchResults(data);
      } catch (err) {
        setSearchError("Search failed");
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery, roomId]);

  const handleDeleteRoom = useCallback(async () => {
    try {
      setDeletingRoom(true);
      const res = await fetch(
        `${import.meta.env.VITE_backendUrl}/api/rooms/${roomId}`,
        {
          method: "DELETE",
          credentials: "include",
        },
      );
      if (res.ok) {
        showToast("Room deleted permanently", "success");
        navigate("/rooms", { replace: true });
      } else {
        const data = await res.json();
        showToast(data.message || "Failed to delete", "info");
      }
    } catch {
      showToast("Server connection failed", "error");
    } finally {
      setDeletingRoom(false);
    }
  }, [roomId, showToast, navigate]);
  return (
    <RoomContext.Provider
      value={{
        roomId,
        roomMeta,
        metaLoading,
        metaError,
        fetchMeta,
        members,
        setMembers,
        membersLoading,
        fetchMembers,
        expenses,
        setExpenses,
        expensesLoading,
        fetchExpenses,
        memberTabError,
        handleRemoveMember,
        handleAddMember,
        setSearchQuery,
        searchResults,
        searchError,
        addingMember,
        removingMember,
        handleDeleteRoom,
        deletingRoom,
        expensesError,
      }}
    >
      {children}
    </RoomContext.Provider>
  );
};

export const useRoom = () => useContext(RoomContext);
