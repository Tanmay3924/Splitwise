function ErrorModal({ error, onClose }) {
  if (!error) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header with Error Icon */}
        <div className="bg-red-50 p-6 flex flex-col items-center">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <span className="text-red-600 text-2xl font-bold">!</span>
          </div>
          <h3 className="text-xl font-bold text-gray-800">
            {error.title || "Error Occurred"}
          </h3>
        </div>

        {/* Content */}
        <div className="p-6 text-center">
          <p className="text-gray-600 leading-relaxed mb-6">{error.message}</p>

          <button
            onClick={onClose}
            className="w-full bg-gray-800 hover:bg-gray-900 text-white font-bold py-3 rounded-lg transition duration-200 shadow-lg"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default ErrorModal;
