require('dotenv').config();
const express = require('express');
const path = require('path');
const app = express();
const bodyParser = require('body-parser');
const PORT = process.env.PORT || 3000;
const cookieParser = require('cookie-parser');
const cors = require('cors');
const mongoose = require('mongoose');

// connect to database
mongoose.connect(process.env.MONGOURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
});

//on successful connection
mongoose.connection.on('connected', () => {
  console.log('Connected to database!!');
});

//on error connecting to database
mongoose.connection.on('error', (err) => {
  console.log('error connecting to database ' + err);
});

// view engine setup
app.set('views', path.join(__dirname, 'public'));
app.set('view engine', 'ejs');

//default code of expressjs generator

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//importing routes

const indexRouter = require('./app/modules/index');

app.use('/', indexRouter);

app.listen(PORT, () => console.log(`MITS Web backend running on port ${PORT}`));
