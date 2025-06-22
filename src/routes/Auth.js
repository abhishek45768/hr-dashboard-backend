const express = require('express');
const {
  register,
  login,
  logout,
  getMe,
  updateDetails,
  updatePassword
} = require('../controller/Auth');
const { protect } = require('../middleware/Auth');
const { uploadProfileImage } = require('../middleware/Upload');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/logout', logout);
router.get('/me', protect, getMe);
router.put('/updatedetails', protect, uploadProfileImage, updateDetails);
router.put('/updatepassword', protect, updatePassword);

module.exports = router;