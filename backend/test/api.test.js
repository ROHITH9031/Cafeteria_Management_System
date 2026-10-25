import { test } from 'node:test';
import assert from 'node:assert/strict';
import jwt from 'jsonwebtoken';
import { errorHandler, notFound } from '../src/middleware/errors.js';
import { createToken, hashPassword, comparePassword, publicUser } from '../src/utils/auth.js';
import { env } from '../src/config/env.js';

function createMockRes() {
  const res = {
    statusCode: 200,
    headersSent: false,
    locals: { requestId: 'request-test' },
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    },
  };
  return res;
}

test('errorHandler maps CastError to 400 Bad Request', () => {
  const res = createMockRes();
  const castErr = { name: 'CastError', path: '_id', value: 'invalid-id' };
  errorHandler(castErr, {}, res, () => {});

  assert.equal(res.statusCode, 400);
  assert.equal(res.body.message, 'Invalid _id: invalid-id');
});

test('errorHandler maps ValidationError to 400 Bad Request', () => {
  const res = createMockRes();
  const valErr = {
    name: 'ValidationError',
    errors: {
      name: { message: 'Name is required' },
    },
  };
  errorHandler(valErr, {}, res, () => {});

  assert.equal(res.statusCode, 400);
  assert.equal(res.body.message, 'Validation failed');
  assert.deepEqual(res.body.errors, ['Name is required']);
});

test('errorHandler maps code 11000 to 409 Conflict', () => {
  const res = createMockRes();
  const dupErr = { code: 11000 };
  errorHandler(dupErr, {}, res, () => {});

  assert.equal(res.statusCode, 409);
  assert.match(res.body.message, /already exists/);
});

test('errorHandler maps body parser SyntaxError to 400 Bad Request', () => {
  const res = createMockRes();
  const syntaxErr = new SyntaxError('Unexpected token in JSON');
  syntaxErr.status = 400;
  syntaxErr.body = '{"invalidJson":';
  errorHandler(syntaxErr, {}, res, () => {});

  assert.equal(res.statusCode, 400);
  assert.match(res.body.message, /Malformed JSON payload/);
});

test('errorHandler maps JsonWebTokenError to 401 Unauthorized', () => {
  const res = createMockRes();
  const jwtErr = { name: 'JsonWebTokenError', message: 'invalid signature' };
  errorHandler(jwtErr, {}, res, () => {});

  assert.equal(res.statusCode, 401);
  assert.match(res.body.message, /Invalid token/);
});

test('errorHandler maps request body size errors to 413', () => {
  const res = createMockRes();
  errorHandler({ type: 'entity.too.large' }, { method: 'POST', path: '/api/orders' }, res, () => {});

  assert.equal(res.statusCode, 413);
  assert.equal(res.body.error, 'Payload Too Large');
});

test('errorHandler maps rate limit errors to 429', () => {
  const res = createMockRes();
  errorHandler({ statusCode: 429, message: 'Too many requests' }, { method: 'POST', path: '/api/auth/login' }, res, () => {});

  assert.equal(res.statusCode, 429);
  assert.equal(res.body.error, 'Too Many Requests');
});

test('errorHandler does not expose internal error messages', () => {
  const res = createMockRes();
  errorHandler(new Error('database password leaked'), { method: 'GET', path: '/api/menu' }, res, () => {});

  assert.equal(res.statusCode, 500);
  assert.equal(res.body.message, 'An unexpected error occurred');
  assert.equal(res.body.requestId, 'request-test');
  assert.equal(JSON.stringify(res.body).includes('database password'), false);
});

test('errorHandler delegates errors after response headers were sent', () => {
  const res = createMockRes();
  res.headersSent = true;
  let passedError;
  const error = new Error('late failure');
  errorHandler(error, {}, res, (nextError) => { passedError = nextError; });

  assert.equal(passedError, error);
});

test('notFound returns 404 with route description', () => {
  const res = createMockRes();
  notFound({ method: 'GET', path: '/api/test-route', originalUrl: '/api/test-route?private=value' }, res);

  assert.equal(res.statusCode, 404);
  assert.match(res.body.message, /Route not found: GET \/api\/test-route/);
  assert.equal(res.body.message.includes('private=value'), false);
});

test('hashPassword and comparePassword work correctly', async () => {
  const password = 'SuperSecretPassword123';
  const hashed = await hashPassword(password);
  assert.notEqual(hashed, password);

  const isMatch = await comparePassword(password, hashed);
  assert.equal(isMatch, true);

  const isWrong = await comparePassword('wrongPassword', hashed);
  assert.equal(isWrong, false);
});

test('createToken signs valid JWT token with user claims', () => {
  const mockUser = {
    _id: '660c1234567890abcdef1234',
    role: 'customer',
    email: 'student@srkr.edu.in',
  };

  const token = createToken(mockUser);
  assert.ok(typeof token === 'string' && token.length > 20);

  const decoded = jwt.verify(token, env.jwtSecret);
  assert.equal(decoded.sub, mockUser._id);
  assert.equal(decoded.role, mockUser.role);
  assert.equal(decoded.email, mockUser.email);
});

test('publicUser removes sensitive fields like passwordHash', () => {
  const user = {
    _id: 'user123',
    name: 'Student Name',
    email: 'student@srkr.edu.in',
    role: 'customer',
    studentId: '22B01A0501',
    contactInfo: '9876543210',
    passwordHash: 'hashed_secret_value',
  };

  const pub = publicUser(user);
  assert.equal(pub.id, user._id);
  assert.equal(pub.name, user.name);
  assert.equal(pub.email, user.email);
  assert.equal(pub.passwordHash, undefined);
});

