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


const router = express.Router()

router.route("/getcandidates").get(protect, getCandidates)

router.route('/createCandidate').post(protect, authorize("HR"), createCandidate)

router.route("/getcandidate/:id").get(getCandidate)
router.route("/updateCandidate/:id").put(protect, updateCandidate)

router.route("/deleteCandidate/:id").delete(protect, authorize("HR"), deleteCandidate)

router.patch("/updateCandidateStatus/:id", protect, authorize("HR"), updateCandidateStatus)


module.exports = router
