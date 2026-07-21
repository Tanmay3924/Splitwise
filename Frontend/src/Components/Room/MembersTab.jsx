import { useEffect, useState } from "react";
import MembersTabSkeleton from "../Room/MembersTabSkeleton";
import AddMember from "../AddMember";
import { useApp } from "../../context/AppContext";
import { useRoom } from "../../context/RoomContext";

const MembersTab = () => {
  const { user } = useApp();
  const {
    fetchMembers,
    roomMeta,
    members,
    membersLoading,
    memberTabError,
    handleRemoveMember,
    setSearchQuery,
    removingMember,
    handleDeleteRoom,
    deletingRoom,
  } = useRoom();
  const [addMemberOpen, setAddMemberOpen] = useState(false);
  const [memberToBeRemoved, setMemberToBeRemoved] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  return (
    <div className="space-y-8 pb-20">
      {membersLoading ? (
        <MembersTabSkeleton />
      ) : memberTabError ? (
        /* --- ERROR STATE VIEW --- */
        <div className="bg-white border-2 border-red-50 rounded-[2rem] p-12 text-center">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500">
            <svg
              className="w-8 h-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-black text-gray-900 mb-2">
            Unable to load members
          </h3>
          <p className="text-sm text-gray-500 font-medium mb-6">
            {memberTabError}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-gray-900 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-gray-800 transition-all"
          >
            Try Again
          </button>
        </div>
      ) : (
        <>
          {/* Header Section */}
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-xl font-black text-gray-900 tracking-tight">
                Room Members
              </h3>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">
                {members.length} active participants
              </p>
            </div>

            {roomMeta.isOwner && (
              <button
                onClick={() => {
                  setAddMemberOpen(!addMemberOpen);
                  setSearchQuery("");
                }}
                className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-lg ${
                  addMemberOpen
                    ? "bg-gray-900 text-white rotate-45"
                    : "bg-[#1cc29f] text-white shadow-[#1cc29f]/20 hover:scale-105"
                }`}
              >
                <span className="text-2xl font-light">+</span>
              </button>
            )}
          </div>

          {/* Add Member Card */}
          {addMemberOpen && (
            <div className="animate-in zoom-in-95 fade-in duration-300">
              <AddMember />
            </div>
          )}

          {/* Members List Container */}
          <div className="grid grid-cols-1 gap-3">
            {members.map((member) => {
              const isCurrentUser = member._id === user._id;
              const isRoomOwner = member._id === roomMeta.owner._id;

              return (
                <div
                  key={member._id}
                  className="bg-white p-4 rounded-2xl border border-gray-100 flex items-center justify-between shadow-sm hover:border-[#1cc29f]/30 transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center overflow-hidden shrink-0">
                      {member.profilePhoto ? (
                        <img
                          src={member.profilePhoto}
                          className="w-full h-full object-cover"
                          alt={member.name}
                        />
                      ) : (
                        <span className="text-[#1cc29f] font-bold">
                          {member.name?.charAt(0)}
                        </span>
                      )}
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-gray-800">
                        {member.name}{" "}
                        {isCurrentUser && (
                          <span className="text-[#1cc29f] ml-1">(You)</span>
                        )}
                      </h4>
                      <p className="text-[11px] font-medium text-gray-400">
                        {member.email}
                      </p>
                    </div>
                  </div>

                  {isRoomOwner ? (
                    <div className="bg-amber-50 px-3 py-1 rounded-lg border border-amber-100">
                      <span className="text-[10px] font-black text-amber-600 uppercase tracking-tighter">
                        Owner
                      </span>
                    </div>
                  ) : (
                    roomMeta.isOwner && (
                      <button
                        onClick={() => {
                          setMemberToBeRemoved(member._id);
                          handleRemoveMember(member._id);
                        }}
                        disabled={removingMember}
                        className="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-red-500 bg-red-50 hover:bg-red-500 hover:text-white rounded-xl transition-all disabled:opacity-30"
                      >
                        {removingMember && memberToBeRemoved === member._id
                          ? "Removing..."
                          : "Remove"}
                      </button>
                    )
                  )}
                </div>
              );
            })}
          </div>

          {/* Danger Zone */}
          {roomMeta.isOwner && (
            <div className="pt-10 border-t border-gray-100">
              <div className="bg-red-50/50 rounded-[2rem] p-8 border border-red-100/50 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="text-center md:text-left">
                  <span className="text-[10px] font-black text-red-500 uppercase tracking-[0.3em] mb-2 block">
                    Danger Zone
                  </span>
                  <h4 className="text-lg font-black text-gray-900">
                    Delete this room?
                  </h4>
                  <p className="text-sm text-gray-500 font-medium">
                    This wipes all data. This cannot be undone.
                  </p>
                </div>
                <button
                  onClick={() => setShowDeleteModal(true)} // Changed to open modal
                  disabled={deletingRoom}
                  className="bg-white border-2 border-red-200 text-red-500 px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-red-500 hover:text-white hover:border-red-500 transition-all active:scale-95 disabled:opacity-50"
                >
                  Delete Permanently
                </button>
              </div>
              <ConfirmModal
                isOpen={showDeleteModal}
                title="Delete this room?"
                message="Are you sure you want to delete this room? This action will permanently remove all data and cannot be undone."
                onConfirm={() => {
                  handleDeleteRoom();
                  setShowDeleteModal(false);
                }}
                onCancel={() => setShowDeleteModal(false)}
                isLoading={deletingRoom}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
};

const ConfirmModal = ({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  isLoading,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-[2rem] p-8 w-full max-w-sm shadow-2xl animate-in zoom-in-95 duration-200">
        <h3 className="text-xl font-black text-gray-900 mb-2">{title}</h3>
        <p className="text-sm text-gray-500 mb-8 font-medium">{message}</p>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest text-gray-600 bg-gray-100 hover:bg-gray-200 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest text-white bg-red-500 hover:bg-red-600 transition-all disabled:opacity-50"
          >
            {isLoading ? "Deleting..." : "Confirm"}
          </button>
        </div>
      </div>
    </div>
  );
};
export default MembersTab;
