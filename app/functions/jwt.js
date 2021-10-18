const jwt = require("jsonwebtoken");
const User = require("../models/user.model");

const auth = (req, res, next) => {
  const token = req.header("mitsweb-access-token");

  if (!token)
    return res.status(400).json({ success: false, msg: "Access denied" });
  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified;
    next();
  } catch (err) {
    res.status(400).json({ msg: "Invalid token", success: false });
  }
};
const adminAuth = async (req, res, next) => {
  const token = req.header("mitsweb-access-token");

  if (!token)
    return res.status(400).json({ success: false, msg: "Access denied" });
  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified;
    const currentUser = await User.findOne({ email: req.user.email });
    if (currentUser && currentUser.type === "admin") {
      next();
    } else {
      res.status(400).json({ msg: "Invalid token", success: false });
    }
  } catch (err) {
    res.status(400).json({ msg: "Invalid token", success: false });
  }
};

const facultyAuth = async (req, res, next) => {
  const token = req.header("mitsweb-access-token");

  if (!token)
    return res.status(400).json({ success: false, msg: "Access denied" });
  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified;
    const currentUser = await User.findOne({ email: req.user.email });
    if (currentUser && currentUser.type === "faculty") {
      next();
    } else {
      res.status(400).json({ msg: "Invalid token", success: false });
    }
  } catch (err) {
    res.status(400).json({ msg: "Invalid token", success: false });
  }
};
const securityAuth = async (req, res, next) => {
  const token = req.header("mitsweb-access-token");

  if (!token)
    return res.status(400).json({ success: false, msg: "Access denied" });
  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified;
    const currentUser = await User.findOne({ email: req.user.email });
    if (currentUser && currentUser.type === "security") {
      next();
    } else {
      res.status(400).json({ msg: "Invalid token", success: false });
    }
  } catch (err) {
    res.status(400).json({ msg: "Invalid token", success: false });
  }
};

const studentAuth = async (req, res, next) => {
  const token = req.header("mitsweb-access-token");

  if (!token)
    return res.status(400).json({ success: false, msg: "Access denied " });
  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified;
    const currentUser = await User.findOne({ email: req.user.email });
    if (currentUser && currentUser.type === "student") {
      next();
    } else {
      res.status(400).json({ msg: "Invalid token", success: false });
    }
  } catch (err) {
    res.status(400).json({ msg: "Invalid token", success: false });
  }
};

module.exports = {
  auth,
  adminAuth,
  securityAuth,
  facultyAuth,
  studentAuth,
};
