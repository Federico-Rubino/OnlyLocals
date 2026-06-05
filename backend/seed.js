require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('./src/models/userModel');
const Shop = require('./src/models/shopModel');

// ── Credentials ────────────────────────────────────────────────────────────
const CUSTOMER = {
  name: 'Mario',
  surname: 'Rossi',
  email: 'customer@test.com',
  bornDate: '1995-06-15',
  username: 'mario_customer',
  password: 'Password123!',
};

const VENDOR = {
  name: 'Lucia',
  surname: 'Verdi',
  email: 'vendor@test.com',
  bornDate: '1988-03-22',
  username: 'lucia_vendor',
  password: 'Password123!',
};

const SHOP = {
  name: 'Bottega di Lucia',
  description: 'Prodotti freschi e artigianali direttamente dal produttore.',
  category: ['Ortofrutta'],
};
// ───────────────────────────────────────────────────────────────────────────

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('MongoDB connected');

  // ── Customer ──────────────────────────────────────────────────────────────
  const existingCustomer = await User.findOne({ email: CUSTOMER.email });
  if (existingCustomer) {
    console.log(`Customer already exists (${CUSTOMER.email}), skipping.`);
  } else {
    const passwordHash = await bcrypt.hash(CUSTOMER.password, 10);
    await User.create({
      name: CUSTOMER.name,
      surname: CUSTOMER.surname,
      email: CUSTOMER.email,
      bornDate: CUSTOMER.bornDate,
      auth: { username: CUSTOMER.username, passwordHash },
      role: 'customer',
    });
    console.log(`✓ Customer created  →  ${CUSTOMER.email}  /  password: ${CUSTOMER.password}`);
  }

  // ── Shop ──────────────────────────────────────────────────────────────────
  let shop = await Shop.findOne({ name: SHOP.name });
  if (shop) {
    console.log(`Shop already exists (${SHOP.name}), skipping.`);
  } else {
    shop = await Shop.create(SHOP);
    console.log(`✓ Shop created  →  id: ${shop._id}  name: "${shop.name}"`);
  }

  // ── Vendor ────────────────────────────────────────────────────────────────
  const existingVendor = await User.findOne({ email: VENDOR.email });
  if (existingVendor) {
    console.log(`Vendor already exists (${VENDOR.email}), skipping.`);
  } else {
    const passwordHash = await bcrypt.hash(VENDOR.password, 10);
    await User.create({
      name: VENDOR.name,
      surname: VENDOR.surname,
      email: VENDOR.email,
      bornDate: VENDOR.bornDate,
      auth: { username: VENDOR.username, passwordHash },
      role: 'vendor',
      vendorShop: shop._id,
    });
    console.log(`✓ Vendor created   →  ${VENDOR.email}  /  password: ${VENDOR.password}`);
    console.log(`  vendorShop linked to shop id: ${shop._id}`);
  }

  await mongoose.disconnect();
  console.log('\nDone. You can now log in with the credentials above.');
}

seed().catch(err => {
  console.error(err);
  mongoose.disconnect();
  process.exit(1);
});
