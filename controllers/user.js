const User = require("../models/User");
const bcrypt = require("bcryptjs");
const passport = require("passport");
const Task = require("../models/Task");
const Submission = require("../models/Submission");
const mongoose = require("mongoose");

exports.getLogin = (req, res, next) => {
  res.render("login");
};

exports.postLogin = (req, res, next) => {
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/users/login",
    failureFlash: true,
  })(req, res, next);
};

exports.getRegister = (req, res, next) => {
  res.render("signup");
};

exports.postRegister = async (req, res, next) => {
  const {
    name,
    team_name,
    college,
    address,
    number,
    email,
    password,
    password2,
  } = req.body;
  let errors = [];

  if (
    !name ||
    !team_name ||
    !college ||
    !address ||
    !number ||
    !email ||
    !password ||
    !password2
  ) {
    errors.push({ msg: "Please enter all fields!" });
  }

  if (password != password2) {
    errors.push({ msg: "Passwords do not match!" });
  }

  if (errors.length > 0) {
    res.render("signup", {
      errors,
      name,
      team_name,
      college,
      address,
      number,
      email,
      password,
      password2,
    });
  } else {
    let user = await User.findOne({ email });
    if (user) {
      errors.push({ msg: "Email already exists!" });
      return res.render("signup", {
        errors,
        name,
        team_name,
        college,
        address,
        number,
        email,
        password,
        password2,
      });
    }

    const newUser = new User({
      name,
      team_name,
      college,
      address,
      number,
      email,
      password,
    });

    const hashedPass = await bcrypt.hash(password, 8);
    newUser.password = hashedPass;

    user = await newUser.save();

    req.flash("success_msg", "You are now registered and can log in");
    res.redirect("/users/login");
  }
};

exports.getDashboard = async (req, res, next) => {
  res.render("dashboard");
};

exports.postLogout = (req, res) => {
  req.logout();
  req.flash("success_msg", "You are logged out");
  res.redirect("/users/login");
};

// TASKS ENDPOINTS
exports.getCreateTask = async (req, res, next) => {
  const id = req.params.id;
  if (!id) return res.render("createTask");
  let task = await Task.findById(id);
  if (!task) {
    req.flash("error_msg", "No such task exists in the database");
    res.redirect("/tasks");
  } else {
    // console.log(task);
    return res.render("createTask", { task });
  }
  res.render("createTask");
};

exports.postCreateTask = async (req, res, next) => {
  const { name, description, guidelines, points, deadline } = req.body;

  let newTask = new Task({
    name,
    description,
    guidelines,
    points,
    deadline,
  });

  newTask = await newTask.save();
  req.flash("success_msg", "Task Added successfully!");
  res.redirect("/users/dashboard");
};

exports.putEditTask = async (req, res, next) => {
  const id =  mongoose.Types.ObjectId(req.params.id);
  const { name, description, guidelines, points, deadline } = req.body;
  let task = await Task.findById(id);
  let updates = {};
  updates.name = name ?? task.name;
  updates.description = description ?? task.description;
  updates.guidelines = guidelines ?? task.guidelines;
  updates.points = points ?? task.points;
  updates.deadline = deadline ?? task.deadline;

  task = await Task.findByIdAndUpdate(id, { $set: updates }, { new: true });

  if (!task) {
    req.flash("error_msg", "Error Occurred!");
    res.redirect("/tasks");
  } else {
    req.flash("success_msg", "Task Updated Successfully");
    res.redirect("/tasks");
  }
};

exports.deleteTask = async (req, res, next) => {
  const id = req.params.id;
  let task = await Task.findById(id);
  if (!task) {
    req.flash("error_msg", "No such task exists in the database");
    return res.redirect("/tasks");
  }

  task = await Task.findByIdAndRemove(id);
  if (!task) {
    req.flash("error_msg", "Error Occurred!");
    return res.redirect("/tasks");
  } else {
    req.flash("success_msg", "Task deleted successfully!");
    return res.redirect("/tasks");
  }
};

// SUBMISSION ENDPOINTS
exports.submitTask = async (req, res, next) => {
  const id = req.params.id;
  const userId = req.user._id;

  const task = await Task.findById(id);
  const submittedAt = Date.now();

  if (task.deadline < submittedAt) {
    req.flash("error_msg", "Submission Time Ended!");
    return res.redirect("/users/dashboard");
  }

  const file = req.body.file;
  console.log(file);

  if (!file) {
    req.flash("error_msg", "No submission file found!");
    return res.redirect("/users/dashboard");
  }

  let submission = await new Submission({
    taskID: id,
    teamID: userId,
    submittedAt,
    fileUrl: file,
  });

  submission = await submission.save();
  if (!submission) {
    req.flash("error_msg", "Error Occurred!");
    res.redirect("/tasks");
  } else {
    req.flash("success_msg", "Submission Successful!");
    res.redirect("/tasks");
  }
};

exports.editSubmitTask = async (req, res, next) => {
  const id = req.params.id;
  const userId = req.user._id;

  const task = await Task.findById(id);
  const submittedAt = Date.now();

  if (task.deadline < submittedAt) {
    req.flash("error_msg", "Submission Time Ended!");
    return res.redirect("/tasks");
  }

  const file = req.body.file;
  if (!file) {
    req.flash("error_msg", "No submission file found!");
    return res.redirect("/tasks");
  }

  let submission = await Submission.findOne({ taskID: id, teamID: userId });

  if (!submission) {
    req.flash("error_msg", "No previous submission found!");
    return res.redirect("/tasks");
  }

  let updates = {
    taskID: id,
    teamID: userId,
    submittedAt,
    fileUrl: file,
  };

  submission = await Submission.findByIdAndUpdate(
    submission._id,
    { $set: updates },
    { new: true }
  );

  if (!submission) {
    req.flash("error_msg", "Error Occurred!");
    res.redirect("/tasks");
  } else {
    req.flash("success_msg", "Submission Updated Successfully!");
    res.redirect("/tasks");
  }
};

exports.deleteSubmiTask = async (req, res, next) => {
  const id = req.params.id;
  const userId = req.user._id;

  const task = await Task.findById(id);
  const submittedAt = Date.now();

  if (task.deadline < submittedAt) {
    req.flash("error_msg", "Submission Time Ended! No changes allowed");
    return res.redirect("/tasks");
  }

  let submission = await Submission.find({ taskID: id, teamID: userId });

  console.log(submission);

  if (!submission) {
    req.flash("error_msg", "Error Occurred!");
    return res.redirect("/tasks");
  }

  submission = await Submission.findByIdAndRemove(submission[0]._id);

  if (!submission) {
    req.flash("error_msg", "Error Occurred!");
    res.redirect("/tasks");
  } else {
    req.flash("success_msg", "Submission Deleted Successfully!");
    res.redirect("/tasks");
  }
};
