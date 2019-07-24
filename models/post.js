const mongoose = require("mongoose");

const Post = mongoose.model("Post", {
    title: { type: String, required: true },
    content: { type: String, required: true },
    creator: {
        name: { type: String, required: true }
    },
    createdAt: { type: Date, required: true }
});

module.exports = Post;
