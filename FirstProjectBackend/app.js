require('dotenv').config();
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cron = require("node-cron");
const cors = require("cors");
const PORT = process.env.PORT || 5001;
app.use(cors());

app.use(express.json());



const mongoUrl = process.env.MONGO_URI;
const JWT_SECRET = process.env.JWT_SECRET;



mongoose
  .connect(mongoUrl
  // , {
  //   useNewUrlParser: true,
  //   useUnifiedTopology: true,
  // }
  )
  .then(() => console.log("Database Connected"))
  .catch((e) => console.log(e));

require("./UserDetails");
const User = mongoose.model("UserInfo");

require("./Attendance");
const Attendance = mongoose.model("Attendance");

const Geofence = require("./models/Geofence");
const DeclineLog = require("./models/DeclineLog");

const now = new Date();

app.get("/", (req, res) => {
  res.send({ status: "started" });
});
//--------OTP-------
const OtpModel = require("./models/Otp"); // or require('./Otp') if in same folder

const generateOTP = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

app.post("/send-otp", async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user)
      return res
        .status(404)
        .send({ status: "error", message: "User not found" });

    const otp = generateOTP();

    // ✅ DELETE previous OTPs before creating a new one
    await OtpModel.deleteMany({ email });

    await OtpModel.create({ email, otp });

    await transporter.sendMail({
      from: '"Inzone" <inzoneaai@gmail.com>',
      to: email,
      subject: "Reset Password OTP",
      text: `Your OTP for password reset is: ${otp}. It is valid for 5 minutes.`,
    });

    res.send({ status: "ok", message: "OTP sent successfully" });
  } catch (error) {
    res.status(500).send({ status: "error", message: error.message });
  }
});

//----verify otp------
app.post("/verify-otp", async (req, res) => {
  const { email, otp } = req.body;

  try {
    const validOtp = await OtpModel.findOne({ email, otp });
    if (!validOtp) {
      return res
        .status(400)
        .send({ status: "error", message: "Invalid or expired OTP" });
    }

    res.send({ status: "ok", message: "OTP verified" });
  } catch (err) {
    res.status(500).send({ status: "error", message: err.message });
  }
});

//---------reset password --------
app.post("/reset-password", async (req, res) => {
  const { email, newPassword } = req.body;

  try {
    const encrypted = await bcrypt.hash(newPassword, 10);
    await User.updateOne({ email }, { $set: { password: encrypted } });

    await OtpModel.deleteMany({ email }); // remove OTPs after reset

    res.send({ status: "ok", message: "Password reset successfully" });
  } catch (error) {
    res.status(500).send({ status: "error", message: error.message });
  }
});

// -------------------- REGISTER --------------------
app.post("/register", async (req, res) => {
  console.log("Received data:", req.body);

  const {
    employeeId,
    firstName,
    lastName,
    department,
    post,
    email,
    contact,
    password,
    confirmPassword,
    role,
  } = req.body;

  try {
    const oldUser = await User.findOne({ employeeId });
    if (oldUser) {
      return res.send({ status: "error", data: "User already exists!" });
    }
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).send({
        status: "error",
        data: "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
      });
    }
    const encryptedPassword = await bcrypt.hash(password, 10);

    await User.create({
      employeeId,
      firstName,
      lastName,
      department,
      post,
      email,
      contact,
      password: encryptedPassword,
      role,
      approved: false, // 🚨 required for signup approval flow
      // requestedAt is automatically set by schema default
    });

    res.send({
      status: "ok",
      data: "Signup request submitted for admin approval",
    });
  } catch (error) {
    console.error("❌ Error occurred during register:", error);
    res.status(500).send({ status: "error", data: error.message });
  }
});

// -------------------- LOGIN (USER/ADMIN Combined) --------------------
app.post("/login-user", async (req, res) => {
  const { employeeId, email, password, role } = req.body;

  try {
    const user = await User.findOne({ employeeId });

    if (!user) {
      return res.send({ status: "error", data: "User doesn't exist!" });
    }

    if (user.role !== role) {
      return res.send({
        status: "error",
        data: `Login not allowed as ${role}`,
      });
    }

    if (!user.approved && role === "user") {
      return res.send({
        status: "error",
        data: "Your signup request is still pending approval by the admin.",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.send({ status: "error", data: "Invalid password" });
    }

    const token = jwt.sign(
      { employeeId: user.employeeId, role: user.role },
      JWT_SECRET
    );
    return res.send({ status: "ok", data: token });
  } catch (error) {
    console.error("Login Error:", error);
    return res.status(500).send({ status: "error", data: "Server error" });
  }
});

// -------------------- LOGIN (ADMIN ONLY) --------------------
app.post("/login-admin", async (req, res) => {
  const { employeeId, email, password } = req.body;

  const user = await User.findOne({ employeeId });

  if (!user) {
    return res.send({ status: "error", data: "Admin doesn't exist!" });
  }

  if (user.role !== "admin") {
    return res.send({ status: "error", data: "Not an admin account!" });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.send({ status: "error", data: "Invalid password" });
  }

  const token = jwt.sign(
    { employeeId: user.employeeId, role: user.role },
    JWT_SECRET
  );
  return res.send({ status: "ok", data: token });
});

// -------------------- FETCH USER DATA --------------------
app.post("/userdata", async (req, res) => {
  const { token } = req.body;
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const employeeId = decoded.employeeId;

    const user = await User.findOne({ employeeId });
    if (!user) return res.status(404).send({ error: "User not found" });

    res.send({ status: "ok", data: user });
  } catch (error) {
    res.status(500).send({ status: "error", error: error.message });
  }
});

// -------------------- UPDATE PROFILE --------------------
app.post("/update-profile", async (req, res) => {
  const { employeeId, firstName, lastName, email, contact, department } =
    req.body;

  try {
    const user = await User.findOne({ employeeId });

    if (!user) {
      return res
        .status(404)
        .send({ status: "error", message: "User not found" });
    }

    user.firstName = firstName;
    user.lastName = lastName;
    user.email = email;
    user.contact = contact;
    if (department) {
      user.department = department;
    }

    await user.save();

    return res.send({ status: "ok", message: "Profile updated successfully" });
  } catch (error) {
    console.error("Update profile error:", error);
    return res
      .status(500)
      .send({ status: "error", message: "Internal Server Error" });
  }
});

// -------------------- CHANGE PASSWORD --------------------
app.post("/change-password", async (req, res) => {
  const { employeeId, currentPassword, newPassword } = req.body;

  try {
    const user = await User.findOne({ employeeId });
    if (!user) {
      return res
        .status(404)
        .send({ status: "error", message: "User not found" });
    }

    const isPasswordCorrect = await bcrypt.compare(
      currentPassword,
      user.password
    );
    if (!isPasswordCorrect) {
      return res
        .status(401)
        .send({ status: "error", message: "Incorrect current password" });
    }

    const encryptedNewPassword = await bcrypt.hash(newPassword, 10);
    user.password = encryptedNewPassword;
    await user.save();

    res.send({ status: "ok", message: "Password updated successfully" });
  } catch (error) {
    console.error("Password change error:", error);
    res.status(500).send({ status: "error", message: "Internal server error" });
  }
});

app.post("/mark-attendance", async (req, res) => {
  const { employeeId, checkInTime, checkOutTime, totalHours, checkInDateTime } =
    req.body;
  const today = new Date().toISOString().split("T")[0];

  try {
    let attendance = await Attendance.findOne({ employeeId, date: today });

    // 🟢 First Check-In
    if (!attendance) {
      attendance = await Attendance.create({
        employeeId,
        date: today,
        checkInTime,
        checkInDateTime,
        status: "Absent",
      });
      return res.send({ status: "ok", data: "Check-in marked" });
    }

    // 🛑 Already checked out
    if (attendance.checkOutTime) {
      return res.send({
        status: "error",
        data: "Attendance already marked for today.",
      });
    }

    // 🟡 Check-Out (Now totalHours is required)
    if (checkOutTime && totalHours) {
      attendance.checkOutTime = checkOutTime;
      attendance.totalHours = totalHours;

      let totalWorkedHours = 0;

      if (typeof totalHours === "string") {
        const hrsMatch = totalHours.match(/(\d+)\s*hrs/);
        const minsMatch = totalHours.match(/(\d+)\s*mins/);
        const hrs = hrsMatch ? parseInt(hrsMatch[1], 10) : 0;
        const mins = minsMatch ? parseInt(minsMatch[1], 10) : 0;
        totalWorkedHours = hrs + mins / 60;
      }

      attendance.status = totalWorkedHours >= 5 ? "Present" : "Absent";
      await attendance.save();

      return res.send({
        status: "ok",
        data: `Check-out marked as ${attendance.status}`,
      });
    }
  } catch (error) {
    console.error("❌ Error in /mark-attendance:", error.message);
    console.error(error.stack);
    return res.status(500).send({ status: "error", data: error.message });
  }
});

// -------------------- GET ATTENDANCE BY STATUS --------------------
app.post("/get-attendance-by-status", async (req, res) => {
  const { employeeId, status, month, year } = req.body;

  try {
    const regexMonth = String(
      new Date(`${month} 1, ${year}`).getMonth() + 1
    ).padStart(2, "0");
    const records = await Attendance.find({
      employeeId,
      status,
      date: { $regex: `^${year}-${regexMonth}` }, // Match dates like "2025-07"
    });

    res.send({ status: "ok", data: records });
  } catch (err) {
    console.error("Error fetching attendance:", err);
    res.status(500).send({ status: "error", message: err.message });
  }
});

// -------------------- GET TODAY'S ATTENDANCE --------------------
app.post("/get-today-attendance", async (req, res) => {
  const { employeeId } = req.body;
  const today = new Date().toISOString().split("T")[0];

  try {
    const record = await Attendance.findOne({ employeeId, date: today });
    res.send({ status: "ok", data: record });
  } catch (error) {
    res.status(500).send({ status: "error", data: error.message });
  }
});

// Get all attendance records for a specific date
app.post("/get-attendance-for-date", async (req, res) => {
  const { date } = req.body;

  try {
    const records = await Attendance.find({ date });

    // Fetch user details to attach names and photos
    const employeeIds = records.map((r) => r.employeeId);
    const users = await User.find({ employeeId: { $in: employeeIds } });

    const enrichedRecords = records.map((rec) => {
      const user = users.find((u) => u.employeeId === rec.employeeId);
      return {
        ...rec._doc,
        name: user ? `${user.firstName} ${user.lastName}` : "Unknown",
        profilePic: user?.profilePic || null,
      };
    });

    res.send({ status: "ok", data: enrichedRecords });
  } catch (error) {
    console.error("Error fetching attendance:", error);
    res.status(500).send({ status: "error", data: error.message });
  }
});

app.post("/update-profile-pic", async (req, res) => {
  const { token, profilePic } = req.body;

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const { employeeId, role } = decoded;

    const user = await User.findOne({ employeeId, role });
    if (!user)
      return res
        .status(404)
        .send({ status: "error", message: "User not found" });

    user.profilePic = profilePic;
    await user.save();

    return res.send({ status: "ok", message: "Profile picture updated" });
  } catch (error) {
    console.error("Error updating profile pic:", error);
    return res
      .status(500)
      .send({ status: "error", message: "Internal server error" });
  }
});

app.post("/monthly-stats", async (req, res) => {
  const { month, year, department } = req.body;

  try {
    const users = await mongoose
      .model("UserInfo")
      .find(
        department === "All" ? { role: "user" } : { department, role: "user" }
      );

    const employeeIds = users.map((u) => u.employeeId);

    const allRecords = await mongoose.model("Attendance").find({
      employeeId: { $in: employeeIds },
      date: {
        $regex: `^${year}-${String(
          new Date(`${month} 01, ${year}`).getMonth() + 1
        ).padStart(2, "0")}`,
      },
    });

    const statsMap = {};

    // Count present days per employee
    allRecords.forEach((record) => {
      if (!statsMap[record.employeeId]) {
        statsMap[record.employeeId] = {
          daysPresent: 0,
        };
      }
      if (record.status === "Present") {
        statsMap[record.employeeId].daysPresent += 1;
      }
    });

    const finalData = users.map((user) => ({
      id: user._id,
      employeeId: user.employeeId,
      name: `${user.firstName} ${user.lastName}`,
      profilePic: user.profilePic || null,
      daysPresent: statsMap[user.employeeId]?.daysPresent || 0,
    }));

    // Daily attendance chart
    const dayWiseAttendance = {};
    allRecords.forEach((record) => {
      const day = record.date.split("-")[2];
      if (!dayWiseAttendance[day]) dayWiseAttendance[day] = 0;
      if (record.status === "Present") dayWiseAttendance[day] += 1;
    });

    const sortedDays = Object.keys(dayWiseAttendance).sort(
      (a, b) => Number(a) - Number(b)
    );
    const chartLabels = sortedDays;
    const chartData = sortedDays.map((day) => dayWiseAttendance[day]);

    res.send({
      status: "ok",
      data: {
        employeeStats: finalData,
        chart: {
          labels: chartLabels,
          data: chartData,
        },
      },
    });
  } catch (error) {
    console.error("Monthly stats error:", error);
    res.status(500).send({ status: "error", message: error.message });
  }
});

// -------------------- GET ADMIN PROFILE DATA --------------------
app.post("/admindata", async (req, res) => {
  const { token } = req.body;
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const employeeId = decoded.employeeId;

    const admin = await User.findOne({ employeeId, role: "admin" });
    if (!admin)
      return res
        .status(404)
        .send({ status: "error", message: "Admin not found" });

    res.send({ status: "ok", data: admin });
  } catch (error) {
    res.status(500).send({ status: "error", message: error.message });
  }
});

// -------------------- GET ADMIN STATS --------------------
app.post("/get-admin-stats", async (req, res) => {
  const { adminId } = req.body;

  try {
    const managedEmployees = await User.countDocuments({
      role: "user",
      department: { $ne: null },
    });

    const now = new Date();
    const currentMonth = String(now.getMonth() + 1).padStart(2, "0");
    const currentYear = now.getFullYear();

    const attendanceThisMonth = await Attendance.find({
      date: { $regex: `^${currentYear}-${currentMonth}` },
      status: "Present",
    });

    const approvals = await User.countDocuments({ approvedBy: adminId });
    const declines = await DeclineLog.countDocuments({ declinedBy: adminId }); // ✅ Use log

    res.send({
      status: "ok",
      data: {
        managedEmployees,
        totalCheckInsMonth: attendanceThisMonth.length,
        approvalsHandled: approvals,
        declinesHandled: declines,
      },
    });
  } catch (error) {
    res.status(500).send({ status: "error", message: error.message });
  }
});

//pending requests
app.get("/pending-requests", async (req, res) => {
  try {
    const pendings = await User.find({ role: "user", approved: false });
    res.send({ status: "ok", data: pendings });
  } catch (err) {
    console.error(err);
    res.status(500).send({ status: "error", message: err.message });
  }
});

//nodemailer
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
  tls: { rejectUnauthorized: false },
});

app.post("/handle-request", async (req, res) => {
  const { employeeId, action, adminId } = req.body; // <-- include adminId

  try {
    const user = await User.findOne({ employeeId });
    if (!user)
      return res
        .status(404)
        .send({ status: "error", message: "User not found" });

    if (action === "approve") {
      user.approved = true;
      user.approvedBy = adminId; // 💾 Save admin ID who approved
      await user.save();
      await transporter.sendMail({
        from: '"Inzone" <inzoneaai@gmail.com>',
        to: user.email,
        subject: "Signup Approved",
        text: `Hi ${user.firstName},Greetings from InZone!
Welcome to AAI’s most trusted attendance portal. Thank you for joining us.

We are pleased to inform you that your signup request has been approved. You may now log in and begin using your account.

We sincerely hope you have a smooth, productive, and enjoyable experience with our app.

Warm regards,
Team InZone`,
      });
    } else {
      // 💾 Log the decline before deleting
      await DeclineLog.create({
        employeeId: user.employeeId,
        declinedBy: adminId,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      });

      await transporter.sendMail({
        from: '"Inzone" <inzoneaai@gmail.com>',
        to: user.email,
        subject: "Signup Declined",
        text: `Hi ${user.firstName}, we are sorry to inform you that your signup request was declined.`,
      });

      await User.deleteOne({ employeeId });
    }

    res.send({ status: "ok", message: `User ${action}d` });
  } catch (err) {
    res.status(500).send({ status: "error", message: err.message });
  }
});

//approved users
app.get("/approved-users", async (req, res) => {
  try {
    const users = await User.find({ role: "user", approved: true });
    res.send({ status: "ok", data: users });
  } catch (err) {
    res.status(500).send({ status: "error", message: err.message });
  }
});

app.post("/save-geofence", async (req, res) => {
  const { id, department, color, coordinates } = req.body;

  try {
    const existing = await Geofence.findOne({ id });

    if (existing) {
      await Geofence.updateOne({ id }, { department, color, coordinates });
    } else {
      await Geofence.create({ id, department, color, coordinates });
    }

    res.send({ status: "ok", message: "Geofence saved" });
  } catch (err) {
    res.status(500).send({ status: "error", message: err.message });
  }
});

// Fetch all geofences
app.get("/get-geofences", async (req, res) => {
  try {
    const all = await Geofence.find();
    res.send({ status: "ok", data: all });
  } catch (err) {
    res.status(500).send({ status: "error", message: err.message });
  }
});

// Delete geofence
app.post("/delete-geofence", async (req, res) => {
  try {
    await Geofence.deleteOne({ id: req.body.id });
    res.send({ status: "ok", message: "Deleted" });
  } catch (err) {
    res.status(500).send({ status: "error", message: err.message });
  }
});

// Get geofence by department
app.post("/get-dept-geofence", async (req, res) => {
  const { department } = req.body;

  try {
    const fence = await Geofence.findOne({ department });
    if (!fence)
      return res
        .status(404)
        .send({ status: "error", message: "No geofence for this department" });

    res.send({ status: "ok", data: fence });
  } catch (err) {
    res.status(500).send({ status: "error", message: err.message });
  }
});

app.delete("/delete-user/:employeeId", async (req, res) => {
  try {
    const { employeeId } = req.params;
    const deleted = await User.deleteOne({ employeeId });
    if (deleted.deletedCount === 0) {
      return res
        .status(404)
        .send({ status: "error", message: "User not found" });
    }
    res.send({ status: "ok", message: "User deleted successfully" });
  } catch (err) {
    res.status(500).send({ status: "error", message: err.message });
  }
});

// Add to your app.js
app.get("/departments-posts", async (req, res) => {
  try {
    const departments = ["HR", "IT", "Operations", "Data Analytics"];
    const posts = [
      "App Coordinator",
      "Manager",
      "Director",
      "Analyst",
      "Intern",
    ];

    // FIX: Send in correct structure (without nesting under `data`)
    res.send({
      status: "ok",
      departments,
      posts,
    });
  } catch (err) {
    res.status(500).send({ status: "error", message: err.message });
  }
});

app.post("/delete-user", async (req, res) => {
  const { employeeId } = req.body;
  try {
    await User.deleteOne({ employeeId });
    res.send({ status: "ok", message: "User deleted successfully" });
  } catch (err) {
    res.status(500).send({ status: "error", message: err.message });
  }
});

app.post("/update-employee", async (req, res) => {
  const { employeeId, department, post } = req.body;
  try {
    const user = await User.findOne({ employeeId });
    if (!user)
      return res
        .status(404)
        .send({ status: "error", message: "User not found" });

    user.department = department;
    user.post = post;
    await user.save();

    res.send({ status: "ok", message: "Employee updated" });
  } catch (err) {
    res.status(500).send({ status: "error", message: err.message });
  }
});

app.post("/update-attendance-time", async (req, res) => {
  try {
    const { employeeId, date, checkInTime, checkOutTime } = req.body;

    const Attendance = mongoose.model("Attendance");

    // Combine date and time to ensure accurate Date parsing
    const parseDateTime = (dateStr, timeStr) => {
      return new Date(`${dateStr} ${timeStr}`);
    };

    const checkInDate = parseDateTime(date, checkInTime);
    const checkOutDate = parseDateTime(date, checkOutTime);

    // If checkout is before checkin (e.g., past midnight)
    if (checkOutDate < checkInDate) {
      checkOutDate.setDate(checkOutDate.getDate() + 1);
    }

    const diffMs = checkOutDate.getTime() - checkInDate.getTime();
    const totalMinutes = Math.floor(diffMs / (1000 * 60));
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    const totalHours = `${hours} hrs ${minutes} mins`;
    const status = totalMinutes >= 300 ? "Present" : "Absent";

    const updatedDoc = await Attendance.findOneAndUpdate(
      { employeeId, date },
      {
        checkInTime,
        checkOutTime,
        totalHours,
        status,
      },
      { new: true }
    );

    res.json({
      status: "ok",
      message: "Attendance updated successfully",
      totalHours,
      status: updatedDoc.status,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: "error", message: "Internal server error" });
  }
});

// -------------------- START SERVER --------------------
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});

// 🕛 Run every day at 11:55 PM
cron.schedule("30 14 * * *", async () => {
  const today = new Date(); // Server time is already IST
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");
  const dateStr = `${yyyy}-${mm}-${dd}`;

  // Skip Sundays (0 = Sunday in JS)
  if (today.getDay() === 0) {
    console.log("⛔ Skipping absence marking on Sunday");
    return;
  }

  console.log("🕒 Running auto-absent cron at:", dateStr);

  try {
    const allUsers = await User.find({ role: "user", approved: true });

    for (const user of allUsers) {
      const existing = await Attendance.findOne({
        employeeId: user.employeeId,
        date: dateStr,
        status: "Present",
      });

      if (!existing) {
        await Attendance.updateOne(
          { employeeId: user.employeeId, date: dateStr },
          {
            $setOnInsert: {
              employeeId: user.employeeId,
              date: dateStr,
              status: "Absent",
            },
          },
          { upsert: true }
        );

        console.log(
          `🚫 Marked Absent: ${user.firstName} ${user.lastName} (${user.employeeId})`
        );
      }
    }
  } catch (err) {
    console.error("❌ Error during auto-absent cron:", err.message);
  }
});