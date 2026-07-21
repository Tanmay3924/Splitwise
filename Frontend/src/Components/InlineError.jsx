const InlineError = ({ message }) => {
  // This can be passed as a prop for dynamic messages
  if (!message) return null;

  return (
    <div className="flex items-center gap-2 mt-1.5 animate-in slide-in-from-top-1 duration-200 ">
      {/* Small Error Icon */}
      <svg
        className="w-4 h-4 text-red-500"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>

      {/* Error Text */}
      <span className="text-sm font-medium text-red-500 italic">{message}</span>
    </div>
  );
};

export default InlineError;
