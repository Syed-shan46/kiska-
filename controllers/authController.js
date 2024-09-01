const User = require('../models/user')
const bcrypt = require('bcrypt')


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
    return emailRegex.test(email);
};

const handleRegister = async (req, res) => {
    const { firstName, email, lastName, city, phone, password, confirmPw, } = req.body;

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

    // Validate Phone Number
    if (!phone || !/^\+?[0-9\s\-()]*$/.test(phone)) {
        errors.phone = 'Please enter a valid phone number.';
    }

    // Check for validation errors
    if (Object.keys(errors).length > 0) {
        return res.render('user/register', { errors, email, phone, firstName, lastName, city, phone });
    }

    try {
        // Hash the password before saving it to the database
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create the user if there are no errors
        await User.create({ firstName, lastName, city, phone, email, password: hashedPassword, });
        return res.redirect('/login')
    } catch (error) {
        console.error(error);
        return res.render('user/register', { error: 'Error during registration' });
    }
};

// const handleLogin = async (req, res) => {
//     const { email, password } = req.body;

//     // Array to collect error messages
//     const errors = {};

//     // Validate Email
//     if (!email || !isValidEmail(email)) {
//         errors.email = 'Please enter a valid email address.';
//     }

//     // Validate Password
//     if (!password) {
//         errors.password = 'Please enter your password.';
//     }

//     // Check for validation errors
//     if (Object.keys(errors).length > 0) {
//         return res.render('user/login', { errors, email });
//     }
//     try {
//         // Check if user exists
//         const user = await User.findOne({ email });

//         if (!user) {
//             errors.email = 'No account found with this email.';
//             return res.render('user/login', { errors, email });
//         }

//         // Compare passwords
//         const isMatch = await bcrypt.compare(password, user.password);

//         if (!isMatch) {
//             errors.password = 'Incorrect password.';
//             return res.render('user/login', { errors, email });
//         }

//         // If login is successful, set the session
//         req.session.userId = user._id;

//         req.session.save(err => {
//             if (err) {
//                 console.error('Session save error:', err);
//                 return res.render('user/login', { error: 'Error during login' });
//             }
//             // Redirect to the homepage after saving session
//             return res.redirect('/');
//         });
//     } catch (error) {
//         console.error(error);
//         return res.render('user/login', { error: 'Error during login' });
//     }

// }

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