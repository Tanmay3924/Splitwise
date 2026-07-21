const ExpensesEmptyState = () => {
  return (
    <div className="bg-white border border-dashed border-gray-200 rounded-lg p-10 text-center">
      <p className="text-gray-500 text-sm font-medium">
        You are not part of any expenses yet.
      </p>
    </div>
  );
};

export default ExpensesEmptyState;
