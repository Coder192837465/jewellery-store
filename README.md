# 💎 Jewelry E-Commerce & Pricing System

A full-stack jewelry web application built for managing and selling gold and silver items with a real-world pricing engine based on Nepal market standards.

---

## 🚀 Features

- 🛍️ Product browsing (rings, necklaces, bracelets, etc.)
- 🛒 Shopping cart system
- 🔐 Authentication system (admin/user)
- 📦 Order & billing history
- 💰 Real-time jewelry price calculator
- ⚖️ Supports gold/silver pricing with:
  - Daily market rates
  - Purity adjustment (24K, 22K, 18K)
  - Net weight & wastage (jhutti)
  - Making charges (jyala/jalti)
  - Stone & design costs
  - VAT calculation
- 🧾 Admin dashboard for management
- 📱 Responsive UI design

---

## 🧠 Pricing Logic

The system calculates final jewelry price using:

**Final Price =**
Metal Cost + Making Charges + Stone Cost + VAT

Where:
- Metal Cost = (Adjusted Rate × Net Weight) + Wastage
- Making Charges = Per gram or percentage
- VAT = 13% (Nepal standard)

---

## 🛠️ Tech Stack

- React (Vite)
- Context API (State Management)
- JavaScript (ES6+)
- CSS (Custom styling)
- React Router DOM

---

---

## ⚙️ Installation & Setup

# Clone the repository
git clone https://github.com/your-username/jewelry-store.git

# Navigate to project folder
cd jewelry-store

# Install dependencies
npm install

# Start development server
npm run dev

## 📁 Project Structure
