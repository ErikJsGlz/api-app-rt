const express = require("express");
const router = express.Router();
const { requireLogin } = require("../middlewares/authentication");

// routes for users
var user_controller = require("../controllers/user.controller");
router.post("/user/login", user_controller.login);
router.post("/user/register", user_controller.register);
router.post(
  "/user/change_admin",
  requireLogin,
  user_controller.change_to_admin
);

// routes for reports
var report_controller = require("../controllers/report.controller");
router.post(
  "/report/register_report",
  requireLogin,
  report_controller.register_report
);
router.get(
  "/report/import_admin",
  requireLogin,
  report_controller.import_reports_admin
);
router.get(
  "/report/import_user",
  requireLogin,
  report_controller.import_reports_user
);
router.post(
  "/report/change_status",
  requireLogin,
  report_controller.change_status
);

module.exports = router;