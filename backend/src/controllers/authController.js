const jwt = require('jsonwebtoken');

const env = require('../config/env');
const User = require('../models/User');
const generateOtp = require('../utils/generateOtp');
const ApiError = require('../utils/ApiError');
const { sendOtpNotification } = require('../services/notificationService');
const {
  createOtpEntry,
  getLatestUnusedOtpByContact,
  markOtpAsUsed,
  cleanupExpiredOtps,
} = require('../services/otpService');

const normalizePhoneContact = (value) => {
  const compact = value.replace(/[\s()-]/g, '');

  if (compact.startsWith('+')) return compact;

  if (/^\d{10}$/.test(compact)) {
    return `${env.smsDefaultCountryCode}${compact}`;
  }

  return compact;
};

const normalizeContact = (contact) => {
  const trimmed = String(contact || '').trim();

  if (trimmed.includes('@')) {
    return trimmed.toLowerCase();
  }

  return normalizePhoneContact(trimmed);
};

const detectContactType = (contact) => {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phonePattern = /^\+[0-9]{10,15}$|^[0-9]{10,15}$/;

  if (emailPattern.test(contact)) return 'email';
  if (phonePattern.test(contact)) return 'phone';
  return null;
};

const findUserByContact = async (contact) => {
  return User.findOne({ contact });
};

const generateOtpHandler = async (req, res, next) => {
  try {
    await cleanupExpiredOtps();

    const contact = normalizeContact(req.body.contact);
    const contactType = detectContactType(contact);

    if (!contactType) {
      return next(new ApiError(400, 'Please provide a valid email or phone number'));
    }

    let user = await findUserByContact(contact);

    if (!user) {
      user = await User.create({
        name: 'OTP User',
        contact,
        contactType,
        isVerified: false,
      });
    }

    const existingOtpEntry = await getLatestUnusedOtpByContact(contact);

    let otp = existingOtpEntry?.otp;
    let expiresAt = existingOtpEntry?.expiresAt;

    if (!existingOtpEntry || new Date(existingOtpEntry.expiresAt) < new Date()) {
      otp = generateOtp();
      expiresAt = new Date(Date.now() + env.otpExpiryMinutes * 60 * 1000);
      await createOtpEntry({ contact, otp, expiresAt });
    }

    await sendOtpNotification({ contact, contactType, otp, expiresAt });

    res.status(200).json({
      success: true,
      message: 'OTP generated and sent successfully',
      data: {
        contact,
        expiresAt,
        // Exposing OTP for demo/testing. Remove this in production.
        otp,
      },
    });
  } catch (error) {
    next(error);
  }
};

const verifyOtpHandler = async (req, res, next) => {
  try {
    await cleanupExpiredOtps();

    const contact = normalizeContact(req.body.contact);
    const { otp } = req.body;
    const otpEntry = await getLatestUnusedOtpByContact(contact);

    if (!otpEntry) {
      return next(new ApiError(400, 'No active OTP found. Please generate OTP again.'));
    }

    if (new Date(otpEntry.expiresAt) < new Date()) {
      return next(new ApiError(400, 'OTP expired. Please generate a new OTP.'));
    }

    if (otpEntry.otp !== otp) {
      return next(new ApiError(400, 'Invalid OTP'));
    }

    await markOtpAsUsed(otpEntry);

    let user = await findUserByContact(contact);

    if (user) {
      user.isVerified = true;
      await user.save();
    }

    const token = jwt.sign({ contact }, env.jwtSecret, { expiresIn: '1h' });

    res.status(200).json({
      success: true,
      message: 'OTP verified. Access granted.',
      token,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  generateOtpHandler,
  verifyOtpHandler,
};
