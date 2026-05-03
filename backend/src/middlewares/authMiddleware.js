const jwt = require("jsonwebtoken");

exports.autenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    //token not provided
    if (!token){
        return res.status(401).json({ message: 'Access denied. No token provided.'});
    }

    //decode token
    jwt.verify(token, process.env.JWT_TOKEN, (err, decodeData) =>{
        if (err) {
            return res.status(403).json({message: 'Invalid or expired token. Login again'})
        }

        //return id decoded
        req.user = decodeData;

        next();
    });
};