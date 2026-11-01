const mongoose = require('mongoose');

const shiftSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    startTime: {
      type: String,
      default: '09:00',
      trim: true,
    },
    endTime: {
      type: String,
      default: '18:00',
      trim: true,
    },
    graceMinutes: {
      type: Number,
      default: 10,
      min: 0,
    },
    breakMinutes: {
      type: Number,
      default: 60,
      min: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      index: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Shift', shiftSchema);
