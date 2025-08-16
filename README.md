# 📍 Geofence-Based Attendance App (For AAI Employees)

This mobile application is designed specifically for the employees of the *Airports Authority of India (AAI)* to simplify and secure attendance tracking through real-time geofence-based check-in and check-out. The system ensures attendance is recorded only when employees are physically present within their assigned office region.

---

## 🚀 Overview

Built using *React Native* and a *MERN (MongoDB, Express, React Native, Node.js)* stack, the app provides role-based functionality for both *AAI employees* and *administrators*. It supports real-time location validation, attendance analytics, and administrative controls for profile and access management.

---

## 🔑 Key Features

### 👨‍💼 For AAI Employees
- 📍 Location-verified check-in/out using geofencing
- 📅 View monthly personal attendance history
- 🧑‍💼 Upload and update profile picture
- 🔒 Secure login (only after admin approval)

### 🛡 For AAI Admins
- 🧭 Create, update, and delete geofence regions by department
- 👥 Approve/decline employee sign-up requests in real time
- 📊 View and analyze attendance data (daily/monthly stats and charts)
- 🔍 Filter records by date, department, and role
- 🗂 Manage employee profiles with edit/delete access

---

## ⚙ Tech Stack

### 📱 Frontend (React Native)
- React Navigation
- React Native Maps
- Axios
- Lottie Animations
- React Native Chart Kit
- Custom Animated UI with Montserrat Fonts
- Element Dropdown / Dropdown Picker

### 🌐 Backend (MERN Stack)
- Node.js + Express.js
- MongoDB + Mongoose
- Nodemailer for email notifications
- REST APIs for attendance, profile, and approval flows

- ## 🔒 Authentication & Authorization
- Role-based access (admin/user)
- Only approved users can log in
- Admins can manage access rights
