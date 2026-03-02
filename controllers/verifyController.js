const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');

exports.showVerify = (req, res) => {
  res.render('verify', { error: null });
};

exports.verify = async (req, res) => {
  const { code } = req.body;

  const user = await User.findOne({
    email: req.session.verifyEmail,
    activationCode: code,
    activationExpire: { $gt: Date.now() }
  });

  if (!user) {
    return res.render('verify', { error: 'รหัสไม่ถูกต้องหรือหมดอายุ' });
  }

  user.isActivated = true;
  user.activationCode = null;
  user.activationExpire = null;
  await user.save();

  res.redirect('/login');
};

exports.resend = async (req, res) => {
  const user = await User.findOne({ email: req.session.verifyEmail });
  if (!user) return res.redirect('/register');

  const newCode = Math.floor(100000 + Math.random() * 900000).toString();

  user.activationCode = newCode;
  user.activationExpire = Date.now() + 10 * 60 * 1000;
  await user.save();

  await sendEmail(user.email, newCode);
  res.redirect('/verify');
};
