const Employee = require("../model/Employee")
const Candidate = require("../model/Candidate")
const User = require("../model/User")
const ErrorResponse = require("../utils/errorResponse")
const path = require("path")
const fs = require("fs")
const { default: mongoose } = require("mongoose")

exports.getEmployees = async (req, res, next) => {
  try {
    const id = req.user.id
    const {  department, search ,position} = req.query
    const query = {
      createdBy: new mongoose.Types.ObjectId(id)
    }
    
      query.status = "Selected"
    if(position){
      query.position=position
    }

    if (department) {
      query.department = department
    }

    if (search) {
      query.$or = [{ fullName: { $regex: search, $options: "i" } }, { email: { $regex: search, $options: "i" } }]
    }

    const employees = await Candidate.find(query).sort({ createdAt: -1 })

    return res.status(200).json({
      success: true,
      count: employees.length,
      data: employees,
    })
  } catch (error) {
    next(error)
  }
}

exports.getEmployee = async (req, res, next) => {
  try {
    const employee = await Candidate.findById(req.params.id)

    if (!employee) {
      return next(new ErrorResponse(`Employee not found with id of ${req.params.id}`, 404))
    }

    res.status(200).json({
      success: true,
      data: employee,
    })
  } catch (error) {
    next(error)
  }
}

exports.createEmployee = async (req, res, next) => {
  try {
    req.body.createdBy = req.user.id

    const existingEmployee = await Employee.findOne({ email: req.body.email })
    if (existingEmployee) {
      return next(new ErrorResponse("Employee with this email already exists", 400))
    }

    const employee = await Employee.create(req.body)
    console.log("employee : ", employee)

    return res.status(201).json({
      message: "Employee created successfully",
      success: true,
      data: employee,
    })
  } catch (error) {
    next(error)
  }
}

exports.updateEmployee = async (req, res, next) => {
  try {
    let employee = await Candidate.findById(req.params.id)

    if (!employee) {
      return next(new ErrorResponse(`Employee not found with id of ${req.params.id}`, 404))
    }

    if (req.user.role !== "HR") {
      return next(new ErrorResponse("Not authorized to update employee details", 401))
    }

    employee = await Candidate.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })

    res.status(200).json({
      success: true,
      data: employee,
    })
  } catch (error) {
    next(error)
  }
}

exports.deleteEmployee = async (req, res, next) => {
  try {
    const employee = await Candidate.findById(req.params.id)

    if (!employee) {
      return next(new ErrorResponse(`Employee not found with id of ${req.params.id}`, 404))
    }

    if (req.user.role !== "HR") {
      return next(new ErrorResponse("Not authorized to delete employee", 401))
    }

    if (employee.profileImage && employee.profileImage !== "default-profile.jpg") {
      const filePath = path.join(__dirname, "../uploads/profiles", employee.profileImage)
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath)
      }
    }

    if (employee.resume) {
      const filePath = path.join(__dirname, "../uploads/resumes", employee.resume)
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath)
      }
    }

    // if (employee.user) {
    //   await User.findByIdAndUpdate(employee.user, { status: "Inactive" })
    // }

    await employee.deleteOne()

    res.status(200).json({
      message : "employee deleted successfully",
      success: true,
    })
  } catch (error) {
    next(error)
  }
}

exports.downloadResume = async (req, res, next) => {
  try {
    const employee = await Candidate.findById(req.params.id)

    if (!employee) {
      return next(new ErrorResponse(`Employee not found with id of ${req.params.id}`, 404))
    }

    if (!employee.resume) {
      return next(new ErrorResponse("No resume found for this employee", 404))
    }

    const filePath = path.join(__dirname, "../uploads/resumes", employee.resume)

    if (!fs.existsSync(filePath)) {
      return next(new ErrorResponse("Resume file not found", 404))
    }

    res.download(filePath)
  } catch (error) {
    next(error)
  }
}
