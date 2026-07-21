const MemberRowSkeleton = () => {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm flex items-center justify-between">
      <div className="flex items-center gap-4">
        {/* Avatar */}
        <div className="w-12 h-12 rounded-xl bg-gray-200 shrink-0" />

        {/* Text */}
        <div className="space-y-2">
          <div className="h-4 w-36 bg-gray-200 rounded" />
          <div className="h-3 w-28 bg-gray-100 rounded" />
        </div>
      </div>

      {/* Action */}
      <div className="h-7 w-20 bg-gray-200 rounded-xl" />
    </div>
  );
};

export default MemberRowSkeleton;
