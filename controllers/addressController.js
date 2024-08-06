const addAddress = (req, res) => {
    const userId = req.session.userId;
    res.render('user/add-address', { userId, isLoggedIn: !!req.session.userId });
}

module.exports = { addAddress }