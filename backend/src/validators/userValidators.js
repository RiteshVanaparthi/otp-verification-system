const { body, param } = require('express-validator');

const contactTypeValidator = body('contactType')
  .notEmpty()
  .withMessage('contactType is required')
  .isIn(['email', 'phone'])
  .withMessage('contactType must be email or phone');

const createUserValidation = [
  body('name').notEmpty().withMessage('Name is required').isString().trim(),
  body('contact').notEmpty().withMessage('Contact is required').isString().trim(),
  contactTypeValidator,
];

const updateUserValidation = [
  param('id').notEmpty().withMessage('User ID is required'),
  body('name').optional().isString().withMessage('Name must be a string').trim(),
  body('contact').optional().isString().withMessage('Contact must be a string').trim(),
  body('contactType').optional().isIn(['email', 'phone']).withMessage('contactType must be email or phone'),
];

const userIdValidation = [param('id').notEmpty().withMessage('User ID is required')];

module.exports = { createUserValidation, updateUserValidation, userIdValidation };
