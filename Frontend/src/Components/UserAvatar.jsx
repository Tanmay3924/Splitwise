const UserAvatar = ({ user, isYou = false, size = 32 }) => {
  if (!user) return null;

  const avatarUrl = user.profilePhoto || "/default-avatar.png";
  const label = isYou ? "You" : user.name;

  return (
    <div className="flex items-center gap-2">
      <img
        src={avatarUrl}
        alt={label}
        className="rounded-full object-cover border"
        style={{ width: size, height: size }}
        onError={(e) => {
          e.target.onerror = null;
          e.target.src = "/default-avatar.png";
        }}
      />
      <span className="text-sm font-medium text-gray-700">{label}</span>
    </div>
  );
};

export default UserAvatar;
