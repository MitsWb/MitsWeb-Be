const express = require("express");
const router = express.Router();
const { securityAuth } = require("../functions/jwt");
const GatePass = require("../models/gatepass.model");
const Student = require("../models/student.model");
const moment = require("moment");
const { validateGatepass } = require("./validation/security.validation");
const { isValidObjectId } = require("mongoose");

//to verify the gatepass issued to the user
router.post("/verify", validateGatepass, securityAuth, async (req, res) => {
  try {
    const _id = req.body.gatepassId;
    if (!isValidObjectId(_id)) {
      return res.json({ success: false, msg: "Invalid Gatepass" });
    }
    const gatepass = await GatePass.findOne({ _id, status: 1 });
    console.log(gatepass);
    if (!gatepass) {
      return res.json({ success: false, msg: "Invalid Gatepass" });
    }
    const date = gatepass.time;

    if (
      !(
        new Date(date).toISOString() > new Date().toISOString() ||
        moment().format("MMM Do YY") === moment(date).format("MMM Do YY")
      )
    ) {
      return res.json({ success: false, msg: "Invalid Gatepass" });
    }

    gatepass.status = 2;
    await gatepass.save();
    const { time, department } = gatepass;
    const student = await Student.findOne({ email: gatepass.requestBy });
    if (!student) {
      return res.json({ success: false, msg: "Error" });
    }
    const { name, email, photo } = student;
    const data = {
      name,
      email,
      photo,
      department,
      time,
    };
    return res.json({ success: true, msg: "Valid Gatepass", data });
  } catch (err) {
    console.log(`error:${err.message}`.red);
    return res.json({ success: false, msg: err.message });
  }
});

module.exports = router;
