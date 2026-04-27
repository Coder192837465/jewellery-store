import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import './OrderHistory.css';

const OrderHistory = () => {
  const { user } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axios.get('/api/orders');
        setOrders(response.data);
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchOrders();
    }
  }, [user]);

  if (loading) return <div className="container section text-center">Loading history...</div>;

  return (
    <div className="order-history container section">
      <h1 className="font-serif text-2xl mb-8">Order History</h1>
      
      {orders.length === 0 ? (
        <div className="text-center py-12 bg-soft-beige">
          <p className="text-gray">You haven't placed any orders yet.</p>
        </div>
      ) : (
        <div className="orders-list flex-col gap-8">
          {orders.map(order => (
            <div key={order.id} className="order-card glass p-6">
              <div className="order-header flex justify-between items-center mb-4 border-b pb-4">
                <div>
                  <p className="text-sm text-gray">Order ID: #{order.id}</p>
                  <p className="text-sm text-gray">Placed on: {new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">Total: Rs. {order.totalAmount.toLocaleString()}</p>
                  <span className="status-badge bg-gold text-white text-xs px-2 py-1 rounded">
                    {order.status}
                  </span>
                </div>
              </div>
              
              <div className="order-items flex-col gap-4">
                {order.OrderItems.map(item => (
                  <div key={item.id} className="order-item flex items-center gap-4">
                    <img src={item.image} alt={item.productName} className="order-item-img" />
                    <div className="flex-grow">
                      <h4 className="font-serif">{item.productName}</h4>
                      <p className="text-sm text-gray">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-medium">Rs. {(item.price * item.quantity).toLocaleString()}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrderHistory;
