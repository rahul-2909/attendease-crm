const roles = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  COMPANY_OWNER: 'COMPANY_OWNER',
  HR_ADMIN: 'HR_ADMIN',
  MANAGER: 'MANAGER',
  EMPLOYEE: 'EMPLOYEE',
};

const ROLE_VALUES = Object.values(roles);

module.exports = {
  ...roles,
  ROLE_VALUES,
};
