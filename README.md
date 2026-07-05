# POS System - Web Based

A modern Point of Sale system inspired by Loyverse, built with Node.js + React + SQLite.

## Features

- **Sales & Checkout** - Process transactions and print receipts
- **Inventory Management** - Track products and stock levels
- **Customer Management** - Store customer information and loyalty points
- **Reporting & Analytics** - Sales reports and analytics
- **Multi-user Support** - Staff login and role management
- **Barcode Scanning** - Product lookup via barcode
- **Responsive Design** - Works on desktop, tablet, and mobile browsers
- **Offline Support** (PWA) - Works offline, syncs when online

## Tech Stack

- **Frontend:** React, Tailwind CSS, Axios
- **Backend:** Node.js, Express, SQLite3
- **Database:** SQLite
- **Authentication:** JWT

## Quick Start

### Backend Setup
```bash
cd backend
npm install
npm run dev
```

Backend runs on `http://localhost:5000`

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`

## API Endpoints

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/products` - Get all products
- `POST /api/sales` - Create new sale
- `GET /api/customers` - Get all customers
- `GET /api/reports/daily-summary` - Today's stats

## License

MIT
