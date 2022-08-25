const express = require('express');
const router = express.Router();

const Auth = require('../utils/auth');
const User = require('../models/user');

router.get('/', Auth.isAuthorized(), (req, res, next) => {
    res.render('account', { title: 'Your account', userEmail: req.user.email, currentUrl: req.originalUrl });
});

router.delete('/', Auth.isAuthorized(), async (req, res, next) => {
    const user = new User(req.user.id);
    try {
        const result = await user.delete();
        res.status(result.status).send(result.message);
    } catch (error) {
        res.status(error.status).send(error.message);
    }
});

router.get('/login', Auth.isAuthorized(expectLoggedIn = false, unauthorizedRedirect = '/account'), (req, res, next) => {
    res.render('login');
});

router.post('/login', async (req, res) => {
    try {
        const authToken = await User.logIn(req.body.email, req.body.password);
        
        res.cookie('authToken', authToken, {
            httpOnly: true,
            sameSite: true,
            secure: process.env.NODE_ENV === "production"
        }).status(200).redirect('/');
    } catch (error) {
        req.flash('error', error.message);
        res.status(error.status).redirect('/account/login');
    }
});

router.get('/register', Auth.isAuthorized(expectLoggedIn = false, unauthorizedRedirect = '/account'), (req, res, next) => {
    res.render('register');
});

router.post('/register', async (req, res) => {
    try {
        const result = await User.register(req.body.email, req.body.password);
        req.flash('success', result.message);
        res.status(result.status).redirect('/account/register');
    } catch (error) {
        req.flash('error', error.message);
        res.status(error.status).redirect('/account/register');
    }
});

router.delete('/logout', Auth.isAuthorized(), (req, res, next) => {
    res.clearCookie('authToken');
    res.send('Logged out successfully');
});

module.exports = router;
