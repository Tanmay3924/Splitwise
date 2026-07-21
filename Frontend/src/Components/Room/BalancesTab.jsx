import { useEffect, useState } from "react";
import BalancesSkeleton from "./BalancesSkeleton";
import PayModal from "./PayModal";
import { useApp } from "../../context/AppContext";
import { useRoom } from "../../context/RoomContext";

const BalancesTab = () => {
  const { roomId } = useRoom();
  const { showToast, user } = useApp();

  const [balances, setBalances] = useState([]);
  const [settlements, setSettlements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [payContext, setPayContext] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");
      const [balancesRes, settlementsRes] = await Promise.all([
        fetch(
          `${import.meta.env.VITE_backendUrl}/api/rooms/${roomId}/balances`,
          { credentials: "include" },
        ),
        fetch(
          `${import.meta.env.VITE_backendUrl}/api/rooms/${roomId}/settlements`,
          { credentials: "include" },
        ),
      ]);

      const balancesData = await balancesRes.json();
      const settlementsData = await settlementsRes.json();

      if (!balancesRes.ok) throw new Error(balancesData.message);
      if (!settlementsRes.ok) throw new Error(settlementsData.message);

      setBalances(balancesData.balances);
      setSettlements(settlementsData.settlements);
    } catch (err) {
      setError(err.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (roomId) fetchData();
  }, [roomId]);

  const confirmSettlement = async (id) => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_backendUrl}/api/settlements/${id}/confirm`,
        {
          method: "POST",
          credentials: "include",
        },
      );
      if (res.ok) {
        showToast("Payment confirmed", "success");
        fetchData();
      }
    } catch {
      showToast("Failed to confirm", "error");
    }
  };

  const rejectSettlement = async (id) => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_backendUrl}/api/settlements/${id}/reject`,
        {
          method: "POST",
          credentials: "include",
        },
      );
      if (res.ok) {
        showToast("Payment rejected", "info");
        fetchData();
      }
    } catch {
      showToast("Failed to reject", "error");
    }
  };

  if (loading) return <BalancesSkeleton />;

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-10 bg-red-50 border border-red-100 rounded-3xl text-center space-y-4">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center text-red-600 font-bold text-2xl">
          !
        </div>
        <div className="space-y-1">
          <h3 className="text-lg font-bold text-red-900">
            Unable to load data
          </h3>
          <p className="text-sm text-red-600">{error}</p>
        </div>
        <button
          onClick={fetchData}
          className="px-6 py-2 bg-red-600 text-white font-bold rounded-xl transition-all active:scale-95"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-12 pb-20">
      {/* ---------- SECTION 1: ACTIVE BALANCES ---------- */}
      <section className="space-y-6">
        <h3 className="text-2xl font-black text-gray-900">Current Balances</h3>

        {balances.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 bg-gradient-to-b from-white to-gray-50 border border-dashed border-gray-200 rounded-[2rem] text-center">
            <span className="text-5xl mb-4 animate-bounce">🎉</span>
            <h3 className="text-xl font-black text-gray-900">
              All Settled Up!
            </h3>
            <p className="text-gray-500 text-sm">
              No pending debts in this room.
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {balances.map((balance, index) => {
              const isDebtor = user._id === balance.from._id;
              const isCreditor = user._id === balance.to._id;

              return (
                <div
                  key={index}
                  className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4 hover:shadow-md transition"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={balance.from.profilePhoto || "/default-avatar.png"}
                      className="w-10 h-10 rounded-full border shadow-sm"
                      alt=""
                    />
                    <p className="text-sm font-medium text-gray-700">
                      <span className="font-bold">
                        {isDebtor ? "You" : balance.from.name}
                      </span>{" "}
                      owe{" "}
                      <span className="font-bold">
                        {isCreditor ? "You" : balance.to.name}
                      </span>
                    </p>
                    <img
                      src={balance.to.profilePhoto || "/default-avatar.png"}
                      className="w-10 h-10 rounded-full border shadow-sm"
                      alt=""
                    />
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="font-black text-xl text-[#1cc29f]">
                      ₹{balance.amount}
                    </span>
                    {isDebtor && (
                      <button
                        onClick={() =>
                          setPayContext({
                            toUser: balance.to,
                            maxAmount: balance.amount,
                          })
                        }
                        className="bg-[#1cc29f] text-white px-5 py-2 rounded-xl text-xs font-bold hover:scale-105 transition"
                      >
                        Pay Now
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ---------- SECTION 2: ACTIVITY LOG (Settlements) ---------- */}
      <section className="space-y-6">
        <h3 className="text-2xl font-black text-gray-900">Activity Log</h3>

        {settlements.length === 0 ? (
          <p className="text-center text-gray-400 text-sm italic py-10">
            No recent activity.
          </p>
        ) : (
          <div className="space-y-4">
            {settlements.map((s) => {
              const isFromMe = s.from._id === user._id;
              const isToMe = s.to._id === user._id;
              const isPending = s.status === "pending";

              return (
                <div
                  key={s._id}
                  className={`p-5 rounded-2xl border transition-all ${isPending ? "bg-amber-50/30 border-amber-100 shadow-sm" : "bg-white border-gray-100"}`}
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex items-center gap-3">
                      <div className="flex -space-x-2">
                        <img
                          src={s.from.profilePhoto || "/default-avatar.png"}
                          className="w-8 h-8 rounded-full border-2 border-white ring-1 ring-gray-100"
                          alt=""
                        />
                        <img
                          src={s.to.profilePhoto || "/default-avatar.png"}
                          className="w-8 h-8 rounded-full border-2 border-white ring-1 ring-gray-100"
                          alt=""
                        />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-800">
                          {isFromMe ? "You" : s.from.name} paid{" "}
                          {isToMe ? "You" : s.to.name}
                        </p>
                        <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest">
                          {new Date(s.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                      <span className="text-lg font-black text-gray-900">
                        ₹{s.amount}
                      </span>
                      <span
                        className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                          s.status === "confirmed"
                            ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                            : s.status === "pending"
                              ? "bg-amber-100 text-amber-700 border-amber-200 animate-pulse"
                              : "bg-gray-50 text-gray-500 border-gray-200"
                        }`}
                      >
                        {s.status === "pending"
                          ? "Awaiting Confirmation"
                          : s.status}
                      </span>
                    </div>
                  </div>

                  {/* Contextual Actions for Pending Receipts */}
                  {isPending && isToMe && (
                    <div className="mt-4 pt-4 border-t border-dashed border-amber-200 flex gap-2">
                      <button
                        onClick={() => confirmSettlement(s._id)}
                        className="flex-1 bg-emerald-500 text-white text-xs font-bold py-2 rounded-xl shadow-md"
                      >
                        Confirm
                      </button>
                      <button
                        onClick={() => rejectSettlement(s._id)}
                        className="flex-1 bg-white text-rose-500 border border-rose-100 text-xs font-bold py-2 rounded-xl"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* PAY MODAL */}
      {payContext && (
        <PayModal
          roomId={roomId}
          to={payContext.toUser}
          maxAmount={payContext.maxAmount}
          onClose={() => setPayContext(null)}
          onSuccess={() => {
            setPayContext(null);
            fetchData();
          }}
        />
      )}
    </div>
  );
};

export default BalancesTab;
