const express = require("express");
const router = express.Router();
const { requireLogin } = require("../middlewares/authentication");
const { anony_reports } = require("../middlewares/anony_reports");
const { uploadMiddleware } = require('../middlewares/upload');

// routes for users
var user_controller = require("../controllers/user.controller");
router.get("/user/get_user", requireLogin, user_controller.get_user);
router.post("/user/login", user_controller.login);
router.post("/user/register", user_controller.register);
router.post("/user/change_admin", requireLogin, user_controller.change_to_admin);
router.get("/user/get_admins", requireLogin, user_controller.get_admins);
router.patch("/user/reset_password", requireLogin, user_controller.reset_password);
router.put("/user/new_main_admin", requireLogin, user_controller.new_main_admin);
router.put("/user/block_anony_reports", requireLogin, user_controller.block_anony_reports);
router.put("/user/block_user", requireLogin, user_controller.block_user);

// routes for reports
var report_controller = require("../controllers/report.controller");
router.post("/report/register_report", anony_reports, uploadMiddleware.single('photo'), report_controller.register_report);
router.put("/report/get_report", requireLogin, report_controller.get_report);
router.get("/images/:photoPath", report_controller.get_report_image);
router.put("/report/get_summaries", requireLogin, report_controller.get_summaries)
router.get("/report/import_admin", requireLogin, report_controller.import_reports_admin);
router.get("/report/import_user", requireLogin, report_controller.import_reports_user);
router.post("/report/respond_report", requireLogin, report_controller.respond_report);
router.get("/report/get_message_report", requireLogin, report_controller.get_message_report);

module.exports = router;