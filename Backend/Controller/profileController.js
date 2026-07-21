const User = require("../Models/User");

const uploadProfilePhoto = async (req, res) => {
  try {
    const userId = req.userId;

    if (!req.file) {
      return res.status(400).json({ message: "No image uploaded" });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { profilePhoto: req.file.path },
      { new: true },
    ).select("_id name email profilePhoto");

    return res.json({
      message: "Profile photo updated",
      user,
    });
  } catch (err) {
    console.error("Upload profile photo error:", err);
    return res.status(500).json({ message: "Upload failed" });
  }
};
const removeProfilePhoto = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findByIdAndUpdate(
      userId,
      { profilePhoto: "" },
      { new: true },
    ).select("_id name email profilePhoto");

    return res.json({
      message: "Profile photo removed",
      user,
    });
  } catch (err) {
    console.error("Remove profile photo error:", err);
    return res.status(500).json({ message: "Remove failed" });
  }
};

module.exports = { uploadProfilePhoto, removeProfilePhoto };
