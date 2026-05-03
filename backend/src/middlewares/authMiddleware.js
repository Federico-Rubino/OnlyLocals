
const User = require('../models/userModel');
const jwt = require("jsonwebtoken");

exports.autenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    //token not provided
    if (!token){
        return res.status(401).json({ message: 'Access denied. No token provided.'});
    }

    //decode token
    jwt.verify(token, process.env.JWT_TOKEN, async (err, decodeData) =>{
        if (err) {
            return res.status(403).json({message: 'Invalid or expired token. Login again'})
        }

        console.log(decodeData.userId);

        const user = await User.findById(decodeData.userId);

        if((req.baseUrl != 'api/shops/register' || req.baseUrl != 'api/users/setAsCostumer') && user.role == 'pending'){
            return res.status(403).json({message: 'User is pending. Set a role using users/setAsCostumer or assign a shop'});
        }

        //return id decoded
        req.user = decodeData;

        next();
    });
};