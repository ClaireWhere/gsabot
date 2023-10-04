const express = require("express");
const profileRouter = express.Router();
const { requiresAuth } = require('express-openid-connect');


profileRouter.get('/profile', requiresAuth(), function (req, res, next) {
    res.render('profile', {
        userProfile: JSON.stringify(req.oidc.user, null, 2),
        title: 'Profile page'
    });
});

module.exports = { profileRouter }