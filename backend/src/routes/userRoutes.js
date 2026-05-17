const express = require('express');

const {
  listUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
} = require('../controllers/userController');
const { protect } = require('../middlewares/authMiddleware');
const { validateRequest } = require('../middlewares/validateMiddleware');
const { createUserValidation, updateUserValidation, userIdValidation } = require('../validators/userValidators');

const router = express.Router();

router.use(protect);

router.get('/', listUsers);
router.get('/:id', userIdValidation, validateRequest, getUserById);
router.post('/', createUserValidation, validateRequest, createUser);
router.put('/:id', updateUserValidation, validateRequest, updateUser);
router.delete('/:id', userIdValidation, validateRequest, deleteUser);

module.exports = router;
