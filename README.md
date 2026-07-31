# Kotla Marketplace

A full-stack e-commerce marketplace platform built to connect local vendors and buyers with a streamlined shopping and inventory management experience.

## Features

- **Multi-Category Catalog:** Browse and filter products across various categories including apparel, electronics, tools, and beauty.
- **Vendor Management:** Dedicated dashboard for sellers to add, update, and manage product inventory and pricing.
- **Smart Product Descriptions:** Automatic fallback descriptions with custom vendor input overrides.
- **Secure Checkout:** Streamlined Cash on Delivery (COD) order placement with instant validation.
- **Responsive UI:** Clean and modern interface optimized for both desktop and mobile devices.

## Tech Stack

- **Frontend:** React.js, React Hooks, Context API, Custom CSS
- **Backend:** Node.js, Express.js, RESTful APIs
- **Database:** MongoDB, Mongoose ODM

## Project Structure

```text
kotla-app/
├── backend/
│   ├── server.js
│   └── package.json
└── frontend/
    ├── public/
    ├── src/
    └── package.json

Getting Started

Prerequisites

1. Node.js installed on your local machine

2. MongoDB connection string

Installation & Setup

1. Clone the repository:

   git clone [https://github.com/Jabranibrar/kotla-marketplace-backend.git](https://github.com/Jabranibrar/kotla-marketplace-backend.git)
   cd kotla-app

2. Setup and run the backend:

   cd backend
   npm install

  Create a .env file in the backend/ directory:

  PORT=5000
  MONGO_URI=your_mongodb_uri_here

Start the server:

  npm start

3. Setup and run the frontend:
   Open a separate terminal window and run:

  cd frontend
  npm install
  npm start
```
