const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user");

exports.signup = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new Error("Validation failed.");
        error.statusCode = 422;
        error.data = errors.array();
        throw error;
    }
    const { email, name, password } = req.body;

    bcrypt
        .hash(password, 12)
        .then(hash => {
            const user = new User({
                email,
                name,
                password: hash
            });
            return user.save();
        })
        .then(user => {
            res.status(201).json({
                message: "User successfully created",
                userId: user._id
            });
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        });
};

exports.login = (req, res, next) => {
    const { email, password } = req.body;
    let loadedUser;
    User.findOne({ email })
        .then(user => {
            if (!user) {
                const error = new Error(
                    "A user with this email could not be found"
                );
                error.statusCode = 401;
                throw error;
            }
            loadedUser = user;

            return bcrypt.compare(password, user.password);
        })
        .then(doMatch => {
            if (!doMatch) {
                const error = new Error("Incorrect password.");
                error.statusCode = 401;
                throw error;
            }
            const token = jwt.sign(
                { email: loadedUser.email, userId: loadedUser._id.toString() },
                process.env.SECRET,
                { expiresIn: "1h" }
            );
            res.status(200).json({ token, userId: loadedUser._id.toString() });
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        });
};
