const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/user.model");
const Admin = require("../models/admin.model");
const Faculty = require("../models/faculty.model");
const Student = require("../models/student.model");
const Office = require("../models/office.model");
const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET;
const AuthValidator = require("google-auth-library");
const Security = require("../models/security.model");
const {
  validateRegistration,
  validateLogin,
  validateGooglelogin,
} = require("./validation/auth.validation");

router.get("/", (req, res) => {
  res.json({ msg: "Welcome to MITS Web User Authentication!!", success: true });
});

//signup route
router.post("/signup", validateRegistration, async (req, res) => {
  try {
    var { name, email, password, confirm, number, type, oldpassword } =
      req.body;

    if (password !== confirm) {
      return res.json({ error: "Password not same", success: false });
    }
    //check if the user with that mail already exists
    await User.findOne({ email: email })
      .then(async (savedUser) => {
        if (savedUser && savedUser.type === "faculty") {
          await Faculty.findOne({ email: email }).then((resp) => {
            savedUser = resp;
          });
        }
        if (savedUser && savedUser.type === "admin") {
          await Admin.findOne({ email: email }).then((resp) => {
            savedUser = resp;
          });
        }
        if (savedUser && savedUser.type === "student") {
          await Student.findOne({ email: email }).then((resp) => {
            savedUser = resp;
          });
        }
        if (savedUser && savedUser.type === "office") {
          await Office.findOne({ email: email }).then((resp) => {
            savedUser = resp;
          });
        }
        if (savedUser && savedUser.type === "security") {
          await Security.findOne({ email: email }).then((resp) => {
            savedUser = resp;
          });
        }

        if (savedUser && savedUser.registered) {
          return res.json({
            msg: "Please login!!",
            success: false,
          });
        }

        if (savedUser && !savedUser.registered) {
          bcrypt
            .compare(oldpassword, savedUser.password)
            .then(async (doMatch) => {
              if (doMatch) {
                bcrypt.hash(password, 12).then(async (hashedPassword) => {
                  savedUser.name = name;
                  savedUser.mobile = number;
                  savedUser.registered = true;
                  savedUser.password = hashedPassword;
                  await savedUser.save();
                  return res.json({
                    msg: "User Registered",
                    success: true,
                  });
                });
              } else {
                return res.json({
                  msg: "wrong password",
                  success: false,
                });
              }
            });
        }
        if (!savedUser) {
          if (email == "admin@mitsweb.com") {
            type = "admin";
            console.log(`${email}`.blue);
            if (oldpassword === process.env.ADMINPASSWORD) {
              bcrypt.hash(password, 12).then(async (hashedPassword) => {
                const newUser = new User({ email, type });
                await newUser.save();
                const newAdmin = new Admin({
                  name,
                  password: hashedPassword,
                  type,
                  mobile: number,
                  email,
                  registered: true,
                });
                await newAdmin.save();
                return res.json({
                  msg: "User Registered",
                  success: true,
                });
              });
            } else {
              return res.json({
                msg: "Wrong Password!!",
                success: false,
              });
            }
          } else {
            return res.json({
              msg: "Invalid email",
              success: false,
            });
          }
        }
      })
      .catch((err) => {
        console.log(err);
      });
  } catch (err) {
    console.log(`error:${err.message}`.red);
    return res.json({ success: false, msg: err.message });
  }
});

//signin route
router.post("/signin", validateLogin, async (req, res) => {
  try {
    const { email, password } = req.body;

    await User.findOne({ email: email }).then(async (savedUser) => {
      if (!savedUser) {
        return res.json({
          msg: "Invalid email or password!!",
          success: false,
        });
      }
      if (savedUser && savedUser.type == "admin") {
        await Admin.findOne({ email: email }).then((resp) => {
          savedUser = resp;
        });
      }
      if (savedUser && savedUser.type == "faculty") {
        await Faculty.findOne({ email: email }).then((resp) => {
          savedUser = resp;
        });
      }
      if (savedUser && savedUser.type == "student") {
        await Student.findOne({ email: email }).then((resp) => {
          savedUser = resp;
        });
      }
      if (savedUser && savedUser.type == "office") {
        await Office.findOne({ email: email }).then((resp) => {
          savedUser = resp;
        });
      }
      if (savedUser && savedUser.type == "security") {
        await Security.findOne({ email: email }).then((resp) => {
          savedUser = resp;
        });
      }

      if (savedUser && !savedUser.registered) {
        return res.json({
          msg: "Please register!!",
          success: false,
        });
      }
      if (savedUser && !savedUser.active) {
        return res.json({
          msg: "Your account is diabled by admin!!",
          success: false,
        });
      }
      bcrypt
        .compare(password, savedUser.password)
        .then((doMatch) => {
          if (doMatch) {
            // res.json({message:"successfully signed in"})
            const token = jwt.sign({ email: savedUser.email }, JWT_SECRET, {
              expiresIn: "24h",
            });
            const { _id, name, email, photo } = savedUser;
            return res.header("mitsweb-access-token", token).json({
              token,
              success: true,
              user: { _id, name, photo },
            });
          } else {
            return res.json({
              success: false,
              msg: "Invalid email or password!!",
            });
          }
        })
        .catch((err) => {
          console.log(err);
        });
    });
  } catch (err) {
    console.log(`error:${err.message}`.red);
    return res.json({ success: false, msg: err.message });
  }
});

//for google login
router.post("/googlelogin", validateGooglelogin, async (req, resp) => {
  try {
    const tokenVerifier = async (token) => {
      const verify = async () => {
        const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
        const client = new AuthValidator.OAuth2Client(CLIENT_ID);
        const ticket = await client.verifyIdToken({
          idToken: token,
          audience: CLIENT_ID,
        });
        const payload = ticket.getPayload();
        return payload;
      };
      return verify().catch(console.error);
    };

    await tokenVerifier(req.body.googleToken).then(async (res) => {
      let user = await User.findOne({
        email: res.email,
      });

      if (user && user.type == "student") {
        await Student.findOne({ email: res.email }).then((resp) => {
          user = resp;
        });
      }
      if (user && user.type == "admin") {
        await Admin.findOne({ email: res.email }).then((resp) => {
          user = resp;
        });
      }
      if (user && user.type == "faculty") {
        await Faculty.findOne({ email: res.email }).then((resp) => {
          user = resp;
        });
      }
      if (user && user.type == "office") {
        await Office.findOne({ email: res.email }).then((resp) => {
          user = resp;
        });
      }
      if (user && user.type == "security") {
        await Security.findOne({ email: res.email }).then((resp) => {
          user = resp;
        });
      }

      if (user && user.active) {
        if (!user.registered) {
          console.log("new");
          user.registered = true;
          user.name = res.name;
        } else {
          console.log("old");
        }
        user.photo = res.picture;
        const userNow = await user.save();
        const token = jwt.sign({ email: user.email }, JWT_SECRET, {
          expiresIn: "24h",
        });
        const { _id, name, email, photo } = userNow;
        resp.json({
          token,
          success: true,
          user: { _id, name, photo, email },
        });
      } else {
        resp.json({
          success: false,
          msg: "Invalid User",
        });
      }
    });
  } catch (err) {
    console.log(`error:${err.message}`.red);
    return res.json({ success: false, msg: err.message });
  }
});

module.exports = router;
