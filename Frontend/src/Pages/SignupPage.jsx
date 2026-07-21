import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";

const SignupPage = () => {
  const { showToast, setGlobalError } = useApp();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    upiId: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

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

    // Name Validation
    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    // Email Validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // Password Validation
    // 1. Define the trimmed version first for consistency
    const trimmedPassword = formData.password.trim();

    // 2. Check for empty or only-whitespace
    if (trimmedPassword === "") {
      newErrors.password =
        "Passwords cannot be empty or consist solely of whitespace.";
    }

    // 3. Check length against the TRIMMED version
    else if (trimmedPassword.length < 8) {
      newErrors.password = "Password must be at least 8 characters long";
    }

    // 4. Check complexity (Regex)
    else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*])/.test(trimmedPassword)) {
      newErrors.password =
        "Must include uppercase, lowercase, and a special character";
    }
    const upiRegex = /^[\w.-]+@[\w.-]+$/;
    if (formData.upiId.trim() && !upiRegex.test(formData.upiId)) {
      newErrors.upiId = "Please enter a valid UPI ID (e.g., name@bank)";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setErrors({});

    const isValid = validateForm();
    if (!isValid) return;

    try {
      setLoading(true);
      const res = await fetch(
        `${import.meta.env.VITE_backendUrl}/api/auth/signup`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        },
      );

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 409) {
          setErrors({ email: data.message });
        } else {
          setErrors({ general: data.message || "Signup failed" });
        }
        return;
      }

      showToast("Signup successful! Please log in.");
      navigate("/login", { replace: true });
    } catch {
      setGlobalError({
        title: "Signup error",
        message: "Unable to connect to server. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
        <div className="mb-8">
          <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-2">
            Introduce Yourself
          </h2>
          <h1 className="text-3xl font-bold text-gray-800">
            Hi there! My name is
          </h1>
        </div>

        {errors.general && (
          <div className="mb-6 p-3 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm">
            {errors.general}
          </div>
        )}

        <form onSubmit={handleSignup} className="space-y-6" noValidate>
          {/* Name Input */}
          <div>
            <input
              type="text"
              name="name"
              placeholder="Your name"
              value={formData.name}
              onChange={handleChange}
              className={`w-full text-xl px-0 py-2 border-b-2 outline-none transition bg-transparent ${
                errors.name
                  ? "border-red-500"
                  : "border-gray-200 focus:border-[#1cc29f]"
              }`}
              required
            />
            {errors.name && (
              <p className="text-red-500 text-xs mt-1">{errors.name}</p>
            )}
          </div>

          <div className="space-y-4">
            <p className="text-gray-600 text-sm">
              Here’s my <strong>email</strong>, <strong>password</strong>, and{" "}
              <strong>UPI</strong>:
            </p>

            {/* Email Input */}
            <div>
              <input
                type="email"
                name="email"
                placeholder="Email address"
                value={formData.email}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded outline-none transition ${
                  errors.email
                    ? "border-red-500 ring-1 ring-red-500"
                    : "border-gray-300 focus:ring-2 focus:ring-[#1cc29f]"
                }`}
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">{errors.email}</p>
              )}
            </div>

            {/* Password Input */}
            <div>
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded outline-none transition ${
                  errors.password
                    ? "border-red-500 ring-1 ring-red-500"
                    : "border-gray-300 focus:ring-2 focus:ring-[#1cc29f]"
                }`}
              />
              {errors.password && (
                <p className="text-red-500 text-xs mt-1">{errors.password}</p>
              )}
            </div>

            {/* UPI ID Input */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  Optional
                </label>
                {errors.upiId && (
                  <span className="text-red-500 text-[10px] font-bold uppercase">
                    Invalid Format
                  </span>
                )}
              </div>
              <input
                type="text"
                name="upiId"
                placeholder="UPI ID (e.g., name@okaxis)"
                value={formData.upiId}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded outline-none transition ${
                  errors.upiId
                    ? "border-red-500 ring-1 ring-red-500"
                    : "border-gray-300 focus:ring-2 focus:ring-[#1cc29f]"
                }`}
              />
              {errors.upiId ? (
                <p className="text-red-500 text-xs mt-1">{errors.upiId}</p>
              ) : (
                <p className="text-[10px] text-gray-400 mt-1 italic">
                  Adding this helps others settle up with you faster.
                </p>
              )}
            </div>
          </div>
          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded shadow-lg font-bold transition ${
              loading
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-[#ff652f] hover:bg-[#e55a2a] text-white"
            }`}
          >
            {loading ? "Signing up..." : "Sign me up!"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{" "}
            <Link
              to="/login"
              replace={true}
              className="text-[#1cc29f] font-bold hover:underline transition"
            >
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
