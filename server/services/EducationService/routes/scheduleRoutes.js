const express = require("express");
const router = express.Router();
const scheduleController = require("../controllers/scheduleControllers");

router.post('/generate-schedule', scheduleController.generateSchedule);


module.exports = router;
