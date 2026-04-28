const users = [];

exports.create = async (user) => {
  users.push(user);
  return user;
};

exports.findAll = async () => {
  return users;
};