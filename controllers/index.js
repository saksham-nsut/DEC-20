const Submission = require("../models/Submission");
const Task = require("../models/Task");

exports.getWelcome = async (req, res, next) => {
  res.render("welcome");
};

exports.getAllTasks = async (req, res, next) => {
  let tasks = await Task.find({});
  if (!tasks) {
    req.flash("error_msg", "Error Occurred!");
    return res.redirect("/");
  }

  res.render("allTasks.ejs", { tasks });
};

exports.getTask = async (req, res, next) => {
  const id = req.params.id;
  let file = null;
  let prevSub = null;
  if (req.user) {
    const teamId = req.user._id;
    file = await Submission.find({ teamID: teamId, taskID: id });
    if (file && file.length !== 0) prevSub = file[0].fileUrl;
  }

  let task = await Task.findById(id);
  if (!task) {
    req.flash("error_msg", "No such task exists in the database");
    res.redirect("/");
  } else {
    let action = `/users/submitTask/${task._id}`;
    let deleteAction = `/`;
    let taskDeleteAction = `/users/addTask/${task._id}?_method=DELETE`;
    if (prevSub) {
      action = `/users/submitTask/${task._id}?_method=PUT`;
      deleteAction = `/users/submitTask/${task._id}?_method=DELETE`;
    }
    let date = new Date(String(task.deadline));
    let endtime =
      date.getDate() + "/" + (date.getMonth() + 1) + "/" + date.getFullYear();

    res.render("task_page", {
      task,
      endtime,
      prevSub,
      action,
      deleteAction,
      taskDeleteAction,
    });
  }
};
