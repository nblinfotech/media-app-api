const jwt = require('jsonwebtoken');

// Generate tokens
const generateTokens = (userId) => {
  const accessToken = jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '1h' });
  const refreshToken = jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '30d' }); // Longer expiration for refresh token

  return { accessToken, refreshToken };
};

module.exports = {
  generateTokens,
};
