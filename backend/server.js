const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
require('dotenv').config();
const { sequelize, User, Product, CartItem, Order, OrderItem, Op } = require('./database');

const app = express();
app.use(cors());
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';

// Middleware to verify JWT
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') return res.sendStatus(403);
  next();
};

// --- AUTH ROUTES ---

app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    // Basic Validation
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }
    if (!email.endsWith('@gmail.com')) {
      return res.status(400).json({ error: 'Only @gmail.com emails are allowed' });
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const user = await User.create({ name, email, password });
    
    const token = jwt.sign({ id: user.id, email: user.email, name: user.name, role: user.role }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    if (!email.endsWith('@gmail.com')) {
      return res.status(400).json({ error: 'Only @gmail.com emails are allowed' });
    }

    const user = await User.findOne({ where: { email } });
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign({ id: user.id, email: user.email, name: user.name, role: user.role }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- ADMIN ROUTES ---

app.get('/api/users', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ['id', 'name', 'email', 'role', 'createdAt']
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- PRODUCT ROUTES ---

app.get('/api/products', async (req, res) => {
  try {
    const { category, q, minPrice, maxPrice, sort } = req.query;
    let where = {};

    if (category && category !== 'All') {
      where.category = category;
    }

    if (q) {
      where.name = { [Op.like]: `%${q}%` };
    }

    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price[Op.gte] = parseInt(minPrice);
      if (maxPrice) where.price[Op.lte] = parseInt(maxPrice);
    }

    let order = [['createdAt', 'DESC']];
    if (sort === 'price_asc') order = [['price', 'ASC']];
    if (sort === 'price_desc') order = [['price', 'DESC']];
    if (sort === 'rating') order = [['rating', 'DESC']];

    const products = await Product.findAll({ where, order });
    res.json(products);
  } catch (error) {
    console.error('Error in GET /api/products:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/products', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { name, price, category, image, stock } = req.body;
    
    // Validation
    if (!name || !price || !category || !image) {
      return res.status(400).json({ error: 'Name, price, category, and image are required' });
    }
    if (isNaN(price) || price <= 0) {
      return res.status(400).json({ error: 'Price must be a positive number' });
    }
    if (stock !== undefined && (isNaN(stock) || stock < 0)) {
      return res.status(400).json({ error: 'Stock cannot be negative' });
    }

    const product = await Product.create(req.body);
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/products/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    await product.update(req.body);
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/products/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    await product.destroy();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- CART ROUTES ---

app.get('/api/cart', authenticateToken, async (req, res) => {
  try {
    const cartItems = await CartItem.findAll({
      where: { userId: req.user.id }
    });
    res.json(cartItems);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/cart', authenticateToken, async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    let cartItem = await CartItem.findOne({
      where: { userId: req.user.id, productId }
    });

    if (cartItem) {
      cartItem.quantity += quantity;
      await cartItem.save();
    } else {
      cartItem = await CartItem.create({ userId: req.user.id, productId, quantity });
    }
    res.json(cartItem);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/cart/:productId', authenticateToken, async (req, res) => {
  try {
    const { quantity } = req.body;
    const cartItem = await CartItem.findOne({
      where: { userId: req.user.id, productId: req.params.productId }
    });
    
    if (!cartItem) return res.status(404).json({ error: 'Not in cart' });
    
    cartItem.quantity = quantity;
    await cartItem.save();
    res.json(cartItem);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/cart/:productId', authenticateToken, async (req, res) => {
  try {
    await CartItem.destroy({
      where: { userId: req.user.id, productId: req.params.productId }
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- ORDER ROUTES ---

app.post('/api/orders', authenticateToken, async (req, res) => {
  try {
    const cartItems = await CartItem.findAll({
      where: { userId: req.user.id }
    });

    if (cartItems.length === 0) {
      return res.status(400).json({ error: 'Cart is empty' });
    }

    let totalAmount = 0;
    const orderItemsData = [];

    for (let item of cartItems) {
      const product = await Product.findByPk(item.productId);
      if (product) {
        totalAmount += product.price * item.quantity;
        orderItemsData.push({
          productName: product.name,
          price: product.price,
          quantity: item.quantity,
          image: product.image
        });
      }
    }

    const order = await Order.create({
      userId: req.user.id,
      totalAmount
    });

    for (let itemData of orderItemsData) {
      await OrderItem.create({
        ...itemData,
        orderId: order.id
      });
    }

    // Clear the cart
    await CartItem.destroy({ where: { userId: req.user.id } });

    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/orders', authenticateToken, async (req, res) => {
  try {
    const orders = await Order.findAll({
      where: { userId: req.user.id },
      include: [OrderItem],
      order: [['createdAt', 'DESC']]
    });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/admin/orders', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const orders = await Order.findAll({
      include: [OrderItem, { model: User, attributes: ['name', 'email'] }],
      order: [['createdAt', 'DESC']]
    });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/admin/orders/:id/status', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findByPk(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    order.status = status;
    await order.save();
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Initialize database and start server
const PORT = process.env.PORT || 5000;
sequelize.sync({ force: false }).then(async () => {
  console.log('Database synced');
  
  // Create admin if not exists
  const admin = await User.findOne({ where: { email: 'admin@gmail.com' } });
  if (!admin) {
    await User.create({
      name: 'Admin User',
      email: 'admin@gmail.com',
      password: 'admin',
      role: 'admin'
    });
    console.log('Admin user created: admin@gmail.com / admin');
  }

  // Create default products if DB is empty
  const count = await Product.count();
  if (count === 0) {
    await Product.bulkCreate([
      {
        name: "Solitaire Diamond Ring",
        price: 450000,
        category: "Rings",
        image: "/src/assets/diamond_ring_1777202452831.png",
        rating: 4.9,
        stock: 5,
        description: "A stunning 1-carat solitaire diamond ring set in 18k solid gold."
      },
      {
        name: "Emerald Pendant Necklace",
        price: 360000,
        category: "Necklaces",
        image: "/src/assets/emerald_necklace_1777202524362.png",
        rating: 4.7,
        stock: 3,
        description: "Elegant emerald pendant surrounded by a halo of small diamonds."
      },
      {
        name: "Diamond Tennis Bracelet",
        price: 540000,
        category: "Bracelets",
        image: "/src/assets/tennis_bracelet_1777202594287.png",
        rating: 4.8,
        stock: 2,
        description: "Classic diamond tennis bracelet featuring 3 carats of brilliant-cut diamonds."
      },
      {
        name: "Gold Drop Earrings",
        price: 155000,
        category: "Earrings",
        image: "/src/assets/gold_earrings_1777202670326.png",
        rating: 4.6,
        stock: 10,
        description: "Sophisticated 18k gold drop earrings accented with subtle diamond detailing."
      }
    ]);
  }

  if (process.env.NODE_ENV !== 'test') {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  }
});

module.exports = app;
