# MediStore Backend v2

Full-stack e-commerce backend for OTC medicines, built with **Node.js, Express, Prisma, and Better Auth**.

## 🚀 Key Features

- **Authentication**: Email/Password login, Email Verification (Nodemailer), Session Management.
- **Roles**: Customer, Seller, Admin.
- **Modules**:
  - 💊 **Medicines**: Browse, Search, Filter by Category/Price.
  - 🛒 **Orders**: Cart management, Order placement, Order tracking.
  - 🏪 **Seller Dashboard**: Manage inventory, View orders.
  - 👨‍💼 **Admin Dashboard**: User management, Statistics, Category management.
- **Security**: Helmet, Rate Limiting, Zod Validation.
- **Database**: PostgreSQL (NeonDB) with Prisma ORM.

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL (NeonDB)
- **ORM**: Prisma
- **Auth**: Better Auth
- **Email**: Nodemailer
- **Validation**: Zod

## ⚙️ Setup Instructions

### 1. Clone & Install
```bash
git clone https://github.com/tasinzuba/backend--v2.git
cd backend--v2
npm install
```

### 2. Environment Variables
Create a `.env` file based on `.env.example`:
```env
DATABASE_URL="postgresql://..."
BETTER_AUTH_SECRET="your-secret"
BETTER_AUTH_URL="http://localhost:3001"
EMAIL_USER="your-email@gmail.com"
EMAIL_PASS="your-app-password"
FRONTEND_URL="http://localhost:3000"
```

### 3. Database Setup
```bash
npm run prisma:generate
npm run prisma:push
npm run seed
```

### 4. Run Server
```bash
# Development
npm run dev

# Production
npm run build
npm start
```

## 📝 API Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| **Auth** | | | |
| POST | `/api/auth/sign-in/email` | Login | Public |
| POST | `/api/auth/sign-up/email` | Register | Public |
| **Medicines** | | | |
| GET | `/api/medicines` | Get all medicines | Public |
| GET | `/api/medicines/:id` | Get medicine details | Public |
| **Orders** | | | |
| GET | `/api/orders` | Get my orders | Customer |
| POST | `/api/orders` | Create order | Customer |
| **Seller** | | | |
| GET | `/api/seller/medicines` | Get my medicines | Seller |
| POST | `/api/seller/medicines` | Add medicine | Seller |

## 👤 Default Users (After Seeding)

- **Admin**: `admin@medistore.com` (Note: Register manually first via API)
- **Seller**: `seller@medistore.com` (Note: Register manually first via API)

## 📄 License
MIT
