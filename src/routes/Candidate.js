const express = require("express")
const {
    getCandidates,
    getCandidate,
    createCandidate,
    updateCandidate,
    deleteCandidate,
    updateCandidateStatus,
    downloadResume,
} = require("../controller/Candidate")

const { protect, authorize } = require("../middleware/Auth")
const { uploadResume } = require("../middleware/Upload")

const router = express.Router()

router.route("/getcandidates").get(protect, getCandidates)

router.route('/createCandidate').post(protect, authorize("HR"), uploadResume, createCandidate)

router.route("/getcandidate/:id").get(getCandidate)
router.route("/updateCandidate/:id").put(protect, uploadResume, updateCandidate)

router.route("/deleteCandidate/:id").delete(protect, authorize("HR"), deleteCandidate)

router.patch("/updateCandidateStatus/:id", protect, authorize("HR"), updateCandidateStatus)
router.get("/downloadResume/:id", protect, authorize("HR"), downloadResume)

module.exports = router
