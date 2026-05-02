# Urban Cart 🛒

A full-stack e-commerce web application built with the **MERN stack**, featuring AI-powered product search and automated description generation.

Demo video link : [CLick Here 👇](https://drive.google.com/drive/folders/1X78jNhX0vTJylinjBfZuV6zdFJiUlLCu?usp=sharing)

---

## 🚀 Live Features

- 🔐 **Secure Authentication** — JWT access tokens + refresh tokens + rate limiting
- 🤖 **AI Search** — Natural language product search powered by Google Gemini & Groq
- ✍️ **AI Description Generator** — Auto-generate product descriptions in the admin panel
- 🛍️ **Product Catalog** — Browse, filter, and sort across Men / Women / Kids categories
- 🛒 **Cart & Orders** — Full cart management with order tracking
- 💳 **Multiple Payments** — Stripe, Razorpay, and Cash on Delivery
- 📦 **Admin Panel** — Separate dashboard to manage products and orders
- 🔍 **Smart Recommendations** — Similar and recommended products after AI search

---

## 🧱 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React.js, Tailwind CSS, Context API |
| Backend | Node.js, Express.js |
| Database | MongoDB, Mongoose |
| Auth | JWT (Access + Refresh Tokens), bcrypt |
| AI | Google Gemini 2.5 Flash, Groq (LLaMA 3.1) |
| Payments | Stripe, Razorpay |
| Storage | Cloudinary (image uploads) |
| Security | express-rate-limit, httpOnly cookies |

---

## 📁 Project Structure

```
urban-cart/
├── frontend/          # React storefront
│   └── src/
│       ├── pages/     # Collection, Product, Cart, Orders...
│       ├── components/# Navbar, SearchBar, ProductItem...
│       ├── context/   # ShopContext (global state)
│       └── api.js     # Axios instance with token interceptor
│
├── backend/           # Node.js + Express API
│   ├── controllers/   # Business logic
│   ├── models/        # Mongoose schemas
│   ├── routes/        # API routes
│   ├── middleware/    # Auth, AdminAuth, RateLimiter
│   └── config/        # MongoDB, Cloudinary setup
│
└── admin/             # Separate React admin panel
    └── src/
        └── pages/     # Add, List, Orders
```

---

## ⚙️ Setup & Installation

### Prerequisites
- Node.js v18+
- MongoDB (local or Atlas)
- Cloudinary account
- Stripe and Razorpay accounts
- Google AI Studio API key (free)
- Groq API key (free)

---

### 1. Clone the repository
```bash
git clone https://github.com/shprashantkr01/urban_cart.git
cd urban-cart
```

---

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in `/backend`:

```env
# Server
PORT=4000

# Database
MONGODB_URI=your_mongodb_connection_string

# Auth
JWT_SECRET=your_jwt_secret_key
JWT_REFRESH_SECRET=your_jwt_refresh_secret_key

# Admin
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=your_admin_password

# Cloudinary
CLOUDINARY_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_SECRET_KEY=your_secret_key

# AI
GEMINI_API_KEY=your_gemini_api_key
GROQ_API_KEY=your_groq_api_key

# Payments
STRIPE_SECRET_KEY=your_stripe_secret_key
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_secret
```

Start the backend:
```bash
npm run dev
```

---

### 3. Seed the database (optional but recommended)

```bash
node seedData.js
```

This inserts 90 products, 10 users, and 35+ orders. All user passwords are `Test@1234`.

---

### 4. Frontend Setup

```bash
cd frontend
npm install
```

Create `.env` in `/frontend`:
```env
VITE_BACKEND_URL=http://localhost:4000
```

Start the frontend:
```bash
npm run dev
```

---

### 5. Admin Panel Setup

```bash
cd admin
npm install
```

Create `.env` in `/admin`:
```env
VITE_BACKEND_URL=http://localhost:4000
```

Start the admin panel:
```bash
npm run dev
```

---

## 🔑 Getting Free API Keys

| Service | Link | Free Tier |
|---|---|---|
| Google Gemini | [aistudio.google.com](https://aistudio.google.com) | 1500 req/day |
| Groq | [console.groq.com](https://console.groq.com) | Generous daily limits |
| Cloudinary | [cloudinary.com](https://cloudinary.com) | 25 credits/month |

---

## 🤖 AI Features

See [AI_FEATURES.md](./AI_FEATURES.md) for a detailed breakdown of how the AI features work.

---

## 📡 API Documentation

See [API.md](./API.md) for complete API reference with request/response examples.

---

## 🔐 Authentication Flow

```
Register / Login
      ↓
Access Token (15 min) → stored in localStorage
Refresh Token (7 days) → stored in httpOnly cookie
      ↓
Every request → Authorization: Bearer <accessToken>
      ↓
Token expired? → auto-refresh via /api/user/refresh
      ↓
Refresh expired? → redirect to login
```

---

## 📸 Screenshots

> Add screenshots of your app here after deployment

| Page | Description |
|---|---|
| Home | Hero section, bestsellers, latest collection |
| Collection | Product grid with AI search and filter pills |
| Product | Product detail with related items |
| Admin | Add products with AI description generator |

---

## 🗺️ Roadmap

- [ ] Google OAuth (Sign in with Google)
- [ ] Product reviews and ratings
- [ ] Vector embeddings for semantic search (RAG)
- [ ] Email verification on registration
- [ ] Order email notifications

---

## 👨‍💻 Author

**Prashant Kumar Sharma**
- GitHub: [@shprashantkr01](https://github.com/shprashantkr01)
- LinkedIn: [linkedin.com/in/prashant-sharma-mern-developer](www.linkedin.com/in/prashant-sharma-mern-developer)
- Email: sh.prashantkr01@gmail.com
