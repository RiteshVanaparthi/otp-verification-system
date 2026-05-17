const User = require('../models/User');
const ApiError = require('../utils/ApiError');

const listUsers = async (req, res, next) => {
  try {
    const users = await User.find({ isVerified: true }).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, data: users });
  } catch (error) {
    next(error);
  }
};

const getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) return next(new ApiError(404, 'User not found'));
    if (!user.isVerified) return next(new ApiError(403, 'Only verified users are allowed in CRUD'));

    return res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

const createUser = async (req, res, next) => {
  try {
    const { name, contact, contactType } = req.body;

    const existingUser = await User.findOne({ contact });
    if (!existingUser || !existingUser.isVerified) {
      return next(new ApiError(403, 'Contact must be OTP-verified before it can be added to CRUD'));
    }

    if (existingUser.name !== 'OTP User') {
      return next(new ApiError(400, 'Contact already exists. Use update API to modify user details'));
    }

    existingUser.name = name;
    existingUser.contactType = contactType;
    await existingUser.save();

    return res.status(201).json({
      success: true,
      message: 'Verified user added to CRUD successfully',
      data: existingUser,
    });
  } catch (error) {
    next(error);
  }
};

const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) return next(new ApiError(404, 'User not found'));
    if (!user.isVerified) return next(new ApiError(403, 'Only verified users are allowed in CRUD'));

    Object.assign(user, req.body);
    const updatedUser = await user.save();

    return res.status(200).json({ success: true, message: 'User updated', data: updatedUser });
  } catch (error) {
    next(error);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) return next(new ApiError(404, 'User not found'));
    if (!user.isVerified) return next(new ApiError(403, 'Only verified users are allowed in CRUD'));

    await user.deleteOne();

    return res.status(200).json({ success: true, message: 'User deleted' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  listUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
};
