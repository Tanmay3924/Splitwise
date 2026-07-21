import { useEffect, useState } from "react";
import { RoomProvider, useRoom } from "../context/RoomContext";
import Loading from "../Components/Loading";
import PageError from "../Components/PageError";
import MembersTab from "../Components/Room/MembersTab";
import { Link } from "react-router-dom";
import ExpensesTab from "../Components/Room/ExpensesTab";
import BalancesTab from "../Components/Room/BalancesTab";

const RoomPageContent = () => {
  const { roomMeta, metaLoading, metaError, fetchMeta } = useRoom();
  const [currentTab, setCurrentTab] = useState("members");
  useEffect(() => {
    fetchMeta();
  }, [fetchMeta]);
  if (metaLoading) return <Loading />;
  if (metaError)
    return (
      <PageError title="Room Error" message={metaError} onRetry={fetchMeta} />
    );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col pb-10">
      {/* Floating Header */}
      <header className="sticky top-0 z-[100] w-full px-4 pt-4">
        <div className="max-w-3xl mx-auto bg-white/80 backdrop-blur-lg border border-white/20 px-4 py-3 rounded-2xl shadow-xl shadow-gray-200/50 flex items-center justify-between">
          <Link
            to="/rooms"
            className="w-10 h-10 flex items-center justify-center bg-gray-50 rounded-xl text-gray-500 hover:bg-[#1cc29f]/10 hover:text-[#1cc29f] transition-all"
          >
            <span className="text-xl">←</span>
          </Link>

          <div className="flex flex-col items-center">
            <h1 className="text-base font-black text-gray-900 tracking-tight leading-none">
              {roomMeta.name}
            </h1>
            {roomMeta.isOwner && (
              <span className="text-[9px] font-black text-[#1cc29f] uppercase tracking-widest mt-1">
                Admin Mode
              </span>
            )}
          </div>

          <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-[#1cc29f] animate-pulse" />
          </div>
        </div>
      </header>

      {/* Modern Segmented Tabs */}
      <div className="max-w-3xl w-full mx-auto px-4 mt-6">
        <nav className="bg-gray-200/50 p-1 rounded-2xl flex items-center gap-1">
          {["members", "expenses", "balances"].map((tab) => (
            <button
              key={tab}
              onClick={() => setCurrentTab(tab)}
              className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.15em] transition-all ${
                currentTab === tab
                  ? "bg-white text-[#1cc29f] shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content Wrapper */}
      <main className="max-w-3xl w-full mx-auto px-4 mt-8 flex-1">
        {currentTab === "members" && <MembersTab />}
        {currentTab === "expenses" && <ExpensesTab />}
        {currentTab === "balances" && <BalancesTab />}
      </main>
    </div>
  );
};

// 2. The main export just wraps the content with the Provider
const RoomDetail = () => {
  return (
    <RoomProvider>
      <RoomPageContent />
    </RoomProvider>
  );
};

export default RoomDetail;
