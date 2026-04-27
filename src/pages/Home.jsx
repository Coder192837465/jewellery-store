import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { ProductContext } from '../context/ProductContext';
import heroBanner from '../assets/hero_banner_1777202202532.png';
import './Home.css';

const Home = () => {
  const { products, categories } = useContext(ProductContext);
  const featuredProducts = products.slice(0, 4);

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-image-container">
          <img src={heroBanner} alt="Luxury Jewelry Collection" className="hero-image" />
          <div className="hero-overlay"></div>
        </div>
        <div className="hero-content">
          <h1 className="hero-title">Timeless Elegance</h1>
          <p className="hero-subtitle">Discover our exclusive collection of fine jewelry.</p>
          <Link to="/products" className="btn-primary hero-btn">Explore Collection</Link>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="section container">
        <h2 className="section-title">Shop by Category</h2>
        <div className="categories-grid grid">
          {categories.filter(c => c !== "All").map(category => (
            <Link to={`/products?category=${category}`} key={category} className="category-card">
              <div className="category-content flex-col items-center justify-center">
                <h3 className="font-serif">{category}</h3>
                <span className="shop-now">Shop Now</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="section container bg-soft-beige">
        <h2 className="section-title">Featured Pieces</h2>
        <div className="products-grid grid">
          {featuredProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
        <div className="text-center mt-8">
          <Link to="/products" className="btn-outline">View All Jewelry</Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
