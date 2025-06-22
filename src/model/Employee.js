const mongoose = require("mongoose")

const EmployeeSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, "Please add a full name"],
    trim: true,
  },
  email: {
    type: String,
    required: [true, "Please add an email"],
    unique: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, "Please add a valid email"],
  },
  phone: {
    type: String,
    required: [true, "Please add a phone number"],
  },
  position: {
    type: String,
    required: [true, "Please add a position"],
  },
  department: {
    type: String,
    required: [true, "Please add a department"],
  },
  joinDate: {
    type: Date,
    required: [true, "Please add a join date"],
  },
  profileImage: {
    type: String,
    default: "default-profile.jpg",
  },
  resume: {
    type: String,
  },
  status: {
    type: String,
    enum: ["Active", "Inactive"],
    default: "Active",
  },
  // Reference to user account if exists
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  // If this employee was created from a candidate
  candidateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Candidate",
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

module.exports = mongoose.model("Employee", EmployeeSchema)
