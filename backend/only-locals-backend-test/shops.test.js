const request = require('supertest');
const app = require('../src/app');

beforeAll(() => jest.spyOn(console, 'error').mockImplementation(() => {}));
afterAll(() => console.error.mockRestore());

jest.mock('../src/services/shopService');
jest.mock('../src/models/shopModel');
jest.mock('../src/models/userModel');

const shopService = require('../src/services/shopService');

// Fix: optionalAuth was not mocked, causing TypeError on GET /api/shops/:id
jest.mock('../src/middlewares/authMiddleware', () => ({
  autenticateToken: (req, _res, next) => {
    req.user = { userId: 'vendor123' };
    next();
  },
  optionalAuth: (_req, _res, next) => next(),
}));

const FUTURE_DATE = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
const PAST_DATE   = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

const validShopBody = {
  name: 'Panificio Centrale',
  description: 'Fresh bread',
  category: ['Bakery'],
  itinerario: {
    monday: { morning: { latitudine: 45.4642, longitudine: 9.19 } }
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

  test('500 – service error', async () => {
    shopService.searchShops.mockRejectedValue(new Error('DB error'));

    const res = await request(app).get('/api/shops/search');

    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });
});

// GET /api/shops/stats

describe('GET /api/shops/stats', () => {
  test('200 – returns shop statistics', async () => {
    shopService.getStatistiche.mockResolvedValue({
      name: 'Panificio Centrale',
      statistiche: {
        numSalvataggi: 10,
        votoMedio: 4.2,
        totaleFeedback: 5,
        mappaAccessi: [],
        storicoFeedback: [],
        ultimoAggiornamento: new Date().toISOString(),
      },
    });

    const res = await request(app).get('/api/shops/stats');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.nomeShop).toBe('Panificio Centrale');
  });

  test('403 – user is not a vendor', async () => {
    shopService.getStatistiche.mockRejectedValue(new Error('Not a vendor'));

    const res = await request(app).get('/api/shops/stats');

    expect(res.status).toBe(403);
  });

  test('404 – shop not found', async () => {
    shopService.getStatistiche.mockRejectedValue(new Error('Shop not found'));

    const res = await request(app).get('/api/shops/stats');

    expect(res.status).toBe(404);
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
      promotions: [],
      statistiche: { votoMedio: 4, totaleFeedback: 2, storicoFeedback: [] },
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
    endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
  };

  test('200 – adds promotion', async () => {
    shopService.addPromotion.mockResolvedValue('shop1');

    const res = await request(app).post('/api/shops/promotion').send(validPromotion);

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
    const res = await request(app).post('/api/shops/promotion').send({
      ...validPromotion,
      startDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      endDate:   new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
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
    date: FUTURE_DATE,
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

  test('409 – duplicate event name', async () => {
    const err = new Error('Event already exists');
    err.name = 'DuplicateEvent';
    shopService.addEvent.mockRejectedValue(err);

    const res = await request(app).post('/api/shops/event').send(validEvent);

    expect(res.status).toBe(409);
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

  test('500 – service error', async () => {
    shopService.deleteEvent.mockRejectedValue(new Error('Event not found'));

    const res = await request(app)
      .delete('/api/shops/event')
      .send({ name: 'Nonexistent Event' });

    expect(res.status).toBe(500);
  });
});

// POST /api/shops/fidelity/scan

describe('POST /api/shops/fidelity/scan', () => {
  test('200 – adds 1 point to fidelity card', async () => {
    shopService.scanFidelityCard.mockResolvedValue({ points: 6 });

    const res = await request(app)
      .post('/api/shops/fidelity/scan')
      .send({ barcode: 'abc123' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test('400 – missing barcode', async () => {
    const res = await request(app).post('/api/shops/fidelity/scan').send({});
    expect(res.status).toBe(400);
  });

  test('403 – user is not a vendor', async () => {
    shopService.scanFidelityCard.mockRejectedValue(new Error('Not a vendor'));

    const res = await request(app)
      .post('/api/shops/fidelity/scan')
      .send({ barcode: 'abc123' });

    expect(res.status).toBe(403);
  });

  test('404 – fidelity card not found', async () => {
    shopService.scanFidelityCard.mockRejectedValue(new Error('Fidelity card not found'));

    const res = await request(app)
      .post('/api/shops/fidelity/scan')
      .send({ barcode: 'abc123' });

    expect(res.status).toBe(404);
  });
});

// GET /api/shops/fidelity/vantaggi

describe('GET /api/shops/fidelity/vantaggi', () => {
  test('200 – returns list of benefits', async () => {
    shopService.getVantaggi.mockResolvedValue([
      { descrizione: '10% off', valore: 10, sogliaPunti: 50 }
    ]);

    const res = await request(app).get('/api/shops/fidelity/vantaggi');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(1);
  });

  test('500 – service error', async () => {
    shopService.getVantaggi.mockRejectedValue(new Error('DB error'));

    const res = await request(app).get('/api/shops/fidelity/vantaggi');

    expect(res.status).toBe(500);
  });
});

// PUT /api/shops/fidelity/vantaggi

describe('PUT /api/shops/fidelity/vantaggi', () => {
  const vantaggi = [{ descrizione: '10% off', valore: 10, sogliaPunti: 50 }];

  test('200 – updates benefits', async () => {
    shopService.setVantaggi.mockResolvedValue({ vantaggi });

    const res = await request(app)
      .put('/api/shops/fidelity/vantaggi')
      .send({ vantaggi });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test('400 – empty vantaggi list', async () => {
    const res = await request(app)
      .put('/api/shops/fidelity/vantaggi')
      .send({ vantaggi: [] });

    expect(res.status).toBe(400);
  });

  test('403 – cannot modify within 3 months', async () => {
    shopService.setVantaggi.mockRejectedValue(
      new Error('Vantaggi non modificabili prima di 3 mesi dall\'ultima modifica')
    );

    const res = await request(app)
      .put('/api/shops/fidelity/vantaggi')
      .send({ vantaggi });

    expect(res.status).toBe(403);
  });
});

// POST /api/shops/fidelity/scan/addPoints

describe('POST /api/shops/fidelity/scan/addPoints', () => {
  test('200 – adds points based on purchase amount', async () => {
    shopService.addPoints.mockResolvedValue({ points: 10 });

    const res = await request(app)
      .post('/api/shops/fidelity/scan/addPoints')
      .send({ barcode: 'abc123', importo: 50 });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test('400 – missing barcode or importo', async () => {
    const res = await request(app)
      .post('/api/shops/fidelity/scan/addPoints')
      .send({ barcode: 'abc123' });

    expect(res.status).toBe(400);
  });

  test('400 – importo is zero or negative', async () => {
    const res = await request(app)
      .post('/api/shops/fidelity/scan/addPoints')
      .send({ barcode: 'abc123', importo: 0 });

    expect(res.status).toBe(400);
  });

  test('404 – fidelity card not found', async () => {
    shopService.addPoints.mockRejectedValue(new Error('Fidelity card not found'));

    const res = await request(app)
      .post('/api/shops/fidelity/scan/addPoints')
      .send({ barcode: 'abc123', importo: 50 });

    expect(res.status).toBe(404);
  });
});

// POST /api/shops/fidelity/scan/redeem

describe('POST /api/shops/fidelity/scan/redeem', () => {
  test('200 – redeems a benefit', async () => {
    shopService.redeemVantaggio.mockResolvedValue({ points: 0 });

    const res = await request(app)
      .post('/api/shops/fidelity/scan/redeem')
      .send({ barcode: 'abc123', descrizioneVantaggio: '10% off' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test('400 – missing fields', async () => {
    const res = await request(app)
      .post('/api/shops/fidelity/scan/redeem')
      .send({ barcode: 'abc123' });

    expect(res.status).toBe(400);
  });

  test('400 – not enough points', async () => {
    shopService.redeemVantaggio.mockRejectedValue(new Error('Not enough points'));

    const res = await request(app)
      .post('/api/shops/fidelity/scan/redeem')
      .send({ barcode: 'abc123', descrizioneVantaggio: '10% off' });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Not enough points');
  });

  test('404 – fidelity card or benefit not found', async () => {
    shopService.redeemVantaggio.mockRejectedValue(new Error('Fidelity card not found'));

    const res = await request(app)
      .post('/api/shops/fidelity/scan/redeem')
      .send({ barcode: 'abc123', descrizioneVantaggio: '10% off' });

    expect(res.status).toBe(404);
  });
});

// PUT /api/shops/fidelity/modifyConversion

describe('PUT /api/shops/fidelity/modifyConversion', () => {
  test('200 – sets conversion rate', async () => {
    shopService.modifyConversion.mockResolvedValue({ tasso: 10 });

    const res = await request(app)
      .put('/api/shops/fidelity/modifyConversion')
      .send({ tasso: 10 });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test('400 – missing tasso', async () => {
    const res = await request(app)
      .put('/api/shops/fidelity/modifyConversion')
      .send({});

    expect(res.status).toBe(400);
  });

  test('403 – user is not a vendor', async () => {
    shopService.modifyConversion.mockRejectedValue(new Error('Not a vendor'));

    const res = await request(app)
      .put('/api/shops/fidelity/modifyConversion')
      .send({ tasso: 10 });

    expect(res.status).toBe(403);
  });
});

// POST /api/shops/:shopId/feedback

describe('POST /api/shops/:shopId/feedback', () => {
  test('201 – submits feedback', async () => {
    shopService.addFeedback.mockResolvedValue({ voto: 4, commento: 'Great!' });

    const res = await request(app)
      .post('/api/shops/shop1/feedback')
      .send({ voto: 4, commento: 'Great!' });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  test('400 – voto out of range (0)', async () => {
    const res = await request(app)
      .post('/api/shops/shop1/feedback')
      .send({ voto: 0 });

    expect(res.status).toBe(400);
  });

  test('400 – voto out of range (6)', async () => {
    const res = await request(app)
      .post('/api/shops/shop1/feedback')
      .send({ voto: 6 });

    expect(res.status).toBe(400);
  });

  test('404 – shop not found', async () => {
    shopService.addFeedback.mockRejectedValue(new Error('Shop not found'));

    const res = await request(app)
      .post('/api/shops/shop1/feedback')
      .send({ voto: 4 });

    expect(res.status).toBe(404);
  });
});

// PUT /api/shops/update

describe('PUT /api/shops/update', () => {
  test('200 – updates shop data', async () => {
    shopService.updateShop.mockResolvedValue({ name: 'Nuovo Nome' });

    const res = await request(app)
      .put('/api/shops/update')
      .send({ name: 'Nuovo Nome' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test('400 – empty body', async () => {
    const res = await request(app).put('/api/shops/update').send({});
    expect(res.status).toBe(400);
  });

  test('403 – user is not a vendor', async () => {
    shopService.updateShop.mockRejectedValue(new Error('Not a vendor'));

    const res = await request(app).put('/api/shops/update').send({ name: 'X' });

    expect(res.status).toBe(403);
  });

  test('404 – shop not found', async () => {
    shopService.updateShop.mockRejectedValue(new Error('Shop not found'));

    const res = await request(app).put('/api/shops/update').send({ name: 'X' });

    expect(res.status).toBe(404);
  });
});
