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

exports.login = async (req, res) => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({ message: "Bad request. Missing identifier or password." });
    }

    const {accessToken, refreshToken} = await userService.loginUser(identifier, password);

    res.status(201).json({
      message: "Login ok",
      accessToken: accessToken,
      refreshToken: refreshToken
    });
  } catch (err){
    if (err.message === 'Invalid credentials') {
      return res.status(401).json({ message: err.message });
    }
    res.status(500).json({message: err.message});
  }
};

exports.refreshToken = async (req, res) => {
  const {oldRefreshToken} = req.body;

  if(!oldRefreshToken){
    return res.status(401).json({message: "refresh token absent"});
  }
  try {
    const {newAccessToken , newRefreshToken} = await userService.refreshToken(oldRefreshToken)
    res.status(201).json({
      message: "Refresh ok",
      accessToken: newAccessToken,
      refreshToken: newRefreshToken
    });
    } catch (err){
      if (err.message === "Refresh Token not valid or revoked") {
        return res.status(401).json({ message: err.message });
      }
      res.status(500).json({message: err.message});
    }
};


