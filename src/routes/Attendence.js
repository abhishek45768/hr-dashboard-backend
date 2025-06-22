const express = require("express")
const {
    getAttendance,
    getTodayAttendance,
    getAttendanceById,
    createAttendance,
    updateAttendance,
    deleteAttendance,
    getAttendanceStats,
    bulkCreateAttendance,
} = require("../controller/Attendence")

const { protect, authorize } = require("../middleware/Auth")

const router = express.Router()

router.use(protect)

router.route("/attendence").get(getAttendance).post(authorize("HR"), createAttendance)

router.get("/todayAttendence", getTodayAttendance)
router.get("/attendenceStats", authorize("HR"), getAttendanceStats)
router.post("/createBulkAttendence", authorize("HR"), bulkCreateAttendance)

router
    .route("/attendence/:id")
    .get(getAttendanceById)
    .put(authorize("HR"), updateAttendance)
    .delete(authorize("HR"), deleteAttendance)

module.exports = router
