import MemberRowSkeleton from "./MemberRowSkeleton";

const MembersTabSkeleton = () => {
  return (
    <div className="space-y-10 pb-20 animate-pulse">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <div className="h-7 w-40 bg-gray-200 rounded-lg" />
          <div className="h-3 w-28 bg-gray-100 rounded" />
        </div>
        <div className="h-12 w-12 bg-gray-200 rounded-2xl" />
      </div>

      {/* Members */}
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <MemberRowSkeleton key={i} />
        ))}
      </div>

      {/* Danger Zone */}
      <div className="space-y-4 pt-10">
        <div className="h-4 w-32 bg-gray-200 rounded" />
        <div className="bg-gray-100/50 rounded-3xl p-6 flex flex-col sm:flex-row justify-between gap-6">
          <div className="space-y-3">
            <div className="h-5 w-44 bg-gray-200 rounded" />
            <div className="h-4 w-64 bg-gray-200 rounded" />
          </div>
          <div className="h-12 w-40 bg-gray-300 rounded-2xl" />
        </div>
      </div>
    </div>
  );
};

export default MembersTabSkeleton;
