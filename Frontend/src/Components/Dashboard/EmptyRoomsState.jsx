const EmptyRoomsState = ({ onCreate }) => {
  return (
    <div className="group relative bg-white border-2 border-dashed border-gray-100 rounded-[2.5rem] p-12 md:p-20 text-center overflow-hidden transition-all duration-500 hover:border-[#1cc29f] hover:bg-[#1cc29f]/[0.01]">
      {/* Dynamic Background Pattern */}
      <div
        className="absolute inset-0 opacity-[0.05] pointer-events-none transition-opacity group-hover:opacity-[0.08]"
        style={{
          backgroundImage: `radial-gradient(#1cc29f 1.5px, transparent 1.5px)`,
          backgroundSize: "32px 32px",
        }}
      />

      <div className="relative z-10 flex flex-col items-center">
        {/* Floating Icon Container */}
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-[#1cc29f] blur-2xl opacity-10 group-hover:opacity-20 transition-opacity animate-pulse" />
          <div className="relative w-24 h-24 bg-white rounded-3xl shadow-xl shadow-gray-200 flex items-center justify-center text-[#1cc29f] transform transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-3">
            <svg
              className="w-12 h-12"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          </div>
        </div>

        <h3 className="text-3xl font-black text-gray-900 mb-3 tracking-tight">
          Ready to split?
        </h3>

        <p className="text-gray-400 max-w-sm mx-auto mb-10 font-medium leading-relaxed">
          Create a room to start tracking shared expenses with friends,
          roommates, or travel buddies.
        </p>

        <button
          onClick={onCreate}
          className="relative overflow-hidden group/btn bg-[#1cc29f] text-white px-10 py-4 rounded-2xl font-black shadow-xl shadow-[#1cc29f]/30 transition-all transform active:scale-95"
        >
          {/* Button Shine Effect */}
          <div className="absolute inset-0 w-1/2 h-full bg-white/20 skew-x-[-25deg] -translate-x-full group-hover/btn:animate-[shine_0.75s_ease-in-out]" />

          <div className="relative flex items-center gap-3">
            <span className="text-xl leading-none">+</span>
            <span className="uppercase tracking-widest text-xs">
              Create New Room
            </span>
          </div>
        </button>
      </div>

      <style>{`
        @keyframes shine {
          100% {
            transform: translateX(250%);
          }
        }
      `}</style>
    </div>
  );
};

export default EmptyRoomsState;
