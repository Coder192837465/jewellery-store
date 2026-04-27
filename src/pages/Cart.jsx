import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, ShoppingBag, History, AlertTriangle } from 'lucide-react';
import axios from 'axios';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import { ProductContext } from '../context/ProductContext';
import './Cart.css';

const Cart = () => {
  const { cartItems, removeFromCart, updateQuantity, clearCart } = useContext(CartContext);
  const { user } = useContext(AuthContext);
  const { products } = useContext(ProductContext);
  const navigate = useNavigate();

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => {
      const product = products.find(p => p.id === item.id);
      return total + (product ? product.price * item.quantity : 0);
    }, 0);
  };

  // Check if every item in the cart has enough stock
  const isCartValid = cartItems.every(item => {
    const product = products.find(p => p.id === item.id);
    return product && product.stock >= item.quantity;
  });

  const handleCheckout = () => {
    if (!user) {
      alert("Please sign in to proceed to checkout.");
      navigate('/login');
      return;
    }

    if (!isCartValid) {
      alert("Some items in your cart are out of stock or exceed available quantity. Please adjust your cart.");
      return;
    }

    let config = {
      "publicKey": "test_public_key_dc74e0fd57cb46cd93832aee0a390234",
      "productIdentity": "1234567890",
      "productName": "Gyani Jewellers Order",
      "productUrl": "http://localhost:5173",
      "paymentPreference": ["KHALTI", "EBANKING", "MOBILE_BANKING", "CONNECT_IPS", "SCT"],
      "eventHandler": {
          async onSuccess (payload) {
              try {
                  await axios.post('/api/orders');
                  clearCart();
                  alert("Payment Successful! Your order has been placed.");
                  navigate('/orders');
              } catch (err) {
                  console.error("Order creation failed", err);
                  alert("Payment was successful but we couldn't create your order record. Please contact support.");
              }
          },
          onError (error) {
              alert("Payment failed or cancelled.");
          },
          onClose () {}
      }
    };

    let checkout = new window.KhaltiCheckout(config);
    const amountInPaisa = getCartTotal() * 100;
    checkout.show({amount: amountInPaisa});
  };

  if (cartItems.length === 0) {
    return (
      <div className="cart-empty container section flex-col items-center justify-center">
        <ShoppingBag size={64} className="text-gray mb-4" />
        <h2 className="font-serif text-xl mb-4">Your cart is empty</h2>
        <p className="text-gray mb-8">Discover our fine jewelry collections.</p>
        <div className="flex gap-4">
          <Link to="/products" className="btn-primary">Continue Shopping</Link>
          <Link to="/orders" className="btn-outline flex items-center gap-2">
            <History size={18} /> View History
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page container section">
      <div className="flex justify-between items-center mb-8">
        <h1 className="font-serif text-2xl">Shopping Cart</h1>
        <Link to="/orders" className="text-gold flex items-center gap-2 font-medium">
          <History size={18} /> Order History
        </Link>
      </div>
      
      <div className="cart-grid grid">
        <div className="cart-items">
          {cartItems.map(item => {
            const productData = products.find(p => p.id === item.id);
            if (!productData) return null;
            const stockLimit = productData.stock;
            const isOutOfStock = stockLimit === 0;
            const isInsufficientStock = stockLimit < item.quantity;

            return (
              <div key={item.id} className={`cart-item flex ${isOutOfStock || isInsufficientStock ? 'invalid-item' : ''}`}>
                <Link to={`/product/${item.id}`} className="cart-item-image-container">
                  <img src={productData.image} alt={productData.name} className="cart-item-image" />
                </Link>
                
                <div className="cart-item-info flex-grow">
                  <div className="flex justify-between">
                    <div>
                      <h3 className="font-serif text-lg"><Link to={`/product/${item.id}`}>{productData.name}</Link></h3>
                      <p className="text-gray text-sm mt-1">{productData.category}</p>
                      
                      {isOutOfStock && (
                        <div className="stock-warning text-red-600 flex items-center gap-1 mt-2 text-sm font-bold" style={{ color: '#d32f2f' }}>
                          <AlertTriangle size={14} /> OUT OF STOCK
                        </div>
                      )}
                      
                      {!isOutOfStock && isInsufficientStock && (
                        <div className="stock-warning text-orange-600 flex items-center gap-1 mt-2 text-sm font-bold" style={{ color: '#ed6c02' }}>
                          <AlertTriangle size={14} /> Only {stockLimit} left in stock
                        </div>
                      )}
                    </div>
                    <p className="text-lg font-medium">Rs. {(productData.price * item.quantity).toLocaleString()}</p>
                  </div>
                  
                  <div className="cart-item-actions flex justify-between items-center mt-4">
                    <div className="quantity-selector flex items-center">
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        aria-label="Decrease quantity"
                      >-</button>
                      <span>{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        aria-label="Increase quantity"
                        disabled={item.quantity >= stockLimit}
                      >+</button>
                    </div>
                    <button 
                      className="remove-btn flex items-center gap-2"
                      onClick={() => removeFromCart(item.id)}
                    >
                      <Trash2 size={16} /> Remove
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="cart-summary bg-soft-beige">
          <h3 className="font-serif text-lg mb-4">Order Summary</h3>
          {!isCartValid && (
            <div className="cart-error mb-4 p-3 bg-red-100 text-red-700 rounded text-sm flex items-start gap-2" style={{ backgroundColor: '#fee2e2', color: '#b91c1c' }}>
              <AlertTriangle size={18} />
              <span>Please remove out-of-stock items or adjust quantities to proceed.</span>
            </div>
          )}
          <div className="summary-row flex justify-between mb-4">
            <span className="text-gray">Subtotal</span>
            <span>Rs. {getCartTotal().toLocaleString()}</span>
          </div>
          <div className="summary-row flex justify-between mb-4">
            <span className="text-gray">Shipping</span>
            <span>Complimentary</span>
          </div>
          <div className="summary-row flex justify-between font-medium text-lg mt-4 pt-4 border-t">
            <span>Total</span>
            <span>Rs. {getCartTotal().toLocaleString()}</span>
          </div>
          
          <button 
            className={`btn-primary checkout-btn w-full mt-8 ${!isCartValid ? 'btn-disabled' : ''}`}
            onClick={handleCheckout}
            disabled={!isCartValid}
            style={!isCartValid ? { backgroundColor: '#cccccc', cursor: 'not-allowed' } : {}}
          >
            Pay with Khalti
          </button>
        </div>
      </div>
    </div>
  );
};

export default Cart;
