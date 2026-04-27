import React, { useState, useEffect, useContext } from 'react';
import { Navigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Trash2, Shield } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { ProductContext } from '../context/ProductContext';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const { user } = useContext(AuthContext);
  const { products, categories, addProduct, updateProduct, deleteProduct } = useContext(ProductContext);
  const [usersList, setUsersList] = useState([]);
  const [activeTab, setActiveTab] = useState('inventory');
  const [adminUsers, setAdminUsers] = useState([]);
  const [adminOrders, setAdminOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  const [newProduct, setNewProduct] = useState({
    name: '',
    price: '',
    category: 'Rings',
    image: '',
    stock: '',
    description: ''
  });

  const [showCustomCategory, setShowCustomCategory] = useState(false);
  const [customCategory, setCustomCategory] = useState('');

  useEffect(() => {
    if (activeTab === 'users') {
      fetchUsers();
    } else if (activeTab === 'orders') {
      fetchOrders();
    }
  }, [activeTab]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/users');
      setAdminUsers(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/admin/orders');
      setAdminOrders(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await axios.put(`/api/admin/orders/${orderId}/status`, { status: newStatus });
      fetchOrders();
    } catch (err) {
      console.error(err);
      alert('Failed to update status');
    }
  };

  if (!user || user.role !== 'admin') {
    return <Navigate to="/login" replace />;
  }

  const handleAddProduct = (e) => {
    e.preventDefault();
    const finalCategory = showCustomCategory ? customCategory : newProduct.category;
    
    if (newProduct.name && newProduct.price && newProduct.image && newProduct.stock && finalCategory) {
      addProduct({
        ...newProduct,
        category: finalCategory,
        price: Number(newProduct.price),
        stock: Number(newProduct.stock)
      });
      setNewProduct({
        name: '', price: '', category: 'Rings', image: '', stock: '', description: ''
      });
      setCustomCategory('');
      setShowCustomCategory(false);
      alert('Product added successfully!');
    }
  };

  const handleCategoryChange = (e) => {
    if (e.target.value === 'CUSTOM') {
      setShowCustomCategory(true);
      setNewProduct({ ...newProduct, category: '' });
    } else {
      setShowCustomCategory(false);
      setNewProduct({ ...newProduct, category: e.target.value });
    }
  };

  return (
    <div className="admin-dashboard container section">
      <h1 className="font-serif text-2xl mb-8">Admin Dashboard</h1>

      <div className="admin-quick-actions mb-8">
        <Link to="/admin/calculator" className="quick-action-card">
          <span className="quick-action-icon">₨</span>
          <div>
            <strong>Jewelry Pricing Calculator</strong>
            <p>Calculate gold & silver prices in NPR</p>
          </div>
          <span className="quick-action-arrow">→</span>
        </Link>
        <Link to="/admin/bills" className="quick-action-card">
          <span className="quick-action-icon">📄</span>
          <div>
            <strong>Bill History</strong>
            <p>View and manage all saved invoices</p>
          </div>
          <span className="quick-action-arrow">→</span>
        </Link>
      </div>

      <div className="flex gap-4 mb-8">
        <button 
          className={`btn-outline ${activeTab === 'inventory' ? 'bg-black text-white' : ''}`}
          onClick={() => setActiveTab('inventory')}
        >
          Inventory
        </button>
        <button 
          className={`btn-outline ${activeTab === 'users' ? 'bg-black text-white' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          Users
        </button>
        <button 
          className={`btn-outline ${activeTab === 'orders' ? 'bg-black text-white' : ''}`}
          onClick={() => setActiveTab('orders')}
        >
          Customer Orders
        </button>
      </div>

      {activeTab === 'inventory' && (
        <div className="admin-grid grid">
          <div className="admin-inventory">
            <h2 className="font-serif text-xl mb-4">Inventory Management</h2>
            <div className="table-responsive">
              <table className="inventory-table w-full text-left">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Category</th>
                    <th>Price (Rs.)</th>
                    <th>Stock</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map(product => (
                    <tr key={product.id}>
                      <td>
                        <div className="flex items-center gap-2">
                          <img src={product.image} alt={product.name} className="table-img" />
                          <span>{product.name}</span>
                        </div>
                      </td>
                      <td>{product.category}</td>
                      <td>
                        <input 
                          type="number" 
                          value={product.price}
                          onChange={(e) => updateProduct(product.id, { price: Number(e.target.value) })}
                          className="edit-input"
                        />
                      </td>
                      <td>
                        <input 
                          type="number" 
                          value={product.stock}
                          onChange={(e) => updateProduct(product.id, { stock: Number(e.target.value) })}
                          className="edit-input w-20"
                        />
                      </td>
                      <td>
                        <button 
                          className="delete-btn"
                          onClick={() => {
                            if (window.confirm(`Are you sure you want to delete "${product.name}"?`)) {
                              deleteProduct(product.id);
                            }
                          }}
                          aria-label="Delete Product"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="admin-add-product bg-soft-beige">
            <h2 className="font-serif text-xl mb-4">Add New Item</h2>
            <form onSubmit={handleAddProduct} className="flex-col gap-4">
              <div className="input-group">
                <label>Product Name</label>
                <input 
                  type="text" 
                  value={newProduct.name} 
                  onChange={e => setNewProduct({...newProduct, name: e.target.value})} 
                  required 
                />
              </div>
              <div className="input-group">
                <label>Price (Rs.)</label>
                <input 
                  type="number" 
                  value={newProduct.price} 
                  onChange={e => setNewProduct({...newProduct, price: e.target.value})} 
                  required 
                />
              </div>
              <div className="input-group">
                <label>Category</label>
                {!showCustomCategory ? (
                  <select 
                    value={newProduct.category} 
                    onChange={handleCategoryChange}
                    className="edit-input w-full"
                  >
                    {categories.filter(c => c !== "All").map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                    <option value="CUSTOM">+ Create New Category</option>
                  </select>
                ) : (
                  <div className="flex-col gap-2">
                    <input 
                      type="text" 
                      placeholder="Enter new category name"
                      value={customCategory}
                      onChange={e => setCustomCategory(e.target.value)}
                      required
                    />
                    <button 
                      type="button" 
                      onClick={() => setShowCustomCategory(false)}
                      className="text-sm text-gold underline self-start"
                    >
                      Back to existing categories
                    </button>
                  </div>
                )}
              </div>
              <div className="input-group">
                <label>Stock Quantity</label>
                <input 
                  type="number" 
                  value={newProduct.stock} 
                  onChange={e => setNewProduct({...newProduct, stock: e.target.value})} 
                  required 
                />
              </div>
              <div className="input-group">
                <label>Image URL</label>
                <input 
                  type="url" 
                  placeholder="https://example.com/image.png"
                  value={newProduct.image} 
                  onChange={e => setNewProduct({...newProduct, image: e.target.value})} 
                  required 
                />
              </div>
              <div className="input-group">
                <label>Description</label>
                <textarea 
                  value={newProduct.description} 
                  onChange={e => setNewProduct({...newProduct, description: e.target.value})} 
                  required 
                  rows="3"
                  className="edit-input w-full"
                ></textarea>
              </div>
              <button type="submit" className="btn-primary w-full mt-4">Add Product</button>
            </form>
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="admin-users-list">
          <h2 className="font-serif text-xl mb-4">Platform Users</h2>
          <div className="table-responsive">
            <table className="inventory-table w-full text-left">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Joined</th>
                </tr>
              </thead>
              <tbody>
                {adminUsers.map(u => (
                  <tr key={u.id}>
                    <td>{u.name}</td>
                    <td>{u.email}</td>
                    <td><span className={`badge ${u.role}`}>{u.role}</span></td>
                    <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'orders' && (
        <div className="admin-orders-list">
          <h2 className="font-serif text-xl mb-4">Customer Orders</h2>
          {adminOrders.length === 0 ? (
            <p className="text-gray py-8 text-center">No orders placed yet.</p>
          ) : (
            <div className="flex-col gap-6">
              {adminOrders.map(order => (
                <div key={order.id} className="order-admin-card glass p-6 rounded-lg">
                  <div className="flex justify-between items-start mb-4 border-b pb-4">
                    <div>
                      <h3 className="font-bold">Order #{order.id}</h3>
                      <p className="text-sm text-gray">{new Date(order.createdAt).toLocaleString()}</p>
                      <p className="text-sm font-medium mt-1">Customer: {order.User?.name} ({order.User?.email})</p>
                    </div>
                    <div className="flex-col items-end gap-2">
                      <select 
                        value={order.status} 
                        onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                        className={`status-select ${order.status.toLowerCase()}`}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                      <strong className="text-gold text-lg block mt-2">Rs. {order.totalAmount.toLocaleString()}</strong>
                    </div>
                  </div>
                  <div className="order-items-grid">
                    {order.OrderItems.map((item, idx) => (
                      <div key={idx} className="flex gap-4 items-center mb-2 last:mb-0">
                        <img src={item.image} alt={item.productName} className="w-12 h-12 object-cover rounded" />
                        <div className="flex-1">
                          <p className="text-sm font-medium">{item.productName}</p>
                          <p className="text-xs text-gray">Qty: {item.quantity} × Rs. {item.price.toLocaleString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
