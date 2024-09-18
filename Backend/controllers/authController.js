// controllers/authController.js
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const fs = require('fs');
const path = require('path');


// Signup Controller
// Signup Controller
const signup = async (req, res) => {
  const { email, username, password, birthday } = req.body;

  try {
    // Check if all fields are provided
    if (!email || !username || !password || !birthday) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Invalid email format.' });
    }

    // Check if passwords meet basic criteria (e.g., length)
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long.' });
    }

    // Check if the username already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: 'Username already exists.' });
    }

    // Check if the email already exists
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ message: 'Email already in use.' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user with the validated data
    const user = new User({
      email,
      username,
      password: hashedPassword,
      birthday, // Store birthday as a string or format as needed
    });

    // Save the new user to the database
    await user.save();

    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Login Controller

const login = async (req, res) => {
  const { email, password } = req.body; // Expecting email and password now

  try {
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.json({ token, "username":user.username });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const userdetails = async (req, res) => {
  const { username } = req.body;

  try {
    if (!username) {
      return res.status(400).json({ message: 'Username is required' });
    }

    // Find user details with projection to only include email and birthday
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(404).json({ message: 'No user found' });
    }

    // Store email and birthday in variables
    const { email, birthday } = user;
    console.log(user);

    // Respond with email and birthday
    res.status(200).json({ email, birthday });
  } catch (error) {
    console.error('Error fetching user details:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Upload Photo Controller

const uploadPhoto = async (req, res) => {
  const username = req.body.username; // Get username from the request body

  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Find user by username
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Log current user profile for debugging
    console.log('User before update:', user);

    // Check if user already has a profile image
    if (user.profileImage) {
      // Delete the old image file
     
      fs.unlink(user.profileImage, (err) => {
        if (err) {
          console.error('Error deleting old profile image:', err);
          // Proceed even if there's an error deleting the old image
        }
      });
    }

    // Store the new file path in the user's profileImage field
    user.profileImage = req.file.path;
    await user.save();

    res.status(200).json({ message: 'Profile photo uploaded successfully', photo: req.file.path });
  } catch (error) {
    console.error('Error uploading profile photo:', error);
    res.status(500).json({ message: 'Server error' });
  }
};





module.exports = {
  signup,
  login,
  userdetails,
  uploadPhoto,
  
};
