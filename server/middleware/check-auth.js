const jwt = require('jsonwebtoken');

const process = require('../../keys/jwt');

module.exports = (req,res,next) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const decode = jwt.verify(token, process.env.JWT_KEYS);
    req.userData = decode;
    next();
  }
  catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Auth failed'
    });
  }
};
