const { body } = require('express-validator');

const contactValidator = body('contact')
  .notEmpty()
  .withMessage('Contact is required')
  .isString()
  .withMessage('Contact must be a string')
  .customSanitizer((value) => String(value || '').trim())
  .custom((value) => {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phonePattern = /^\+?[0-9\s()-]{10,18}$/;

    if (emailPattern.test(value) || phonePattern.test(value)) {
      return true;
    }

    throw new Error('Contact must be a valid email or phone number');
  });

const otpValidator = body('otp')
  .notEmpty()
  .withMessage('OTP is required')
  .matches(/^\d{6}$/)
  .withMessage('OTP must be a 6-digit number');

const generateOtpValidation = [contactValidator];
const verifyOtpValidation = [contactValidator, otpValidator];

module.exports = { generateOtpValidation, verifyOtpValidation };
