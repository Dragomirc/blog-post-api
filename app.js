require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const feedHandler = require("./routes/feed.js");
const app = express();

mongoose.connect(
    `mongodb+srv://Dragomir:${
        process.env.DATABASE_PASSWORD
    }@cluster0-lie0b.mongodb.net/blog-post?retryWrites=true&w=majority`
);
app.use(bodyParser.urlencoded({ extended: false }));

app.use(bodyParser.json());
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
app.listen(8080, () => {
    console.log("Server listens at port 8080");
});
