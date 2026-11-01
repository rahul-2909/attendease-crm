# AttendEase Demo — Understanding Guide

Companion documentation for `attendease_demo.html`.

This demo is a single-file attendance and project-management SaaS UI. It includes employees, departments, projects, attendance, leave, shifts, reports, salary, settings, and a role-permission module.

---

## 1. What the file contains

Everything runs inside `attendease_demo.html`:

- HTML markup for login, app shell, sidebar, top bar, and modals
- CSS for the complete responsive UI
- JavaScript for data, rendering, navigation, CRUD actions, and permissions
- Seed data embedded in the file
- Browser `localStorage` used as the database

There is no backend or API call. All changes are stored locally in the browser.

---

## 2. How to run

Open `attendease_demo.html` in a browser.

Use one of the demo login buttons:

| Role | Login label | Internal role key |
|---|---|---|
| Company Owner | Company Owner | `COMPANY_OWNER` |
| HR / Admin | HR / Admin | `HR_ADMIN` |
| Manager | Manager | `MANAGER` |
| Employee | Employee | `EMPLOYEE` |

The selected role is stored under the `attendease_role` localStorage key.

---

## 3. Core architecture

### 3.1 Storage keys

| Key | Purpose |
|---|---|
| `attendease_demo_v1` | Main database: employees, projects, attendance, roles permissions, etc. |
| `attendease_role` | Currently logged-in demo role |

### 3.2 Main state variables

| Variable | Meaning |
|---|---|
| `db` | In-memory copy of the localStorage database |
| `currentRole` | Role of the logged-in demo user |
| `currentPage` | Currently rendered module |
| `permRole` | Role currently selected in the Role Permissions matrix |

### 3.3 Data loading and saving

| Function | Purpose |
|---|---|
| `getDB()` | Loads localStorage data, seeds it if missing, and adds any missing default permissions |
| `saveDB(db)` | Writes the current database back to localStorage |

The seed database is the `seed` constant near the top of the script.

---

## 4. Navigation and rendering

### 4.1 Module list

Modules are defined in `navItems`:

| Module id | Label |
|---|---|
| `dashboard` | Dashboard |
| `employees` | Employees |
| `departments` | Departments |
| `projects` | Projects |
| `attendance` | Attendance |
| `leave` | Leave |
| `shifts` | Shifts |
| `reports` | Reports |
| `salary` | Salary |
| `settings` | Settings |
| `permissions` | Role Permissions |

### 4.2 Sidebar visibility

`renderShell()` filters `navItems` using `can(moduleId)`:

- A module appears in the sidebar only when the current role has `view: true` for that module.
- `can(page)` delegates to `canView(module)`.

### 4.3 Page rendering

`renderPage(page)` maps the module id to a view function:

| Module | View function |
|---|---|
| Dashboard | `dashboardView()` |
| Employees | `employeesView()` |
| Departments | `departmentsView()` |
| Projects | `projectsView()` |
| Attendance | `attendanceView()` |
| Leave | `leaveView()` |
| Shifts | `shiftsView()` |
| Reports | `reportsView()` |
| Salary | `salaryView()` |
| Settings | `settingsView()` |
| Role Permissions | `permissionsView()` |

`navigate(page)` refuses to open a page when the current role does not have View permission.

---

## 5. Permission model

Permissions are stored inside the main database:

```js
rolePermissions: {
  COMPANY_OWNER: {
    employees: { view: true, create: true, update: true, delete: true },
    projects:  { view: true, create: true, update: true, delete: true },
    // ...
  },
  HR_ADMIN: {
    // ...
  }
}
```

Each role has one permission object per module. Each permission object has four booleans:

| Permission | Meaning |
|---|---|
| `view` | Module is visible in the sidebar and can be opened |
| `create` | Create/add buttons are available |
| `update` | Edit/save/approve buttons are available |
| `delete` | Delete buttons are available |

### 5.1 Permission helper functions

| Function | Checks |
|---|---|
| `canView(module)` | `view` permission for the current role |
| `canCreate(module)` | `create` permission for the current role |
| `canUpdate(module)` | `update` permission for the current role |
| `canDelete(module)` | `delete` permission for the current role |
| `can(page)` | Alias for `canView(page)` |

### 5.2 Permission rules

- If `view` is disabled, the module is hidden from the sidebar and `navigate()` blocks access.
- Enabling `create`, `update`, or `delete` automatically enables `view` for that module.
- Disabling `view` automatically disables `create`, `update`, and `delete` for that module.
- Changes are saved immediately to localStorage.
- If the owner changes their own role permissions, the sidebar refreshes immediately.
- If the current page becomes inaccessible, the app navigates to the first available module.
- The Company Owner cannot remove their own `view` or `update` access to the Role Permissions module, preventing lockout.

### 5.3 Default permissions

`buildDefaultPermissions()` creates the initial permission matrix.

- View defaults come from the legacy `roles` lists.
- Create/update/delete defaults come from `permConfig`.
- The `permissions` module starts with View and Update only for `COMPANY_OWNER`.

---

## 6. Default permission matrix

Legend: **Yes** = enabled, **—** = disabled.

### 6.1 Company Owner (`COMPANY_OWNER`)

| Module | View | Create | Update | Delete |
|---|---|---|---|---|
| Dashboard | Yes | — | — | — |
| Employees | Yes | Yes | Yes | Yes |
| Departments | Yes | Yes | Yes | Yes |
| Projects | Yes | Yes | Yes | Yes |
| Attendance | Yes | Yes | Yes | — |
| Leave | Yes | Yes | Yes | Yes |
| Shifts | Yes | Yes | Yes | Yes |
| Reports | Yes | — | — | — |
| Salary | Yes | — | Yes | — |
| Settings | Yes | — | Yes | — |
| Role Permissions | Yes | — | Yes | — |

### 6.2 HR / Admin (`HR_ADMIN`)

| Module | View | Create | Update | Delete |
|---|---|---|---|---|
| Dashboard | Yes | — | — | — |
| Employees | Yes | Yes | Yes | — |
| Departments | Yes | Yes | Yes | — |
| Projects | Yes | Yes | Yes | Yes |
| Attendance | Yes | Yes | Yes | — |
| Leave | Yes | Yes | Yes | Yes |
| Shifts | Yes | Yes | Yes | — |
| Reports | Yes | — | — | — |
| Salary | — | — | — | — |
| Settings | Yes | — | Yes | — |
| Role Permissions | — | — | — | — |

### 6.3 Manager (`MANAGER`)

| Module | View | Create | Update | Delete |
|---|---|---|---|---|
| Dashboard | Yes | — | — | — |
| Employees | Yes | — | — | — |
| Departments | — | — | — | — |
| Projects | Yes | Yes | Yes | — |
| Attendance | Yes | — | — | — |
| Leave | Yes | Yes | Yes | — |
| Shifts | — | — | — | — |
| Reports | Yes | — | — | — |
| Salary | — | — | — | — |
| Settings | — | — | — | — |
| Role Permissions | — | — | — | — |

### 6.4 Employee (`EMPLOYEE`)

| Module | View | Create | Update | Delete |
|---|---|---|---|---|
| Dashboard | Yes | — | — | — |
| Employees | — | — | — | — |
| Departments | — | — | — | — |
| Projects | Yes | — | — | — |
| Attendance | Yes | Yes | — | — |
| Leave | Yes | Yes | — | — |
| Shifts | — | — | — | — |
| Reports | — | — | — | — |
| Salary | — | — | — | — |
| Settings | — | — | — | — |
| Role Permissions | — | — | — | — |

---

## 7. What each permission controls in the UI

| Module | View | Create | Update | Delete |
|---|---|---|---|---|
| Dashboard | Shows dashboard | Enables quick check-in / add-employee shortcut where applicable | Not used | Not used |
| Employees | Shows module | `+ Add Employee` | `Edit Employee`, save changes | `Delete` employee |
| Departments | Shows module | `+ Add Department` | Edit and save department | Delete department |
| Projects | Shows module | `+ New Project` | Edit project and save | Delete project |
| Attendance | Shows module | Manual entry or check-in/out | Not currently exposed | Not currently exposed |
| Leave | Shows module | `+ Apply Leave` | Approve/reject leave | Delete leave request |
| Shifts | Shows module | `+ Add Shift` | Edit shift | Delete shift |
| Reports | Shows module | Not used | Not used | Not used |
| Salary | Shows salary data | Not used | `Edit Salary` and save | Not used |
| Settings | Shows settings | Not used | Toggles and Save Settings | Not used |
| Role Permissions | Shows permission matrix | Not used | Checkbox editing | Not used |

Some CRUD toggles are configurable even when the module has no matching button yet. This keeps the permission model consistent and ready for future actions.

---

## 8. How to use the Role Permissions module

1. Log in as **Company Owner**.
2. Open **Role Permissions** from the sidebar.
3. Select a role from the dropdown.
4. Toggle **View**, **Create**, **Update**, or **Delete** for each module.
5. Changes save immediately.
6. Log out and log in as that role to see the updated sidebar and action buttons.

Because permissions are role-based, every demo login using the same role receives the same access.

---

## 9. Adding a new module

To add a new module to the demo:

1. Add an entry to `navItems`:
   ```js
   ['module_id', 'icon', 'Module Label']
   ```
2. Add a view function, for example `moduleView()`.
3. Register it in `renderPage()`:
   ```js
   const views = { ..., module_id: moduleView };
   ```
4. Decide which roles should see it by default:
   - Add `module_id` to the relevant `roles` arrays for View defaults.
   - Add create/update/delete defaults in `permConfig`.
5. Gate action buttons with:
   ```js
   canCreate('module_id')
   canUpdate('module_id')
   canDelete('module_id')
   ```
6. The permission module will automatically include the new module for every role.

Existing localStorage data automatically receives the new module’s default permissions through the merge logic in `getDB()`.

---

## 10. Resetting demo data

To reset the demo:

1. Open browser DevTools.
2. Go to Application → Local Storage.
3. Delete:
   - `attendease_demo_v1`
   - `attendease_role`
4. Reload the page.

The original seed data and default permissions will be recreated.

---

## 11. Key code locations

| Area | Location |
|---|---|
| Roles | `roles` constant |
| Modules | `navItems` constant |
| Default create/update/delete rules | `permConfig` constant |
| Default permission builder | `buildDefaultPermissions()` |
| localStorage loading | `getDB()` |
| Permission checks | `can()`, `canView()`, `canCreate()`, `canUpdate()`, `canDelete()` |
| Sidebar rendering | `renderShell()` |
| Page navigation | `navigate()` |
| Page rendering | `renderPage()` |
| Permission matrix UI | `permissionsView()`, `permRow()`, `togglePerm()` |

---

## 12. Important limitations

- This is a front-end demo only. Permissions are not secure against a user editing localStorage or JavaScript in DevTools.
- Login is simulated; there is no authentication or password validation.
- The demo user’s display name is fixed in the seed data.
- A real implementation should enforce permissions on the server/API as well as in the UI.
- Some modules show partial data or static demo values, such as reports charts and settings/subscription details.
