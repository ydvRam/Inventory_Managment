# Verify: Products only for Admin

**Base URL:** `http://localhost:3000` (start app with `npm run start:dev`)

---

## 1. Without token → must get **401**

- **GET** `http://localhost:3000/products`  
  No `Authorization` header.  
  **Expected:** `401 Unauthorized` (e.g. "Missing or invalid token")

---

## 2. With invalid token → must get **401**

- **GET** `http://localhost:3000/products`  
  Header: `Authorization: Bearer invalid-token`  
  **Expected:** `401 Unauthorized` (e.g. "Invalid or expired token")

---

## 3. Login as Admin and use token → must get **200**

1. Create Admin role and user (if not already):
   - **POST** `/roles` → body: `{ "name": "Admin" }` → copy `id`
   - **POST** `/users` → body: `{ "email": "admin@test.com", "password": "Admin@123", "name": "Admin", "roleIds": ["<role-id>"] }`

2. **POST** `http://localhost:3000/auth/login`  
   Body: `{ "email": "admin@test.com", "password": "Admin@123" }`  
   **Expected:** `200` with `access_token` and `user.roles` containing `"Admin"`

3. **GET** `http://localhost:3000/products`  
   Header: `Authorization: Bearer <access_token>`  
   **Expected:** `200` and list of products (or `[]`)

4. **POST** `http://localhost:3000/products`  
   Header: `Authorization: Bearer <access_token>`  
   Body: `{ "name": "Test Product", "sku": "SKU-001", "categoryId": "<any-category-uuid>", "stockLevel": 10, "reorderPoint": 5 }`  
   **Expected:** `201` and created product

---

## 4. Login as non-Admin and use token → must get **403**

1. Create a role that is not Admin, e.g. **POST** `/roles` → `{ "name": "Sales" }` → copy `id`
2. Create user with that role: **POST** `/users` → `{ "email": "sales@test.com", "password": "Sales@123", "name": "Sales", "roleIds": ["<sales-role-id>"] }`
3. **POST** `/auth/login` → body: `{ "email": "sales@test.com", "password": "Sales@123" }` → copy `access_token`
4. **GET** `http://localhost:3000/products`  
   Header: `Authorization: Bearer <access_token>`  
   **Expected:** `403 Forbidden` ("Admin role required")

---

## Summary

| Case                    | Expected   |
|-------------------------|-----------|
| No token                | 401       |
| Invalid/expired token   | 401       |
| Valid token, Admin role | 200/201   |
| Valid token, not Admin  | 403       |

Same behavior for **categories** and **products/:id/variants**.
