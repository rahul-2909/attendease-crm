const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema(
  {
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      unique: true,
      index: true,
    },
    companyName: {
      type: String,
      trim: true,
    },
    companyEmail: {
      type: String,
      lowercase: true,
      trim: true,
    },
    companyPhone: {
      type: String,
      trim: true,
    },
    companyAddress: {
      type: String,
      trim: true,
    },
    graceMinutes: {
      type: Number,
      default: 10,
      min: 0,
    },
    gpsEnabled: {
      type: Boolean,
      default: true,
    },
    qrEnabled: {
      type: Boolean,
      default: true,
    },
    manualEnabled: {
      type: Boolean,
      default: true,
    },
    lateAlertsEnabled: {
      type: Boolean,
      default: true,
    },
    leaveEnabled: {
      type: Boolean,
      default: true,
    },
    checkoutReminderEnabled: {
      type: Boolean,
      default: true,
    },
    plan: {
      type: String,
      default: 'Business',
    },
    employeeLimit: {
      type: Number,
      default: 100,
    },
    renewalDate: {
      type: Date,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Settings', settingsSchema);
