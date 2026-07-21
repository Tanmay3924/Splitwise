import { Link } from "react-router-dom";
import { useApp } from "../../context/AppContext";

const DashboardHeader = () => {
  const { user, logout } = useApp();

  return (
    <nav className="sticky top-0 z-[100] w-full px-6 py-4">
      {/* Glassmorphism Container */}
      <div className="max-w-7xl mx-auto bg-white/80 backdrop-blur-md border border-white/20 px-6 py-3 rounded-2xl shadow-xl shadow-gray-200/50 flex justify-between items-center transition-all">
        {/* Brand Section */}
        <Link to="/rooms" className="flex items-center gap-3 group">
          <div className="bg-[#1cc29f] text-white w-10 h-10 rounded-xl flex items-center justify-center font-black text-2xl shadow-lg shadow-[#1cc29f]/30 group-hover:rotate-6 transition-transform">
            S
          </div>
          <div className="flex flex-col leading-none">
            <h1 className="text-lg font-black tracking-tight text-gray-900 uppercase">
              Splitwise
            </h1>
            <span className="text-[10px] font-bold text-[#1cc29f] uppercase tracking-widest">
              Dashboard
            </span>
          </div>
        </Link>

        {/* User Actions Section */}
        <div className="flex items-center gap-6">
          {/* Profile Quick Link */}
          <Link to="/profile" className="flex items-center gap-3 group">
            <div className="hidden sm:flex flex-col items-end leading-tight">
              <span className="text-sm font-bold text-gray-900 group-hover:text-[#1cc29f] transition-colors">
                {user?.name}
              </span>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
                View Profile
              </span>
            </div>

            <div className="w-10 h-10 rounded-xl overflow-hidden border-2 border-gray-100 group-hover:border-[#1cc29f] bg-gray-50 flex items-center justify-center transition-all shadow-sm">
              {user?.profilePhoto ? (
                <img
                  src={user.profilePhoto}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-[#1cc29f] font-black text-lg">
                  {user?.name?.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
          </Link>

          <div className="h-8 w-px bg-gray-100 mx-1 hidden sm:block" />

          {/* Logout Button */}
          <button
            onClick={logout}
            className="flex items-center justify-center w-10 h-10 sm:w-auto sm:px-4 sm:py-2 rounded-xl bg-gray-50 text-gray-400 hover:bg-red-50 hover:text-red-500 hover:border-red-100 border border-transparent transition-all group"
            title="Logout"
          >
            <svg
              className="w-5 h-5 sm:w-4 sm:h-4 group-hover:-translate-x-0.5 transition-transform"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            <span className="hidden sm:inline-block ml-2 text-xs font-black uppercase tracking-widest">
              Logout
            </span>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default DashboardHeader;
