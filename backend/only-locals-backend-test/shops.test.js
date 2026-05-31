const request = require('supertest');
const app = require('../src/app');

jest.mock('../src/services/shopService');
jest.mock('../src/models/shopModel');

const shopService = require('../src/services/shopService');

jest.mock('../src/middlewares/authMiddleware', () => ({
  autenticateToken: (req, _res, next) => {
    req.user = { userId: 'vendor123' };
    next();
  }
}));


const FUTURE_DATE = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
const PAST_DATE   = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

const validShopBody = {
  name: 'Panificio Centrale',
  description: 'Fresh bread',
  category: ['Bakery'],
  itinerario: {
    monday: {
      morning: { latitudine: 45.4642, longitudine: 9.19 }
    }
  }
};

// POST /api/shops/register

describe('POST /api/shops/register', () => {
  test('201 – registers shop and assigns vendor role', async () => {
    shopService.registerShop.mockResolvedValue({ _id: 'shop1' });
    shopService.assignShop.mockResolvedValue('vendor');

    const res = await request(app).post('/api/shops/register').send(validShopBody);

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ success: true, id: 'shop1', newRole: 'vendor' });
  });

  test('400 – Mongoose ValidationError', async () => {
    const err = new Error('name is required');
    err.name = 'ValidationError';
    shopService.registerShop.mockRejectedValue(err);

    const res = await request(app).post('/api/shops/register').send({});

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test('500 – unexpected error', async () => {
    shopService.registerShop.mockRejectedValue(new Error('DB crash'));

    const res = await request(app).post('/api/shops/register').send(validShopBody);

    expect(res.status).toBe(500);
  });
});

// GET /api/shops/search

describe('GET /api/shops/search', () => {
  test('200 – returns matching shops', async () => {
    shopService.searchShops.mockResolvedValue([{ name: 'Panificio' }]);

    const res = await request(app).get('/api/shops/search').query({ name: 'Panificio' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.results).toBe(1);
    expect(res.body.data).toHaveLength(1);
  });

  test('200 – returns empty array when no matches', async () => {
    shopService.searchShops.mockResolvedValue([]);

    const res = await request(app).get('/api/shops/search').query({ name: 'xyz' });

    expect(res.status).toBe(200);
    expect(res.body.results).toBe(0);
  });

  test('200 – geo search with lat/lng/radius', async () => {
    shopService.searchShops.mockResolvedValue([{ name: 'Nearby Shop' }]);

    const res = await request(app)
      .get('/api/shops/search')
      .query({ lat: 45.4642, lng: 9.19, radius: 3 });

    expect(res.status).toBe(200);
    expect(shopService.searchShops).toHaveBeenCalledWith(
      expect.objectContaining({ lat: 45.4642, lng: 9.19, radius: 3 })
    );
  });

  test('200 – filter by category array', async () => {
    shopService.searchShops.mockResolvedValue([]);

    const res = await request(app)
      .get('/api/shops/search')
      .query({ category: ['Bakery', 'Fruit and Vegetables'] });

    expect(res.status).toBe(200);
  });

  test('500 – service error', async () => {
    shopService.searchShops.mockRejectedValue(new Error('DB error'));

    const res = await request(app).get('/api/shops/search');

    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });
});

// GET /api/shops/:id

describe('GET /api/shops/:id', () => {
  test('200 – returns shop details', async () => {
    shopService.getShopById.mockResolvedValue({
      name: 'Panificio Centrale',
      description: 'Fresh bread',
      category: ['Bakery'],
      itinerario: {},
      events: [],
      promotions: []
    });

    const res = await request(app).get('/api/shops/shop1');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe('Panificio Centrale');
  });

  test('404 – shop not found', async () => {
    shopService.getShopById.mockResolvedValue(null);

    const res = await request(app).get('/api/shops/nonexistent');

    expect(res.status).toBe(404);
    expect(res.body.message).toBe('Shop not found');
  });

  test('500 – service error', async () => {
    shopService.getShopById.mockRejectedValue(new Error('DB error'));

    const res = await request(app).get('/api/shops/shop1');

    expect(res.status).toBe(500);
  });
});

// POST /api/shops/promotion

describe('POST /api/shops/promotion', () => {
  const validPromotion = {
    description: 'Summer sale',
    value: '20%',
    startDate: FUTURE_DATE,
    endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()
  };

  test('200 – adds promotion', async () => {
    shopService.addPromotion.mockResolvedValue('shop1');

    const res = await request(app)
      .post('/api/shops/promotion')
      .send(validPromotion);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test('400 – start date in the past', async () => {
    const res = await request(app)
      .post('/api/shops/promotion')
      .send({ ...validPromotion, startDate: PAST_DATE });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/start date/i);
  });

  test('400 – end date before start date', async () => {
    const res = await request(app)
      .post('/api/shops/promotion')
      .send({
        ...validPromotion,
        endDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
        startDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString()
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/end date/i);
  });
});

// DELETE /api/shops/promotion

describe('DELETE /api/shops/promotion', () => {
  test('200 – removes promotion', async () => {
    shopService.deletePromotion.mockResolvedValue([]);

    const res = await request(app)
      .delete('/api/shops/promotion')
      .query({ description: 'Summer sale' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test('500 – service error', async () => {
    shopService.deletePromotion.mockRejectedValue(new Error('Promotion not found'));

    const res = await request(app)
      .delete('/api/shops/promotion')
      .query({ description: 'nonexistent' });

    expect(res.status).toBe(500);
  });
});

// POST /api/shops/event

describe('POST /api/shops/event', () => {
  const validEvent = {
    name: 'Summer Festival',
    description: 'Big outdoor event',
    date: FUTURE_DATE
  };

  test('200 – adds event', async () => {
    shopService.addEvent.mockResolvedValue([validEvent]);

    const res = await request(app).post('/api/shops/event').send(validEvent);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test('400 – event date in the past', async () => {
    const res = await request(app)
      .post('/api/shops/event')
      .send({ ...validEvent, date: PAST_DATE });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/future/i);
  });

  test('500 – service error', async () => {
    shopService.addEvent.mockRejectedValue(new Error('DB error'));

    const res = await request(app).post('/api/shops/event').send(validEvent);

    expect(res.status).toBe(500);
  });
});

// DELETE /api/shops/event

describe('DELETE /api/shops/event', () => {
  test('200 – deletes event', async () => {
    shopService.deleteEvent.mockResolvedValue([]);

    const res = await request(app)
      .delete('/api/shops/event')
      .send({ name: 'Summer Festival' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test('500 – event not found', async () => {
    shopService.deleteEvent.mockRejectedValue(new Error('Event not found'));

    const res = await request(app)
      .delete('/api/shops/event')
      .send({ name: 'Nonexistent Event' });

    expect(res.status).toBe(500);
  });
});
