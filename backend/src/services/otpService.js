const Otp = require('../models/Otp');

const createOtpEntry = async ({ contact, otp, expiresAt }) => {
  await Otp.deleteMany({ contact, isUsed: false });
  return Otp.create({ contact, otp, expiresAt, isUsed: false });
};

const getLatestUnusedOtpByContact = async (contact) => {
  return Otp.findOne({ contact, isUsed: false }).sort({ createdAt: -1 });
};

const markOtpAsUsed = async (otpEntry) => {
  if (!otpEntry) return;

  otpEntry.isUsed = true;
  await otpEntry.save();
};

const cleanupExpiredOtps = async () => {
  const now = new Date();

  await Otp.deleteMany({ expiresAt: { $lt: now } });
};

module.exports = {
  createOtpEntry,
  getLatestUnusedOtpByContact,
  markOtpAsUsed,
  cleanupExpiredOtps,
};
