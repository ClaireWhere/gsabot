const express = require("express");
const homeRouter = express.Router();

homeRouter.get('/', function (req, res, next) {
    res.render('index', {
        title: 'Auth',
        isAuthenticated: req.oidc.isAuthenticated()
    });
});
homeRouter.get('/home', function (req, res, next) {
    res.redirect('/');
});

homeRouter.get('/archive', function (req, res, next) {
    res.render('archive');
});
homeRouter.get('/copyright', function (req, res, next) {
    res.render('copyright');
});
homeRouter.get('/about', function (req, res, next) {
    res.render('about');
});

module.exports = { homeRouter }