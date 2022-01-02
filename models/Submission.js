const mongoose = require("mongoose");
const Task = require("./Task");
const User = require("./User");

const SubmissionSchema = mongoose.Schema({
  taskID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: Task,
    required: true,
  },
  teamID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: User,
    required: true,
  },
  score: {
    type: Number,
  },
  submittedAt: {
    type: Date,
    required: true,
  },
  fileUrl: {
    type: String,
    required: true,
  },
});

module.exports = Submission = mongoose.model("Submission", SubmissionSchema);
