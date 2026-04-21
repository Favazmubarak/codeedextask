const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { users } = require('../store');

router.post('/register', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res.status(400).json({ message: 'All fields required' });

  const exists = users.find(u => u.username === username);
  if (exists)
    return res.status(400).json({ message: 'User already exists' });

  const user = { id: uuidv4(), username, password };
  users.push(user);
  res.json({ message: 'Registered successfully' });
});

router.post('/login', (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username && u.password === password);
  if (!user)
    return res.status(401).json({ message: 'Invalid credentials' });

  req.session.user = { id: user.id, username: user.username };
  res.json({ message: 'Logged in', user: req.session.user });
});

router.post('/logout', (req, res) => {
  req.session.destroy();
  res.json({ message: 'Logged out' });
});

router.get('/me', (req, res) => {
  if (!req.session.user)
    return res.status(401).json({ message: 'Not logged in' });
  res.json(req.session.user);
});

module.exports = router;