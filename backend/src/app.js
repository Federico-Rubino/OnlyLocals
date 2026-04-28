const express = require('express');
const userRoutes = require('./routes/userRoutes');
const errorMiddleware = require('./middlewares/errorMiddleware');

const app = express();

app.use(express.json());

// routes
app.use('/api/users', userRoutes);

// error handler (sempre alla fine)
app.use(errorMiddleware);

module.exports = app;