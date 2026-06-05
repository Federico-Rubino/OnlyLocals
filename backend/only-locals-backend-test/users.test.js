const request = require('supertest');
const app = require('../src/app');

beforeAll(() => jest.spyOn(console, 'error').mockImplementation(() => {}));
afterAll(() => console.error.mockRestore());

jest.mock('../src/services/userService');
jest.mock('../src/models/userModel');

const userService = require('../src/services/userService');

jest.mock('../src/middlewares/authMiddleware', () => ({
  autenticateToken: (req, _res, next) => {
    req.user = { userId: 'user123' };
    next();
  },
  optionalAuth: (_req, _res, next) => next(),
}));

// POST /api/users/register

describe('POST /api/users/register', () => {
  const validBody = {
    name: 'Mario',
    surname: 'Rossi',
    email: 'mario@example.com',
    password: 'Password1!',
    bornDate: '19900101',
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
    userService.loginUser.mockResolvedValue({ accessToken: 'acc', refreshToken: 'ref' });

    const res = await request(app)
      .post('/api/users/login')
      .send({ identifier: 'mario@example.com', password: 'Password1!' });

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ accessToken: 'acc', refreshToken: 'ref' });
  });

  test('400 – missing identifier', async () => {
    const res = await request(app).post('/api/users/login').send({ password: 'Password1!' });
    expect(res.status).toBe(400);
  });

  test('400 – missing password', async () => {
    const res = await request(app).post('/api/users/login').send({ identifier: 'mario@example.com' });
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
      newRefreshToken: 'newRef',
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
    userService.refreshToken.mockRejectedValue(new Error('Refresh Token not valid or revoked'));

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

// GET /api/users/me

describe('GET /api/users/me', () => {
  test('200 – returns user data', async () => {
    userService.getUserData.mockResolvedValue({
      name: 'Mario', surname: 'Rossi', email: 'mario@example.com',
      bornDate: '19900101', role: 'customer',
    });

    const res = await request(app).get('/api/users/me');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe('Mario');
  });

  test('404 – user not found', async () => {
    userService.getUserData.mockRejectedValue(new Error('User not found'));

    const res = await request(app).get('/api/users/me');

    expect(res.status).toBe(404);
  });
});

// GET /api/users/favorites

describe('GET /api/users/favorites', () => {
  test('200 – returns favourite shops', async () => {
    userService.getFavoritesWithDetails.mockResolvedValue([{ _id: 's1', name: 'Shop A' }]);

    const res = await request(app).get('/api/users/favorites');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(1);
  });

  test('500 – service throws', async () => {
    userService.getFavoritesWithDetails.mockRejectedValue(new Error('DB error'));

    const res = await request(app).get('/api/users/favorites');

    expect(res.status).toBe(500);
  });
});

// POST /api/users/favorites

describe('POST /api/users/favorites', () => {
  test('200 – adds shop to favorites', async () => {
    userService.addShopToFavorites.mockResolvedValue(['shop1']);

    const res = await request(app).post('/api/users/favorites').send({ shopId: 'shop1' });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Shop added to favorites');
  });

  test('400 – missing shopId', async () => {
    const res = await request(app).post('/api/users/favorites').send({});
    expect(res.status).toBe(400);
  });
});

// DELETE /api/users/favorites

describe('DELETE /api/users/favorites', () => {
  test('200 – removes shop from favorites', async () => {
    userService.removeShopFromFavorites.mockResolvedValue([]);

    const res = await request(app).delete('/api/users/favorites').send({ shopId: 'shop1' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test('400 – missing shopId', async () => {
    const res = await request(app).delete('/api/users/favorites').send({});
    expect(res.status).toBe(400);
  });

  test('400 – shop not in favorites', async () => {
    userService.removeShopFromFavorites.mockRejectedValue(new Error('Shop not in favorites'));

    const res = await request(app).delete('/api/users/favorites').send({ shopId: 'shopX' });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Shop not in favorites');
  });
});

// GET /api/users/fidelity/points

describe('GET /api/users/fidelity/points', () => {
  test('200 – returns points per shop', async () => {
    userService.getPoints.mockResolvedValue([{ activity: 'Shop A', count: 5 }]);

    const res = await request(app).get('/api/users/fidelity/points');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(1);
  });

  test('404 – fidelity card not found', async () => {
    userService.getPoints.mockRejectedValue(new Error('Fidelity card not found'));

    const res = await request(app).get('/api/users/fidelity/points');

    expect(res.status).toBe(404);
    expect(res.body.message).toBe('Fidelity card not found');
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

    const res = await request(app).patch('/api/users/profile').send({ name: 'Luigi' });

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

    const res = await request(app).patch('/api/users/profile').send({ name: 'Ghost' });

    expect(res.status).toBe(404);
  });
});

// PATCH /api/users/pushToken

describe('PATCH /api/users/pushToken', () => {
  test('200 – saves push token', async () => {
    userService.savePushToken.mockResolvedValue(undefined);

    const res = await request(app)
      .patch('/api/users/pushToken')
      .send({ pushToken: 'ExponentPushToken[xxx]' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test('400 – missing pushToken', async () => {
    const res = await request(app).patch('/api/users/pushToken').send({});
    expect(res.status).toBe(400);
    expect(res.body.message).toBe('pushToken required');
  });
});

// GET /api/users/notifications

describe('GET /api/users/notifications', () => {
  test('200 – returns notifications list', async () => {
    userService.getNotifications.mockResolvedValue([{ _id: 'n1', message: 'test', read: false }]);

    const res = await request(app).get('/api/users/notifications');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(1);
  });

  test('500 – service throws', async () => {
    userService.getNotifications.mockRejectedValue(new Error('DB error'));

    const res = await request(app).get('/api/users/notifications');

    expect(res.status).toBe(500);
  });
});

// PATCH /api/users/notifications/read-all

describe('PATCH /api/users/notifications/read-all', () => {
  test('200 – marks all notifications as read', async () => {
    userService.markAllNotificationsRead.mockResolvedValue(undefined);

    const res = await request(app).patch('/api/users/notifications/read-all');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});

// PATCH /api/users/notifications/:notificationId/read

describe('PATCH /api/users/notifications/:notificationId/read', () => {
  test('200 – marks one notification as read', async () => {
    userService.markNotificationRead.mockResolvedValue(undefined);

    const res = await request(app).patch('/api/users/notifications/notif1/read');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});

// GET /api/users/searches

describe('GET /api/users/searches', () => {
  test('200 – returns saved searches', async () => {
    userService.getSavedSearches.mockResolvedValue(['pizza', 'gelato']);

    const res = await request(app).get('/api/users/searches');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(2);
  });
});

// POST /api/users/searches

describe('POST /api/users/searches', () => {
  test('200 – saves a new search', async () => {
    userService.saveSearch.mockResolvedValue(['pizza']);

    const res = await request(app)
      .post('/api/users/searches')
      .send({ name: 'pizza' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test('400 – missing name and categories', async () => {
    const res = await request(app).post('/api/users/searches').send({});
    expect(res.status).toBe(400);
    expect(res.body.message).toBe('name or categories required');
  });

  test('403 – only customers can save searches', async () => {
    userService.saveSearch.mockRejectedValue(new Error('Only customers can save searches'));

    const res = await request(app).post('/api/users/searches').send({ name: 'pizza' });

    expect(res.status).toBe(403);
  });

  test('409 – search already saved', async () => {
    userService.saveSearch.mockRejectedValue(new Error('Search already saved'));

    const res = await request(app).post('/api/users/searches').send({ name: 'pizza' });

    expect(res.status).toBe(409);
  });
});

// DELETE /api/users/searches

describe('DELETE /api/users/searches', () => {
  test('200 – removes a saved search', async () => {
    userService.removeSearch.mockResolvedValue([]);

    const res = await request(app).delete('/api/users/searches').send({ search: 'pizza' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test('400 – missing search string', async () => {
    const res = await request(app).delete('/api/users/searches').send({});
    expect(res.status).toBe(400);
    expect(res.body.message).toBe('search string required');
  });

  test('400 – search not found', async () => {
    userService.removeSearch.mockRejectedValue(new Error('Search not found'));

    const res = await request(app).delete('/api/users/searches').send({ search: 'unknown' });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Search not found');
  });
});

// POST /api/users/forgot-password

describe('POST /api/users/forgot-password', () => {
  test('200 – always returns success (does not reveal if email exists)', async () => {
    userService.forgotPassword.mockResolvedValue(undefined);

    const res = await request(app)
      .post('/api/users/forgot-password')
      .send({ email: 'mario@example.com' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test('400 – missing email', async () => {
    const res = await request(app).post('/api/users/forgot-password').send({});
    expect(res.status).toBe(400);
    expect(res.body.message).toBe('email required');
  });

  test('500 – service throws', async () => {
    userService.forgotPassword.mockRejectedValue(new Error('DB error'));

    const res = await request(app)
      .post('/api/users/forgot-password')
      .send({ email: 'mario@example.com' });

    expect(res.status).toBe(500);
  });
});

// POST /api/users/verify-pin

describe('POST /api/users/verify-pin', () => {
  test('200 – valid PIN returns recovery token', async () => {
    userService.verifyPin.mockResolvedValue('recovery-token-abc');

    const res = await request(app)
      .post('/api/users/verify-pin')
      .send({ email: 'mario@example.com', pin: '123456' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.recoveryToken).toBe('recovery-token-abc');
  });

  test('400 – missing fields', async () => {
    const res = await request(app)
      .post('/api/users/verify-pin')
      .send({ email: 'mario@example.com' });
    expect(res.status).toBe(400);
  });

  test('400 – invalid PIN', async () => {
    userService.verifyPin.mockRejectedValue(new Error('Invalid PIN'));

    const res = await request(app)
      .post('/api/users/verify-pin')
      .send({ email: 'mario@example.com', pin: '000000' });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Invalid PIN');
  });

  test('400 – PIN expired', async () => {
    userService.verifyPin.mockRejectedValue(new Error('PIN expired'));

    const res = await request(app)
      .post('/api/users/verify-pin')
      .send({ email: 'mario@example.com', pin: '123456' });

    expect(res.status).toBe(400);
  });

  test('404 – no active recovery request', async () => {
    userService.verifyPin.mockRejectedValue(new Error('No active recovery request'));

    const res = await request(app)
      .post('/api/users/verify-pin')
      .send({ email: 'unknown@example.com', pin: '123456' });

    expect(res.status).toBe(404);
  });

  test('429 – too many failed attempts', async () => {
    userService.verifyPin.mockRejectedValue(new Error('Too many attempts'));

    const res = await request(app)
      .post('/api/users/verify-pin')
      .send({ email: 'mario@example.com', pin: '999999' });

    expect(res.status).toBe(429);
  });
});

// POST /api/users/reset-password

describe('POST /api/users/reset-password', () => {
  test('200 – resets password successfully', async () => {
    userService.resetPassword.mockResolvedValue(undefined);

    const res = await request(app)
      .post('/api/users/reset-password')
      .send({ recoveryToken: 'valid-token', newPassword: 'NewPass123!' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe('Password updated successfully');
  });

  test('400 – missing fields', async () => {
    const res = await request(app)
      .post('/api/users/reset-password')
      .send({ recoveryToken: 'valid-token' });
    expect(res.status).toBe(400);
  });

  test('400 – invalid or expired token', async () => {
    userService.resetPassword.mockRejectedValue(new Error('Invalid or expired recovery token'));

    const res = await request(app)
      .post('/api/users/reset-password')
      .send({ recoveryToken: 'bad-token', newPassword: 'NewPass123!' });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Invalid or expired recovery token');
  });
});
