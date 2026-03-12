require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('✅ Connected to MongoDB');
    
    // Find all users
    const users = await User.find();
    console.log('\n📋 Users in database:', users.length);
    
    users.forEach(user => {
      console.log(`- ${user.name} (${user.email})`);
    });
    
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ MongoDB error:', err);
    process.exit(1);
  });