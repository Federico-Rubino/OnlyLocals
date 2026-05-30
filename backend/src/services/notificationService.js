const https = require('https');
const User = require('../models/userModel');

function sendExpoPushNotifications(messages) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify(messages);
    const options = {
      hostname: 'exp.host',
      path: '/--/api/v2/push/send',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Accept-Encoding': 'gzip, deflate',
        'Content-Length': Buffer.byteLength(body)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch { resolve(data); }
      });
    });

    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

exports.notifyShopFollowers = async (shopId, shopName, eventData) => {
  const notification = {
    shopId,
    shopName,
    eventName: eventData.name,
    eventDescription: eventData.description,
    eventDate: eventData.date,
    sentAt: new Date(),
    read: false
  };

  // Persist notification for every user who saved this shop
  await User.updateMany(
    { savedShops: shopId },
    { $push: { notifications: notification } }
  );

  // Send push only to users who have a token
  const users = await User.find(
    { savedShops: shopId, pushToken: { $ne: null, $exists: true } },
    'pushToken'
  );

  if (!users.length) return;

  const messages = users.map(u => ({
    to: u.pushToken,
    title: `Nuovo evento da ${shopName}`,
    body: eventData.name,
    data: { shopId: shopId.toString() }
  }));

  try {
    await sendExpoPushNotifications(messages);
  } catch (err) {
    console.error('Push notification delivery error:', err);
  }
};
