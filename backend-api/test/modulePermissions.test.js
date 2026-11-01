const test = require('node:test');
const assert = require('node:assert/strict');
const {
  MODULES,
  defaultsForRole,
  normalizeMatrix,
  can,
} = require('../src/constants/modules');

const permission = (...enabled) =>
  Object.fromEntries(
    ['view', 'create', 'update', 'delete'].map((action) => [
      action,
      enabled.includes(action),
    ])
  );

const expected = {
  COMPANY_OWNER: {
    dashboard: ['view'],
    employees: ['view', 'create', 'update', 'delete'],
    departments: ['view', 'create', 'update', 'delete'],
    projects: ['view', 'create', 'update', 'delete'],
    attendance: ['view', 'create', 'update'],
    leave: ['view', 'create', 'update', 'delete'],
    shifts: ['view', 'create', 'update', 'delete'],
    reports: ['view'],
    salary: ['view', 'update'],
    settings: ['view', 'update'],
    permissions: ['view', 'update'],
  },
  HR_ADMIN: {
    dashboard: ['view'],
    employees: ['view', 'create', 'update'],
    departments: ['view', 'create', 'update'],
    projects: ['view', 'create', 'update', 'delete'],
    attendance: ['view', 'create', 'update'],
    leave: ['view', 'create', 'update', 'delete'],
    shifts: ['view', 'create', 'update'],
    reports: ['view'],
    settings: ['view', 'update'],
  },
  MANAGER: {
    dashboard: ['view'],
    employees: ['view'],
    projects: ['view', 'create', 'update'],
    attendance: ['view'],
    leave: ['view', 'create', 'update'],
    reports: ['view'],
  },
  EMPLOYEE: {
    dashboard: ['view'],
    projects: ['view'],
    attendance: ['view', 'create'],
    leave: ['view', 'create'],
  },
};

test('default role matrices match the documented module permissions', () => {
  for (const [role, modules] of Object.entries(expected)) {
    const matrix = defaultsForRole(role);
    const expectedMatrix = Object.fromEntries(
      MODULES.map((moduleName) => [
        moduleName,
        permission(...(modules[moduleName] || [])),
      ])
    );

    assert.deepEqual(matrix, expectedMatrix, `${role} defaults`);
  }
});

test('normalization disables actions when view is disabled and enables view for actions', () => {
  const normalized = normalizeMatrix('EMPLOYEE', {
    attendance: { view: false, create: true, update: true, delete: true },
    leave: { view: true, create: false, update: true },
  });

  assert.deepEqual(normalized.attendance, permission());
  assert.deepEqual(normalized.leave, permission('view', 'update'));
});

test('module checks deny missing modules and actions without view access', () => {
  assert.equal(can({}, 'employees'), false);
  assert.equal(can({ employees: permission('create') }, 'employees', 'create'), false);
  assert.equal(can({ employees: permission('view') }, 'employees', 'delete'), false);
  assert.equal(can({ employees: permission('view', 'create') }, 'employees', 'create'), true);
});
