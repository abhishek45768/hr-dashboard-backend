const Leave = require('../model/Leave');
const Employee = require('../model/Employee');
const Attendance = require('../model/Attendence');
const ErrorResponse = require('../utils/errorResponse');
const path = require('path');
const fs = require('fs');

exports.getLeaves = async (req, res, next) => {
  try {
    const { status, employeeId, startDate, endDate } = req.query;

    let query = {};

    if (status) {
      query.status = status;
    }

    if (employeeId) {
      query.employee = employeeId;
    }

    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    } else if (startDate) {
      query.date = { $gte: new Date(startDate) };
    } else if (endDate) {
      query.date = { $lte: new Date(endDate) };
    }

    const leaves = await Leave.find(query)
      .populate({
        path: 'employee',
        select: 'fullName position profileImage'
      })
      .sort({ date: -1 });

    res.status(200).json({
      success: true,
      count: leaves.length,
      data: leaves
    });
  } catch (error) {
    next(error);
  }
};

exports.getApprovedLeaves = async (req, res, next) => {
  try {
    const leaves = await Leave.find({ status: 'Approved' })
      .populate({
        path: 'employee',
        select: 'fullName position profileImage'
      })
      .sort({ date: -1 });

    res.status(200).json({
      success: true,
      count: leaves.length,
      data: leaves
    });
  } catch (error) {
    next(error);
  }
};

exports.getLeave = async (req, res, next) => {
  try {
    const leave = await Leave.findById(req.params.id)
      .populate({
        path: 'employee',
        select: 'fullName position profileImage'
      });

    if (!leave) {
      return next(new ErrorResponse(`Leave not found with id of ${req.params.id}`, 404));
    }

    res.status(200).json({
      success: true,
      data: leave
    });
  } catch (error) {
    next(error);
  }
};


exports.createLeave = async (req, res, next) => {
  try {
    req.body.createdBy = req.user.id;

    const employee = await Employee.findById(req.body.employee);
    if (!employee) {
      return next(new ErrorResponse('Employee not found', 404));
    }

    // const today = new Date();
    // today.setHours(0, 0, 0, 0);

    // const attendance = await Attendance.findOne({
    //   employee: req.body.employee,
    //   date: {
    //     $gte: today,
    //     $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
    //   },
    //   status: 'Present'
    // });

    // if (!attendance && req.user.role === 'Employee') {
    //   return next(new ErrorResponse('Only present employees can take leaves', 400));
    // }

    const leave = await Leave.create(req.body);
    console.log("leave : ", leave);

    return res.status(201).json({
      success: true,
      data: leave
    });
  } catch (error) {
    next(error);
  }
};

exports.updateLeaveStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    if (!['Pending', 'Approved', 'Rejected'].includes(status)) {
      return next(new ErrorResponse('Invalid status value', 400));
    }

    const leave = await Leave.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    ).populate({
      path: 'employee',
      select: 'fullName position profileImage'
    });

    if (!leave) {
      return next(new ErrorResponse(`Leave not found with id of ${req.params.id}`, 404));
    }

    res.status(200).json({
      success: true,
      data: leave
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteLeave = async (req, res, next) => {
  try {
    const leave = await Leave.findById(req.params.id);

    if (!leave) {
      return next(new ErrorResponse(`Leave not found with id of ${req.params.id}`, 404));
    }

    if (leave.createdBy.toString() !== req.user.id && req.user.role !== 'HR') {
      return next(new ErrorResponse('Not authorized to delete this leave', 401));
    }

    if (leave.document) {
      const filePath = path.join(__dirname, '../uploads/documents', leave.document);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await leave.remove();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
};


exports.downloadLeaveDocument = async (req, res, next) => {
  try {
    const leave = await Leave.findById(req.params.id);

    if (!leave) {
      return next(new ErrorResponse(`Leave not found with id of ${req.params.id}`, 404));
    }

    if (!leave.document) {
      return next(new ErrorResponse('No document found for this leave', 404));
    }

    const filePath = path.join(__dirname, '../uploads/documents', leave.document);

    if (!fs.existsSync(filePath)) {
      return next(new ErrorResponse('Document file not found', 404));
    }

    res.download(filePath);
  } catch (error) {
    next(error);
  }
};