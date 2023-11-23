const express = require('express');
require('dotenv').config();
const userRouter = require('./Routes/user');
const expenseRouter = require('./Routes/expense');
const groupRouter = require('./Routes/groupRoutes');

const mongoose = require('mongoose'); 
const app = express();
const cors = require('cors');
const PORT = process.env.PORT; 
app.use(express.json());
app.use(cors());

app.use((req, res, next) => {
  next();
});

app.use('/api/user', userRouter);
app.use('/api/group', groupRouter);
app.use('/api/expense', expenseRouter);

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true }) 
  .then(() => {
    app.listen(PORT, () => {
      console.log('Connected to the database and listening on port', PORT);
    });
  })
  .catch((error) => {
    console.error('Error connecting to the database:', error);
  });
