const mongoose = require ("mongoose");

const UserDetailSchema = new mongoose.Schema({
  profilePic: {
  type: String, // This will store a URL (base64 string or cloud URL)
  default: '',
},

    employeeId : {type :Number, unique : true ,required : true},
    firstName : {type :String,required : true},
    lastName : {type :String,required : true},
    department : {type : String, required : true },
    post: {
  type: String,
  enum: ['App Coordinator','Manager', 'Director', 'Analyst', 'Intern'],
  default: 'Analyst', // Optional default
},

    approved: { type: Boolean, default: false },
requestedAt: { type: Date, default: Date.now },
approvedBy: { type: String, default: null },
// declinedBy: { type: String, default: null },
declinedBy: String,
declined: { type: Boolean, default: false },



    role: {
  type: String,
  enum: ['user', 'admin'],
  default: 'user',
  required: true,
},
    email :{type : String , unique:true , required : true , lowercase: true,trim: true,match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/,'Please enter a valid email address',],},
    contact: {type: String,required: true, match: [/^\d{10}$/, 'Contact number must be exactly 10 digits']},
    password: {
    type: String,
    required: true,
    minlength: [8, 'Password must be at least 8 characters'],
    // match: [
    //   /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/,
    //   'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
    // ],
  },
},{
    collection :"UserInfo"
});

UserDetailSchema.pre('save', function (next) {
  this.confirmPassword = undefined;
  next();
});

mongoose.model("UserInfo" , UserDetailSchema)