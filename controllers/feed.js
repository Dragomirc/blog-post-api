const { validationResult } = require("express-validator/check");
const Post = require("../models/post");
exports.getPosts = (req, res, next) => {
    Post.find()
        .then(posts => {
            res.status(200).json({
                message: "Fetched posts succesfully",
                posts
            });
        })
        .catch(error => {
            if (!error.statusCode) {
                statusCode = 500;
            }
            next(error);
        });
};

exports.postPost = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new Error(
            "Validation failed, entered data is incorrect."
        );
        error.statusCode = 422;
        throw error;
    }
    if (!req.file) {
        const error = new Error("No image provided.");
        error.statusCode = 422;
        throw error;
    }
    const imageUrl = req.file.path.replace("\\", "/");
    const { title, content } = req.body;
    const post = new Post({
        title,
        content,
        imageUrl,
        creator: { name: "Dragomir" }
    });
    post.save()
        .then(post => {
            res.status(201).json({
                message: "Post created successfully!",
                post
            });
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        });
};

exports.getPost = (req, res, next) => {
    const { postId } = req.params;
    Post.findById(postId)
        .then(post => {
            if (!post) {
                const error = new Error("Could not find post.");
                error.statusCode = 404;
                throw error;
            }
            res.status(200).json({ message: "Post fetched", post });
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        });
};
