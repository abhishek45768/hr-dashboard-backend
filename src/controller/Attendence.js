const Attendance = require("../model/Attendence")
const Employee = require("../model/Employee")
const ErrorResponse = require("../utils/errorResponse")

exports.getAttendance = async (req, res, next) => {
  try {
    const { employeeId, status, startDate, endDate } = req.query

    const query = {}

    if (employeeId) {
      query.employee = employeeId
    }

    if (status) {
      query.status = status
    }

    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      }
    } else if (startDate) {
      query.date = { $gte: new Date(startDate) }
    } else if (endDate) {
      query.date = { $lte: new Date(endDate) }
    }

    const attendance = await Attendance.find(query)
      .populate({
        path: "employee",
        select: "fullName position profileImage",
      })
      .sort({ date: -1 })

    res.status(200).json({
      success: true,
      count: attendance.length,
      data: attendance,
    })
  } catch (error) {
    next(error)
  }
}


exports.getTodayAttendance = async (req, res, next) => {
  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const attendance = await Attendance.find({
      date: {
        $gte: today,
        $lt: tomorrow,
      },
    }).populate({
      path: "employee",
      select: "fullName position profileImage",
    })

    res.status(200).json({
      success: true,
      count: attendance.length,
      data: attendance,
    })
  } catch (error) {
    next(error)
  }
}


exports.getAttendanceById = async (req, res, next) => {
  try {
    const attendance = await Attendance.findById(req.params.id).populate({
      path: "employee",
      select: "fullName position profileImage",
    })

    if (!attendance) {
      return next(new ErrorResponse(`Attendance record not found with id of ${req.params.id}`, 404))
    }

    res.status(200).json({
      success: true,
      data: attendance,
    })
  } catch (error) {
    next(error)
  }
}

exports.createAttendance = async (req, res, next) => {
  try {
    req.body.createdBy = req.user.id

    const employee = await Employee.findById(req.body.employee)
    if (!employee) {
      return next(new ErrorResponse("Employee not found", 404))
    }

    const date = new Date(req.body.date || Date.now())
    date.setHours(0, 0, 0, 0)
    const nextDay = new Date(date)
    nextDay.setDate(nextDay.getDate() + 1)

    const existingAttendance = await Attendance.findOne({
      employee: req.body.employee,
      date: {
        $gte: date,
        $lt: nextDay,
      },
    })

    if (existingAttendance) {
      return next(new ErrorResponse("Attendance record already exists for this employee on this date", 400))
    }

    const attendance = await Attendance.create({
      ...req.body,
      date,
    })

    res.status(201).json({
      success: true,
      data: attendance,
    })
  } catch (error) {
    next(error)
  }
}


exports.updateAttendance = async (req, res, next) => {
  try {
    let attendance = await Attendance.findById(req.params.id)

    if (!attendance) {
      return next(new ErrorResponse(`Attendance record not found with id of ${req.params.id}`, 404))
    }

    if (req.user.role !== "HR") {
      return next(new ErrorResponse("Not authorized to update attendance records", 401))
    }

    attendance = await Attendance.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate({
      path: "employee",
      select: "fullName position profileImage",
    })

    res.status(200).json({
      success: true,
      data: attendance,
    })
  } catch (error) {
    next(error)
  }
}

exports.deleteAttendance = async (req, res, next) => {
  try {
    const attendance = await Attendance.findById(req.params.id)

    if (!attendance) {
      return next(new ErrorResponse(`Attendance record not found with id of ${req.params.id}`, 404))
    }

    if (req.user.role !== "HR") {
      return next(new ErrorResponse("Not authorized to delete attendance records", 401))
    }

    await attendance.deleteOne()

    res.status(200).json({
      success: true,
      data: {},
    })
  } catch (error) {
    next(error)
  }
}


exports.getAttendanceStats = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query

    let dateQuery = {}

    if (startDate && endDate) {
      dateQuery = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      }
    } else if (startDate) {
      dateQuery = { $gte: new Date(startDate) }
    } else if (endDate) {
      dateQuery = { $lte: new Date(endDate) }
    }

    const totalEmployees = await Employee.countDocuments({ status: "Active" })

    const stats = await Attendance.aggregate([
      {
        $match: dateQuery.length > 0 ? { date: dateQuery } : {},
      },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ])

    const formattedStats = {
      totalEmployees,
      present: 0,
      absent: 0,
    }

    stats.forEach((stat) => {
      if (stat._id === "Present") {
        formattedStats.present = stat.count
      } else if (stat._id === "Absent") {
        formattedStats.absent = stat.count
      }
    })

    res.status(200).json({
      success: true,
      data: formattedStats,
    })
  } catch (error) {
    next(error)
  }
}

exports.bulkCreateAttendance = async (req, res, next) => {
  try {
    const { date, employees, status } = req.body

    if (!date || !employees || !Array.isArray(employees) || !status) {
      return next(new ErrorResponse("Please provide date, employees array, and status", 400))
    }

    if (!["Present", "Absent"].includes(status)) {
      return next(new ErrorResponse("Invalid status value", 400))
    }

    const attendanceDate = new Date(date)
    attendanceDate.setHours(0, 0, 0, 0)
    const nextDay = new Date(attendanceDate)
    nextDay.setDate(nextDay.getDate() + 1)

    const existingAttendance = await Attendance.find({
      employee: { $in: employees },
      date: {
        $gte: attendanceDate,
        $lt: nextDay,
      },
    })

    const existingEmployeeIds = existingAttendance.map((record) => record.employee.toString())

    const newEmployeeIds = employees.filter((id) => !existingEmployeeIds.includes(id.toString()))

    const attendanceRecords = newEmployeeIds.map((employeeId) => ({
      employee: employeeId,
      date: attendanceDate,
      status,
      createdBy: req.user.id,
    }))

    if (attendanceRecords.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No new attendance records to create",
        created: 0,
        existing: existingEmployeeIds.length,
      })
    }

    await Attendance.insertMany(attendanceRecords)

    res.status(201).json({
      success: true,
      message: "Attendance records created successfully",
      created: attendanceRecords.length,
      existing: existingEmployeeIds.length,
    })
  } catch (error) {
    next(error)
  }
}
