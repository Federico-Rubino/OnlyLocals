const request = require('supertest');
const app = require('../src/app');

beforeAll(() => jest.spyOn(console, 'error').mockImplementation(() => {}));
afterAll(() => console.error.mockRestore());

jest.mock('../src/services/userService');
jest.mock('../src/models/userModel');

const userService = require('../src/services/userService');
const User = require('../src/models/userModel');


const JWT = require('jsonwebtoken');

function makeToken(userId = 'user123') {
  return JWT.sign({ userId }, process.env.JWT_TOKEN || 'test_secret', { expiresIn: '1h' });
}

// Stub authMiddleware so protected routes receive req.user without a real DB hit
jest.mock('../src/middlewares/authMiddleware', () => ({
  autenticateToken: (req, _res, next) => {
    req.user = { userId: 'user123' };
    next();
  }
}));

// POST /api/users/register

describe('POST /api/users/register', () => {
  const validBody = {
    name: 'Mario',
    surname: 'Rossi',
    email: 'mario@example.com',
    password: 'Password1!',
    bornDate: '1990-01-01',
    username: 'mariorossi'
  };

  test('201 – creates user and returns id + email', async () => {
    userService.createUser.mockResolvedValue({ _id: 'abc', email: validBody.email });

    const res = await request(app).post('/api/users/register').send(validBody);

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ id: 'abc', email: validBody.email });
  });

  test('400 – missing required fields', async () => {
    const res = await request(app).post('/api/users/register').send({ email: 'a@b.com' });
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/missing fields/i);
  });

  test('400 – invalid email format', async () => {
    const res = await request(app)
      .post('/api/users/register')
      .send({ ...validBody, email: 'not-an-email' });
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/invalid email/i);
  });

  test('409 – user already exists', async () => {
    userService.createUser.mockRejectedValue(new Error('User already exists'));

    const res = await request(app).post('/api/users/register').send(validBody);

    expect(res.status).toBe(409);
    expect(res.body.message).toBe('User already exists');
  });

  test('500 – unexpected service error', async () => {
    userService.createUser.mockRejectedValue(new Error('DB down'));

    const res = await request(app).post('/api/users/register').send(validBody);

    expect(res.status).toBe(500);
  });
});

// POST /api/users/login

describe('POST /api/users/login', () => {
  test('201 – returns access and refresh tokens', async () => {
    userService.loginUser.mockResolvedValue({
      accessToken: 'acc',
      refreshToken: 'ref'
    });

    const res = await request(app)
      .post('/api/users/login')
      .send({ identifier: 'mario@example.com', password: 'Password1!' });

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ accessToken: 'acc', refreshToken: 'ref' });
  });

  test('400 – missing identifier', async () => {
    const res = await request(app)
      .post('/api/users/login')
      .send({ password: 'Password1!' });
    expect(res.status).toBe(400);
  });

  test('400 – missing password', async () => {
    const res = await request(app)
      .post('/api/users/login')
      .send({ identifier: 'mario@example.com' });
    expect(res.status).toBe(400);
  });

  test('401 – invalid credentials', async () => {
    userService.loginUser.mockRejectedValue(new Error('Invalid credentials'));

    const res = await request(app)
      .post('/api/users/login')
      .send({ identifier: 'wrong@example.com', password: 'wrong' });

    expect(res.status).toBe(401);
  });
});

// POST /api/users/refreshToken

describe('POST /api/users/refreshToken', () => {
  test('201 – rotates tokens', async () => {
    userService.refreshToken.mockResolvedValue({
      newAccessToken: 'newAcc',
      newRefreshToken: 'newRef'
    });

    const res = await request(app)
      .post('/api/users/refreshToken')
      .send({ oldRefreshToken: 'someToken' });

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ accessToken: 'newAcc', refreshToken: 'newRef' });
  });

  test('401 – missing refresh token', async () => {
    const res = await request(app).post('/api/users/refreshToken').send({});
    expect(res.status).toBe(401);
    expect(res.body.message).toBe('refresh token absent');
  });

  test('401 – revoked or invalid token', async () => {
    userService.refreshToken.mockRejectedValue(
      new Error('Refresh Token not valid or revoked')
    );

    const res = await request(app)
      .post('/api/users/refreshToken')
      .send({ oldRefreshToken: 'badToken' });

    expect(res.status).toBe(401);
  });
});

// POST /api/users/logout

describe('POST /api/users/logout', () => {
  test('200 – logs out successfully', async () => {
    userService.logout.mockResolvedValue(true);

    const res = await request(app)
      .post('/api/users/logout')
      .send({ refreshToken: 'someToken' });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Log out OK');
  });

  test('500 – service throws', async () => {
    userService.logout.mockRejectedValue(new Error('DB error'));

    const res = await request(app)
      .post('/api/users/logout')
      .send({ refreshToken: 'someToken' });

    expect(res.status).toBe(500);
  });
});

// ── POST /api/users/favorites ─────────────────────────────────────────────────

describe('POST /api/users/favorites', () => {
  test('200 – adds shop to favorites', async () => {
    userService.addShopToFavorites.mockResolvedValue(['shop1']);

    const res = await request(app)
      .post('/api/users/favorites')
      .send({ shopId: 'shop1' });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Shop added to favorites');
  });

  test('400 – missing shopId', async () => {
    const res = await request(app)
      .post('/api/users/favorites')
      .send({});
    expect(res.status).toBe(400);
  });
});

// ── DELETE /api/users/favorites ───────────────────────────────────────────────

describe('DELETE /api/users/favorites', () => {
  test('200 – removes shop from favorites', async () => {
    userService.removeShopFromFavorites.mockResolvedValue([]);

    const res = await request(app)
      .delete('/api/users/favorites')
      .send({ shopId: 'shop1' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test('400 – missing shopId', async () => {
    const res = await request(app)
      .delete('/api/users/favorites')
      .send({});
    expect(res.status).toBe(400);
  });

  test('400 – shop not in favorites', async () => {
    userService.removeShopFromFavorites.mockRejectedValue(
      new Error('Shop not in favorites')
    );

    const res = await request(app)
      .delete('/api/users/favorites')
      .send({ shopId: 'shopX' });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Shop not in favorites');
  });
});

// PATCH /api/users/setAsCustomer

describe('PATCH /api/users/setAsCustomer', () => {
  test('200 – sets user as customer', async () => {
    userService.setAsCustomer.mockResolvedValue('customer');

    const res = await request(app).patch('/api/users/setAsCustomer');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test('400 – user is not pending', async () => {
    userService.setAsCustomer.mockRejectedValue(new Error('User is not pending'));

    const res = await request(app).patch('/api/users/setAsCustomer');

    expect(res.status).toBe(400);
    expect(res.body.message).toBe('User is not pending');
  });
});

// PATCH /api/users/profile

describe('PATCH /api/users/profile', () => {
  test('200 – updates personal data', async () => {
    userService.updatePersonalData.mockResolvedValue({ name: 'Luigi' });

    const res = await request(app)
      .patch('/api/users/profile')
      .send({ name: 'Luigi' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test('400 – empty body', async () => {
    const res = await request(app).patch('/api/users/profile').send({});
    expect(res.status).toBe(400);
    expect(res.body.message).toBe('No data provided.');
  });

  test('409 – email already in use', async () => {
    userService.updatePersonalData.mockRejectedValue(new Error('Email already in use'));

    const res = await request(app)
      .patch('/api/users/profile')
      .send({ email: 'taken@example.com' });

    expect(res.status).toBe(409);
  });

  test('409 – username already in use', async () => {
    userService.updatePersonalData.mockRejectedValue(new Error('Username already in use'));

    const res = await request(app)
      .patch('/api/users/profile')
      .send({ username: 'takenUser' });

    expect(res.status).toBe(409);
  });

  test('404 – user not found', async () => {
    userService.updatePersonalData.mockRejectedValue(new Error('User not found'));

    const res = await request(app)
      .patch('/api/users/profile')
      .send({ name: 'Ghost' });

    expect(res.status).toBe(404);
  });
});
