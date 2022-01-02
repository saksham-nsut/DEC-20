const express = require("express");
const router = express.Router();
const controller = require("../controllers/user");
const {
  forwardAuthenticated,
  ensureAuthenticated,
  ensureIsAdmin,
} = require("../middlewares/auth");

// USER ENDPOINTS
router.get("/login", forwardAuthenticated, controller.getLogin);
router.post("/login", controller.postLogin);

router.get("/register", forwardAuthenticated, controller.getRegister);
router.post("/register", controller.postRegister);

router.get("/dashboard", ensureAuthenticated, controller.getDashboard);

router.get("/logout", controller.postLogout);

// TASKS ENDPOINTS
router.get("/addTask", ensureIsAdmin, controller.getCreateTask);
router.post("/addTask", ensureIsAdmin, controller.postCreateTask);
router.delete("/addTask/:id", ensureIsAdmin, controller.deleteTask);

router.get("/editTask/:id", ensureIsAdmin, controller.getCreateTask);
router.put("/editTask/:id", ensureIsAdmin, controller.putEditTask);
// SUBMISSION ENDPOINTS
router.post("/submitTask/:id", ensureAuthenticated, controller.submitTask);
router.put("/submitTask/:id", ensureAuthenticated, controller.editSubmitTask);
router.delete(
  "/submitTask/:id",
  ensureAuthenticated,
  controller.deleteSubmiTask
);

module.exports = router;
