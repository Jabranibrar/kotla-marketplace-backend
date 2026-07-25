cat > README.md << 'EOF'

# Kotla Marketplace Backend API

A professional e-commerce marketplace platform API built with Node.js and MongoDB.

## Quick Start

```bash
npm install
npm run dev
```

Server runs on `http://localhost:5000`

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB
- **Authentication:** JWT
- **Utilities:** Bcryptjs, Mongoose, CORS

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Products

- `GET /api/products` - Get all products
- `POST /api/products` - Add new product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

### Orders

- `POST /api/orders` - Create order
- `GET /api/orders/user/:id` - Get user orders

### Seller Stats

- `GET /api/seller/stats/:id` - Get seller statistics

## Environment Variables

Create `.env` file:
