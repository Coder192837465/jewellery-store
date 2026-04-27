import React, { useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, ArrowLeft } from 'lucide-react';
import { CartContext } from '../context/CartContext';
import { ProductContext } from '../context/ProductContext';
import './ProductDetails.css';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, cartItems } = useContext(CartContext);
  const { products } = useContext(ProductContext);
  const [quantity, setQuantity] = useState(1);
  const [toast, setToast] = useState(false);

  const product = products.find(p => p.id === parseInt(id));

  if (!product) {
    return (
      <div className="container section text-center py-20 flex-col items-center justify-center">
        <h2 className="font-serif text-2xl mb-4">Product Not Found</h2>
        <p className="text-gray mb-8">The product you are looking for may have been removed or is currently unavailable.</p>
        <button onClick={() => navigate('/products')} className="btn-primary">Return to Shop</button>
      </div>
    );
  }

  const itemInCart = cartItems.find(item => item.id === product.id);
  const qtyInCart = itemInCart ? itemInCart.quantity : 0;
  
  const remainingStock = product.stock - qtyInCart;
  const isOutOfStock = product.stock === 0;

  const handleAddToCart = () => {
    if (quantity <= remainingStock) {
      addToCart(product, quantity);
      setToast(true);
      setTimeout(() => setToast(false), 3000);
      setQuantity(1);
    } else {
      alert(`Sorry, you can only add ${remainingStock} more of this item.`);
    }
  };

  return (
    <div className="product-details-page container section">
      <button onClick={() => navigate(-1)} className="back-btn mb-8 flex items-center gap-4">
        <ArrowLeft size={20} /> Back
      </button>

      <div className="details-grid grid">
        <div className="details-image-container glass" style={{ opacity: isOutOfStock ? 0.5 : 1 }}>
          <img src={product.image} alt={product.name} className="details-image" style={{ filter: isOutOfStock ? 'grayscale(100%)' : 'none' }} onError={(e) => { e.target.src = 'https://via.placeholder.com/600x600?text=No+Image'; }} />
        </div>

        <div className="details-info flex-col">
          <p className="text-gray text-sm uppercase mb-4">{product.category}</p>
          <h1 className="font-serif text-xl mb-4">{product.name}</h1>
          
          <div className="flex items-center gap-4 mb-4">
            <div className="flex text-gold">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={16} fill={i < Math.floor(product.rating) ? 'currentColor' : 'none'} />
              ))}
            </div>
            <span className="text-sm text-gray">({product.rating} Reviews)</span>
          </div>

          <p className="details-price mb-8">Rs. {product.price.toLocaleString()}</p>
          <p className="details-description mb-8">{product.description}</p>
          
          <p className="mb-4 text-sm font-medium" style={{ color: isOutOfStock ? '#d32f2f' : 'inherit' }}>
            {isOutOfStock ? 'Currently out of stock.' : `${product.stock} in stock`}
          </p>

          <div className="purchase-actions flex gap-4">
            <div className="quantity-selector flex items-center">
              <button 
                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                aria-label="Decrease quantity"
                disabled={isOutOfStock || remainingStock === 0}
              >-</button>
              <span>{isOutOfStock || remainingStock === 0 ? 0 : quantity}</span>
              <button 
                onClick={() => setQuantity(q => Math.min(remainingStock, q + 1))}
                aria-label="Increase quantity"
                disabled={isOutOfStock || quantity >= remainingStock}
              >+</button>
            </div>
            <button 
              className="btn-primary flex-grow" 
              onClick={handleAddToCart}
              disabled={isOutOfStock || remainingStock === 0}
              style={{ opacity: (isOutOfStock || remainingStock === 0) ? 0.5 : 1, cursor: (isOutOfStock || remainingStock === 0) ? 'not-allowed' : 'pointer' }}
            >
              {isOutOfStock ? 'Out of Stock' : (remainingStock === 0 ? 'Max Allowed in Cart' : 'Add to Cart')}
            </button>
          </div>
        </div>
      </div>

      {toast && (
        <div className="toast">
          Added {quantity} {product.name} to your cart.
        </div>
      )}
    </div>
  );
};

export default ProductDetails;
