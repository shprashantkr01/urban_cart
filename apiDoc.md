# API Documentation — Urban Cart

**Base URL:** `http://localhost:4000`  
**Content-Type:** `application/json`  
**Auth:** `Authorization: Bearer <accessToken>` (where required)

---

## Authentication

### POST `/api/user/register`
Register a new user.

**Request Body:**
```json
{
  "name": "Prashant Sharma",
  "email": "prashant@example.com",
  "password": "StrongPass123"
}
```

**Response — 201 Created:**
```json
{
  "success": true,
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response — 400 Bad Request:**
```json
{
  "success": false,
  "message": "User already exists"
}
```

> Sets `refreshToken` as an `httpOnly` cookie (7 day expiry).

---

### POST `/api/user/login`
Login with email and password.

> ⚠️ Rate limited to **5 requests per 15 minutes** per IP.

**Request Body:**
```json
{
  "email": "prashant@example.com",
  "password": "StrongPass123"
}
```

**Response — 200 OK:**
```json
{
  "success": true,
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response — 401 Unauthorized:**
```json
{
  "success": false,
  "message": "Invalid credentials"
}
```

---

### POST `/api/user/refresh`
Get a new access token using the refresh token cookie.

**Request:** No body needed. Refresh token is read from `httpOnly` cookie.

**Response — 200 OK:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response — 401 Unauthorized:**
```json
{
  "message": "No refresh token"
}
```

---

### POST `/api/user/admin`
Login as admin.

**Request Body:**
```json
{
  "email": "admin@urbancart.com",
  "password": "your_admin_password"
}
```

**Response — 200 OK:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

## Products

### GET `/api/product/list`
Get all products.

**Auth:** Not required

**Response — 200 OK:**
```json
{
  "success": true,
  "products": [
    {
      "_id": "64f1a2b3c4d5e6f7a8b9c0d1",
      "name": "Classic White Oxford Shirt",
      "description": "A timeless white Oxford shirt...",
      "price": 1299,
      "image": ["https://cloudinary.com/..."],
      "category": "Men",
      "subCategory": "Topwear",
      "sizes": ["S", "M", "L", "XL", "XXL"],
      "bestseller": true,
      "date": 1710000000000
    }
  ]
}
```

---

### POST `/api/product/single`
Get a single product by ID.

**Request Body:**
```json
{
  "productId": "64f1a2b3c4d5e6f7a8b9c0d1"
}
```

**Response — 200 OK:**
```json
{
  "success": true,
  "product": { ... }
}
```

---

### POST `/api/product/add`
Add a new product. **Admin only.**

**Auth:** Required (Admin token)  
**Content-Type:** `multipart/form-data`

**Form Fields:**

| Field | Type | Required | Description |
|---|---|---|---|
| `name` | string | ✅ | Product name |
| `description` | string | ✅ | Product description |
| `price` | number | ✅ | Price in ₹ |
| `category` | string | ✅ | Men / Women / Kids |
| `subCategory` | string | ✅ | Topwear / Bottomwear / Winterwear |
| `bestseller` | boolean | ❌ | Mark as bestseller |
| `sizes` | JSON string | ✅ | e.g. `'["S","M","L"]'` |
| `image1` | file | ✅ | Primary image |
| `image2-4` | file | ❌ | Additional images |

**Response — 200 OK:**
```json
{
  "success": true,
  "message": "Product Added"
}
```

---

### POST `/api/product/remove`
Remove a product by ID. **Admin only.**

**Auth:** Required (Admin token)

**Request Body:**
```json
{
  "id": "64f1a2b3c4d5e6f7a8b9c0d1"
}
```

**Response — 200 OK:**
```json
{
  "success": true,
  "message": "Product Removed"
}
```

---

### POST `/api/product/ai-search` 🤖
AI-powered natural language product search.

**Auth:** Not required

**Request Body:**
```json
{
  "q": "warm jacket for women under 3000"
}
```

**Response — 200 OK:**
```json
{
  "success": true,
  "products": [
    {
      "_id": "...",
      "name": "Long Woolen Coat – Charcoal Grey",
      "price": 2799,
      "category": "Women",
      "subCategory": "Winterwear",
      "score": 12
    }
  ],
  "filters": {
    "category": "Women",
    "subCategory": "Winterwear",
    "maxPrice": 3000,
    "keywords": ["warm", "jacket"]
  },
  "usedAI": true
}
```

**Response — 400 Bad Request:**
```json
{
  "success": false,
  "message": "Query is required"
}
```

**Notes:**
- Results are ranked by relevance score (highest first)
- Cached for 10 minutes per unique query
- Falls back to Groq if Gemini fails
- Falls back to regex search if both AI providers fail

---

### POST `/api/product/generate-description` 🤖
Generate an AI product description. **Admin use.**

**Request Body:**
```json
{
  "name": "Puffer Jacket – Midnight Blue",
  "category": "Men",
  "subCategory": "Winterwear"
}
```

**Response — 200 OK:**
```json
{
  "success": true,
  "description": "A lightweight yet warm midnight-blue puffer jacket with water-resistant outer shell. Packable and stylish — the perfect men's winter essential for city and travel."
}
```

---

## Cart

> All cart endpoints require user authentication.

### POST `/api/cart/add`
Add an item to cart.

**Auth:** Required

**Request Body:**
```json
{
  "itemId": "64f1a2b3c4d5e6f7a8b9c0d1",
  "size": "M"
}
```

**Response — 200 OK:**
```json
{
  "success": true,
  "message": "Added To Cart"
}
```

---

### POST `/api/cart/update`
Update item quantity in cart.

**Auth:** Required

**Request Body:**
```json
{
  "itemId": "64f1a2b3c4d5e6f7a8b9c0d1",
  "size": "M",
  "quantity": 3
}
```

**Response — 200 OK:**
```json
{
  "success": true,
  "message": "Cart Updated"
}
```

---

### POST `/api/cart/get`
Get current user's cart.

**Auth:** Required

**Request Body:** `{}`

**Response — 200 OK:**
```json
{
  "success": true,
  "cartData": {
    "64f1a2b3c4d5e6f7a8b9c0d1": {
      "M": 2,
      "L": 1
    }
  }
}
```

---

## Orders

### POST `/api/order/place`
Place a Cash on Delivery order.

**Auth:** Required

**Request Body:**
```json
{
  "userId": "64f1a2b3c4d5e6f7a8b9c0d2",
  "items": [
    {
      "_id": "64f1a2b3c4d5e6f7a8b9c0d1",
      "name": "Classic White Oxford Shirt",
      "price": 1299,
      "quantity": 1,
      "size": "M"
    }
  ],
  "amount": 1498,
  "address": {
    "firstName": "Prashant",
    "lastName": "Sharma",
    "email": "prashant@example.com",
    "street": "12 Rajouri Garden",
    "city": "New Delhi",
    "state": "Delhi",
    "zipcode": "110027",
    "country": "India",
    "phone": "9876543210"
  }
}
```

**Response — 200 OK:**
```json
{
  "success": true,
  "message": "Order Placed"
}
```

---

### POST `/api/order/stripe`
Place an order and get Stripe checkout URL.

**Auth:** Required

**Request Body:** Same as `/api/order/place`

**Response — 200 OK:**
```json
{
  "success": true,
  "session_url": "https://checkout.stripe.com/pay/cs_test_..."
}
```

---

### POST `/api/order/razorpay`
Place an order and get Razorpay order details.

**Auth:** Required

**Request Body:** Same as `/api/order/place`

**Response — 200 OK:**
```json
{
  "success": true,
  "order": {
    "id": "order_ABC123",
    "amount": 149800,
    "currency": "INR"
  }
}
```

---

### POST `/api/order/userorders`
Get all orders for the logged-in user.

**Auth:** Required

**Request Body:**
```json
{
  "userId": "64f1a2b3c4d5e6f7a8b9c0d2"
}
```

**Response — 200 OK:**
```json
{
  "success": true,
  "orders": [
    {
      "_id": "...",
      "items": [...],
      "amount": 1498,
      "status": "Shipped",
      "paymentMethod": "COD",
      "payment": false,
      "date": 1710000000000
    }
  ]
}
```

---

### POST `/api/order/list`
Get all orders. **Admin only.**

**Auth:** Required (Admin token)

**Response — 200 OK:**
```json
{
  "success": true,
  "orders": [...]
}
```

---

### POST `/api/order/status`
Update order status. **Admin only.**

**Auth:** Required (Admin token)

**Request Body:**
```json
{
  "orderId": "64f1a2b3c4d5e6f7a8b9c0d3",
  "status": "Shipped"
}
```

**Available statuses:** `Order Placed` → `Packing` → `Shipped` → `Out for Delivery` → `Delivered`

**Response — 200 OK:**
```json
{
  "success": true,
  "message": "Status Updated"
}
```

---

## Error Responses

All endpoints return consistent error format:

| Status Code | Meaning |
|---|---|
| `400` | Bad request / validation error |
| `401` | Unauthorized — missing or invalid token |
| `403` | Forbidden — valid token but insufficient role |
| `404` | Resource not found |
| `429` | Too many requests — rate limit exceeded |
| `500` | Internal server error |

**Error Response Format:**
```json
{
  "success": false,
  "message": "Descriptive error message here"
}
```