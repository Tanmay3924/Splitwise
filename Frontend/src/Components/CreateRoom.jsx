import { useState } from "react";
import { useApp } from "../context/AppContext";

const CreateRoom = ({ onClose, onRoomCreated }) => {
  const { setGlobalError } = useApp();
  const [roomName, setRoomName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!roomName.trim()) {
      setError("Please give your room a name");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`${import.meta.env.VITE_backendUrl}/api/rooms`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: roomName }),
      });

      const data = await res.json();

      if (res.ok) {
        onRoomCreated(data.room);
        onClose();
        return;
      }

      setError(data.message || "Failed to create room");
    } catch (error) {
      setGlobalError({
        title: "Connection Lost",
        message:
          "We couldn't reach the server. Check your internet connection.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-[2rem] shadow-2xl overflow-hidden border border-gray-100">
      {/* Visual Header */}
      <div className="bg-[#1cc29f] p-8 text-white relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-2xl font-black tracking-tight">
            Create New Room
          </h2>
        </div>
        {/* Abstract Background Circle */}
        <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-2xl" />
      </div>

      <form onSubmit={handleCreate} className="p-8">
        <div className="space-y-6">
          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 ml-1">
              Room Name
            </label>
            <input
              autoFocus
              type="text"
              value={roomName}
              onChange={(e) => {
                setRoomName(e.target.value);
                if (error) setError("");
              }}
              placeholder="e.g. Weekend in Goa"
              className={`w-full px-5 py-4 rounded-2xl bg-gray-50 border-2 transition-all outline-none text-gray-800 font-bold placeholder:text-gray-300 ${
                error
                  ? "border-red-100 focus:border-red-400"
                  : "border-transparent focus:border-[#1cc29f] focus:bg-white"
              }`}
            />
            {error && (
              <p className="text-red-500 text-[10px] font-bold uppercase tracking-wider mt-2 ml-1 animate-pulse">
                {error}
              </p>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-6 py-4 rounded-2xl font-black text-gray-400 hover:bg-gray-100 transition-colors uppercase text-xs tracking-widest"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gray-900 text-white px-6 py-4 rounded-2xl font-black shadow-xl shadow-gray-200 hover:bg-[#1cc29f] transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed uppercase text-xs tracking-widest flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Creating...</span>
                </>
              ) : (
                "Create Room"
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CreateRoom;
