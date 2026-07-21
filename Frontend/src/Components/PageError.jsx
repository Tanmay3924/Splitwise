const PageError = ({
  title = "Something went wrong",
  message = "We couldn't load this page.",
  onRetry,
}) => {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="bg-white border rounded-xl shadow-sm p-8 max-w-md w-full text-center">
        <div className="text-red-500 text-3xl font-bold mb-4">!</div>

        <h2 className="text-lg font-bold text-gray-800 mb-2">{title}</h2>

        <p className="text-sm text-gray-600 mb-6">{message}</p>

        {onRetry && (
          <button
            onClick={onRetry}
            className="bg-[#1cc29f] hover:bg-[#16a085] text-white font-bold px-6 py-2 rounded transition"
          >
            Try Again
          </button>
        )}
      </div>
    </div>
  );
};

export default PageError;
