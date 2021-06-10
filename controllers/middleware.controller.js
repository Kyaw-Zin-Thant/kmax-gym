const fs = require('fs');
const publicKey = fs.readFileSync('config/jwtRS256.key.pub', 'utf8');
const jwt = require('jsonwebtoken');
exports.checkToken = async (req, res, next) => {
  try {
    if (
      req.path == '/api/v1/users/login' ||
      req.method == 'OPTIONS' ||
      req.path.includes('/public/uploads')
    ) {
      next();
    } else {
      console.log(req.headers.Authorization);
      var token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, publicKey, {
        algorithms: ['RS256'],
      });
      const { userId, userType } = decoded;
      req.headers.userId = userId;
      req.headers.userType = userType;
      next();
    }
  } catch (error) {
    console.log(error, ' error');
    return res.status(401).json({
      message: 'Token Expired',
    });
  }
};
