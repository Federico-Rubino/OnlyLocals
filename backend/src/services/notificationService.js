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

exports.notifyVendor = async (shopId, shopName, feedbackData) => {
  const vendor = await User.findOne({ vendorShop: shopId, role: 'vendor' });
  if (!vendor) return;

  const notification = {
    type: 'feedback',
    shopId,
    shopName,
    feedbackAuthorName: feedbackData.authorName,
    feedbackRating: feedbackData.rating,
    feedbackComment: feedbackData.comment,
    sentAt: new Date(),
    read: false
  };

  await User.findByIdAndUpdate(vendor._id, { $push: { notifications: notification } });

  if (vendor.pushToken) {
    const stars = '★'.repeat(feedbackData.rating) + '☆'.repeat(5 - feedbackData.rating);
    try {
      await sendExpoPushNotifications([{
        to: vendor.pushToken,
        title: `Nuovo feedback per ${shopName}`,
        body: `${feedbackData.authorName} — ${stars}`,
        data: { shopId: shopId.toString(), type: 'feedback' }
      }]);
    } catch (err) {
      console.error('Push notification delivery error:', err);
    }
  }
};

exports.notifyShopFollowers = async (shopId, shopName, type, payload) => {
  const notification = { type, shopId, shopName, sentAt: new Date(), read: false };
  let pushTitle, pushBody;

  if (type === 'event') {
    notification.eventName = payload.name;
    notification.eventDescription = payload.description;
    notification.eventDate = payload.date;
    pushTitle = `Nuovo evento da ${shopName}`;
    pushBody = payload.name;
  } else {
    notification.promotionDescription = payload.description;
    notification.promotionValue = payload.value;
    notification.promotionStartDate = payload.startDate;
    notification.promotionEndDate = payload.endDate;
    pushTitle = `Nuova promozione da ${shopName}`;
    pushBody = `${payload.description} — ${payload.value}`;
  }

  await User.updateMany(
    { savedShops: shopId },
    { $push: { notifications: notification } }
  );

  const users = await User.find(
    { savedShops: shopId, pushToken: { $ne: null, $exists: true } },
    'pushToken'
  );

  if (!users.length) return;

  const messages = users.map(u => ({
    to: u.pushToken,
    title: pushTitle,
    body: pushBody,
    data: { shopId: shopId.toString(), type }
  }));

  try {
    await sendExpoPushNotifications(messages);
  } catch (err) {
    console.error('Push notification delivery error:', err);
  }
};
