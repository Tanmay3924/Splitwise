const BalancesSkeleton = () => {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Title Skeleton */}
      <div className="h-8 w-40 bg-gray-200 rounded-xl" />

      {/* Cards */}
      <div className="space-y-4">
        {[1, 2, 3].map((item) => (
          <div
            key={item}
            className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 
                       flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center"
          >
            {/* LEFT */}
            <div className="flex items-center gap-3 w-full">
              {/* Avatar */}
              <div className="w-9 h-9 bg-gray-200 rounded-full shrink-0" />

              {/* Text lines */}
              <div className="space-y-2 w-full">
                <div className="h-4 w-48 bg-gray-200 rounded" />
                <div className="h-3 w-32 bg-gray-200 rounded" />
              </div>
            </div>

            {/* RIGHT */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full sm:w-auto">
              {/* Amount */}
              <div className="h-6 w-20 bg-gray-200 rounded-lg" />

              {/* Button */}
              <div className="h-8 w-full sm:w-24 bg-gray-200 rounded-xl" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BalancesSkeleton;
