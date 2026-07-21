const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const userModel = require("../Models/User");
const { Resend } = require("resend");
const resend = new Resend(process.env.RESEND_API_KEY);
const crypto = require("crypto");
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;
const IV_LENGTH = 16;
const signUp = async (req, res) => {
  const { name, email, password, upiId } = req.body;

  // 1. Basic Presence Check
  if (!name || !email || !password) {
    return res
      .status(400)
      .json({ message: "Name, email, and password are required" });
  }

  // 2. Name Validation (Trimmed)
  if (name.trim().length === 0) {
    return res.status(400).json({ message: "Name cannot be empty" });
  }

  // 3. Email Format Validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: "Invalid email format" });
  }

  // 4. Password Strength Validation (Frontend: 8 chars, Upper, Lower, Special)
  const passwordRegex = /(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*])/;
  if (password.length < 8) {
    return res
      .status(400)
      .json({ message: "Password must be at least 8 characters long" });
  }
  if (!passwordRegex.test(password)) {
    return res.status(400).json({
      message:
        "Password must include uppercase, lowercase, and a special character",
    });
  }

  // 5. UPI ID Validation (Only if provided)
  if (upiId && upiId.trim() !== "") {
    const upiRegex = /^[\w.-]+@[\w.-]+$/;
    if (!upiRegex.test(upiId)) {
      return res.status(400).json({ message: "Invalid UPI ID format" });
    }
  }

  try {
    // Check if user exists
    const isExist = await userModel.findOne({ email });
    if (isExist) {
      return res.status(409).json({ message: "Email already exists" });
    }

    // Hash and Save
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new userModel({
      name: name.trim(),
      email: email.toLowerCase(),
      password: hashedPassword,
      upiId: upiId ? upiId.trim() : null,
    });

    await newUser.save();
    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error("Signup Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }
  const user = await userModel.findOne({ email });
  if (!user) {
    return res.status(401).json({ message: "Invalid email or password" });
  }
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(401).json({ message: "Invalid email or password" });
  }
  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

  res.cookie("token", token, {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
  res.status(200).json({
    message: "Login successful",
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      profilePhoto: user.profilePhoto,
    },
  });
};
const me = async (req, res) => {
  const userId = req.userId;
  const user = await userModel.findById(userId);

  if (!user) {
    return res.status(401).json({ message: "User not found" });
  }
  res.status(200).json({
    _id: user._id,
    name: user.name,
    email: user.email,
    profilePhoto: user.profilePhoto,
  });
};
const logout = (req, res) => {
  res
    .clearCookie("token", "", {
      httpOnly: true,
      sameSite: "lax",
      secure: false,
    })
    .status(200)
    .json({ message: "Logout successful" });
};
const encryptData = (text) => {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(
    "aes-256-cbc",
    Buffer.from(ENCRYPTION_KEY),
    iv,
  );
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString("hex") + ":" + encrypted.toString("hex");
};
const decryptData = (text) => {
  const textParts = text.split(":");
  const iv = Buffer.from(textParts.shift(), "hex");
  const encryptedText = Buffer.from(textParts.join(":"), "hex");
  const decipher = crypto.createDecipheriv(
    "aes-256-cbc",
    Buffer.from(ENCRYPTION_KEY),
    iv,
  );
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
};
const forgotPassword = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  try {
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const plainOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = Date.now() + 15 * 60 * 1000;

    const tokenData = JSON.stringify({ otp: plainOtp, expiry: expiry });
    const encryptedToken = encryptData(tokenData);

    user.resetPasswordToken = encryptedToken;
    await user.save();

    const { error } = await resend.emails.send({
      from: "Splitwise Clone <onboarding@resend.dev>",
      to: email,
      subject: "Splitwise Clone - Password Reset OTP",
      html: `<h2>Password Reset Request</h2>
             <p>Your password reset OTP is: <strong>${plainOtp}</strong></p>
             <p>It is valid for 15 minutes.</p>`,
    });

    if (error) {
      console.error("Resend API Error:", error);
      return res.status(500).json({ message: "Failed to send email" });
    }

    res.status(200).json({ message: "Password reset OTP has been sent" });
  } catch (error) {
    console.error("Forgot Password Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
const resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;

  if (!email || !otp || !newPassword) {
    return res.status(400).json({ message: "All fields are required" });
  }

  if (newPassword.length < 8) {
    return res
      .status(400)
      .json({ message: "Password must be at least 8 characters long" });
  }

  try {
    const user = await userModel.findOne({ email });
    if (!user || !user.resetPasswordToken) {
      return res
        .status(400)
        .json({ message: "Invalid request or no reset initiated" });
    }

    let decryptedData;
    try {
      const decryptedString = decryptData(user.resetPasswordToken);
      decryptedData = JSON.parse(decryptedString);
    } catch (err) {
      return res.status(400).json({ message: "Token is corrupted or invalid" });
    }

    const { otp: savedOtp, expiry } = decryptedData;

    if (expiry < Date.now()) {
      user.resetPasswordToken = null;
      await user.save();
      return res
        .status(400)
        .json({ message: "OTP has expired. Please request a new one." });
    }
    if (savedOtp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.resetPasswordToken = null;
    await user.save();

    res.status(200).json({ message: "Password reset successfully." });
  } catch (error) {
    console.error("Reset Password Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
module.exports = { signUp, login, me, logout, forgotPassword, resetPassword };
