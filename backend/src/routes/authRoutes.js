const express = require('express');

const { generateOtpHandler, verifyOtpHandler } = require('../controllers/authController');
const { validateRequest } = require('../middlewares/validateMiddleware');
const { generateOtpValidation, verifyOtpValidation } = require('../validators/authValidators');

const router = express.Router();

router.post('/generate-otp', generateOtpValidation, validateRequest, generateOtpHandler);
router.post('/verify-otp', verifyOtpValidation, validateRequest, verifyOtpHandler);

module.exports = router;
