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
