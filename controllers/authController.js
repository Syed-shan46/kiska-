const User = require('../models/user');

const handleRegister = async (req, res) => {
    const { email, password } = req.body;
    try {
        await User.create({
            email, password
        });
        return res.render('user/authentication');
    } catch (error) {
        console.error(error);
        return res.render('user/authentication', { error: 'Error during registration' });
    }
}

const handleLogin = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email, password });
        if (!user) {
            return res.render('user/authentication', { error: 'Invalid Username or password' },
            )
        }
        req.session.userId = user._id;
        return res.redirect('/');
    } catch (error) {
        console.error(error);
        return res.render('user/authentication', { error: error })
    }

}

const handleLogout = async (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.redirect('/');
        }
        res.clearCookie('connect.sid');
        return res.redirect('/register');
    })
}

const handleIndexPage = (req, res) => {
    const userId = req.session.userId; // Retrieve userId from session
    res.render('index', { userId }); // Pass userId to the view
};

registerPage = (req, res) => {
    res.render('user/authentication');
}

module.exports = { handleRegister, handleLogin, handleLogout, registerPage };