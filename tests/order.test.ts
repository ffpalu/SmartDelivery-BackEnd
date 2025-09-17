import request from 'supertest';
import app from '../src/app';
import './setup';

describe('Orders', () => {
  let customerToken: string;
  let courierToken: string;
  let adminToken: string;

  const testCustomer = {
    email: 'customer@test.com',
    password: 'Password123',
    firstName: 'Test',
    lastName: 'Customer',
    role: 'customer'
  };

  const testCourier = {
    email: 'courier@test.com',
    password: 'Password123',
    firstName: 'Test',
    lastName: 'Courier',
    role: 'courier'
  };

  const testAdmin = {
    email: 'admin@test.com',
    password: 'Password123',
    firstName: 'Test',
    lastName: 'Admin',
    role: 'admin'
  };

  const testOrder = {
    pickupAddress: 'Via Milano 10, Milano',
    deliveryAddress: 'Via Roma 20, Milano',
    description: 'Test order',
    estimatedPrice: 15.50
  };

  beforeEach(async () => {
    // Register users
    await request(app).post('/api/v1/auth/register').send(testCustomer);
    await request(app).post('/api/v1/auth/register').send(testCourier);
    await request(app).post('/api/v1/auth/register').send(testAdmin);

    // Get tokens
    const customerLogin = await request(app)
			.post('/api/v1/auth/login')
			.send({ email: testCustomer.email, password: testCustomer.password });

		console.log('Customer login response:', customerLogin.body);
		if (!customerLogin.body.data) {
			console.log('Login failed for customer');
			return;
		}
		customerToken = customerLogin.body.data.token;

    const courierLogin = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: testCourier.email, password: testCourier.password });
    courierToken = courierLogin.body.data.token;

    const adminLogin = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: testAdmin.email, password: testAdmin.password });
    adminToken = adminLogin.body.data.token;
  });

  describe('POST /api/v1/orders', () => {
    it('should create order as customer', async () => {
      const response = await request(app)
        .post('/api/v1/orders')
        .set('Authorization', `Bearer ${customerToken}`)
        .send(testOrder);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('pending');
    });

    it('should fail without auth', async () => {
      const response = await request(app)
        .post('/api/v1/orders')
        .send(testOrder);

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/v1/orders', () => {
    beforeEach(async () => {
      await request(app)
        .post('/api/v1/orders')
        .set('Authorization', `Bearer ${customerToken}`)
        .send(testOrder);
    });

    it('should get orders for customer', async () => {
      const response = await request(app)
        .get('/api/v1/orders')
        .set('Authorization', `Bearer ${customerToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.data).toHaveLength(1);
    });
  });

  describe('PUT /api/v1/orders/:id', () => {
    let orderId: number;

    beforeEach(async () => {
      const orderRes = await request(app)
        .post('/api/v1/orders')
        .set('Authorization', `Bearer ${customerToken}`)
        .send(testOrder);
      orderId = orderRes.body.data.id;

      // Assign courier to order
      await request(app)
        .put(`/api/v1/orders/${orderId}/assign`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ courierId: 2 }); // Courier user ID is 2
    });

    it('should update order status as courier', async () => {
      const response = await request(app)
        .put(`/api/v1/orders/${orderId}`)
        .set('Authorization', `Bearer ${courierToken}`)
        .send({ status: 'in_transit' });

      expect(response.status).toBe(200);
      expect(response.body.data.status).toBe('in_transit');
    });
  });
});