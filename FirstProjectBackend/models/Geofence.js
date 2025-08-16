const mongoose = require("mongoose");

const GeofenceSchema = new mongoose.Schema({
  id: String,
  department: String,
  color: String,
  coordinates: [{ latitude: Number, longitude: Number }],
});

module.exports = mongoose.model("Geofence", GeofenceSchema);