# Testing the API with Postman

## 1. Start the backend

```bash
cd backend
npm run start:dev
```

Default base URL: **http://localhost:3001** (or set `PORT` in `.env`).

---

## 2. Get a JWT token (required for all other requests)

All procurement endpoints use **JWT + Admin**. You must log in with an **admin** user first.

**Request**

- **Method:** `POST`
- **URL:** `http://localhost:3001/auth/login`
- **Headers:** `Content-Type: application/json`
- **Body (raw JSON):**

```json
{
  "email": "your-admin-email@example.com",
  "password": "your-password"
}
```

**Response**

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": { "id": "...", "email": "...", "name": "...", "roles": ["Admin"] }
}
```

Copy the `access_token` value.

---

## 3. Use the token on every other request

For **Suppliers**, **Purchase Orders**, and **Inventory**:

- Open the **Authorization** tab.
- Type: **Bearer Token**
- Token: paste the `access_token` from the login response.

Or set a header manually:

- **Key:** `Authorization`  
- **Value:** `Bearer <paste-your-token-here>`

---

## 4. Import the Postman collection (optional)

1. In Postman: **Import** → choose **backend/postman/Inventory-Management-API.postman_collection.json**.
2. Run **Auth → Login** with your admin email/password in the body.
3. The collection script will save the token into the variable `token`; other requests use `{{token}}`.
4. For **Create purchase order** and any request that needs IDs, set collection variables:
   - `supplierId` – UUID from a supplier
   - `productId` – UUID from a product (from your products API)
   - `poId` – UUID from a purchase order

---

## 5. Quick reference – endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| **Auth** | | |
| POST | `/auth/login` | Login (body: `email`, `password`) |
| **Suppliers** | | |
| GET | `/suppliers` | List all suppliers |
| GET | `/suppliers/:id` | Get one supplier |
| POST | `/suppliers` | Create (body: `name`, `email`, `phone`, `address`) |
| PUT | `/suppliers/:id` | Update |
| DELETE | `/suppliers/:id` | Delete |
| **Purchase orders** | | |
| GET | `/purchase-orders` | List all POs |
| GET | `/purchase-orders/:id` | Get one PO |
| POST | `/purchase-orders` | Create (body: `supplierId`, `items`: `[{ productId, quantity, unitPrice }]`) |
| PUT | `/purchase-orders/:id` | Update `status` / `paymentStatus` |
| POST | `/purchase-orders/:id/receive` | Receive order → updates inventory |
| DELETE | `/purchase-orders/:id` | Delete (only if not Received) |
| **Inventory** | | |
| GET | `/inventory` | List all inventory rows |
| GET | `/inventory/by-product/:productId` | Get inventory for one product |
| GET | `/inventory/:id` | Get one inventory record by its ID |
| PUT | `/inventory/adjust?productId=:id` | Set quantity (body: `{ "quantity": 100 }`) |

**PO status values:** `Pending`, `Received`, `Cancelled`  
**Payment status values:** `Unpaid`, `Paid`

---

## 6. Suggested test flow

1. **Login** → copy `access_token`.
2. **Create a supplier** (POST `/suppliers`) → copy `id`.
3. Get a **product ID** from GET `/products` (product-management).
4. **Create a purchase order** (POST `/purchase-orders`) with that `supplierId` and `items` with the `productId`.
5. **Receive the order** (POST `/purchase-orders/:id/receive`) → inventory and product stock increase.
6. **Get inventory** (GET `/inventory`) or GET `/inventory/by-product/:productId`) to confirm.

If you get **401 Unauthorized**, the token is missing or invalid. If you get **403 Forbidden**, the user is not an admin.

---

## 7. Steps: Create Customer and Sales Order (Postman)

**Note:** Customers and Sales Orders work with **any logged-in user** (admin or normal). Use the same login and Bearer token.

### Step 1: Login and copy the token

1. **POST** `http://localhost:3001/auth/login`
2. **Body** (raw, JSON):
   ```json
   {
     "email": "your-email@example.com",
     "password": "your-password"
   }
   ```
3. Send the request.
4. From the response, copy the value of **`access_token`**.
5. For all following requests, set **Authorization** → Type: **Bearer Token** → paste the token (or add header `Authorization: Bearer <token>`).

---

### Step 2: Create a customer

1. **POST** `http://localhost:3001/customers`
2. **Headers:** `Content-Type: application/json` and **Authorization: Bearer &lt;token&gt;**
3. **Body** (raw, JSON):
   ```json
   {
     "name": "Acme Corp",
     "email": "contact@acme.com",
     "phone": "+1-555-0100",
     "address": "123 Main St, City, Country"
   }
   ```
4. Send the request.
5. In the response, copy the customer **`id`** (UUID). You will use it as `customerId` when creating the sales order.

**Optional:** To list all customers: **GET** `http://localhost:3001/customers` (with same Bearer token).

---

### Step 3: Get a product ID (for sales order items)

1. **GET** `http://localhost:3001/products`  
   (Use **Bearer token**; if you only have a normal user, ensure products are exposed to them, or use an admin token.)
2. From the response array, pick one product and copy its **`id`** (UUID).

If you have no products yet, create one first via **POST** `/products` (admin) or use an existing product ID from your database.

---

### Step 4: Create a sales order

1. **POST** `http://localhost:3001/sales-orders`
2. **Headers:** `Content-Type: application/json` and **Authorization: Bearer &lt;token&gt;**
3. **Body** (raw, JSON). Replace `customer-id-here` with the customer ID from Step 2, and `product-id-here` with the product ID from Step 3:
   ```json
   {
     "customerId": "customer-id-here",
     "items": [
       {
         "productId": "product-id-here",
         "quantity": 2,
         "unitPrice": "29.99"
       }
     ]
   }
   ```
   Example with real UUIDs:
   ```json
   {
     "customerId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
     "items": [
       {
         "productId": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
         "quantity": 2,
         "unitPrice": "29.99"
       }
     ]
   }
   ```
4. Send the request.
5. Response will contain the created sales order with **`id`**, **`totalAmount`**, **`status`** (e.g. `"Pending"`), **`customer`**, and **`items`**.

**Optional:** To list all sales orders: **GET** `http://localhost:3001/sales-orders`.

---

### Step 5 (optional): Fulfill the sales order (sell items)

Fulfilling deducts stock from inventory and marks the order as Confirmed.

1. **POST** `http://localhost:3001/sales-orders/:id/fulfill`  
   Replace `:id` with the sales order `id` from Step 4.
2. **Headers:** **Authorization: Bearer &lt;token&gt;**
3. No body required. Send the request.
4. Response returns the updated sales order (e.g. **`status: "Confirmed"`**).

---

### Step 6 (optional): Generate an invoice from the sales order

1. **POST** `http://localhost:3001/invoices/generate`
2. **Headers:** `Content-Type: application/json` and **Authorization: Bearer &lt;token&gt;**
3. **Body** (raw, JSON). Replace with your sales order ID from Step 4:
   ```json
   {
     "salesOrderId": "sales-order-id-here"
   }
   ```
4. Send the request. Response contains the created invoice (e.g. **`invoiceNumber`**, **`amount`**, **`status: "Unpaid"`**).

---

### Quick checklist

| Step | Method | URL | What to copy from response |
|------|--------|-----|----------------------------|
| 1 | POST | `/auth/login` | `access_token` |
| 2 | POST | `/customers` | Customer `id` → use as `customerId` |
| 3 | GET | `/products` | Any product `id` → use in `items[].productId` |
| 4 | POST | `/sales-orders` | Sales order `id` (for fulfill / invoice) |
| 5 | POST | `/sales-orders/:id/fulfill` | — |
| 6 | POST | `/invoices/generate` | Invoice details |
