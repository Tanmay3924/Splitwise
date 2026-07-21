import { useState } from "react";
import { useRoom } from "../context/RoomContext";

const AddMember = () => {
  const {
    setSearchQuery,
    searchResults,
    searchError,
    addingMember,
    handleAddMember,
  } = useRoom();
  const [memberToBeAdded, setMemberToBeAdded] = useState(null);
  const [inputValue, setInputValue] = useState("");

  const handleSearch = (val) => {
    setInputValue(val);
    setSearchQuery(val);
  };

  return (
    <div className="bg-white rounded-[2rem] p-6 border-2 border-[#1cc29f]/20 shadow-xl shadow-gray-100">
      <div className="mb-6">
        <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 block ml-1">
          Find New Members
        </label>
        <div className="relative group">
          <input
            autoFocus
            type="text"
            value={inputValue}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full bg-gray-50 border-2 border-transparent rounded-2xl px-5 py-4 text-sm font-bold text-gray-800 outline-none focus:bg-white focus:border-[#1cc29f] transition-all placeholder:text-gray-300"
          />
          {inputValue && (
            <button
              onClick={() => {
                setInputValue("");
                setSearchQuery("");
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 transition-colors"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      <div className="space-y-3">
        {searchError && (
          <p className="text-red-500 text-[10px] font-bold uppercase tracking-widest text-center py-2">
            {searchError}
          </p>
        )}

        {searchResults.map((user) => (
          <div
            key={user._id}
            className="flex items-center justify-between p-3 rounded-2xl bg-gray-50 border border-transparent hover:border-gray-200 transition-all"
          >
            <div className="flex items-center gap-3">
              {/* Profile Photo Restoration */}
              <div className="w-10 h-10 rounded-xl bg-white border border-gray-100 overflow-hidden flex items-center justify-center shrink-0">
                {user.profilePhoto ? (
                  <img
                    src={user.profilePhoto}
                    className="w-full h-full object-cover"
                    alt=""
                  />
                ) : (
                  <span className="text-[#1cc29f] font-black text-xs">
                    {user.name?.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>

              <div className="flex flex-col leading-tight">
                <span className="text-sm font-bold text-gray-800">
                  {user.name}
                </span>
                <span className="text-[10px] font-medium text-gray-400">
                  {user.email}
                </span>
              </div>
            </div>

            <button
              disabled={addingMember}
              onClick={() => {
                setMemberToBeAdded(user._id);
                handleAddMember(user._id);
              }}
              className="bg-[#1cc29f] text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#16a085] transition-all shadow-md shadow-[#1cc29f]/10 disabled:opacity-50 active:scale-95"
            >
              {addingMember && memberToBeAdded === user._id ? "..." : "Add"}
            </button>
          </div>
        ))}

        {inputValue && searchResults.length === 0 && !searchError && (
          <div className="py-8 text-center border-2 border-dashed border-gray-100 rounded-2xl">
            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">
              No users found
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
export default AddMember;
