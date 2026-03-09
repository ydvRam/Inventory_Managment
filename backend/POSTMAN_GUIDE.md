# Postman Guide – User Roles & Access Control

Base URL: `http://localhost:3000` (or your `PORT` from `.env`)

---

## 1. Permissions

### Seed default permissions (run this first)
- **Method:** `GET`  
- **URL:** `http://localhost:3000/permissions/seed`  
- **Body:** None  
- **Result:** Creates default permissions (users:read, roles:write, etc.). Returns array of created permissions.

### List all permissions
- **Method:** `GET`  
- **URL:** `http://localhost:3000/permissions`  
- **Result:** All permissions (code, module, description).

### List permissions by module
- **Method:** `GET`  
- **URL:** `http://localhost:3000/permissions/module/users`  
- **Result:** Permissions for module `users`. Change `users` to `roles`, `products`, etc.

### Create a permission (optional)
- **Method:** `POST`  
- **URL:** `http://localhost:3000/permissions`  
- **Headers:** `Content-Type: application/json`  
- **Body (raw JSON):**
```json
{
  "code": "reports:export",
  "module": "reports",
  "description": "Export reports"
}
```

### Get one permission
- **Method:** `GET`  
- **URL:** `http://localhost:3000/permissions/:id`  
- **Example:** `http://localhost:3000/permissions/<paste-permission-uuid>`

---

## 2. Roles

### List all roles
- **Method:** `GET`  
- **URL:** `http://localhost:3000/roles`  
- **Result:** All roles with their permissions.

### Create a role
- **Method:** `POST`  
- **URL:** `http://localhost:3000/roles`  
- **Headers:** `Content-Type: application/json`  
- **Body (raw JSON):**
```json
{
  "name": "Admin",
  "description": "Full access",
  "permissionIds": ["<permission-uuid-1>", "<permission-uuid-2>"]
}
```
Get `permissionIds` from `GET /permissions` (use `id` of each permission). You can omit `permissionIds` or send `[]` and assign later.

### Get one role
- **Method:** `GET`  
- **URL:** `http://localhost:3000/roles/:id`

### Update a role
- **Method:** `PUT`  
- **URL:** `http://localhost:3000/roles/:id`  
- **Body (raw JSON):**
```json
{
  "name": "Administrator",
  "description": "Updated description",
  "permissionIds": ["<uuid1>", "<uuid2>"]
}
```

### Assign permissions to a role
- **Method:** `PUT`  
- **URL:** `http://localhost:3000/roles/:id/permissions`  
- **Body (raw JSON):**
```json
{
  "permissionIds": ["<permission-uuid-1>", "<permission-uuid-2>"]
}
```

### Delete a role
- **Method:** `DELETE`  
- **URL:** `http://localhost:3000/roles/:id`

---

## 3. Users

### List all users
- **Method:** `GET`  
- **URL:** `http://localhost:3000/users`  
- **Result:** All users with roles and permissions (no password).

### Create a user
- **Method:** `POST`  
- **URL:** `http://localhost:3000/users`  
- **Headers:** `Content-Type: application/json`  
- **Body (raw JSON):**
```json
{
  "email": "admin@example.com",
  "password": "SecurePass123",
  "name": "Admin User",
  "isActive": true,
  "roleIds": ["<role-uuid>"]
}
```
Get `roleIds` from `GET /roles`. You can omit `roleIds` or send `[]`.

### Get one user
- **Method:** `GET`  
- **URL:** `http://localhost:3000/users/:id`

### Update a user
- **Method:** `PUT`  
- **URL:** `http://localhost:3000/users/:id`  
- **Body (raw JSON):**
```json
{
  "name": "New Name",
  "email": "newemail@example.com",
  "password": "NewPassword123",
  "isActive": true,
  "roleIds": ["<role-uuid-1>"]
}
```
Omit `password` if you don’t want to change it.

### Assign roles to a user
- **Method:** `PUT`  
- **URL:** `http://localhost:3000/users/:id/roles`  
- **Body (raw JSON):**
```json
{
  "roleIds": ["<role-uuid-1>", "<role-uuid-2>"]
}
```

### Delete a user
- **Method:** `DELETE`  
- **URL:** `http://localhost:3000/users/:id`

---

## 4. Audit logs

### Create an audit log (manual)
- **Method:** `POST`  
- **URL:** `http://localhost:3000/audit/log`  
- **Headers:** `Content-Type: application/json`  
- **Body (raw JSON):**
```json
{
  "userId": "<user-uuid>",
  "action": "CREATE",
  "resource": "product",
  "resourceId": "prod-123",
  "oldData": null,
  "newData": { "name": "Widget", "sku": "WID-001" }
}
```
`userId`, `oldData`, `newData`, `resourceId` are optional. IP and User-Agent are taken from the request if not sent.

### List audit logs (paginated)
- **Method:** `GET`  
- **URL:** `http://localhost:3000/audit?page=1&limit=10`  
- **Optional query params:**  
  - `userId` – filter by user ID  
  - `resource` – e.g. `product`, `order`  
  - `action` – e.g. `CREATE`, `UPDATE`  
  - `from` – ISO date (e.g. `2025-01-01`)  
  - `to` – ISO date  

**Example:**  
`http://localhost:3000/audit?page=1&limit=20&resource=product`

### Get one audit log
- **Method:** `GET`  
- **URL:** `http://localhost:3000/audit/:id`

### Get audit logs for a resource
- **Method:** `GET`  
- **URL:** `http://localhost:3000/audit/resource/product/prod-123?limit=20`  
- **Result:** Logs for resource type `product` and id `prod-123`.

---

## Quick test order

1. Start app: `npm run start:dev`
2. **Permissions:** `GET /permissions/seed` → then `GET /permissions` (check table)
3. **Roles:** `POST /roles` with name and `permissionIds` from step 2 → `GET /roles`
4. **Users:** `POST /users` with email, password, name, `roleIds` from step 3 → `GET /users`
5. **Audit:** `POST /audit/log` with action, resource, etc. → `GET /audit`

Use the returned `id` values in later requests (e.g. role `id` in user creation, user `id` in audit log).
