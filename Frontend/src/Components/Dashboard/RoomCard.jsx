import { Link } from "react-router-dom";
import { useApp } from "../../context/AppContext";

const RoomCard = ({ room }) => {
  const { user } = useApp();
  const isOwner = room.owner === user?._id;
  // console.log(room);
  // console.log(user);
  // console.log(isOwner);

  return (
    <div className="group bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:border-[#1cc29f] hover:shadow-md transition-all duration-300 flex flex-col h-full">
      <div className="flex justify-between items-start mb-6">
        {/* Simple Icon Badge */}
        <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center text-[#1cc29f] group-hover:bg-[#1cc29f] group-hover:text-white transition-colors">
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
            />
          </svg>
        </div>

        {/* Minimal Role Badge */}
        {isOwner && (
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest border border-gray-200 px-2 py-1 rounded">
            Owner
          </span>
        )}
      </div>

      <h3 className="text-xl font-bold text-gray-900 mb-1 leading-tight">
        {room.name}
      </h3>

      {/* Simplified Member Indicator */}
      <div className="flex items-center justify-between pt-6 border-t border-gray-50">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#1cc29f]" />
          <span className="text-sm font-semibold text-gray-700">
            {room.members.length}{" "}
            {room.members.length === 1 ? "member" : "members"}
          </span>
        </div>

        <Link
          to={`/rooms/${room._id}`}
          className="text-sm font-bold text-[#1cc29f] hover:text-[#16a085] flex items-center gap-1 transition-colors"
        >
          Enter Room <span>→</span>
        </Link>
      </div>
    </div>
  );
};
export default RoomCard;
