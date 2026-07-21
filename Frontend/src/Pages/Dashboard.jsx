import { useState, useEffect, useCallback } from "react";
import CreateRoom from "../Components/CreateRoom";
import DashboardHeader from "../Components/Dashboard/DashboardHeader";
import EmptyRoomsState from "../Components/Dashboard/EmptyRoomsState";
import RoomsGrid from "../Components/Dashboard/RoomsGrid";
import RoomsGridSkeleton from "../Components/Dashboard/RoomsGridSkeleton";
import { useApp } from "../context/AppContext";

const Dashboard = () => {
  const { setUser, showToast, user } = useApp();

  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // 1. Centralized Room Fetcher (Wrapped in useCallback to avoid recreation)
  const fetchRooms = useCallback(async (signal = null) => {
    try {
      setLoading(true);
      setIsError(false); // Reset error state on new attempt
      
      const res = await fetch(
        `${import.meta.env.VITE_backendUrl}/api/rooms`,
        {
          credentials: "include",
          signal: signal, 
        },
      );

      if (res.status === 401) {
        setUser(null);
        showToast("Session Expired", "error");
        return;
      }

      if (!res.ok) {
        // If response is 500 or 404, we set error but DON'T show empty state
        setIsError(true);
        return;
      }

      const data = await res.json();
      setRooms(Array.isArray(data) ? data : []);
    } catch (error) {
      if (error.name !== "AbortError") {
        setIsError(true);
        showToast("Unable to connect to server", "error");
      }
    } finally {
      setLoading(false);
    }
  }, [setUser, showToast]);

  // 2. Initial Mount Fetch
  useEffect(() => {
    const controller = new AbortController();
    fetchRooms(controller.signal);
    return () => controller.abort(); 
  }, [fetchRooms]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top Bar */}
      <DashboardHeader />

      {/* Main Content Area */}
      <main className="max-w-6xl w-full mx-auto p-6 md:p-10 flex-1">
        
        {/* State 1: Loading */}
        {loading ? (
          <RoomsGridSkeleton />
        ) : isError ? (
          /* State 2: Error State (Server down / Network issue) */
          <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in zoom-in-95 duration-500">
            <div className="bg-red-50 p-6 rounded-full mb-6">
              <svg className="w-12 h-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Failed to load rooms</h3>
            <p className="text-gray-500 mb-8 max-w-xs mx-auto">
              We're having trouble reaching the server. Your data is safe, but we can't show it right now.
            </p>
            <button 
              onClick={() => fetchRooms()} 
              className="bg-[#1cc29f] text-white px-8 py-3 rounded-2xl font-bold hover:shadow-lg hover:shadow-[#1cc29f]/30 transition-all active:scale-95"
            >
              Retry Connection
            </button>
          </div>
        ) : rooms.length === 0 ? (
          /* State 3: Empty State (Fetch worked, but no rooms exist) */
          <EmptyRoomsState onCreate={() => setShowModal(true)} />
        ) : (
          /* State 4: Success State (Rooms found) */
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Welcome Header Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
              <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-center relative overflow-hidden">
                <div className="relative z-10">
                  <h2 className="text-4xl font-black text-gray-900 tracking-tight mb-2">
                    Welcome back, {user?.name?.split(" ")[0] || "User"}! 👋
                  </h2>
                  <p className="text-gray-500 font-medium max-w-md">
                    You're currently part of{" "}
                    <span className="text-[#1cc29f]">
                      {rooms.length} active rooms
                    </span>
                    . Everything is up to date.
                  </p>
                </div>
                {/* Abstract Background Shape */}
                <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-[#1cc29f]/5 rounded-full blur-3xl" />
              </div>

              <div className="bg-[#1cc29f] p-8 rounded-3xl shadow-xl shadow-[#1cc29f]/20 flex flex-col justify-between text-white">
                <div>
                  <p className="text-white/70 font-bold uppercase text-xs tracking-widest mb-1">
                    Quick Action
                  </p>
                  <h3 className="text-xl font-bold mb-4">Start a new split</h3>
                </div>
                <button
                  onClick={() => setShowModal(true)}
                  className="bg-white text-[#1cc29f] w-full py-3 rounded-xl font-bold hover:bg-gray-50 transition-transform active:scale-95 shadow-sm"
                >
                  + Create Room
                </button>
              </div>
            </div>

            {/* The Grid */}
            <RoomsGrid rooms={rooms} />
          </div>
        )}
      </main>

      {/* Modal Overlay Pattern */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-300"
            onClick={() => setShowModal(false)}
          />

          <div className="relative w-full max-w-md animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
            <CreateRoom
              onClose={() => setShowModal(false)}
              onRoomCreated={(newRoom) => {
                setRooms((prev) => [newRoom, ...prev]);
                setShowModal(false);
                showToast("Room created!", "success");
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;