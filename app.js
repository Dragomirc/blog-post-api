const express = require("express");
const bodyParser = require("body-parser");

const feedHandler = require("./routes/feed.js");
const app = express();

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
