import React, { useState, useEffect, useContext } from 'react';
import { useLocation } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { ProductContext } from '../context/ProductContext';
import './ProductListing.css';

const ProductListing = () => {
  const { products, categories, refreshProducts } = useContext(ProductContext);
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialCategory = queryParams.get('category') || 'All';
  const searchQuery = queryParams.get('search') || '';

  const [categoryFilter, setCategoryFilter] = useState(initialCategory);
  const [sortOrder, setSortOrder] = useState('featured');
  const [loading, setLoading] = useState(false);

  // Sync category filter with URL if it changes
  useEffect(() => {
    setCategoryFilter(initialCategory);
  }, [initialCategory]);

  // Fetch products from server when filters change
  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      await refreshProducts({
        category: categoryFilter,
        q: searchQuery,
        sort: sortOrder === 'price-low' ? 'price_asc' : 
              sortOrder === 'price-high' ? 'price_desc' : 
              sortOrder === 'rating' ? 'rating' : undefined
      });
      setLoading(false);
    };
    loadProducts();
  }, [categoryFilter, sortOrder, searchQuery]);

  return (
    <div className="product-listing container section">
      <div className="listing-header flex justify-between items-center mb-8">
        <h1 className="font-serif text-xl">
          {searchQuery ? `Search Results for "${searchQuery}"` : 'The Collection'}
        </h1>
        <div className="filters flex gap-4">
          <select 
            value={categoryFilter} 
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="filter-select"
            aria-label="Filter by Category"
          >
            {categories.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <select 
            value={sortOrder} 
            onChange={(e) => setSortOrder(e.target.value)}
            className="filter-select"
            aria-label="Sort Order"
          >
            <option value="featured">Newest</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="rating">Top Rated</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20">
          <div className="loading-spinner"></div>
          <p className="mt-4 text-gray">Refining collection...</p>
        </div>
      ) : (
        <div className="listing-grid grid">
          {products.length > 0 ? (
            products.map(product => (
              <ProductCard key={product.id} product={product} />
            ))
          ) : (
            <p className="text-center col-span-full py-12 text-gray">No products found matching your selection.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default ProductListing;
