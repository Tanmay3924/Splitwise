import { useState } from "react";
import { replace, useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";

const ProfilePage = () => {
  const { showToast, user, setUser } = useApp();

  const [preview, setPreview] = useState(null);
  const [file, setFile] = useState(null);
  const [profilePhotoUploading, setProfilePhotoUploading] = useState(false);
  const [showUploadButton, setShowUploadButton] = useState(false);
  const [deletingPhoto, setDeletingPhoto] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const navigate = useNavigate();

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (!selected) return;
    if (!selected.type.startsWith("image/")) {
      showToast("Please select an image file", "error");
      return;
    }

    if (selected.size > 2 * 1024 * 1024) {
      showToast("Image must be under 2MB", "error");
      return;
    }

    setFile(selected);
    setPreview(URL.createObjectURL(selected));
    setShowUploadButton(true);
  };

  const handleUpload = () => {
    if (!file) return;
    onPhotoUpload(file);
  };

  const onPhotoUpload = async (file) => {
    try {
      setProfilePhotoUploading(true);
      const formData = new FormData();
      formData.append("photo", file);

      const res = await fetch(
        `${import.meta.env.VITE_backendUrl}/api/profile-photo`,
        {
          method: "POST",
          credentials: "include",
          body: formData,
        },
      );

      if (res.status === 401) {
        setUser(null);
        showToast("Session expired. Please login again.", "error");
        navigate("/login", { replace: true });
        return;
      }

      const data = await res.json();

      if (!res.ok) {
        showToast(data.message || "Upload failed", "error");
        return;
      }

      setUser(data.user);
      showToast("Profile photo updated!", "success");
      setShowUploadButton(false);
      setPreview(null);
      navigate("/rooms", { replace: true });
    } catch (error) {
      showToast("Unable to connect to server", "error");
    } finally {
      setProfilePhotoUploading(false);
    }
  };

  const handleDeletePhoto = async () => {
    try {
      setDeletingPhoto(true);

      const res = await fetch(
        `${import.meta.env.VITE_backendUrl}/api/profile-photo`,
        {
          method: "DELETE",
          credentials: "include",
        },
      );

      const data = await res.json();

      if (!res.ok) {
        showToast(data.message || "Failed to remove photo", "error");
        return;
      }

      setUser(data.user);
      setPreview(null);
      setFile(null);
      setShowUploadButton(false);
      setShowDeleteConfirm(false);
      showToast("Profile photo removed", "success");
      navigate("/rooms", { replace: true });
    } catch {
      showToast("Unable to connect to server", "error");
    } finally {
      setDeletingPhoto(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center items-start py-10 px-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-lg border p-6">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate(-1, { replace: true })}
            className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 transition"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>

          <h2 className="text-2xl font-black text-gray-800">My Profile</h2>

          {/* spacer to keep title centered */}
          <div className="w-10 h-10" />
        </div>

        {/* Avatar */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-[#1cc29f]/40 shadow-md bg-gray-100">
            <img
              src={preview || user?.profilePhoto || "/default-avatar.png"}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          </div>

          <label className="mt-4 cursor-pointer text-sm font-bold text-[#1cc29f] hover:underline">
            Change photo
            <input
              type="file"
              accept="image/*"
              hidden
              onChange={handleFileChange}
            />
          </label>

          {file && showUploadButton && (
            <button
              onClick={handleUpload}
              disabled={profilePhotoUploading}
              className="mt-3 bg-[#1cc29f] hover:bg-[#16a085] text-white px-5 py-2 rounded-lg font-bold transition"
            >
              {profilePhotoUploading ? "Uploading..." : "Upload"}
            </button>
          )}

          {/* ✅ Delete photo button */}
          {user?.profilePhoto && !file && (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              disabled={deletingPhoto}
              className="mt-3 text-xs font-bold text-red-500 hover:underline disabled:opacity-50"
            >
              {deletingPhoto ? "Removing..." : "Remove photo"}
            </button>
          )}
        </div>

        {/* User Info */}
        <div className="space-y-4">
          <div>
            <label className="text-xs uppercase tracking-wider text-gray-400 font-bold">
              Name
            </label>
            <div className="mt-1 p-3 bg-gray-100 rounded-lg font-semibold text-gray-800">
              {user?.name}
            </div>
          </div>

          <div>
            <label className="text-xs uppercase tracking-wider text-gray-400 font-bold">
              Email
            </label>
            <div className="mt-1 p-3 bg-gray-100 rounded-lg font-semibold text-gray-800">
              {user?.email}
            </div>
          </div>
        </div>
      </div>
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl animate-in zoom-in-95">
            <h3 className="text-lg font-black text-gray-900 mb-2">
              Remove profile photo?
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              Your profile photo will be removed and replaced with a default
              avatar.
            </p>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 rounded-xl bg-gray-100 text-gray-600 font-bold"
              >
                Cancel
              </button>

              <button
                onClick={handleDeletePhoto}
                disabled={deletingPhoto}
                className="px-4 py-2 rounded-xl bg-red-500 text-white font-bold hover:bg-red-600 disabled:opacity-50"
              >
                {deletingPhoto ? "Removing..." : "Remove"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
