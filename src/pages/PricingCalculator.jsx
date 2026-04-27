import React, { useContext } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import JewelryCalculator from '../components/JewelryCalculator';

const PricingCalculator = () => {
  const { user } = useContext(AuthContext);

  if (!user || user.role !== 'admin') {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="container section">
      <div className="flex items-center gap-4 mb-6">
        <Link to="/admin" className="btn-outline" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
          ← Back to Dashboard
        </Link>
        <p className="text-gray" style={{ fontSize: '0.85rem' }}>Admin Only</p>
      </div>
      <JewelryCalculator />
    </div>
  );
};

export default PricingCalculator;
