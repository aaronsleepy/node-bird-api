const express = require('express');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const { verifyToken } = require('./middlewares');
const { Domain, User, Post, Hashtag } = require('../models');

const router = express.Router();

router.use(cors({
  origin: [
    'http://localhost:4000',
  ],
  credentials: true,
}));

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
      id: domain.User.id,
      nick: domain.User.nick,
    }, process.env.JWT_SECRET, {
      expiresIn: '1m',
      issuer: 'nodebird',
    });

    return res.json({
      code: 200,
      message: 'Token issued',
      token,
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

router.get('/posts/my', verifyToken, (req, res) => {
  Post.findAll({
    where : { userId: req.decoded.id }
  })
    .then(posts => {
      console.log(posts);
      res.json({
        code: 200,
        payload: posts,
      });
    })
    .catch(error => {
      console.error(error);
      return res.status(500).json({
        code: 500,
        message: 'Server Error',
      });
    });
});

router.get('/posts/hashtag/:title', verifyToken, async (req, res) => {
  try {
    const hashtag = await Hashtag.findOne({
      where: {title: req.params.title},
    });

    if (!hashtag) {
      return res.status(404).json({
        code: 404,
        message: `No results for ${req.params.title}`,
      });
    }

    const posts = await hashtag.getPosts();
    return res.json({
      code: 200,
      payload: posts,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      code: 500,
      message: 'Server Error',
    });
  }
});

module.exports = router;