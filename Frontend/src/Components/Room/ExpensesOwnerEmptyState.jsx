const ExpensesOwnerEmptyState = ({ onAddExpense }) => {
  return (
    <div className="bg-white border border-dashed border-gray-200 rounded-lg p-10 text-center space-y-4">
      <p className="text-gray-600 text-sm font-medium">
        No expenses yet. Add your first expense.
      </p>

      <button
        onClick={onAddExpense}
        className="bg-[#1cc29f] hover:bg-[#16a085] text-white px-5 py-2.5 rounded-lg font-bold text-sm transition"
      >
        + Add Expense
      </button>
    </div>
  );
};

export default ExpensesOwnerEmptyState;
