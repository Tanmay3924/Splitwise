import { useEffect } from "react";

const Toast = ({ message, type = "success", onClose, duration = 3000 }) => {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose, message]);

  if (!message) return null;

  const config = {
    success: {
      style: "bg-gray-900 text-white border-[#1cc29f]",
      icon: "✓",
      iconStyle: "bg-[#1cc29f] text-white",
    },
    error: {
      style: "bg-white text-red-900 border-red-100 shadow-red-100",
      icon: "!",
      iconStyle: "bg-red-500 text-white",
    },
    info: {
      style: "bg-white text-blue-900 border-blue-100 shadow-blue-100",
      icon: "i",
      iconStyle: "bg-blue-500 text-white",
    },
  };

  const current = config[type] || config.success;

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[9999] w-[90%] max-w-sm animate-in fade-in slide-in-from-bottom-5 duration-300 ease-out">
      <div
        className={`${current.style} p-3.5 rounded-2xl border shadow-2xl flex items-center gap-4`}
      >
        {/* Status Icon */}
        <div
          className={`${current.iconStyle} w-6 h-6 shrink-0 rounded-full flex items-center justify-center text-[10px] font-black`}
        >
          {current.icon}
        </div>

        {/* Message */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold leading-tight truncate">{message}</p>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="p-1.5 hover:bg-gray-100/10 rounded-lg transition-colors group"
          aria-label="Close notification"
        >
          <span className="text-gray-400 group-hover:text-gray-200 text-xs">
            ✕
          </span>
        </button>
      </div>
    </div>
  );
};

export default Toast;
