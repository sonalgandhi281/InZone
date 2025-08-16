const mongoose = require('mongoose');

const DeclineLogSchema = new mongoose.Schema({
  employeeId: { type: Number, required: true },
  declinedBy: { type: String, required: true },
  email: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  declinedAt: { type: Date, default: Date.now },
}, {
  collection: 'DeclineLogs'
});

module.exports = mongoose.model('DeclineLog', DeclineLogSchema);