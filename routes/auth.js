const express = require("express");
const { body } = require("express-validator");
const authHandler = require("../controllers/auth");
const User = require("../models/user");
const router = express.Router();

router.post(
    "/signup",
    [
        body("name")
            .trim()
            .isLength({ min: 5 }),
        body("email")
            .trim()
            .isEmail()
            .withMessage("Please enter a valid email.")
            .custom((value, { req }) => {
                return User.findOne({ email: value }).then(user => {
                    if (user) {
                        return Promise.reject("User Already Exists.");
                    }
                });
            })
            .normalizeEmail(),
        body("password")
            .trim()
            .isLength({ min: 8 })
    ],
    authHandler.signup
);
router.post("/login", authHandler.login);
module.exports = router;
