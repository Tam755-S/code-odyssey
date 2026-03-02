const bcrypt = require('bcrypt');
const User = require('../models/User');

exports.login = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.redirect('/login');

  if (!user.isActivated) {
    req.session.verifyEmail = email;
    return res.redirect('/verify');
  }

  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.redirect('/login');

  req.session.userId = user._id;
  res.redirect('/main?auth=' + Date.now());
};

exports.logout = (req, res) => {
  req.session.destroy(() => res.redirect('/login'));
};
