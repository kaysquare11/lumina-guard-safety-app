const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// ============================================
// REGISTER
// ============================================
router.post('/register', async (req, res) => {
  console.log('📝 Registration attempt:', req.body.email);
  
  try {
    const { name, email, password } = req.body;

    // Validate
    if (!name || !email || !password) {
      console.log('❌ Missing fields');
      return res.status(400).json({ message: 'Please provide all fields' });
    }

    if (password.length < 6) {
      console.log('❌ Password too short');
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      console.log('❌ User already exists');
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Create user (password will be hashed by pre-save middleware)
    const user = new User({
      name,
      email: email.toLowerCase(),
      password
    });

    await user.save();
    console.log('✅ User registered:', user.email);

    // Generate token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });

  } catch (error) {
    console.error('❌ Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// ============================================
// LOGIN
// ============================================
router.post('/login', async (req, res) => {
  console.log('🔐 Login attempt:', req.body.email);
  
  try {
    const { email, password } = req.body;

    // Validate
    if (!email || !password) {
      console.log('❌ Missing credentials');
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      console.log('❌ User not found');
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      console.log('❌ Wrong password');
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    console.log('✅ Login successful:', user.email);

    // Generate token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });

  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// ============================================
// LOGOUT (client-side handles this)
// ============================================
router.post('/logout', (req, res) => {
  res.json({ success: true, message: 'Logged out successfully' });
});

module.exports = router;
