const express = require("express");
const router = express.Router();
const User = require("../models/user.model");
const Admin = require("../models/admin.model");
const Faculty = require("../models/faculty.model");
const Student = require("../models/student.model");
const Office = require("../models/office.model");
const Security = require("../models/security.model");
const Subject = require("../models/subject.model");
const Timetable = require("../models/timetable.model");
const { adminAuth } = require("../functions/jwt");
const { generateStudentId } = require("../functions/uniqueId");
const bcrypt = require("bcryptjs");
const {
  validateUpdation,
  validateDeletion,
  validateAddUser,
} = require("./validation/admin.validation");
const {
  validateSubjectCreation,
  validateSubjectEdit,
} = require("./validation/subject.validation");
const { isValidObjectId } = require("mongoose");
const { generateHTML } = require("swagger-ui-express");
const studentModel = require("../models/student.model");

//to delete a user
router.post("/deleteuser", validateDeletion, adminAuth, async (req, res) => {
  try {
    const idUser = await User.findOne({ email: req.body.email });
    if (!idUser) {
      return res.json({ success: false, msg: "invlid id" });
    } else {
      const email = idUser.email;
      await User.deleteOne({ email });
      if (idUser.type === "student") {
        await Student.deleteOne({ email });
      } else if (idUser.type === "admin") {
        await Admin.deleteOne({ email });
      } else if (idUser.type === "faculty") {
        await Faculty.deleteOne({ email });
      } else if (idUser.type === "office") {
        await Office.deleteOne({ email });
      } else if (idUser.type === "security") {
        await Security.deleteOne({ email });
      }
      return res.json({ success: true, msg: "user deleted" });
    }
  } catch (err) {
    res.json({ success: false, msg: err.message });
  }
});

//to update the user
router.post("/updateuser", validateUpdation, adminAuth, async (req, res) => {
  let idUser = await User.findOne({ email: req.body.email });
  if (!idUser) {
    res.json({ success: false, msg: "invalid id" });
  } else {
    const { email } = req.body;
    if (idUser.type === "student") {
      idUser = await Student.findOne({ email });
      const { department, currentYear, passoutYear, rollNo } = req.body;
      idUser.department = department;
      idUser.currentYear = currentYear;
      idUser.passoutYear = passoutYear;
      const studentId = generateStudentId(rollNo, department, passoutYear);
      const student = await Student.findOne({ studentId });
      if (student && student.email !== email) {
        return res.json({ msg: "Invalid rollno", success: false });
      }
      idUser.studentId = studentId;
    }
    if (idUser.type === "office") {
      await Office.findOne({ email }).then((resp) => {
        idUser = resp;
      });
    }
    if (idUser.type === "faculty") {
      await Faculty.findOne({ email }).then((resp) => {
        idUser = resp;
        idUser.isHOD = req.body.isHOD;
        idUser.department = req.body.department;
        idUser.advisor = req.body.advisor;
      });
    }
    if (idUser.type === "admin") {
      await Admin.findOne({ email }).then((resp) => {
        idUser = resp;
      });
    }
    if (idUser.type === "security") {
      await Security.findOne({ email }).then((resp) => {
        idUser = resp;
      });
    }

    idUser.name = req.body.name;
    idUser.active = req.body.active;
    idUser.mobile = req.body.mobile;
    await idUser.save();
    res.json({ success: true, msg: "User updated" });
  }
});

//router to add user
router.post("/adduser", validateAddUser, adminAuth, async (req, res) => {
  var {
    email,
    type,
    password,
    department,
    currentYear,
    passoutYear,
    rollNo,
  } = req.body;

  email = email.toLowerCase();
  //check if the user with that mail already created
  await User.findOne({ email: email }).then((savedUser) => {
    if (savedUser) {
      return res.json({
        error: "User with that email already exists!!",
        success: false,
      });
    }
    if (
      !(
        type === "admin" ||
        type === "student" ||
        type == "faculty" ||
        type === "security" ||
        type === "office"
      )
    ) {
      return res.json({
        success: false,
        error: "Invalid type",
      });
    }
    bcrypt
      .hash(password, 12)
      .then(async (hashedPassword) => {
        const user = new User({
          email,
          type,
        });
        if (type === "student") {
          var studentId = generateStudentId(rollNo, department, passoutYear);

          const student = await Student.findOne({ studentId });
          if (student) {
            return res.json({ success: false, msg: "Invalid Roll no" });
          }

          const newStudent = new Student({
            email,
            password: hashedPassword,
            department,
            currentYear: currentYear,
            passoutYear,
            studentId,
          });
          await newStudent.save();
        }
        if (type === "admin") {
          const newAdmin = new Admin({
            email,
            password: hashedPassword,
          });
          await newAdmin.save();
        }
        if (type === "faculty") {
          const advInit = {
            y1: "false",
            y2: "false",
            y3: "false",
            y4: "false",
          };
          const newFaculty = new Faculty({
            email,
            password: hashedPassword,
            department,
            advisor: advInit,
          });
          await newFaculty.save();
        }
        if (type === "office") {
          const newOffice = new Office({
            email,
            password: hashedPassword,
          });
          await newOffice.save();
        }
        if (type === "security") {
          const newSecurity = new Security({
            email,
            password: hashedPassword,
          });
          await newSecurity.save();
        }

        await user.save();
        return res.json({
          success: true,
          message: "User created and stored successfully!!",
        });
      })
      .catch((err) => {
        console.log(err);
      });
  });
});

//get list of all faculties
router.get("/allfaculties", adminAuth, async (req, res) => {
  try {
    var retArr = [];

    await Faculty.find({}, (err, resp) => {
      for (let i = 0; i < resp.length; i++) {
        const {
          name,
          email,
          mobile,
          active,
          registered,
          isHOD,
          advisor,
          department,
        } = resp[i];
        retArr[i] = {
          name,
          department,
          email,
          mobile,
          active,
          registered,
          isHOD,
          advisor,
        };
      }
      res.json({ data: retArr, success: true });
    });
  } catch (err) {
    res.json({ msg: err, success: false });
  }
});

//get list of all admins
router.get("/alladmins", adminAuth, async (req, res) => {
  try {
    let retArr = [];
    await Admin.find({}, (err, resp) => {
      var j = 0;

      for (let i = 0; i < resp.length; i++) {
        const { name, mobile, active, registered, email } = resp[i];
        if (req.user.email !== email && email !== "admin@mitsweb.com") {
          retArr[j++] = {
            name,
            mobile,
            email,
            active,
            registered,
          };
        }
      }
      res.json({ data: retArr, success: true });
    });
  } catch (err) {
    res.json({ success: false, msg: err });
  }
});

//to get list of all students
router.get("/allstudents", adminAuth, async (req, res) => {
  var retArr = [];
  await Student.find({}, async (err, resp) => {
    for (let i = 0; i < resp.length; i++) {
      const {
        name,
        _id,
        pic,
        mobile,
        address,
        bloodGroup,
        dob,
        email,
        parentDetails,
        department,
        active,
        currentYear,
        passoutYear,
        studentId,
      } = resp[i];
      var rollNo = "";
      if (studentId) {
        rollNo = Number(studentId.substr(4, 7));
      }

      retArr[i] = {
        name,
        _id,
        pic,
        mobile,
        department,
        address,
        bloodGroup,
        dob,
        email,
        parentDetails,
        active,
        currentYear,
        passoutYear,
        rollNo,
        studentId,
      };
    }
    res.json({ success: true, data: retArr });
  });
});

/* 
----------------------------Subject Api's---------------------------------
*/

//to create a new suject

router.delete("/subject/:_id", adminAuth, async (req, res) => {
  try {
    const _id = req.params._id;
    if (!isValidObjectId(_id)) {
      return res.json({ success: false, msg: "Invalid Id" });
    }

    const result = await Subject.deleteOne({ _id });
    if (!result) {
      return res.json({ success: false, msg: "Invalid Id" });
    }
    return res.json({ success: true, msg: "Subject Deleted" });
  } catch (err) {
    return res.json({ success: false, msg: "Error" });
  }
});
router.post(
  "/subject",
  validateSubjectCreation,
  adminAuth,
  async (req, res) => {
    try {
      const { name, code, department, semester, courseType } = req.body;
      const result = await Subject.findOne({ code, department, semester });
      if (result) {
        return res.json({ success: false, msg: "Subject exists" });
      }
      const subject = new Subject({
        name,
        code,
        department,
        semester,
        courseType,
      });
      await subject.save();
      return res.json({
        message: "Subject added",
        success: true,
      });
    } catch (err) {
      console.log(`Failed to add subject with error:${err.message}`.red);
      return res.json({ success: false, msg: err.message });
    }
  }
);

//edit subject information
router.put("/subject", adminAuth, validateSubjectEdit, async (req, res) => {
  try {
    const { _id, name, code, department, semester, courseType } = req.body;
    if (!isValidObjectId(_id)) {
      return res.json({ success: false, msg: "Invalid Id" });
    }
    const result = await Subject.findOneAndUpdate(
      { _id },
      { name, code, department, courseType, semester },
      { returnOriginal: false }
    );
    if (!result) {
      return res.json({
        success: false,
        msg: "Couldn't find the subject and update it.",
      });
    } else {
      return res.json({ success: true, data: result });
    }
  } catch (err) {
    console.log(`Failed to edit subject with error:${err.message}`.red);
    return res.json({ success: false, msg: err.message });
  }
});

/* 
----------------------------Timetable Api's---------------------------------
*/

//to create a new time table
router.post("/timetable", adminAuth, async (req, res) => {
  try {
    const { semesterDepartment, periodTimings } = req.body;
    const timeTable = new Timetable({
      semester: semesterDepartment.semester,
      department: semesterDepartment.department,
      periodTimings,
    });
    await timeTable.save();
    return res.json({
      success: true,
      msg: "Time Table created.",
      data: timeTable,
    });
  } catch (err) {
    console.log(`Failed to create timetable with error:${err.message}`.red);
    return res.json({ success: false, msg: err.message });
  }
});

router.get("/timetable", adminAuth, async (req, res) => {
  const timetables = await Timetable.find({});

  return res.json({ success: true, data: timetables });
});

module.exports = router;
