const Joi = require("joi");

const getStudentsinClassScheme = Joi.object({
  semester: Joi.string().required(),
  department: Joi.string().required(),
  day: Joi.string().required(),
  subjectCode: Joi.string().required(),
});

const addAttendanceScheme = Joi.object({
  startTime: Joi.string().required(),
  endTime: Joi.string().required(),
  timeStamp: Joi.any().required(),
  department: Joi.string().required(),
  semester: Joi.number().required(),
  period: Joi.string().required(),
  attendanceList: Joi.any().required(),
  deliveryMode: Joi.string().required(),
  module: Joi.number().required(),
  topic: Joi.string().required(),
});
let getTimetableScheme = Joi.object({
  department: Joi.string().required(),
  semester: Joi.number().required(),
});

let getAttendanceScheme = Joi.object({
  department: Joi.string().required(),
  semester: Joi.number().required(),
  subjectCode: Joi.string().required(),
});
const validateGetTimetable = (req, res, next) => {
  const { error } = getTimetableScheme.validate(req.body);
  error ? res.json({ msg: error.details[0].message, success: false }) : next();
};
const validategetStudentsinClass = (req, res, next) => {
  const { error, value } = getStudentsinClassScheme.validate(req.body);
  error ? res.json({ msg: error.details[0].message, success: false }) : next();
};

const validateGetAttendance = (req, res, next) => {
  const { error, value } = getAttendanceScheme.validate(req.body);
  error ? res.json({ msg: error.details[0].message, success: false }) : next();
};

const validateAddattendance = (req, res, next) => {
  const { error, value } = addAttendanceScheme.validate(req.body);
  error ? res.json({ msg: error.details[0].message, success: false }) : next();
};

module.exports = {
  validategetStudentsinClass,
  validateAddattendance,
  validateGetTimetable,
  validateGetAttendance,
};
