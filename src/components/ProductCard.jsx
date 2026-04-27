import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';
import { CartContext } from '../context/CartContext';
import './ProductCard.css';

const ProductCard = ({ product }) => {
  const { addToCart } = useContext(CartContext);
  const isOutOfStock = product.stock === 0;

  return (
    <div className={`product-card ${isOutOfStock ? 'out-of-stock' : ''}`}>
      <Link to={`/product/${product.id}`} className="product-image-container">
        <img src={product.image} alt={product.name} className="product-image" loading="lazy" onError={(e) => { e.target.src = 'https://via.placeholder.com/300x300?text=No+Image'; }} />
        
        {isOutOfStock && (
          <div className="stock-badge">OUT OF STOCK</div>
        )}

        {!isOutOfStock && (
          <div className="product-overlay">
            <button 
              className="btn-primary add-to-cart-quick"
              onClick={(e) => {
                e.preventDefault();
                addToCart(product);
              }}
            >
              Add to Cart
            </button>
          </div>
        )}
      </Link>
      <div className="product-info">
        <span className="product-category">{product.category}</span>
        <Link to={`/product/${product.id}`}>
          <h3 className="product-name font-serif">{product.name}</h3>
        </Link>
        <div className="product-rating">
          <Star size={14} className="text-gold" fill="currentColor" />
          <span className="text-sm">{product.rating}</span>
        </div>
        <p className="product-price">Rs. {product.price.toLocaleString()}</p>
      </div>
    </div>
  );
};

export default ProductCard;
