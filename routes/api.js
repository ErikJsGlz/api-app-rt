const express = require("express");
const router = express.Router();
const { requireLogin } = require("../middlewares/authentication");
const { anony_reports } = require("../middlewares/anony_reports");

// routes for users
var user_controller = require("../controllers/user.controller");
router.get("/user/get_user", requireLogin, user_controller.get_user);
router.post("/user/login", user_controller.login);
router.post("/user/register", user_controller.register);
router.post("/user/change_admin", requireLogin, user_controller.change_to_admin);
router.put("/user/reset_password", requireLogin, user_controller.reset_password);
router.put("/user/new_main_admin", requireLogin, user_controller.new_main_admin);
router.put("/user/block_anony_reports", requireLogin, user_controller.block_anony_reports);

// routes for reports
var report_controller = require("../controllers/report.controller");
router.post("/report/register_report", anony_reports, report_controller.register_report);
router.get("/report/import_admin", requireLogin, report_controller.import_reports_admin);
router.get("/report/import_user", requireLogin, report_controller.import_reports_user);
router.post("/report/change_status", requireLogin, report_controller.change_status);

module.exports = router;