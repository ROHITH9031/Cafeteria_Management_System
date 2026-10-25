import { test } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import mongoose from 'mongoose';
import app from '../src/app.js';
import MenuItem from '../src/models/MenuItem.js';
import Order from '../src/models/Order.js';
import User from '../src/models/User.js';
import { createToken, hashPassword } from '../src/utils/auth.js';

test('order, stock, pagination, and authorization integration', { skip: !process.env.MONGODB_TEST_URI }, async () => {
  await mongoose.connect(process.env.MONGODB_TEST_URI);
  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const baseUrl = `http://127.0.0.1:${server.address().port}/api`;

  try {
    await Promise.all([MenuItem.deleteMany({}), Order.deleteMany({}), User.deleteMany({})]);
    const passwordHash = await hashPassword('IntegrationTestPassword123!');
    const customer = await User.create({ name: 'Test Customer', email: 'customer-integration@example.test', passwordHash });
    const admin = await User.create({ name: 'Test Admin', email: 'admin-integration@example.test', passwordHash, role: 'admin' });
    const customerToken = createToken(customer);
    const adminToken = createToken(admin);
    await MenuItem.create({
      itemId: 'integration-meal', name: 'Integration Meal', description: 'Test menu item', price: 75,
      category: 'Meals & Curry', image: '/test.jpg', preparationTime: 10, stock: 30, dietaryTags: ['Vegetarian'],
    });
    const headers = { 'Content-Type': 'application/json' };
    const request = (path, options = {}) => globalThis.fetch(`${baseUrl}${path}`, { ...options, headers: { ...headers, ...(options.headers || {}) } });

    const quote = await request('/orders/quote', { method: 'POST', body: JSON.stringify({ items: [{ id: 'integration-meal', quantity: 2 }] }) });
    assert.equal(quote.status, 200);
    assert.equal((await quote.json()).totalAmount, 150);
    const shortQuote = await request('/orders/quote', { method: 'POST', body: JSON.stringify({ items: [{ id: 'integration-meal', quantity: 31 }] }) });
    assert.equal(shortQuote.status, 409);

    const orderResponse = await request('/orders', {
      method: 'POST', headers: { Authorization: `Bearer ${customerToken}` },
      body: JSON.stringify({ customerName: 'Test Customer', contactInfo: '9876543210', items: [{ id: 'integration-meal', quantity: 2 }] }),
    });
    assert.equal(orderResponse.status, 201);
    const created = (await orderResponse.json()).order;
    assert.equal(created.totalAmount, 150);
    assert.equal((await MenuItem.findOne({ itemId: 'integration-meal' })).stock, 28);

    const customerLogin = await request('/auth/login', { method: 'POST', body: JSON.stringify({ email: admin.email, password: 'IntegrationTestPassword123!' }) });
    assert.equal(customerLogin.status, 401);
    const adminLogin = await request('/auth/admin/login', { method: 'POST', body: JSON.stringify({ email: admin.email, password: 'IntegrationTestPassword123!' }) });
    assert.equal(adminLogin.status, 200);
    const crossRoleLogin = await request('/auth/admin/login', { method: 'POST', body: JSON.stringify({ email: customer.email, password: 'IntegrationTestPassword123!' }) });
    assert.equal(crossRoleLogin.status, 401);
    const registration = await request('/auth/register', { method: 'POST', body: JSON.stringify({ name: 'No Admin', email: 'register-integration@example.test', password: 'CustomerPassword123!', role: 'admin' }) });
    assert.equal(registration.status, 201);
    assert.equal((await User.findOne({ email: 'register-integration@example.test' })).role, 'customer');

    const raceResponse = await request('/orders', {
      method: 'POST', headers: { Authorization: `Bearer ${customerToken}` },
      body: JSON.stringify({ customerName: 'Test Customer', contactInfo: '9876543210', items: [{ id: 'integration-meal', quantity: 3 }] }),
    });
    assert.equal(raceResponse.status, 201);
    const raceOrder = (await raceResponse.json()).order;
    const otherCustomer = await User.create({ name: 'Other Customer', email: 'other-integration@example.test', passwordHash });
    const forbiddenCancel = await request(`/orders/${raceOrder._id}/cancel`, { method: 'PATCH', headers: { Authorization: `Bearer ${createToken(otherCustomer)}` } });
    assert.equal(forbiddenCancel.status, 403);
    const cancellations = await Promise.all([
      request(`/orders/${raceOrder._id}/cancel`, { method: 'PATCH', headers: { Authorization: `Bearer ${customerToken}` } }),
      request(`/orders/${raceOrder._id}/cancel`, { method: 'PATCH', headers: { Authorization: `Bearer ${customerToken}` } }),
    ]);
    assert.deepEqual(cancellations.map((response) => response.status).sort(), [200, 400]);
    assert.equal((await MenuItem.findOne({ itemId: 'integration-meal' })).stock, 28);

    for (let index = 0; index < 3; index += 1) {
      const response = await request('/orders', {
        method: 'POST', body: JSON.stringify({ customerName: `Page Customer ${index}`, contactInfo: '9876543210', items: [{ id: 'integration-meal', quantity: 1 }] }),
      });
      assert.equal(response.status, 201);
    }
    const unauthorized = await request('/orders');
    assert.equal(unauthorized.status, 401);
    const forbidden = await request('/orders', { headers: { Authorization: `Bearer ${customerToken}` } });
    assert.equal(forbidden.status, 403);
    const firstPageResponse = await request('/orders?limit=2', { headers: { Authorization: `Bearer ${adminToken}` } });
    const firstPage = await firstPageResponse.json();
    assert.equal(firstPage.orders.length, 2);
    assert.ok(firstPage.totalCount >= 4);
    assert.ok(firstPage.activeCount >= 1);
    const filteredResponse = await request(`/orders?limit=2&status=Pending&q=${encodeURIComponent('Page Customer')}`, { headers: { Authorization: `Bearer ${adminToken}` } });
    const filtered = await filteredResponse.json();
    assert.equal(filtered.totalCount, 3);
    assert.equal(filtered.activeCount, 3);
    const secondPageResponse = await request(`/orders?limit=2&cursor=${encodeURIComponent(firstPage.nextCursor)}`, { headers: { Authorization: `Bearer ${adminToken}` } });
    const secondPage = await secondPageResponse.json();
    assert.equal(secondPage.orders.length, 2);
    assert.equal(firstPage.orders.some((order) => secondPage.orders.some((second) => second._id === order._id)), false);
  } finally {
    server.closeAllConnections?.();
    await new Promise((resolve) => server.close(resolve));
    await Promise.all([MenuItem.deleteMany({}), Order.deleteMany({}), User.deleteMany({})]);
    await mongoose.disconnect();
  }
});
