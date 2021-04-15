const mongoose = require("mongoose");
const { ObjectId } = require("mongoose").Schema.Types;

const periodSchema = new mongoose.Schema({
  periodTime: {
    start: { type: String },
    end: { type: String },
  },
  subjectId: { type: ObjectId },
});

module.exports = mongoose.model("Period", periodSchema);
