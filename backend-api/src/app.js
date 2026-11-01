const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const env = require('./config/env');
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const attendanceRoutes = require('./routes/attendance.routes');
const organizationRoutes = require('./routes/organization.routes');
const departmentRoutes = require('./routes/department.routes');
const employeeRoutes = require('./routes/employee.routes');
const leaveRoutes = require('./routes/leave.routes');
const reportRoutes = require('./routes/report.routes');
const projectRoutes = require('./routes/project.routes');
const shiftRoutes = require('./routes/shift.routes');
const locationRoutes = require('./routes/location.routes');
const settingsRoutes = require('./routes/settings.routes');
const salaryRoutes = require('./routes/salary.routes');
const rolePermissionRoutes = require('./routes/rolePermission.routes');
const { errorHandler, notFound } = require('./middlewares/error.middleware');

const app = express();

app.use(helmet());
app.use(cors({ origin: '*' }));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/attendance', attendanceRoutes);
app.use('/organizations', organizationRoutes);
app.use('/departments', departmentRoutes);
app.use('/employees', employeeRoutes);
app.use('/leave', leaveRoutes);
app.use('/reports', reportRoutes);
app.use('/projects', projectRoutes);
app.use('/shifts', shiftRoutes);
app.use('/locations', locationRoutes);
app.use('/settings', settingsRoutes);
app.use('/salary', salaryRoutes);
app.use('/permissions', rolePermissionRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
