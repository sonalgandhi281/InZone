const mongoose = require("mongoose");

const AttendanceSchema = new mongoose.Schema({
  employeeId: Number,
  date: String,
  checkInDateTime: {
  type: Date,
  required:false,
},

  checkInTime: String,
  checkOutTime: String,
  totalHours: String,
  status: {
    type: String,
    enum: ["Present", "Absent"],
    default: "Absent",
  },
},{collection:"Attendance"});

mongoose.model("Attendance", AttendanceSchema);

// const mongoose = require("mongoose");

// const AttendanceSchema = new mongoose.Schema({
//   employeeId: Number,
//   date: String,
//   checkInTime: {
//     type: Date, // store actual Date object
//   },
//   checkOutTime: {
//     type: Date,
//   },
//   totalHours: String,
//   status: {
//     type: String,
//     enum: ["Present", "Absent"],
//     default: "Absent",
//   },
// }, { collection: "Attendance" });

// module.exports = mongoose.model("Attendance", AttendanceSchema);
