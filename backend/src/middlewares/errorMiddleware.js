const validator = require("validator");


exports.validateRegisterData = (req, res, next) => {
  const data = req.body;
  if(!data.email || !data.name || !data.password || !data.surname || !data.bornDate ){
    return res.status(400).json({ message: "Missing fields" });
  }

  if (!validator.isEmail(data.email)) {
  return res.status(400).json({ message: "Invalid email" });
  }
  next();
};

