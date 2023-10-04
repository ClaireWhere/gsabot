const userMiddleware = (req, res, next) => {
    res.locals.user = req.oidc.user;
    next();
}

module.exports = { userMiddleware }