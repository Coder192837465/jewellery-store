import React, { useState, useEffect, useContext } from 'react';
import { useLocation, Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { ProductContext } from '../context/ProductContext';
import './ProductListing.css';

const SearchResults = () => {
  const { products, refreshProducts } = useContext(ProductContext);
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const searchQuery = queryParams.get('q') || '';
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const performSearch = async () => {
      if (searchQuery) {
        setLoading(true);
        await refreshProducts({ q: searchQuery });
        setLoading(false);
      }
    };
    performSearch();
  }, [searchQuery]);

  return (
    <div className="search-results-page container section">
      <div className="listing-header mb-8">
        <div className="flex justify-between items-center">
          <h1 className="font-serif text-2xl">
            {searchQuery ? `Search results for "${searchQuery}"` : 'Search'}
          </h1>
          <Link to="/products" className="text-gold hover:underline">View All</Link>
        </div>
        {!loading && <p className="text-gray mt-2">{products.length} results found</p>}
      </div>

      {loading ? (
        <div className="text-center py-20">
          <div className="loading-spinner"></div>
          <p className="mt-4 text-gray">Searching our vault...</p>
        </div>
      ) : products.length > 0 ? (
        <div className="listing-grid grid">
          {products.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-soft-beige rounded">
          <h2 className="font-serif text-xl mb-4">No results found</h2>
          <p className="text-gray mb-8">We couldn't find anything matching your search. Try different keywords or browse our collection.</p>
          <Link to="/products" className="btn-primary">Browse All Products</Link>
        </div>
      )}
    </div>
  );
};

export default SearchResults;
