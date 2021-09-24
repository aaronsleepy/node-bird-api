const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');

const User = require('../models/user');

module.exports = () => {
  passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
  }, async (email, password, done) => {
    try {
      console.info(`Log in started for ${email}`);
      const extUser = await User.findOne({ where: { email } });
      if (extUser) {
        const result = bcrypt.compare(password, extUser.password);
        if (result) {
          done(null, extUser);
        } else {
          done(null, false, { message: 'Password not matched' });
        }
      } else {
        done(null, false, { message: 'No user found' });
      }
    } catch (error) {
      console.error(error);
      done(error);
    }
  }));
};