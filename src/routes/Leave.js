const express = require('express');
const {
  getLeaves,
  getApprovedLeaves,
  getLeave,
  createLeave,
  updateLeaveStatus,
  deleteLeave,
  downloadLeaveDocument
} = require('../controller/Leave');

const { protect, authorize } = require('../middleware/Auth');
const { uploadLeaveDocument } = require('../middleware/Upload');

const router = express.Router();

router.use(protect);

router.route('/getleave').get(getLeaves)
router.route('/createLeave').post(uploadLeaveDocument,createLeave);
router.get('/getApprovedLeave', getApprovedLeaves);

router.route('/leave/:id')
  .get(getLeave)
  .delete(deleteLeave);

router.put('/updateleave/:id', authorize('HR'), updateLeaveStatus);
router.get('/downloadleave/:id', downloadLeaveDocument);

module.exports = router;