const pool = require('../../config/dbConfig')
const bcrypt = require('bcrypt');

exports.changePassword = async (req, res) => {
  const { email, oldPassword, newPassword } = req.body;
  console.log('🔐 Received change-password request');

  if (!email || !oldPassword || !newPassword) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  try {
    const [rows] = await pool.query('SELECT password FROM users WHERE email = ?', [email]);

    if (rows.length === 0) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const storedPassword = rows[0].password;
    const isHashed = storedPassword.startsWith('$2b$') || storedPassword.startsWith('$2a$');

    const isMatch = isHashed
      ? await bcrypt.compare(oldPassword, storedPassword)
      : oldPassword === storedPassword;

    if (!isMatch) {
      return res.status(401).json({ message: 'Old password is incorrect.' });
    }

    const newHashedPassword = await bcrypt.hash(newPassword, 10);
    await pool.query('UPDATE users SET password = ? WHERE email = ?', [newHashedPassword, email]);

    return res.status(200).json({ message: 'Password changed successfully.' });
  } catch (error) {
    console.error('Change Password Error:', error);
    return res.status(500).json({ message: 'Server error. Please try again later.' });
  }
};

exports.registerUser = async (req, res) => {
  const { name, email, password } = req.body;
  console.log('📝 Received registration request:', { name, email });

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  try {
    // Check if user already exists
    const [existingUser] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existingUser.length > 0) {
      return res.status(409).json({ message: 'User already exists.' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user into database
    await pool.query(
      'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
      [name, email, hashedPassword]
    );

    return res.status(201).json({ message: 'User registered successfully.' });
  } catch (error) {
    console.error('🔴 Registration error:', error);
    return res.status(500).json({ message: 'Server error during registration.' });
  }
};
