import { useEffect, useRef, useState } from "react";
import { useApp } from "../context/AppContext";
import { useRoom } from "../context/RoomContext";

const CreateExpense = ({ onClose, onExpenseCreated }) => {
  const { user, showToast } = useApp();
  const { roomId, members } = useRoom();
  const [title, setTitle] = useState("");
  const [totalAmount, setTotalAmount] = useState("");
  const [paidBy, setPaidBy] = useState(members[0]?._id || "");
  const [splitType, setSplitType] = useState("equal");
  const [error, setError] = useState("");
  const [savingExpense, setSavingExpense] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const [involvedMemberIds, setInvolvedMemberIds] = useState(
    members.map((m) => m._id),
  );
  const [customAmounts, setCustomAmounts] = useState({});

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedPayer = members.find((m) => m._id === paidBy);

  const toggleMember = (id) => {
    setInvolvedMemberIds((prev) =>
      prev.includes(id) ? prev.filter((mId) => mId !== id) : [...prev, id],
    );
  };

  const handleCustomInput = (id, value) => {
    setCustomAmounts((prev) => ({ ...prev, [id]: value }));
  };
  const validateExpense = () => {
    if (!title.trim()) {
      return "Please enter a description.";
    }

    if (!totalAmount || Number(totalAmount) <= 0) {
      return "Amount must be greater than 0.";
    }

    if (splitType === "equal" && involvedMemberIds.length === 0) {
      return "Select at least one member to split with.";
    }

    if (splitType === "custom") {
      const entries = Object.entries(customAmounts);

      if (entries.length === 0) {
        return "Enter amounts for at least one member.";
      }

      for (let [_, val] of entries) {
        if (Number(val) < 0) {
          return "Custom split amounts cannot be negative.";
        }
      }

      const sum = entries.reduce(
        (acc, [_, val]) => acc + (Number(val) || 0),
        0,
      );

      if (Math.abs(sum - Number(totalAmount)) > 0.01) {
        return `Custom split total (₹${sum}) must equal ₹${totalAmount}`;
      }
    }

    return null; // valid
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationError = validateExpense();
    if (validationError) {
      setError(validationError);
      return;
    }

    let membersPayload;
    if (splitType === "equal") {
      membersPayload = involvedMemberIds;
    } else {
      membersPayload = Object.keys(customAmounts)
        .filter((id) => Number(customAmounts[id]) > 0)
        .map((id) => ({
          userId: id,
          amount: Number(customAmounts[id]),
        }));
    }

    const finalData = {
      title: title.trim(),
      paidBy,
      totalAmount: Number(totalAmount),
      splitType,
      members: membersPayload,
    };

    try {
      setSavingExpense(true);
      const res = await fetch(
        `${import.meta.env.VITE_backendUrl}/api/rooms/${roomId}/expenses`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(finalData),
        },
      );

      const data = await res.json();
      if (!res.ok) {
        setError(data.message);
        setSavingExpense(false);
        return;
      }

      onExpenseCreated(data.expense);
      setSavingExpense(false);
      onClose();
    } catch (err) {
      showToast(`Network error occurred.`, "error");
      setSavingExpense(false);
    }
  };
  const isFormValid = () => {
    if (!title.trim()) return false;
    if (!totalAmount || Number(totalAmount) <= 0) return false;

    if (splitType === "equal") {
      if (involvedMemberIds.length === 0) return false;
    }

    if (splitType === "custom") {
      const entries = Object.entries(customAmounts);
      if (entries.length === 0) return false;

      const sum = entries.reduce(
        (acc, [_, val]) => acc + (Number(val) || 0),
        0,
      );

      if (Math.abs(sum - Number(totalAmount)) > 0.01) return false;
    }

    return true;
  };

  return (
    <div className="relative bg-white p-7 rounded-3xl border border-gray-100 max-w-2xl mx-auto shadow-2xl animate-in fade-in zoom-in-95 duration-200">
      {/* Header */}
      <div className="flex justify-between items-center mb-7">
        <div>
          <h2 className="text-2xl font-black text-gray-900">Add Expense</h2>
          <p className="text-xs text-gray-400 font-semibold">
            Split your expense with room members
          </p>
        </div>
        <button
          onClick={onClose}
          className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition"
        >
          ✕
        </button>
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-7">
        {/* Title */}
        <div>
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2 px-1">
            Description
          </label>
          <input
            placeholder="Dinner, Movie, Uber..."
            className="w-full text-lg font-bold p-3 border border-gray-100 rounded-xl focus:ring-2 focus:ring-[#1cc29f] outline-none transition"
            onChange={(e) => {
              setTitle(e.target.value);
              setError("");
            }}
            required
          />
        </div>

        {/* Amount */}
        <div>
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2 px-1">
            Total Amount
          </label>
          <div className="relative">
            <span className="absolute left-4 top-4 text-gray-400 font-black text-xl">
              ₹
            </span>
            <input
              type="number"
              step="0.01"
              placeholder="0.00"
              className="w-full text-4xl pl-12 p-4 bg-gradient-to-br from-gray-50 to-white rounded-2xl border border-gray-100 focus:ring-2 focus:ring-[#1cc29f] outline-none font-black text-gray-800 transition-all"
              onChange={(e) => {
                setTotalAmount(e.target.value);
                setError("");
              }}
              required
            />
          </div>
        </div>

        {/* Paid By */}
        <div className="relative" ref={dropdownRef}>
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2 px-1">
            Paid By
          </label>
          <div
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="w-full p-4 border border-gray-100 rounded-2xl bg-gray-50 flex items-center justify-between cursor-pointer hover:border-[#1cc29f] transition"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#1cc29f] to-[#17a888] flex items-center justify-center text-white font-black">
                {selectedPayer?.name?.charAt(0).toUpperCase()}
              </div>
              <span className="font-bold text-gray-700">
                {selectedPayer?.name}{" "}
                {user.id === selectedPayer?._id && "(You)"}
              </span>
            </div>
            <span
              className={`text-gray-400 transition-transform ${
                isDropdownOpen ? "rotate-180" : ""
              }`}
            >
              ▼
            </span>
          </div>

          {isDropdownOpen && (
            <div className="absolute left-0 right-0 z-[100] mt-2 bg-white border border-gray-100 rounded-2xl shadow-xl max-h-56 overflow-y-auto animate-in slide-in-from-top-2">
              {members.map((m) => (
                <div
                  key={m._id}
                  onClick={() => {
                    setPaidBy(m._id);
                    setIsDropdownOpen(false);
                  }}
                  className={`flex items-center gap-3 p-4 cursor-pointer transition ${
                    paidBy === m._id
                      ? "bg-[#1cc29f]/10 text-[#1cc29f]"
                      : "hover:bg-gray-50"
                  }`}
                >
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center font-black">
                    {m.name?.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-bold">
                    {m.name} {user.id === m._id ? "(You)" : ""}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Split Toggle */}
        <div className="bg-gray-50 p-1 rounded-2xl border border-gray-100 grid grid-cols-2">
          {["equal", "custom"].map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => {
                setSplitType(type);
                setError("");
              }}
              className={`py-3 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${
                splitType === type
                  ? "bg-white shadow text-[#1cc29f]"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        {/* Split List */}
        <div>
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2 px-1">
            Split Between
          </label>
          <div className="rounded-2xl border border-gray-100 divide-y">
            {members.map((m) => (
              <div
                key={m._id}
                className="flex justify-between items-center p-4 hover:bg-gray-50 transition"
              >
                <span className="font-bold text-gray-700">
                  {m.name} {user.id === m._id ? "(You)" : ""}
                </span>

                {splitType === "equal" ? (
                  <input
                    type="checkbox"
                    checked={involvedMemberIds.includes(m._id)}
                    onChange={() => toggleMember(m._id)}
                    className="w-5 h-5 accent-[#1cc29f]"
                  />
                ) : (
                  <input
                    type="number"
                    placeholder="₹0"
                    className="w-24 p-2 bg-gray-100 rounded-xl text-right font-bold focus:ring-1 focus:ring-[#1cc29f]"
                    onChange={(e) => handleCustomInput(m._id, e.target.value)}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm font-bold">
            ⚠️ {error}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-4 pt-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 bg-gray-100 text-gray-600 font-bold py-4 rounded-2xl hover:bg-gray-200 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!isFormValid() || savingExpense}
            className={`flex-1 font-black py-4 rounded-2xl transition shadow-lg
    ${
      !isFormValid()
        ? "bg-gray-200 text-gray-400 cursor-not-allowed"
        : "bg-gradient-to-br from-[#ff652f] to-[#ff8f65] text-white hover:scale-[1.02]"
    }
  `}
          >
            {savingExpense ? "Saving..." : "Save Expense"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateExpense;
