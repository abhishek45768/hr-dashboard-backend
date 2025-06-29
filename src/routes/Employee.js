const express = require("express")
const {
  getEmployees,
  getEmployee,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  createEmployeeAccount,
  downloadResume,
  updateAttendenceStatus,
} = require("../controller/Employee")

const { protect, authorize } = require("../middleware/Auth")


const router = express.Router()

router.route("/getEmployees").get(protect, getEmployees)

router
  .route("/employee/:id")
  .get(getEmployee)
  .put(protect, authorize("HR"), updateEmployee)
  .delete(protect, authorize("HR"), deleteEmployee)

router.post("/createEmployee", protect, authorize("HR"), createEmployee)
router.patch("/updateAttendenceStatus/:id", protect, authorize("HR"), updateAttendenceStatus)


module.exports = router
