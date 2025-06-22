const express = require("express")
const {
  getEmployees,
  getEmployee,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  createEmployeeAccount,
  downloadResume,
} = require("../controller/Employee")

const { protect, authorize } = require("../middleware/Auth")
const { uploadProfileImage, uploadResume } = require("../middleware/Upload")

const router = express.Router()

router.route("/getEmployees").get(protect, getEmployees)

router
  .route("/employee/:id")
  .get(getEmployee)
  .put(protect, authorize("HR"), uploadProfileImage, uploadResume, updateEmployee)
  .delete(protect, authorize("HR"), deleteEmployee)

router.post("/createEmployee", protect, authorize("HR"), uploadProfileImage, uploadResume, createEmployee)
router.get("/downloadResume/:id", protect, downloadResume)

module.exports = router
