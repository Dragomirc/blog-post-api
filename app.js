require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const path = require("path");
const multer = require("multer");
const uuidv4 = require("uuid/v4");
const feedHandler = require("./routes/feed.js");
const authHandler = require("./routes/auth.js");

const app = express();
const storageFilter = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, "images");
    },
    filename: function(req, file, cb) {
        cb(null, uuidv4());
    }
});
const fileFilter = (req, file, cb) => {
    if (
        file.mimetype === "image/png" ||
        file.mimetype === "image/jpeg" ||
        file.mimetype === "image/jpg"
    ) {
        cb(null, true);
    }
    cb(null, false);
};

app.use(bodyParser.urlencoded({ extended: false }));
app.use(multer({ storage: storageFilter, fileFilter }).single("image"));
app.use(bodyParser.json());
app.use("/images", express.static(path.join(__dirname, "images")));
app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE");
    res.setHeader(
        "Access-Control-Allow-Headers",
        "Content-Type, Authorization"
    );
    next();
});
app.use("/feed", feedHandler);
app.use("/auth", authHandler);
app.use((error, req, res, next) => {
    console.log(error);
    const status = error.statusCode || 500;
    const message = error.message;
    const data = error.data;
    res.status(status).json({ message, data });
});
mongoose
    .connect(
        `mongodb+srv://Dragomir:${
            process.env.DATABASE_PASSWORD
        }@cluster0-lie0b.mongodb.net/blog-post?retryWrites=true&w=majority`
    )
    .then(result => {
        app.listen(8080);
    })
    .catch(console.log);
