const mongoose = require('mongoose');
const env = require('./config/env');
const Organization = require('./models/Organization');
const User = require('./models/User');
const Department = require('./models/Department');
const Employee = require('./models/Employee');
const Project = require('./models/Project');
const Shift = require('./models/Shift');
const Location = require('./models/Location');
const Settings = require('./models/Settings');
const Attendance = require('./models/Attendance');
const LeaveRequest = require('./models/LeaveRequest');
const RolePermission = require('./models/RolePermission');
const { hashPassword } = require('./utils/password');
const {
  COMPANY_OWNER,
  SUPER_ADMIN,
  HR_ADMIN,
  MANAGER,
  EMPLOYEE,
  ROLE_VALUES,
} = require('./constants/roles');
const { defaultsForRole } = require('./constants/modules');
const { ATTENDANCE_STATUS } = require('./constants/attendanceStatus');
const { LEAVE_STATUS } = require('./constants/leaveStatus');

const SEED_USERS = [
  {
    name: process.env.SEED_OWNER_NAME || 'Rahul Sharma',
    email: (process.env.SEED_OWNER_EMAIL || 'owner@shiftly.com').toLowerCase(),
    phone: process.env.SEED_OWNER_PHONE || '9000000001',
    password: process.env.SEED_OWNER_PASSWORD || 'Owner@12345',
    role: COMPANY_OWNER,
  },
  {
    name: process.env.SEED_DEVELOPER_NAME || 'Developer',
    email: (process.env.SEED_DEVELOPER_EMAIL || 'developer@shiftly.com').toLowerCase(),
    phone: process.env.SEED_DEVELOPER_PHONE || '9000000002',
    password: process.env.SEED_DEVELOPER_PASSWORD || 'Developer@12345',
    role: SUPER_ADMIN,
  },
  {
    name: 'Priya Nair',
    email: 'hr@shiftly.com',
    phone: '9000000003',
    password: 'Hr@123456',
    role: HR_ADMIN,
  },
  {
    name: 'Arjun Mehta',
    email: 'manager@shiftly.com',
    phone: '9000000004',
    password: 'Manager@12345',
    role: MANAGER,
  },
  {
    name: 'Sneha Kapoor',
    email: 'employee@shiftly.com',
    phone: '9000000005',
    password: 'Employee@12345',
    role: EMPLOYEE,
  },
];

const DEPARTMENTS = [
  { name: 'Engineering', manager: 'Arjun Mehta' },
  { name: 'Design', manager: 'Ishita Rao' },
  { name: 'Marketing', manager: 'Karan Malhotra' },
  { name: 'Sales', manager: 'Neha Gupta' },
  { name: 'Human Resources', manager: 'Priya Nair' },
  { name: 'Finance', manager: 'Vikram Singh' },
];

const SHIFTS = [
  { name: 'General shift', startTime: '09:00', endTime: '18:00', graceMinutes: 10, breakMinutes: 60 },
  { name: 'Morning shift', startTime: '06:00', endTime: '14:00', graceMinutes: 5, breakMinutes: 45 },
  { name: 'Night shift', startTime: '22:00', endTime: '06:00', graceMinutes: 15, breakMinutes: 60 },
];

const LOCATIONS = [
  {
    name: 'Head office',
    address: '12 MG Road, Bengaluru, Karnataka 560001',
    latitude: 12.9756,
    longitude: 77.6051,
    radius: 150,
  },
  {
    name: 'Mumbai branch',
    address: '88 Bandra Kurla Complex, Mumbai 400051',
    latitude: 19.067,
    longitude: 72.868,
    radius: 120,
  },
];

const PROJECTS = [
  {
    name: 'Website Revamp',
    code: 'PRJ-01',
    client: 'Bright Tech',
    manager: 'Arjun Mehta',
    status: 'ACTIVE',
    progress: 68,
    startDate: '2026-07-01',
    endDate: '2026-12-15',
    description: 'Redesign the marketing site with a new design system.',
    teamEmails: ['manager@shiftly.com', 'employee@shiftly.com', 'ishita@shiftly.com', 'karan@shiftly.com'],
  },
  {
    name: 'Mobile App v2',
    code: 'PRJ-02',
    client: 'Northwind Labs',
    manager: 'Arjun Mehta',
    status: 'ACTIVE',
    progress: 42,
    startDate: '2026-08-10',
    endDate: '2027-02-28',
    description: 'Ship the second generation iOS and Android app.',
    teamEmails: ['manager@shiftly.com', 'rohan@shiftly.com', 'sneha@shiftly.com'],
  },
  {
    name: 'Payroll Automation',
    code: 'PRJ-03',
    client: 'Internal',
    manager: 'Priya Nair',
    status: 'PLANNED',
    progress: 12,
    startDate: '2026-11-01',
    endDate: '2027-03-31',
    description: 'Automate monthly payroll processing and approvals.',
    teamEmails: ['hr@shiftly.com', 'vikram@shiftly.com'],
  },
  {
    name: 'Q4 Growth Campaign',
    code: 'PRJ-04',
    client: 'Bright Tech',
    manager: 'Karan Malhotra',
    status: 'ON_HOLD',
    progress: 35,
    startDate: '2026-09-15',
    endDate: '2026-12-31',
    description: 'Multi-channel campaign for the fourth quarter.',
    teamEmails: ['karan@shiftly.com', 'ishita@shiftly.com'],
  },
  {
    name: 'CRM Migration',
    code: 'PRJ-05',
    client: 'Acme Corp',
    manager: 'Neha Gupta',
    status: 'COMPLETED',
    progress: 100,
    startDate: '2026-03-01',
    endDate: '2026-09-30',
    description: 'Migrate sales pipeline data to the new CRM.',
    teamEmails: ['neha@shiftly.com', 'sneha@shiftly.com'],
  },
];

const EMPLOYEES = [
  {
    name: 'Rahul Sharma',
    email: 'owner@shiftly.com',
    userEmail: 'owner@shiftly.com',
    employeeCode: 'EMP001',
    role: 'Founder & CEO',
    designation: 'Founder & CEO',
    department: 'Engineering',
    phone: '9000000001',
    salary: 240000,
    joiningDate: '2023-01-15',
    shift: 'General shift',
    color: 'violet',
    initials: 'RS',
  },
  {
    name: 'Priya Nair',
    email: 'hr@shiftly.com',
    userEmail: 'hr@shiftly.com',
    employeeCode: 'EMP002',
    role: 'HR Manager',
    designation: 'Head of People',
    department: 'Human Resources',
    phone: '9000000003',
    salary: 95000,
    joiningDate: '2023-03-06',
    shift: 'General shift',
    color: 'green',
    initials: 'PN',
  },
  {
    name: 'Arjun Mehta',
    email: 'manager@shiftly.com',
    userEmail: 'manager@shiftly.com',
    employeeCode: 'EMP003',
    role: 'Engineering Manager',
    designation: 'Engineering Manager',
    department: 'Engineering',
    phone: '9000000004',
    salary: 160000,
    joiningDate: '2023-02-01',
    shift: 'General shift',
    color: 'blue',
    initials: 'AM',
  },
  {
    name: 'Sneha Kapoor',
    email: 'employee@shiftly.com',
    userEmail: 'employee@shiftly.com',
    employeeCode: 'EMP004',
    role: 'Frontend Developer',
    designation: 'Frontend Developer',
    department: 'Engineering',
    phone: '9000000005',
    salary: 78000,
    joiningDate: '2024-06-17',
    shift: 'General shift',
    color: 'orange',
    initials: 'SK',
  },
  {
    name: 'Rohan Verma',
    email: 'rohan@shiftly.com',
    employeeCode: 'EMP005',
    role: 'Backend Developer',
    designation: 'Senior Backend Developer',
    department: 'Engineering',
    phone: '9000000006',
    salary: 105000,
    joiningDate: '2023-08-21',
    shift: 'General shift',
    color: 'blue',
    initials: 'RV',
  },
  {
    name: 'Ishita Rao',
    email: 'ishita@shiftly.com',
    employeeCode: 'EMP006',
    role: 'Product Designer',
    designation: 'Design Lead',
    department: 'Design',
    phone: '9000000007',
    salary: 92000,
    joiningDate: '2024-01-09',
    shift: 'General shift',
    color: 'violet',
    initials: 'IR',
  },
  {
    name: 'Karan Malhotra',
    email: 'karan@shiftly.com',
    employeeCode: 'EMP007',
    role: 'Marketing Manager',
    designation: 'Marketing Manager',
    department: 'Marketing',
    phone: '9000000008',
    salary: 88000,
    joiningDate: '2024-03-18',
    shift: 'General shift',
    color: 'orange',
    initials: 'KM',
  },
  {
    name: 'Neha Gupta',
    email: 'neha@shiftly.com',
    employeeCode: 'EMP008',
    role: 'Sales Manager',
    designation: 'Sales Manager',
    department: 'Sales',
    phone: '9000000009',
    salary: 90000,
    joiningDate: '2024-04-01',
    shift: 'General shift',
    color: 'green',
    initials: 'NG',
  },
  {
    name: 'Vikram Singh',
    email: 'vikram@shiftly.com',
    employeeCode: 'EMP009',
    role: 'Accountant',
    designation: 'Finance Lead',
    department: 'Finance',
    phone: '9000000010',
    salary: 85000,
    joiningDate: '2024-02-12',
    shift: 'General shift',
    color: 'blue',
    initials: 'VS',
  },
  {
    name: 'Ananya Iyer',
    email: 'ananya@shiftly.com',
    employeeCode: 'EMP010',
    role: 'QA Engineer',
    designation: 'QA Engineer',
    department: 'Engineering',
    phone: '9000000011',
    salary: 62000,
    joiningDate: '2025-01-06',
    shift: 'Morning shift',
    color: 'violet',
    initials: 'AI',
  },
  {
    name: 'Dev Patel',
    email: 'dev@shiftly.com',
    employeeCode: 'EMP011',
    role: 'Sales Executive',
    designation: 'Sales Executive',
    department: 'Sales',
    phone: '9000000012',
    salary: 52000,
    joiningDate: '2025-02-17',
    shift: 'General shift',
    color: 'orange',
    initials: 'DP',
  },
  {
    name: 'Meera Joshi',
    email: 'meera@shiftly.com',
    employeeCode: 'EMP012',
    role: 'Content Strategist',
    designation: 'Content Strategist',
    department: 'Marketing',
    phone: '9000000013',
    salary: 58000,
    joiningDate: '2025-04-14',
    shift: 'General shift',
    color: 'green',
    initials: 'MJ',
  },
  {
    name: 'Aditya Kulkarni',
    email: 'aditya@shiftly.com',
    employeeCode: 'EMP013',
    role: 'DevOps Engineer',
    designation: 'DevOps Engineer',
    department: 'Engineering',
    phone: '9000000014',
    salary: 96000,
    joiningDate: '2024-10-07',
    shift: 'Night shift',
    color: 'blue',
    initials: 'AK',
  },
  {
    name: 'Tara Menon',
    email: 'tara@shiftly.com',
    employeeCode: 'EMP014',
    role: 'UI Designer',
    designation: 'UI Designer',
    department: 'Design',
    phone: '9000000015',
    salary: 64000,
    joiningDate: '2025-06-02',
    shift: 'General shift',
    color: 'violet',
    initials: 'TM',
  },
];

const startOfDay = (date = new Date()) => {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
};

const addDays = (date, days) => {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + days);
  return copy;
};

const atTime = (date, hours, minutes = 0) => {
  const copy = new Date(date);
  copy.setHours(hours, minutes, 0, 0);
  return copy;
};

const seedOrganization = async () => {
  const name = process.env.SEED_ORG_NAME || 'Shiftly Demo';
  const slug = (process.env.SEED_ORG_SLUG || 'shiftly-demo').toLowerCase();

  return Organization.findOneAndUpdate(
    { slug },
    { $set: { name, slug, isActive: true } },
    { upsert: true, new: true, setDefaultsOnInsert: true, runValidators: true }
  );
};

const seedUser = async (seedData, organizationId) => {
  const hashedPassword = await hashPassword(seedData.password);

  return User.findOneAndUpdate(
    { email: seedData.email },
    {
      $set: {
        name: seedData.name,
        email: seedData.email,
        phone: seedData.phone,
        password: hashedPassword,
        role: seedData.role,
        isActive: true,
        organizationId,
      },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true, runValidators: true }
  );
};

const seedDepartments = async (organizationId) => {
  const departments = {};
  for (const department of DEPARTMENTS) {
    const document = await Department.findOneAndUpdate(
      { organizationId, name: department.name },
      { $set: { ...department, organizationId } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    departments[department.name] = document;
  }
  return departments;
};

const seedShifts = async (organizationId) => {
  const shifts = {};
  for (const shift of SHIFTS) {
    const document = await Shift.findOneAndUpdate(
      { organizationId, name: shift.name },
      { $set: { ...shift, organizationId, isActive: true } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    shifts[shift.name] = document;
  }
  return shifts;
};

const seedLocations = async (organizationId) => {
  for (const location of LOCATIONS) {
    await Location.findOneAndUpdate(
      { organizationId, name: location.name },
      { $set: { ...location, organizationId, isActive: true } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  }
};

const seedSettings = async (organization) => {
  const settings = await Settings.findOneAndUpdate(
    { organizationId: organization._id },
    {
      $set: {
        organizationId: organization._id,
        companyName: organization.name,
        companyEmail: 'hello@shiftly.com',
        companyPhone: '+91 80 4123 8890',
        companyAddress: '12 MG Road, Bengaluru, Karnataka 560001',
        graceMinutes: 10,
        gpsEnabled: true,
        qrEnabled: true,
        manualEnabled: true,
        lateAlertsEnabled: true,
        leaveEnabled: true,
        checkoutReminderEnabled: true,
        plan: 'Business',
        employeeLimit: 100,
        renewalDate: new Date('2026-11-29'),
      },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  return settings;
};

const seedEmployees = async (organizationId, departments, shifts, usersByEmail) => {
  const employeesByEmail = {};

  for (const employee of EMPLOYEES) {
    const department = departments[employee.department];
    const shift = shifts[employee.shift];
    const user = usersByEmail[employee.userEmail];

    const document = await Employee.findOneAndUpdate(
      { organizationId, employeeCode: employee.employeeCode },
      {
        $set: {
          organizationId,
          employeeCode: employee.employeeCode,
          name: employee.name,
          role: employee.role,
          email: employee.email,
          phone: employee.phone,
          designation: employee.designation,
          salary: employee.salary,
          joiningDate: new Date(employee.joiningDate),
          departmentId: department?._id,
          shiftId: shift?._id,
          initials: employee.initials,
          color: employee.color,
          isActive: true,
          ...(user ? { userId: user._id } : {}),
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true, runValidators: true }
    );

    employeesByEmail[employee.email] = document;
  }

  const manager = employeesByEmail['manager@shiftly.com'];
  const owner = employeesByEmail['owner@shiftly.com'];

  if (manager && owner) {
    await Employee.updateOne({ _id: manager._id }, { $set: { managerId: owner._id } });
  }

  if (manager) {
    await Employee.updateMany(
      {
        organizationId,
        email: {
          $in: [
            'employee@shiftly.com',
            'rohan@shiftly.com',
            'ishita@shiftly.com',
            'ananya@shiftly.com',
            'aditya@shiftly.com',
          ],
        },
      },
      { $set: { managerId: manager._id } }
    );
  }

  return employeesByEmail;
};

const seedProjects = async (organizationId, employeesByEmail) => {
  for (const project of PROJECTS) {
    const team = project.teamEmails
      .map((email) => employeesByEmail[email])
      .filter(Boolean)
      .map((employee) => employee._id);

    const { teamEmails, ...fields } = project;

    await Project.findOneAndUpdate(
      { organizationId, code: fields.code },
      {
        $set: {
          ...fields,
          team,
          organizationId,
          startDate: new Date(fields.startDate),
          endDate: new Date(fields.endDate),
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true, runValidators: true }
    );
  }

  const projectByCode = {};
  const projects = await Project.find({ organizationId }).lean();
  projects.forEach((project) => {
    projectByCode[project.code] = project;
  });

  const assignments = {
    'manager@shiftly.com': 'PRJ-02',
    'employee@shiftly.com': 'PRJ-01',
    'rohan@shiftly.com': 'PRJ-02',
    'ishita@shiftly.com': 'PRJ-01',
    'karan@shiftly.com': 'PRJ-04',
    'neha@shiftly.com': 'PRJ-05',
    'vikram@shiftly.com': 'PRJ-03',
    'ananya@shiftly.com': 'PRJ-01',
    'dev@shiftly.com': 'PRJ-05',
    'meera@shiftly.com': 'PRJ-04',
    'aditya@shiftly.com': 'PRJ-02',
    'tara@shiftly.com': 'PRJ-01',
    'hr@shiftly.com': 'PRJ-03',
  };

  for (const [email, code] of Object.entries(assignments)) {
    const employee = employeesByEmail[email];
    const project = projectByCode[code];
    if (employee && project) {
      await Employee.updateOne(
        { _id: employee._id },
        { $set: { projectId: project._id } }
      );
    }
  }
};

const seedAttendance = async (organizationId, employeesByEmail) => {
  const employees = Object.values(employeesByEmail);
  const today = startOfDay();

  for (let dayOffset = 0; dayOffset < 5; dayOffset += 1) {
    const date = addDays(today, -dayOffset);
    const weekday = date.getDay();
    if (weekday === 0 || weekday === 6) continue;

    for (let index = 0; index < employees.length; index += 1) {
      const employee = employees[index];
      let status = ATTENDANCE_STATUS.PRESENT;
      if ((index + dayOffset) % 9 === 4) status = ATTENDANCE_STATUS.ON_LEAVE;
      else if ((index + dayOffset) % 11 === 5) status = ATTENDANCE_STATUS.ABSENT;
      else if ((index + dayOffset) % 7 === 2) status = ATTENDANCE_STATUS.LATE;

      const checkIn =
        status === ATTENDANCE_STATUS.ABSENT || status === ATTENDANCE_STATUS.ON_LEAVE
          ? null
          : atTime(date, status === ATTENDANCE_STATUS.LATE ? 9 : 8, status === ATTENDANCE_STATUS.LATE ? 38 : 52);
      const checkOut =
        status === ATTENDANCE_STATUS.ABSENT || status === ATTENDANCE_STATUS.ON_LEAVE
          ? null
          : atTime(date, 18, 5);

      await Attendance.findOneAndUpdate(
        { employeeId: employee._id, date },
        {
          $set: {
            employeeId: employee._id,
            organizationId,
            date,
            status,
            checkIn,
            checkOut,
            notes: status === ATTENDANCE_STATUS.ON_LEAVE ? 'Approved leave' : '',
          },
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
    }
  }
};

const seedLeave = async (organizationId, employeesByEmail, reviewer) => {
  const today = startOfDay();
  const leaves = [
    {
      email: 'employee@shiftly.com',
      type: 'ANNUAL',
      startDate: addDays(today, 6),
      endDate: addDays(today, 8),
      reason: 'Family vacation to Goa.',
      status: LEAVE_STATUS.PENDING,
    },
    {
      email: 'rohan@shiftly.com',
      type: 'SICK',
      startDate: addDays(today, -2),
      endDate: addDays(today, -1),
      reason: 'Fever and rest advised by doctor.',
      status: LEAVE_STATUS.APPROVED,
    },
    {
      email: 'ishita@shiftly.com',
      type: 'CASUAL',
      startDate: addDays(today, 2),
      endDate: addDays(today, 2),
      reason: 'Personal errand.',
      status: LEAVE_STATUS.APPROVED,
    },
    {
      email: 'karan@shiftly.com',
      type: 'ANNUAL',
      startDate: addDays(today, 14),
      endDate: addDays(today, 20),
      reason: 'Annual family trip.',
      status: LEAVE_STATUS.PENDING,
    },
    {
      email: 'dev@shiftly.com',
      type: 'UNPAID',
      startDate: addDays(today, -10),
      endDate: addDays(today, -9),
      reason: 'Extended personal break.',
      status: LEAVE_STATUS.REJECTED,
    },
    {
      email: 'meera@shiftly.com',
      type: 'CASUAL',
      startDate: addDays(today, 3),
      endDate: addDays(today, 3),
      reason: 'Apartment move.',
      status: LEAVE_STATUS.CANCELLED,
    },
  ];

  for (const leave of leaves) {
    const employee = employeesByEmail[leave.email];
    if (!employee) continue;

    await LeaveRequest.findOneAndUpdate(
      {
        employeeId: employee._id,
        type: leave.type,
        startDate: leave.startDate,
      },
      {
        $set: {
          employeeId: employee._id,
          organizationId,
          type: leave.type,
          startDate: leave.startDate,
          endDate: leave.endDate,
          reason: leave.reason,
          status: leave.status,
          ...(leave.status !== LEAVE_STATUS.PENDING && reviewer
            ? { reviewedBy: reviewer._id, reviewedAt: new Date() }
            : {}),
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true, runValidators: true }
    );
  }
};

const seedRolePermissions = async (organizationId) => {
  for (const role of ROLE_VALUES) {
    await RolePermission.findOneAndUpdate(
      { organizationId, role },
      { $set: { modules: defaultsForRole(role) } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  }
};

const seed = async () => {
  try {
    await mongoose.connect(env.MONGODB_URI);
    console.log(`MongoDB Connected: ${mongoose.connection.host}`);

    const organization = await seedOrganization();
    console.log(`Organization ready: ${organization.name} (${organization._id})`);

    const usersByEmail = {};
    for (const seedData of SEED_USERS) {
      const user = await seedUser(seedData, organization._id);
      usersByEmail[user.email] = user;
      console.log(`Seeded ${user.role}: ${user.email} / ${seedData.password}`);
    }

    const departments = await seedDepartments(organization._id);
    const shifts = await seedShifts(organization._id);
    await seedLocations(organization._id);
    await seedSettings(organization);

    const employeesByEmail = await seedEmployees(
      organization._id,
      departments,
      shifts,
      usersByEmail
    );
    await seedProjects(organization._id, employeesByEmail);
    await seedAttendance(organization._id, employeesByEmail);
    await seedLeave(
      organization._id,
      employeesByEmail,
      usersByEmail['owner@shiftly.com']
    );
    await seedRolePermissions(organization._id);

    console.log(
      `Seeded ${Object.keys(departments).length} departments, ${Object.keys(shifts).length} shifts, ` +
        `${Object.keys(employeesByEmail).length} employees, ${PROJECTS.length} projects`
    );
    console.log('Seed completed successfully');
    console.log('Demo logins:');
    SEED_USERS.forEach((user) => {
      console.log(`  ${user.role.padEnd(14)} ${user.email} / ${user.password}`);
    });
  } catch (error) {
    console.error(`Seed failed: ${error.stack || error.message}`);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

seed();
