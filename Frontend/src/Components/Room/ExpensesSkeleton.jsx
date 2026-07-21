const ExpensesSkeleton = () => {
  return (
    <div className="space-y-4 animate-pulse">
      {/* Header skeleton */}
      <div className="flex justify-between items-center mb-6">
        <div className="h-6 w-32 bg-gray-200 rounded" />
        <div className="h-9 w-28 bg-gray-200 rounded-md" />
      </div>

      {/* Expense cards skeleton */}
      {[1, 2, 3].map((item) => (
        <div
          key={item}
          className="bg-white rounded-lg border shadow-sm p-4 flex justify-between items-center"
        >
          <div className="space-y-2">
            <div className="h-4 w-40 bg-gray-200 rounded" />
            <div className="h-3 w-24 bg-gray-100 rounded" />
          </div>

          <div className="h-4 w-16 bg-gray-200 rounded" />
        </div>
      ))}
    </div>
  );
};

export default ExpensesSkeleton;
