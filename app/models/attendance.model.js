const mongoose = require("mongoose");
const { ObjectId } = require("mongoose").Schema.Types;

const attendanceScheme = new mongoose.Schema({
  department: {
    type: String,
    required: true,
  },
  semester: {
    type: Number,
    required: true,
  },
  periodId: {
    type: ObjectId,
    required: true,
  },
  attendanceList: [
    {
      email: { type: String, required: true },
      present: { type: Boolean, default: true },
    },
  ],
});

module.exports = mongoose.model("Attendance", attendanceScheme);
