const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user");

exports.signup = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new Error("Validation failed.");
        error.statusCode = 422;
        error.data = errors.array();
        throw error;
    }
    const { email, name, password } = req.body;
    try {
        const hash = await bcrypt.hash(password, 12);
        const user = new User({
            email,
            name,
            password: hash
        });
        await user.save();

        res.status(201).json({
            message: "User successfully created",
            userId: user._id
        });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};

exports.login = async (req, res, next) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            const error = new Error(
                "A user with this email could not be found"
            );
            error.statusCode = 401;
            throw error;
        }
        const doMatch = await bcrypt.compare(password, user.password);
        if (!doMatch) {
            const error = new Error("Incorrect password.");
            error.statusCode = 401;
            throw error;
        }
        const token = jwt.sign(
            { email: user.email, userId: user._id.toString() },
            process.env.SECRET,
            { expiresIn: "1h" }
        );
        res.status(200).json({ token, userId: user._id.toString() });
        return;
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
        return err;
    }
};
