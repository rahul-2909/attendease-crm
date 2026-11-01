const MODULES = [
  'dashboard',
  'employees',
  'departments',
  'projects',
  'attendance',
  'leave',
  'shifts',
  'reports',
  'salary',
  'settings',
  'permissions',
];

const MODULE_LABELS = {
  dashboard: 'Dashboard',
  employees: 'Employees',
  departments: 'Departments',
  projects: 'Projects',
  attendance: 'Attendance',
  leave: 'Leave',
  shifts: 'Shifts',
  reports: 'Reports',
  salary: 'Salary',
  settings: 'Settings',
  permissions: 'Role Permissions',
};

const ACTIONS = ['view', 'create', 'update', 'delete'];

const emptyModulePermission = () => ({
  view: false,
  create: false,
  update: false,
  delete: false,
});

const buildMatrix = (overrides = {}) => {
  const matrix = {};
  MODULES.forEach((moduleName) => {
    matrix[moduleName] = {
      ...emptyModulePermission(),
      ...(overrides[moduleName] || {}),
    };
  });
  return matrix;
};

const allTrue = () =>
  MODULES.reduce((matrix, moduleName) => {
    matrix[moduleName] = {
      view: true,
      create: true,
      update: true,
      delete: true,
    };
    return matrix;
  }, {});

const WITH_CREATE = { view: true, create: true, update: true };
const VIEW_AND_UPDATE = { view: true, update: true };
const VIEW_ONLY = { view: true };
const FULL = { view: true, create: true, update: true, delete: true };

const DEFAULT_MODULE_PERMISSIONS = {
  SUPER_ADMIN: allTrue(),
  COMPANY_OWNER: buildMatrix({
    dashboard: VIEW_ONLY,
    employees: FULL,
    departments: FULL,
    projects: FULL,
    attendance: { view: true, create: true, update: true },
    leave: FULL,
    shifts: FULL,
    reports: VIEW_ONLY,
    salary: VIEW_AND_UPDATE,
    settings: VIEW_AND_UPDATE,
    permissions: VIEW_AND_UPDATE,
  }),
  HR_ADMIN: buildMatrix({
    dashboard: VIEW_ONLY,
    employees: { view: true, create: true, update: true },
    departments: { view: true, create: true, update: true },
    projects: FULL,
    attendance: { view: true, create: true, update: true },
    leave: FULL,
    shifts: { view: true, create: true, update: true },
    reports: VIEW_ONLY,
    settings: VIEW_AND_UPDATE,
  }),
  MANAGER: buildMatrix({
    dashboard: VIEW_ONLY,
    employees: VIEW_ONLY,
    projects: { view: true, create: true, update: true },
    attendance: VIEW_ONLY,
    leave: { view: true, create: true, update: true },
    reports: VIEW_ONLY,
  }),
  EMPLOYEE: buildMatrix({
    dashboard: VIEW_ONLY,
    projects: VIEW_ONLY,
    attendance: { view: true, create: true },
    leave: { view: true, create: true },
  }),
};

const clone = (value) => JSON.parse(JSON.stringify(value));

const defaultsForRole = (role) =>
  clone(DEFAULT_MODULE_PERMISSIONS[role] || buildMatrix());

const normalizeMatrix = (role, stored = {}) => {
  const defaults = defaultsForRole(role);
  return MODULES.reduce((matrix, moduleName) => {
    const current = stored[moduleName] || {};
    const permission = {
      ...defaults[moduleName],
      view: typeof current.view === 'boolean' ? current.view : defaults[moduleName].view,
      create:
        typeof current.create === 'boolean'
          ? current.create
          : defaults[moduleName].create,
      update:
        typeof current.update === 'boolean'
          ? current.update
          : defaults[moduleName].update,
      delete:
        typeof current.delete === 'boolean'
          ? current.delete
          : defaults[moduleName].delete,
    };

    if (!permission.view) {
      permission.create = false;
      permission.update = false;
      permission.delete = false;
    }

    if (permission.create || permission.update || permission.delete) {
      permission.view = true;
    }

    matrix[moduleName] = permission;
    return matrix;
  }, {});
};

const can = (matrix, moduleName, action = 'view') => {
  const permission = matrix?.[moduleName];
  if (!permission) return false;
  if (action === 'view') return Boolean(permission.view);
  return Boolean(permission.view && permission[action]);
};

module.exports = {
  MODULES,
  MODULE_LABELS,
  ACTIONS,
  DEFAULT_MODULE_PERMISSIONS,
  buildMatrix,
  allTrue,
  defaultsForRole,
  normalizeMatrix,
  can,
};
