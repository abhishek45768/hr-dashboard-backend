const mongoose = require('mongoose');

const CandidateSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, 'Please add a full name'],
    trim: true
  },
  unique_id: Number,
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ]
  },
  phone: {
    type: String,
    required: [true, 'Please add a phone number']
  },
  position: {
    type: String,
    enum3:["Intern","Full Time","Junior","Senior","Team Lead"],
    required: [true, 'Please add a position']
  },
  experience: {
    type: String,
    required: [true, 'Please add experience']
  },
  resume: {
    type: String,
    required: [true, 'Please upload a resume']
  },
  status: {
    type: String,
    enum: ['New', 'Selected', 'Rejected'],
    default: 'New'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Candidate', CandidateSchema);