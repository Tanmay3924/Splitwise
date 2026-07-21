import { useState } from "react";
import { useNavigate, Navigate, Link } from "react-router-dom";
import { useApp } from "../context/AppContext";

const LoginPage = () => {
  const navigate = useNavigate();
  const { setUser, showToast, setGlobalError, user } = useApp();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Authenticated users are redirected
  if (user) {
    return <Navigate to="/rooms" replace />;
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // UX: Clear specific error when user starts typing
    if (errors[name] || errors.general) {
      setErrors((prev) => ({ ...prev, [name]: null, general: null }));
    }
  };

  const validateForm = () => {
    let newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // 1. Email Validation (Trimming is okay here)
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // 2. Password Validation (Do NOT trim the actual value)
    if (!formData.password) {
      newErrors.password = "Password is required";
    }
    // Optional: only if you want to catch obvious mistakes
    // without revealing if the account exists
    else if (formData.password.length < 8) {
      newErrors.general = "Invalid email or password";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    if (!validateForm()) return;

    try {
      setLoading(true);
      const res = await fetch(
        `${import.meta.env.VITE_backendUrl}/api/auth/login`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        },
      );

      const data = await res.json();

      if (!res.ok) {
        // Handle specific unauthorized or not found errors as general alerts
        setErrors({ general: data.message || "Invalid email or password" });
        return;
      }

      setUser(data.user);
      showToast("Welcome back!", "success");
      navigate("/rooms", { replace: true });
    } catch (err) {
      setGlobalError({
        title: "Login error",
        message: "Unable to connect to server. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
        {/* Header Section */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-[#1cc29f] rounded-full flex items-center justify-center mb-4 shadow-sm">
            <span className="text-white text-3xl font-bold">S</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-800">
            Log in to Splitwise
          </h2>
        </div>

        {/* General Error Display */}
        {errors.general && (
          <div className="mb-6 p-3 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm animate-pulse">
            {errors.general}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          {/* Email Input */}
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-1">
              Email address
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="yourname@example.com"
              className={`w-full px-4 py-2 border rounded outline-none transition ${
                errors.email
                  ? "border-red-500 ring-1 ring-red-500"
                  : "border-gray-300 focus:ring-2 focus:ring-[#1cc29f] focus:border-transparent"
              }`}
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">{errors.email}</p>
            )}
          </div>

          {/* Password Input */}
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-1">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter password"
              className={`w-full px-4 py-2 border rounded outline-none transition ${
                errors.password
                  ? "border-red-500 ring-1 ring-red-500"
                  : "border-gray-300 focus:ring-2 focus:ring-[#1cc29f] focus:border-transparent"
              }`}
            />
            {errors.password && (
              <p className="text-red-500 text-xs mt-1">{errors.password}</p>
            )}
          </div>
          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded shadow-lg font-bold transition ${
              loading
                ? "bg-gray-300 cursor-not-allowed text-gray-500"
                : "bg-[#1cc29f] hover:bg-[#16a085] text-white"
            }`}
          >
            {loading ? "Logging in..." : "Log in"}
          </button>
        </form>

        <div className="mt-8 text-center space-y-3">
          <p>
            <a
              href="/forgot-password"
              className="text-sm text-[#1cc29f] hover:underline"
            >
              Forgot your password?
            </a>
          </p>
          <div className="pt-4 border-t border-gray-100">
            <p className="text-sm text-gray-600">
              Done with bills?{" "}
              <Link
                to="/signup"
                replace={true}
                className="text-[#1cc29f] font-bold hover:underline"
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
