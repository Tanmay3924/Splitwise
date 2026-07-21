const express = require("express");
const authMiddleware = require("../Middleware/authMiddleware");
const {
  removeProfilePhoto,
  uploadProfilePhoto,
} = require("../Controller/profileController");
const router = express.Router();
const multer = require("multer");
const storage = require("../Config/cloudinaryStorage");
const upload = multer({ storage });
router.post(
  "/profile-photo",
  authMiddleware,
  upload.single("photo"),
  uploadProfilePhoto,
);
router.delete("/profile-photo", authMiddleware, removeProfilePhoto);

module.exports = router;
