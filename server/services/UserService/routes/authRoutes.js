const express = require("express");
const router = express.Router();
const authController = require("../controllers/authControllers");
const auth = require("../middlewares/auth");

router.get("/verify", authController.verify);
router.post('/login', authController.login);
router.post("/change-password", auth, authController.changePassword);
router.post("/verify-password", auth, authController.verifyPassword);
router.post('/send-reset-link', authController.sendResetLink);
router.post('/reset-password', authController.resetPassword);


module.exports = router;
