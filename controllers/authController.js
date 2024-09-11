const User = require('../models/user')
const VisitCounter = require('../models/visiterSchema');
const bcrypt = require('bcrypt')
require('dotenv').config();
ADMIN_PANEL = process.env.ADMIN_PANEL
PANEL_PASS = process.env.PANEL_PASS

const checkEmailExists = async (email) => {
    try {
        // Query the database for a user with the provided email
        const user = await User.findOne({ email });
        return !!user; // Return true if user exists, false otherwise
    } catch (error) {
        console.error('Error checking email existence:', error);
        throw error; // Rethrow the error if needed
    }
};

// Helper function to validate email
const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.toLowerCase());
};

const handleRegister = async (req, res) => {
    const { userName, email, city, phone, password, confirmPw, } = req.body;

    // Array to collect error messages
    const errors = {};

    // Validate Email
    if (!email || !isValidEmail(email)) {
        errors.email = 'Please enter a valid email address.';
    } else if (await checkEmailExists(email)) {
        errors.email = 'Email is already registered.';
    }

    // Validate Password
    if (!password || password.length < 6) {
        errors.password = 'Password must be at least 6 characters long.';
    }

    // Validate Confirm Password
    if (password !== confirmPw) {
        errors.confirmPw = 'Passwords do not match.';
    }

    // Validate Phone Number (10 digits)
    if (!phone || !/^\d{10}$/.test(phone)) {
        errors.phone = 'Phone number must be exactly 10 digits.';
    }
    // Check for validation errors
    if (Object.keys(errors).length > 0) {
        return res.render('user/register', { errors, email, phone, userName, city, phone });
    }

    try {
        // Hash the password before saving it to the database
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create the user if there are no errors
        await User.create({ userName, city, phone, email, password: hashedPassword, });
        return res.redirect('/login')
    } catch (error) {
        console.error(error);
        return res.render('user/register', { error: 'Error during registration' });
    }
};

const handleLogin = async (req, res, next) => {
    const isAdmin = false;
    const { email, password } = req.body;

    // Array to collect error messages
    const errors = {};

    // Validate Email
    if (!email || !isValidEmail(email)) {
        errors.email = 'Please enter a valid email address.';
    }

    // Validate Password
    if (!password) {
        errors.password = 'Please enter your password.';
    }

    // Check for validation errors
    if (Object.keys(errors).length > 0) {
        return res.render('user/login', { errors, email });
    }
    try {

        if (email === process.env.ADMIN_PANEL && password === process.env.PANEL_PASS) {
            req.session.adminEmail = email;
            return res.redirect('admin');
        }
        // Check if user exists
        const user = await User.findOne({ email });

        if (!user) {
            errors.email = 'No account found with this email.';
            return res.render('user/login', { errors, email });
        }

        // Compare passwords
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            errors.password = 'Incorrect password.';
            return res.render('user/login', { errors, email });
        }

        // If login is successful, set the session
        req.session.userId = user._id;

        req.session.save(err => {
            if (err) {
                console.error('Session save error:', err);
                return res.render('user/login', { error: 'Error during login' });
            }
            // Redirect to the homepage after saving session
            return res.redirect('/');
        });
    } catch (error) {
        console.error(error);
        return res.render('user/login', { error: 'Error during login' });
    }

}

const handleLogout = async (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.redirect('/');
        }
        res.clearCookie('connect.sid');
        return res.redirect('/login');
    })
}

const handleIndexPage = (req, res) => {
    const userId = req.session.userId; // Retrieve userId from session
    res.render('index', { userId }); // Pass userId to the view
};

registerPage = (req, res) => {
    res.render('user/authentication');
}

const visiterCheck = async (req, res) => {
    try {
        const visitCounter = await VisitCounter.findOne();
        const totalVisits = visitCounter ? visitCounter.count : 0;
        res.render('user/visiter-check', { totalVisits }); // Render the view with the visit count
    } catch (err) {
        console.error('Error retrieving visit count:', err);
        res.status(500).send('Error retrieving visit count');
    }
};



module.exports = { handleRegister, handleLogin, handleLogout, registerPage, visiterCheck };