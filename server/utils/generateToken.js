const jwt = require('jsonwebtoken');

/**
 * Signs a JWT for a given user id.
 * @param {string} userId
 * @returns {string} signed JWT
 */
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

/**
 * Sets the JWT as an httpOnly cookie on the response and also returns it
 * in the JSON body, so the client can choose either storage strategy.
 */
const sendTokenResponse = (user, statusCode, res) => {
  const token = generateToken(user._id);

  const cookieExpiresDays = Number(process.env.JWT_COOKIE_EXPIRES_DAYS || 7);
  const cookieOptions = {
    expires: new Date(Date.now() + cookieExpiresDays * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  };

  res.cookie('token', token, cookieOptions);

  const safeUser = user.toObject ? user.toObject() : user;
  delete safeUser.password;

  res.status(statusCode).json({
    success: true,
    token,
    user: safeUser,
  });
};

module.exports = { generateToken, sendTokenResponse };
