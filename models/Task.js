const mongoose = require("mongoose");
const User = require("./User");

const TaskSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  guidelines: {
    type: String,
    required: true,
  },
  points: {
    type: Number,
    default: 0
  },
  deadline: {
    type: Date,
    required: true,
  }
});

module.exports = Task = mongoose.model("Task", TaskSchema);
