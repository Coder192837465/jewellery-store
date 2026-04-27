const request = require('supertest');
const app = require('../server');
const { sequelize, User } = require('../database');

describe('Auth API', () => {
  beforeAll(async () => {
    // Ensure DB is ready
    await sequelize.sync();
  });

  it('should fail to register with invalid email', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Test User',
        email: 'test@invalid.com',
        password: 'password123'
      });
    expect(res.statusCode).toEqual(400);
    expect(res.body.error).toBe('Only @gmail.com emails are allowed');
  });

  it('should fail to register with short password', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Test User',
        email: 'test@gmail.com',
        password: '123'
      });
    expect(res.statusCode).toEqual(400);
    expect(res.body.error).toBe('Password must be at least 6 characters');
  });

  it('should fail to login with non-existent user', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'nonexistent@gmail.com',
        password: 'password123'
      });
    expect(res.statusCode).toEqual(401);
    expect(res.body.error).toBe('Invalid email or password');
  });
});

describe('Product API', () => {
  it('should fetch products with filtering', async () => {
    const res = await request(app).get('/api/products?category=Rings');
    expect(res.statusCode).toEqual(200);
    expect(Array.isArray(res.body)).toBeTruthy();
    res.body.forEach(p => {
      expect(p.category).toBe('Rings');
    });
  });

  it('should search products by name', async () => {
    const res = await request(app).get('/api/products?q=Diamond');
    expect(res.statusCode).toEqual(200);
    expect(res.body.some(p => p.name.includes('Diamond'))).toBeTruthy();
  });
});
