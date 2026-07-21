import { useState } from "react";
import ExpensesSkeleton from "./ExpensesSkeleton";
import ExpensesEmptyState from "./ExpensesEmptyState";
import ExpensesOwnerEmptyState from "./ExpensesOwnerEmptyState";
import CreateExpense from "../CreateExpense";
import { useApp } from "../../context/AppContext";

const ExpensesTab = ({
  isOwner,
  expenses,
  setExpenses,
  loading,
  error,
  roomId,
  members,
  ownerId,
}) => {
  const { showToast, user } = useApp();
  const [expandedId, setExpandedId] = useState(null);
  const [addExpenseClicked, setAddExpenseClicked] = useState(false);

  const toggle = (id) => setExpandedId((prev) => (prev === id ? null : id));
  if (addExpenseClicked)
    return (
      <CreateExpense
        roomId={roomId}
        members={members}
        onClose={() => setAddExpenseClicked(false)}
        user={user}
        onExpenseCreated={(newExpense) => {
          setExpandedId(null);
          setExpenses((prev) => [newExpense, ...prev]);
          setAddExpenseClicked(false);
          showToast("Expense added successfully", "success");
        }}
      />
    );

  if (loading) return <ExpensesSkeleton />;

  if (error)
    return (
      <div className="bg-red-50 border-2 border-red-100/50 rounded-2xl p-6 text-center animate-in zoom-in-95 duration-300">
        <p className="text-red-600 text-xs font-black uppercase tracking-widest">
          {error}
        </p>
      </div>
    );

  if (expenses.length === 0) {
    return isOwner ? (
      <ExpensesOwnerEmptyState
        onAddExpense={() => setAddExpenseClicked(true)}
      />
    ) : (
      <ExpensesEmptyState />
    );
  }

  return (
    <div className="space-y-8 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Premium Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-black text-gray-900 tracking-tight">
            Expenses
          </h3>
          <p className="text-xs text-gray-400 font-bold uppercase tracking-[0.2em] mt-1">
            Room activity
          </p>
        </div>
        {isOwner && (
          <button
            onClick={() => setAddExpenseClicked(true)}
            className="bg-gray-900 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-[#1cc29f] transition-all transform active:scale-95 shadow-xl shadow-gray-200"
          >
            + Add Bill
          </button>
        )}
      </div>

      {/* List Container */}
      <div className="grid grid-cols-1 gap-4">
        {expenses.map((expense) => {
          const isOpen = expandedId === expense._id;
          const dateObj = new Date(expense.createdAt);
          const day = dateObj.getDate();
          const month = dateObj.toLocaleDateString("en-IN", { month: "short" });

          return (
            <div
              key={expense._id}
              className={`bg-white rounded-[2rem] border transition-all duration-300 ${isOpen ? "border-[#1cc29f] shadow-xl shadow-gray-100" : "border-gray-100 hover:border-gray-200 shadow-sm"}`}
            >
              <button
                onClick={() => toggle(expense._id)}
                className="w-full text-left p-6 flex justify-between items-center outline-none"
              >
                <div className="flex items-center gap-5">
                  {/* Date Badge */}
                  <div
                    className={`flex flex-col items-center justify-center w-14 h-14 rounded-2xl transition-colors ${isOpen ? "bg-[#1cc29f] text-white" : "bg-gray-50 text-gray-400"}`}
                  >
                    <span className="text-[10px] font-black uppercase tracking-tighter leading-none">
                      {month}
                    </span>
                    <span className="text-lg font-black">{day}</span>
                  </div>

                  <div>
                    <h4 className="font-black text-gray-800 tracking-tight group-hover:text-[#1cc29f] transition-colors">
                      {expense.title}
                    </h4>
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                      Paid by{" "}
                      <span
                        className={
                          expense.paidBy._id === user.id
                            ? "text-[#1cc29f]"
                            : "text-gray-600"
                        }
                      >
                        {expense.paidBy._id === user.id
                          ? "You"
                          : expense.paidBy.name}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <span className="text-lg font-black text-gray-900">
                    ₹{expense.totalAmount}
                  </span>
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${isOpen ? "bg-[#1cc29f] text-white rotate-180" : "bg-gray-50 text-gray-300"}`}
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </div>
              </button>

              {/* Collapsible Split Details */}
              <div
                className={`grid transition-all duration-300 ease-in-out ${isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}
              >
                <div className="overflow-hidden">
                  <div className="px-8 pb-8 pt-2 space-y-6">
                    <div className="h-px bg-gray-100 w-full" />

                    <div className="space-y-4">
                      <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.25em]">
                        Split Distribution
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {expense.splits.map((split, i) => (
                          <div
                            key={i}
                            className="flex justify-between items-center p-3 bg-gray-50/50 rounded-xl border border-gray-100/50"
                          >
                            <div className="flex items-center gap-3">
                              <img
                                src={
                                  split.user.profilePhoto ||
                                  "/default-avatar.png"
                                }
                                className="w-7 h-7 rounded-lg object-cover border-2 border-white shadow-sm"
                                alt=""
                              />
                              <span className="text-xs font-bold text-gray-600">
                                {user.id === split.user._id
                                  ? "You"
                                  : split.user.name.split(" ")[0]}{" "}
                                {ownerId === split.user._id && (
                                  <span className="text-[#1cc29f] ml-1">★</span>
                                )}
                              </span>
                            </div>
                            <span className="text-xs font-black text-gray-900">
                              ₹{split.amount}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ExpensesTab;
