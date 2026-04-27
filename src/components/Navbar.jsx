import React, { useContext, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingBag, Search, User, Gem, LogOut, Shield } from 'lucide-react';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { getCartCount } = useContext(CartContext);
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  React.useEffect(() => {
    const params = new URLSearchParams(location.search);
    const search = params.get('search');
    if (search) {
      setSearchQuery(search);
      setIsSearchOpen(true);
    }
  }, [location.search]);

  const handleAuthClick = () => {
    if (user) {
      logout();
    } else {
      navigate('/login');
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setIsSearchOpen(false);
    }
  };

  const isAdmin = user && user.role === 'admin';

  return (
    <nav className="navbar glass">
      <div className="container navbar-content">
        <Link to="/" className="brand">
          <Gem size={28} className="text-gold" />
          <span className="font-serif">GYANI JEWELLERS</span>
        </Link>
        
        <div className="nav-links flex items-center">
          <Link to="/">Home</Link>
          <Link to="/products">Collections</Link>
          {isAdmin && (
            <Link to="/admin" className="text-gold flex items-center gap-1">
              <Shield size={16}/> Admin
            </Link>
          )}
        </div>

        <div className="nav-actions flex items-center gap-4">
          {isSearchOpen ? (
            <form onSubmit={handleSearchSubmit} className="search-form flex items-center">
              <input 
                type="text" 
                placeholder="Search jewelry..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
                className="search-input"
              />
              <button type="button" onClick={() => setIsSearchOpen(false)} className="close-search">&times;</button>
            </form>
          ) : (
            <button aria-label="Search" className="icon-btn" onClick={() => setIsSearchOpen(true)}>
              <Search size={22} />
            </button>
          )}
          
          <button 
            aria-label={user ? "Sign Out" : "Sign In"} 
            className="icon-btn flex items-center gap-2"
            onClick={handleAuthClick}
            title={user ? `Signed in as ${user.name}` : "Sign In"}
          >
            {user ? <LogOut size={22} /> : <User size={22} />}
          </button>

          <Link to="/cart" className="cart-btn" aria-label="Cart">
            <ShoppingBag size={22} />
            {getCartCount() > 0 && (
              <span className="cart-badge">{getCartCount()}</span>
            )}
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
