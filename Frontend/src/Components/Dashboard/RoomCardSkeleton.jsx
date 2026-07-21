const RoomCardSkeleton = () => {
  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col h-full animate-pulse">
      {/* Header Section: Icon and Role Badge */}
      <div className="flex justify-between items-start mb-6">
        {/* Icon Badge Placeholder */}
        <div className="w-12 h-12 bg-gray-200 rounded-xl"></div>

        {/* Role Badge Placeholder */}
        <div className="w-12 h-5 bg-gray-100 rounded"></div>
      </div>

      {/* Content Section */}
      <div className="flex-1">
        {/* Room Name Placeholder */}
        <div className="h-6 bg-gray-200 rounded-md w-3/4 mb-2"></div>
        {/* Hosted By Placeholder */}
        <div className="h-4 bg-gray-100 rounded-md w-1/2 mb-6"></div>
      </div>

      {/* Footer Section */}
      <div className="flex items-center justify-between pt-6 border-t border-gray-50">
        {/* Member Count Placeholder */}
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-gray-200" />
          <div className="h-4 bg-gray-200 rounded w-20"></div>
        </div>

        {/* Link Placeholder */}
        <div className="h-4 bg-gray-200 rounded w-16"></div>
      </div>
    </div>
  );
};

export default RoomCardSkeleton;
