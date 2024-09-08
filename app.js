var createError = require('http-errors');
var express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
require('./routes/db');
const helpers = require('./helpers/helper');
const { fetchCartData } = require('./middlewares/cartMiddleware');
const { getCartCount } = require('./middlewares/cartMiddleware');
var setIsLoggedIn = require('./middlewares/loggedInMiddleware');

var usersRouter = require('./routes/users');
var adminRouter = require('./routes/admin');
var hbs = require('express-handlebars');
require('dotenv').config();
var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'hbs');
app.use(session({
  secret: 'syed',
  saveUninitialized: true,
  resave: false,
  store: MongoStore.create({ mongoUrl: 'mongodb://localhost:27017/ziadb' }),
  cookie: { secure: false },
}));

app.engine('hbs', hbs.engine({
  extname: 'hbs',
  defaultLayout: 'layout', layoutsDir: __dirname + '/views/layout/', partialsDir: __dirname + '/views/partials/', runtimeOptions: {
    allowProtoPropertiesByDefault: true,
    allowProtoMethodsByDefault: true,
  },
  helpers: helpers,
}));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(fetchCartData);
app.use(getCartCount);
app.use(setIsLoggedIn);

app.use('/', usersRouter);
app.use('/admin', adminRouter);


// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

// In your app.js or routes file
app.use((req, res, next) => {
  res.status(404).render('404', { title: 'Page Not Found' });
});

app.get('/404', (req, res) => {
  res.status(404).render('404'); // Assuming you're using a template engine like HBS
});

// Middleware to capture user IP
app.use((req, res, next) => {
  const userIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  req.userIp = userIp.split(',')[0]; // If there's a proxy, split and get the first IP
  next();
});



module.exports = app;
