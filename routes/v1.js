const express = require('express');
const jwt = require('jsonwebtoken');

const { verifyToken } = require('./middlewares');
const { Domain, User } = require('../models');

const router = express.Router();

router.post('/token', async (req, res) => {
  const { clientSecret } = req.body;

  try {
    const domain = await Domain.findOne({
      where: {clientSecret},
      include: {
        model: User,
        attributes: ['nick', 'id'],
      },
    });

    if (!domain) {
      return res.status(401).json({
        code: 401,
        message: 'Not registered domain, need to register domain first',
      });
    }

    const token = jwt.sign({
      id: domain.user.id,
      nick: domain.user.nick,
    }, process.env.JWT_SECRET, {
      expiresIn: '1m',
      issuer: 'nodebird',
    });

    return res.json({
      code: 200,
      message: 'Token issued',
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      code: 500,
      message: 'Server Error',
    });
  }
});

router.get('/test', verifyToken, (req, res) => {
res.json(req.decoded);
});

module.exports = router;