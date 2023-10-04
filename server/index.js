const express = require('express');
const { logger } = require('../utils/logger');
const http = require('http');
const path = require('path');
const { auth } = require('express-openid-connect');


require('dotenv').config();

if (!(process.env.APP_PORT)) {
  throw new Error("Some environmental variables are missing. Check docs for more information.")
}

const messageRouter = () => {
  try {
    return require('./messages/messages.router').messagesRouter;
  } catch (error) {
    console.error(error)
    return undefined;
  }
};

const { errorHandler } = require('./middleware/error.middleware');
const { notFoundHandler } = require('./middleware/not-found.middleware');
const { userMiddleware } = require('./middleware/user.middleware');

const { homeRouter } = require('./routes/home.routes');
const { logsRouter } = require('./routes/logs.routes');
const { profileRouter } = require('./routes/profile.routes');


const app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.urlencoded({extended: true}));

//app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'scripts')));
app.use(express.json());


const config = {
  authRequired: false,
  auth0Logout: true,
  // baseURL: `https://${process.env.SERVER_SUBDOMAIN}.${process.env.DOMAIN}`,
  baseURL: 'http://localhost:5050',
  clientID: process.env.AUTH_ID,
  issuerBaseURL: process.env.AUTH_BASE_URL,
  secret: process.env.AUTH_SECRET
};

const PORT = process.env.APP_PORT;

if (!config.baseURL && !process.env.BASE_URL && process.env.PORT && process.env.NODE_ENV !== 'production') {
  config.baseURL = `http://localhost:${PORT}`;
}

// auth router attaches /login, /logout, and /callback routes to the baseURL
app.use(auth(config));


// Middleware to make the `user` object available for all views
app.use(userMiddleware);

app.use('/', homeRouter);
app.use('/logs', logsRouter);
app.use('/profile', profileRouter);


if (!messageRouter) {
  console.warn('message router could not be loaded');
} else {
  app.use('/messages', messageRouter);
}


app.use(errorHandler);
app.use(notFoundHandler);


// // Catch 404 and forward to error handler
// app.use(function (req, res, next) {
//   const err = new Error('Not Found');
//   err.status = 404;
//   next(err);
// });

// // Error handlers
// app.use(function (err, req, res, next) {
//   res.status(err.status || 500);
//   res.render('error', {
//     message: err.message,
//     error: process.env.NODE_ENV !== 'production' ? err : {}
//   });
// });

http.createServer(app)
  .listen(PORT, () => {
    logger.info(`server listening on port ${config.baseURL}`);
  }
);