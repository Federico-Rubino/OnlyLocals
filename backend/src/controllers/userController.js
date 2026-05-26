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

exports.logout = async (req, res) => {
  try {
    // We expect the frontend to send the refresh token in the body
    const { refreshToken } = req.body; 

    // Call the service to delete it from the database
    await userService.logout(refreshToken);

    // Send a success response
    res.status(200).json({ message: "Log out OK" });
    
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error during logout" });
  }
};

exports.addShopToFavorites = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { shopId } = req.body;

    if (!shopId) {
      return res.status(400).json({
          success: false,
          message: "shopId needed."
      });
  }
  const updatedFavorites = await userService.addShopToFavorites(userId, shopId);

    res.status(200).json({ 
      message: "Shop added to favorites",
      results: updatedFavorites
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
}

exports.removeShopFromFavorites = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { shopId } = req.body;

    if (!shopId) {
      return res.status(400).json({
          success: false,
          message: "shopId needed"
      });
    }

    const updatedFavorites = await userService.removeShopFromFavorites(userId, shopId);

    res.status(200).json({ 
      success: true,
      message: "Shop removed from favorites",
      results: updatedFavorites
    });
  } catch (err) {
    if (err.message === "Shop not in favorites") {
      return res.status(400).json({ success: false, message: err.message });
    }

    console.error(err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
}

exports.setAsCustomer = async (req, res) => {
  try {
    const userId = req.user.userId;

    const updatedUser = await userService.setAsCustomer(userId);

    res.status(200).json({
      success: true,
      message: "User set as customer",
      results: updatedUser
    });
  } catch (err) {
    if (err.message === "User is not pending") {
      return res.status(400).json({ success: false, message: err.message });
    }

    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
}

exports.updatePersonalData = async (req, res) => {
  try {
      const userId = req.user.userId;
      const updateData = req.body;

      if (Object.keys(updateData).length === 0) {
          return res.status(400).json({ success: false, message: "No data provided." });
      }

      const updatedUser = await userService.updatePersonalData(userId, updateData);

      res.status(200).json({
          success: true,
          message: "Profile updated successfully",
          results: updatedUser
      });
  } catch (err) {
      if (err.message === "Email already in use" || err.message === "Username already in use") {
          return res.status(409).json({ success: false, message: err.message });
      }

      if (err.message === "User not found") {
          return res.status(404).json({ success: false, message: err.message });
      }

      console.error(err);
      res.status(500).json({ success: false, message: "Internal server error" });
  }
}