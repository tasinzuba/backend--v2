# MediStore Backend v2

REST API backend for MediStore - an online pharmacy e-commerce platform. Built with **Express.js**, **Prisma**, **PostgreSQL**, and **Better Auth**.

![Backend](https://img.shields.io/badge/MediStore-Backend%20API-059669?style=for-the-badge)

## Live Links

| | URL |
|---|---|
| **Frontend Repo** | [github.com/tasinzuba/frontend--v2](https://github.com/tasinzuba/frontend--v2) |
| **Backend Repo** | [github.com/tasinzuba/backend--v2](https://github.com/tasinzuba/backend--v2) |

---

## Tech Stack

| Technology | Purpose |
|---|---|
| Node.js | Runtime |
| Express.js | API framework |
| TypeScript | Type safety |
| Prisma | ORM |
| PostgreSQL (NeonDB) | Database |
| Better Auth | Authentication & session management |
| Nodemailer | Email verification & password reset |
| Cloudinary | Image uploads |
| Zod | Request validation |
| Helmet | Security headers |
| express-rate-limit | Rate limiting |

---

## Database Schema

```
User (id, name, email, role, status, phone, image)
  ├── Session (token, expiresAt)
  ├── Account (providerId, password)
  ├── Order[] (totalPrice, status, shippingAddress, paymentStatus)
  │     └── OrderItem[] (medicineId, quantity, price)
  ├── Review[] (medicineId, rating, comment)
  └── Medicine[] (as Seller)

Category (id, name, description, image)
  └── Medicine[] (name, description, price, stock, image, isActive)

Enums: Role (CUSTOMER, SELLER, ADMIN)
       Status (ACTIVE, SUSPENDED, BANNED)
       OrderStatus (PENDING, CONFIRMED, PROCESSING, SHIPPED, DELIVERED, CANCELLED)
       PaymentStatus (UNPAID, PAID, REFUNDED)
```

---

## Admin / Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| **Admin** | `admin@medistore.com` | `admin123` |
| **Seller** | `seller@medistore.com` | `password123` |
| **Seller 2** | `seller2@medistore.com` | `password123` |
| **Customer** | `customer@medistore.com` | `password123` |
| **Customer 2** | `customer2@medistore.com` | `password123` |

---

## Setup Instructions

### 1. Clone & Install
```bash
git clone https://github.com/tasinzuba/backend--v2.git
cd backend--v2
npm install
```

### 2. Environment Variables
Create `.env`:
```env
DATABASE_URL="postgresql://user:pass@host/db?sslmode=require"
BETTER_AUTH_SECRET="your-secret-key"
BETTER_AUTH_URL="http://localhost:3001"
FRONTEND_URL="http://localhost:3000"
EMAIL_USER="your-email@gmail.com"
EMAIL_PASS="your-app-password"
CLOUDINARY_CLOUD_NAME="your-cloud"
CLOUDINARY_API_KEY="your-key"
CLOUDINARY_API_SECRET="your-secret"
PORT=3001
```

### 3. Database Setup
```bash
npm run prisma:generate    # Generate Prisma Client
npm run prisma:push         # Push schema to database
npm run seed                # Seed demo data (5 users, 6 categories, 17 medicines, 5 orders, 8 reviews)
```

### 4. Run Server
```bash
npm run dev      # Development (tsx watch)
npm run build    # Build for production
npm start        # Production
```

---

## API Endpoints

### Authentication (Better Auth)
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/sign-up/email` | Register (name, email, password, role) | Public |
| POST | `/api/auth/sign-in/email` | Login | Public |
| POST | `/api/auth/sign-out` | Logout | Auth |
| GET | `/api/auth/get-session` | Get current session | Auth |

### Medicines (Public)
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/medicines` | Browse all (search, category, minPrice, maxPrice) | Public |
| GET | `/api/medicines/:id` | Details with reviews | Public |
| GET | `/api/medicines/categories` | All categories | Public |

### Orders (Customer)
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/orders` | My orders | Customer |
| GET | `/api/orders/:id` | Order details | Customer |
| POST | `/api/orders` | Create order | Customer |
| PATCH | `/api/orders/:id/cancel` | Cancel pending order | Customer |

### Reviews (Customer)
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/reviews` | Submit review (must have delivered order) | Customer |

### Seller Routes
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/seller/medicines` | My medicines | Seller |
| POST | `/api/seller/medicines` | Add medicine | Seller |
| PUT | `/api/seller/medicines/:id` | Update medicine | Seller |
| DELETE | `/api/seller/medicines/:id` | Delete medicine | Seller |
| GET | `/api/seller/orders` | Orders containing my products | Seller |
| PATCH | `/api/seller/orders/:id` | Update order status | Seller |

### Admin Routes
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/admin/stats` | System statistics (users, orders, revenue) | Admin |
| GET | `/api/admin/users` | All users (filter by role) | Admin |
| PATCH | `/api/admin/users/:id` | Update user status (ACTIVE/SUSPENDED/BANNED) | Admin |
| POST | `/api/admin/categories` | Create category | Admin |
| PUT | `/api/admin/categories/:id` | Update category | Admin |
| DELETE | `/api/admin/categories/:id` | Delete category (cascades medicines) | Admin |
| GET | `/api/admin/orders` | All orders | Admin |
| GET | `/api/admin/medicines` | All medicines | Admin |

### Upload
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/upload` | Upload image to Cloudinary | Auth |

---

## Project Structure

```
backend--v2/
  src/
    index.ts                    # Express app entry point
    lib/
      auth.ts                   # Better Auth configuration
      prisma.ts                 # Prisma client
      email.ts                  # Nodemailer setup
    middleware/
      auth.middleware.ts        # Auth & role middleware
    controllers/
      medicine.controller.ts    # Public medicine routes
      order.controller.ts       # Customer order routes
      review.controller.ts      # Review routes
      seller.controller.ts      # Seller dashboard routes
      admin.controller.ts       # Admin dashboard routes
      upload.controller.ts      # Image upload routes
    routes/
      medicine.routes.ts
      order.routes.ts
      review.routes.ts
      seller.routes.ts
      admin.routes.ts
      upload.routes.ts
  prisma/
    schema.prisma               # Database schema
    seed.ts                     # Demo data seeder
```

---

## Seeded Demo Data

| Data | Count | Details |
|------|-------|---------|
| Users | 5 | 1 Admin, 2 Sellers, 2 Customers |
| Categories | 6 | Pain Relief, Cold & Flu, Vitamins & Supplements, First Aid, Skin Care, Digestive Health |
| Medicines | 17 | With descriptions, images, varied prices (25-450 BDT), stock levels |
| Orders | 5 | DELIVERED (2), SHIPPED (1), PROCESSING (1), PENDING (1) |
| Reviews | 8 | Ratings 4-5 with realistic Bangla-context comments |

---

## Author

**Tasin Ahmed**
- GitHub: [@tasinzuba](https://github.com/tasinzuba)
- Email: tasinahmed423@gmail.com
