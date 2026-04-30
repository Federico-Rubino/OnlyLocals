const userService = require('../services/userService');

exports.register = async (req, res) => {
  try {
    const data = req.body;

    const user = await userService.createUser(data);

    res.status(201).json({
      id: user._id,
      email: user.email,
    });

  } catch (err) {
    if (err.message === "User already exists") {
      return res.status(409).json({ message: err.message });
    }

    res.status(500).json({ message: "Server error", content: err.message });
  }
};

exports.getShops = async (req, res) =>{
  try {
    const page = parseInt(req.query.page);
    const limit = parseInt(req.query.limit);

    const {shops, total} = await userService.getShops(page, limit);

    res.status(200).json({
      success: true,
      data: shops,
      pagination: {
        totalShops: total,
        currentPage: page,
        limitPages: Math.ceil(total /limit),
        nextPage: page < Math.ceil(total/limit), //true or false
        prevPage: page > 1
      }
    });
  }catch (err){
    res.status(500).json({ message: "Server error", content: err.message })
  }
};
