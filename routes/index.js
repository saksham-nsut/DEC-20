const express = require("express");
const router = express.Router();
const controller = require("../controllers/index");


router.get("/", controller.getWelcome);
router.get("/tasks", controller.getAllTasks);
router.get("/tasks/:id", controller.getTask);

module.exports = router;
