// middleware/setIsLoggedIn.js
module.exports = (req, res, next) => {
    res.locals.isLoggedIn = !!req.session.userId;
    next();
};
