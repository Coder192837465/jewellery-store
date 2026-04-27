import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from './AuthContext';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const { user } = useContext(AuthContext);

  const fetchCart = async () => {
    if (!user) {
      setCartItems([]);
      return;
    }
    try {
      const response = await axios.get('/api/cart');
      const items = response.data.map(item => ({
        cartItemId: item.id,
        id: item.productId,
        quantity: item.quantity
      }));
      setCartItems(items);
    } catch (error) {
      console.error('Error fetching cart:', error);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [user]);

  const addToCart = async (product, quantity = 1) => {
    if (!user) {
      alert("Please log in to add items to your cart.");
      return;
    }
    try {
      await axios.post('/api/cart', { productId: product.id, quantity });
      fetchCart();
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  const removeFromCart = async (productId) => {
    if (!user) return;
    try {
      await axios.delete(`/api/cart/${productId}`);
      fetchCart();
    } catch (error) {
      console.error('Error removing from cart:', error);
    }
  };

  const updateQuantity = async (productId, newQuantity) => {
    if (!user) return;
    if (newQuantity < 1) {
      removeFromCart(productId);
      return;
    }
    try {
      await axios.put(`/api/cart/${productId}`, { quantity: newQuantity });
      fetchCart();
    } catch (error) {
      console.error('Error updating quantity:', error);
    }
  };

  const getCartCount = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, updateQuantity, getCartCount }}>
      {children}
    </CartContext.Provider>
  );
};
