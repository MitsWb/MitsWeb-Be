const mongoose = require("mongoose");
const { ObjectId } = require("mongoose").Schema.Types;

const timetableSchema = new mongoose.Schema({
  department: {
    type: String,
    required: true,
  },
  semester: {
    type: Number,
    required: true,
  },
  timetable: [
    {
      day: String,
      periods: [
        {
          type: ObjectId,
          ref: "Period",
        },
      ],
    },
  ],
});

module.exports = mongoose.model("Timetable", timetableSchema);
