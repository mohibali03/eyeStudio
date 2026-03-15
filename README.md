# 👁️ EyeStudio — Optical Shop Management System

A full-stack **MERN** web application for managing an optical store — covering products, customers, orders, prescriptions, eye test bookings, and a complete admin dashboard.

---

## ✨ Features

### 🔐 Admin Panel
- Secure admin login with JWT authentication
- Dashboard with analytics (sales charts, order stats, customer count)
- **Product Management** — add, edit, delete eyewear products with image upload
- **Customer Management** — create, edit, delete customer accounts
- **Order Management** — create orders for customers, update order status
- **Prescription Management** — add eye prescriptions per customer
- **Eye Test Bookings** — view and manage appointment bookings
- Admin profile with password update

### 👤 Customer Side
- Register & login with strong password enforcement
- Customer dashboard with order history and prescription view
- Browse eyewear products with category/price filters
- Book eye test appointments
- Lens guide information page
- Profile view & edit (name, email, password)

---

## 🛠️ Tech Stack

| Layer      | Technology                        |
|------------|-----------------------------------|
| Frontend   | React.js, React Router, CSS3      |
| Backend    | Node.js, Express.js               |
| Database   | MongoDB (Mongoose)                |
| Auth       | JWT, Bcrypt                       |
| File Upload| Multer                            |
| Charts     | Recharts                          |

---

## 📁 Project Structure

```
eyeStudio/
├── backend/
│   ├── config/          # MongoDB connection
│   ├── controllers/     # Auth logic
│   ├── middleware/       # JWT protect & adminOnly
│   ├── models/          # Mongoose schemas
│   ├── routes/          # Express API routes
│   ├── uploads/         # Product image storage
│   ├── .env.example     # Environment variable template
│   └── server.js        # Entry point
│
├── frontend/
│   ├── public/
│   └── src/
│       ├── components/  # Header, Footer, AdminLayout, ProfileMenu, Toast
│       ├── config/      # API base URL
│       ├── context/     # AuthContext (global auth state)
│       ├── pages/
│       │   ├── admin/   # All admin pages
│       │   └── customer/# All customer pages
│       ├── routes/      # ProtectedRoute, AdminRoute
│       ├── styles/      # All CSS files
│       └── utils/       # passwordValidator
│
├── .gitignore
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) v14 or higher
- [MongoDB Atlas](https://cloud.mongodb.com/) account (or local MongoDB)
- npm

---

### 1. Clone the Repository

```bash
git clone https://github.com/mohibali03/eyeStudio.git
cd eyeStudio
```

---

### 2. Backend Setup

```bash
cd backend
npm install
```

Create your `.env` file from the example:

```bash
cp .env.example .env
```

Fill in your values in `.env`:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
```

Start the backend server:

```bash
npm start
```

Backend runs at: `http://localhost:5000`

---

### 3. Frontend Setup

```bash
cd ../frontend
npm install
```

Update the API base URL in `src/config/api.js` if needed:

```js
export const API_BASE_URL = "http://localhost:5000/api";
```

Start the frontend:

```bash
npm run dev
```

Frontend runs at: `http://localhost:5173`

---

## 🔐 Default Admin Access

Create an admin user directly in MongoDB by setting `role: "admin"` on a user document, or register normally and update the role field in your database.

---

## 📦 API Endpoints

| Method | Endpoint                          | Description              | Auth        |
|--------|-----------------------------------|--------------------------|-------------|
| POST   | `/api/auth/register`              | Register customer        | Public      |
| POST   | `/api/auth/login`                 | Login                    | Public      |
| GET    | `/api/products`                   | Get all products         | Public      |
| POST   | `/api/products`                   | Create product           | Admin       |
| PUT    | `/api/products/:id`               | Update product           | Admin       |
| DELETE | `/api/products/:id`               | Delete product           | Admin       |
| GET    | `/api/users`                      | Get all customers        | Admin       |
| GET    | `/api/users/profile`              | Get own profile          | Protected   |
| PUT    | `/api/users/profile`              | Update own profile       | Protected   |
| GET    | `/api/orders/my`                  | Get my orders            | Protected   |
| GET    | `/api/orders/all`                 | Get all orders           | Admin       |
| POST   | `/api/orders/:customerId`         | Create order             | Admin       |
| PUT    | `/api/orders/:id/status`          | Update order status      | Admin       |
| GET    | `/api/prescriptions/my`           | Get my prescription      | Protected   |
| POST   | `/api/prescriptions/:customerId`  | Add prescription         | Admin       |
| GET    | `/api/eye-tests`                  | Get all bookings         | Admin       |
| POST   | `/api/eye-tests`                  | Book eye test            | Public      |

---

## 🔒 Password Policy

All passwords must meet the following requirements:
- 8–20 characters
- At least one uppercase letter (A–Z)
- At least one lowercase letter (a–z)
- At least one number (0–9)
- At least one special character (`!@#$%^&*` etc.)

---

## 🏢 Business Information

**eyeStudio Optical Store**
- 📍 GF/3, Shyamal Sapphire, Beside HP Petrol Pump, Vasna Link Road, Gotri, Vadodara, Gujarat 390012
- 📞 +91 87809 39861 · +91 85116 92987 · +91 70167 45471
- 🕐 Mon–Sun: 10:00 AM – 8:00 PM
- 📸 [@eye_studio_optical_store](https://www.instagram.com/eye_studio_optical_store/)

---

## 👨‍💻 Developer

Developed by **Mohib Ali** for eyeStudio Optical Store.

---

## 📄 License

This project is private and proprietary. All rights reserved.
