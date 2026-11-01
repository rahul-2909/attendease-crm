import test from 'node:test'
import assert from 'node:assert/strict'
import { PERMISSIONS } from '../src/constants/permissions.js'
import {
  BOTTOM_NAV_ITEMS,
  NAV_ITEMS,
  can,
  visibleBottomNav,
  visibleNav,
} from '../src/utils/permissions.js'

test('module access is denied when the user has no permission matrix entry', () => {
  assert.equal(can({ role: 'EMPLOYEE' }, 'employees'), false)
  assert.equal(can(null, 'dashboard'), false)
})

test('view permission gates modules and their actions', () => {
  const user = {
    role: 'EMPLOYEE',
    modulePermissions: {
      attendance: { view: true, create: true, update: false, delete: false },
      employees: { view: false, create: true, update: false, delete: false },
    },
  }

  assert.equal(can(user, 'attendance'), true)
  assert.equal(can(user, 'attendance', 'create'), true)
  assert.equal(can(user, 'attendance', 'update'), false)
  assert.equal(can(user, 'employees', 'create'), false)
})

test('super admins retain access and navigation follows module view grants', () => {
  const superAdmin = { role: 'SUPER_ADMIN' }
  const employee = {
    role: 'EMPLOYEE',
    modulePermissions: {
      dashboard: { view: true },
      attendance: { view: true },
      settings: { view: true },
      permissions: { view: false },
    },
  }

  assert.equal(can(superAdmin, 'permissions', 'delete'), true)
  assert.deepEqual(PERMISSIONS, {
    canRead: 'view',
    canCreate: 'create',
    canUpdate: 'update',
    canDelete: 'delete',
  })
  assert.deepEqual(
    visibleNav(employee).map(({ module }) => module),
    NAV_ITEMS.filter(({ module }) => ['dashboard', 'attendance'].includes(module)).map(
      ({ module }) => module
    )
  )
  assert.deepEqual(
    visibleBottomNav(employee).map(({ module }) => module),
    BOTTOM_NAV_ITEMS.filter(({ module }) => module === 'settings').map(
      ({ module }) => module
    )
  )
})
