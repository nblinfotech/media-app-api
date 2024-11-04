// controllers/authController.js

const User = require('../models/User');
const bcrypt = require('bcrypt');
const { generateTokens } = require('../utils/tokenUtils'); // Import the utility function

// User registration
const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  // Validate input
  if (!name || !email || !password) {
    return res.status(400).json({ status: 400, message: 'Name, email, and password are required' });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ status: 400, message: 'User already exists' });
    }

    const newUser = new User({ name, email, password });
    await newUser.save();

    res.status(201).json({
      status: 201,
      data: {
        user: {
          id: newUser._id,
          name: newUser.name,
          email: newUser.email,
        },
        message: 'User registered successfully',
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ status: 500, message: 'Internal server error' });
  }
};

// User login
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ status: 400, message: 'Email and password are required' });
  }

  try {
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ status: 400, message: 'Invalid credentials' });
    }

    const { accessToken, refreshToken } = generateTokens(user._id);

    // Update user's refresh token in the database
    user.refreshToken = refreshToken;
    await user.save();

    res.status(200).json({
      status: 200,
      data: {
        token: accessToken,
        refreshToken,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
        },
      },
      message: 'Login successful',
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ status: 500, message: 'Internal server error' });
  }
};

// Refresh token
const refreshToken = async (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(401).json({ status: 401, message: 'Refresh token is required' });
  }

  try {
    const user = await User.findOne({ refreshToken: token });
    if (!user) {
      return res.status(403).json({ status: 403, message: 'Invalid refresh token' });
    }

    jwt.verify(token, process.env.JWT_SECRET, async (err) => {
      if (err) {
        return res.status(403).json({ status: 403, message: 'Invalid refresh token' });
      }

      const { accessToken, refreshToken: newRefreshToken } = generateTokens(user._id);

      user.refreshToken = newRefreshToken;
      await user.save();

      res.status(200).json({
        status: 200,
        data: {
          accessToken,
          refreshToken: newRefreshToken,
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
          },
        },
        message: 'Tokens refreshed successfully',
      });
    });
  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(500).json({ status: 500, message: 'Internal server error' });
  }
};

module.exports = {
  registerUser,
  loginUser,
  refreshToken, // Export the new function
};
