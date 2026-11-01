const mongoose = require('mongoose');
const { ROLE_VALUES } = require('../constants/roles');

const rolePermissionSchema = new mongoose.Schema(
  {
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },
    role: {
      type: String,
      enum: ROLE_VALUES,
      required: true,
    },
    modules: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true }
);

rolePermissionSchema.index({ organizationId: 1, role: 1 }, { unique: true });

module.exports = mongoose.model('RolePermission', rolePermissionSchema);
