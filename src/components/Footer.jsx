import React from 'react';
import { Link } from 'react-router-dom';
import { Gem, Mail, Phone, MapPin } from 'lucide-react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container footer-content grid">
        <div className="footer-brand flex-col gap-4">
          <Link to="/" className="brand">
            <Gem size={28} className="text-gold" />
            <span className="font-serif">GYANI JEWELLERS</span>
          </Link>
          <p className="text-sm">Elegance and luxury in every piece. Discover our timeless collections crafted with passion and precision.</p>
          <div className="social-links flex gap-4 mt-4">
            <a href="#" aria-label="Location"><MapPin size={20} /></a>
            <a href="#" aria-label="Phone"><Phone size={20} /></a>
            <a href="#" aria-label="Email"><Mail size={20} /></a>
          </div>
        </div>
        
        <div className="footer-links">
          <h4 className="font-serif mb-4">Shop</h4>
          <ul>
            <li><Link to="/products?category=Rings">Rings</Link></li>
            <li><Link to="/products?category=Necklaces">Necklaces</Link></li>
            <li><Link to="/products?category=Bracelets">Bracelets</Link></li>
            <li><Link to="/products?category=Earrings">Earrings</Link></li>
          </ul>
        </div>
        
        <div className="footer-links">
          <h4 className="font-serif mb-4">Customer Care</h4>
          <ul>
            <li><a href="#">Contact Us</a></li>
            <li><a href="#">Shipping & Returns</a></li>
            <li><a href="#">Jewelry Care</a></li>
            <li><a href="#">FAQ</a></li>
          </ul>
        </div>
        
        <div className="footer-newsletter">
          <h4 className="font-serif mb-4">Newsletter</h4>
          <p className="text-sm mb-4">Subscribe to receive updates, access to exclusive deals, and more.</p>
          <form className="newsletter-form flex">
            <input type="email" placeholder="Enter your email address" aria-label="Email Address" required />
            <button type="submit" className="btn-primary">Subscribe</button>
          </form>
        </div>
      </div>
      <div className="footer-bottom container text-center text-sm">
        <p>&copy; {new Date().getFullYear()} Gyani Jewellers. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
