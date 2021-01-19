const router = require('express').Router();
const User = require('../model/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { registerValidation, loginValidation } = require('../validation');

router.post('/register', async (req, res) => {
    //Validate data before try to save
    const validation = registerValidation(req.body);
    if (validation.error) return res.status(400).send(validation.error.details[0].message);

    //Check if the user is already in the db
    const emailExists = await User.findOne({ email: req.body.email });
    if (emailExists) return res.status(400).send('Email already exists');

    //Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPass = await bcrypt.hash(req.body.pass, salt);

    //Create new User
    const user = new User({
        name: req.body.name,
        email: req.body.email,
        pass: hashedPass
    });
    try {
        const savedUser = await user.save();
        res.send({ user: savedUser._id });
    } catch (err) {
        res.status(400).send(err);
    }
});

router.post('/login', async (req, res) => {
    const validation = loginValidation(req.body);
    if (validation.error) return res.status(400).send(validation.error.details[0].message);

    //Check if email exists
    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(400).send('Email or password is wrong');

    //Check if pass is correct
    const validPass = await bcrypt.compare(req.body.pass, user.pass);
    if (!validPass) return res.status(400).send('Email or Password is wrong');

    //JWT: create and assign token
    const token = jwt.sign({_id: user._id}, process.env.TOKEN_SECRET);
    res.header('auth-token', token).send(token);
});

module.exports = router;