const Loading = ({ message }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[100px] w-full p-5">
      {/* Spinner Animation */}
      <div className="relative flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-[#1cc29f]/20 border-t-[#1cc29f] rounded-full animate-spin"></div>
        <div className="absolute text-[#1cc29f] font-bold text-xl">S</div>
      </div>

      {/* Text Indicator */}
      <p className="mt-4 text-gray-500 font-medium animate-pulse">
        {message || "Loading..."}
      </p>
    </div>
  );
};

export default Loading;
