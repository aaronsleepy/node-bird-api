const jwt = require('jsonwebtoken');

exports.isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) {
    next();
  } else {
    res.status(403).send('Need to login');
  }
};

exports.isNotLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
      next();
    } else {
      const message = encodeURIComponent('Already logged in');
      res.redirect(`/?error=${message}`);
    }
};

exports.verifyToken = (req, res, next) => {
  try {
    req.decoded = jwt.verify(req.headers.authorization, process.env.JWT_SECRET);
    return next();
  } catch (error) {
    if ('TokenExpiredError' === error.name) {
      return res.status(419).json({
        code: 419,
        message: 'Token is expried',
      });
    }

    return res.status(401).json({
      code: 401,
      message: 'Token is not vaild',
    });
  }
};