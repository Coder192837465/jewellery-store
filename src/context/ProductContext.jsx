import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const ProductContext = createContext();

export const ProductProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  
  // Calculate categories dynamically based on what products exist
  // We use a Set to ensure categories are unique.
  const categories = ["All", ...new Set(products.map(p => p.category))];

  const fetchProducts = async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      if (filters.category) params.append('category', filters.category);
      if (filters.q) params.append('q', filters.q);
      if (filters.sort) params.append('sort', filters.sort);
      if (filters.minPrice) params.append('minPrice', filters.minPrice);
      if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);

      const response = await axios.get(`/api/products?${params.toString()}`);
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const addProduct = async (newProduct) => {
    try {
      await axios.post('/api/products', newProduct);
      fetchProducts();
    } catch (error) {
      console.error('Error adding product:', error);
    }
  };

  const updateProduct = async (id, updatedFields) => {
    try {
      await axios.put(`/api/products/${id}`, updatedFields);
      fetchProducts();
    } catch (error) {
      console.error('Error updating product:', error);
    }
  };

  const deleteProduct = async (id) => {
    try {
      console.log('Attempting to delete product with ID:', id);
      const response = await axios.delete(`/api/products/${id}`);
      console.log('Delete response:', response.data);
      fetchProducts();
    } catch (error) {
      console.error('Error deleting product:', error.response?.data || error.message);
    }
  };

  return (
    <ProductContext.Provider value={{ products, categories, addProduct, updateProduct, deleteProduct, refreshProducts: fetchProducts }}>
      {children}
    </ProductContext.Provider>
  );
};
