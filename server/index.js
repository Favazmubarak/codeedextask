const express = require('express');
const session = require('express-session');
const cors = require('cors');

const app = express();

app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use(session({
  secret: 'kanban-secret',
  resave: false,
  saveUninitialized: false
}));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/tasks', require('./routes/tasks'));

app.listen(5000, () => console.log('Server running on port 5000'));