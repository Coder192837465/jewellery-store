import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './Auth.css';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  const { login, register } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!email.endsWith('@gmail.com')) {
      setError('Please use a @gmail.com email address.');
      return;
    }

    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await register(name, email, password);
      }
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'An error occurred during authentication.');
    }
  };

  return (
    <div className="auth-page container section flex justify-center items-center">
      <div className="auth-card glass flex-col">
        <h1 className="font-serif text-2xl text-center mb-2">
          {isLogin ? 'Welcome Back' : 'Create Account'}
        </h1>
        <p className="text-center text-gray mb-8">
          {isLogin ? 'Sign in to access your Gyani Jewellers account.' : 'Join Gyani Jewellers for an exclusive experience.'}
        </p>

        {error && <div className="text-red-500 mb-4 text-sm" style={{ color: '#d32f2f' }}>{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form flex-col gap-4">
          {!isLogin && (
            <div className="input-group">
              <label htmlFor="name">Full Name</label>
              <input type="text" id="name" placeholder="Enter your full name" value={name} onChange={(e) => setName(e.target.value)} required={!isLogin} />
            </div>
          )}
          <div className="input-group">
            <label htmlFor="email">Email Address</label>
            <input 
              type="email" 
              id="email" 
              placeholder="Enter your @gmail.com email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input 
              type="password" 
              id="password" 
              placeholder="Enter your password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          <button type="submit" className="btn-primary mt-4">
            {isLogin ? 'Sign In' : 'Register'}
          </button>
        </form>

        <div className="text-center mt-6">
          <button 
            type="button"
            className="toggle-auth text-gold"
            onClick={() => { setIsLogin(!isLogin); setError(''); }}
          >
            {isLogin ? "Don't have an account? Register" : "Already have an account? Sign In"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Auth;
