const express = require('express');
const multer = require('multer');
const formData = multer();
const router = express.Router();
const {validateRequestBody} = require('../helpers/appHelper');
const AttendanceController = require('../controllers/attendanceController');

router.get(
    '/calculate-attendance',
    AttendanceController.calculateAttendance
);
module.exports = router;