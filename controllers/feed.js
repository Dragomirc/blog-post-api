const { validationResult } = require("express-validator/check");
const fs = require("fs");
const path = require("path");
const Post = require("../models/post");
const User = require("../models/user");
exports.getPosts = (req, res, next) => {
    const currentPage = req.query.page || 1;
    const perPage = 2;
    let totalItems = 0;
    Post.find()
        .countDocuments()
        .then(total => {
            totalItems = total;
            return Post.find()
                .skip((currentPage - 1) * perPage)
                .limit(perPage);
        })
        .then(posts => {
            res.status(200).json({
                message: "Fetched posts succesfully",
                posts,
                totalItems
            });
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
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
    const { userId } = req;
    let creator;
    const post = new Post({
        title,
        content,
        imageUrl,
        creator: userId
    });
    post.save()
        .then(result => {
            return User.findById(userId);
        })
        .then(user => {
            creator = user;
            user.posts.push({ postId: post._id });
            return user.save();
        })
        .then(result => {
            res.status(201).json({
                message: "Post created successfully!",
                post,
                creator: {
                    _id: creator._id,
                    name: creator.name
                }
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
exports.updatePost = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new Error("Validation failed,entered data is incorrect.");
        error.statusCode = 422;
        throw error;
    }
    const { postId } = req.params;
    const { userId } = req;
    const { title, content } = req.body;
    let imageUrl = req.body.image;
    if (req.file) {
        imageUrl = req.file.path.replace("\\", "/");
    }
    if (!imageUrl) {
        const error = new Error("No image provided.");
        error.statusCode = 422;
        throw error;
    }
    Post.findById(postId)
        .then(post => {
            if (userId !== post.creator.toString()) {
                const error = new Error("Cannot eidt other users posts");
                error.statusCode = 403;
                throw error;
            }
            if (!post) {
                const error = new Error("Could not find post.");
                error.statusCode = 404;
                throw error;
            }
            if (imageUrl !== post.imageUrl) {
                clearImage(post.imageUrl);
            }
            post.title = title;
            post.imageUrl = imageUrl;
            post.content = content;
            return post.save();
        })
        .then(post => {
            res.status(200).json({ message: "Post updated!", post });
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        });
};

const clearImage = filePath => {
    filePath = path.join(__dirname, "..", filePath);
    fs.unlink(filePath, err => console.log(err));
};
exports.deletePost = (req, res, next) => {
    const { postId } = req.params;
    const { userId } = req;
    Post.findById(postId)
        .then(post => {
            if (userId !== post.creator.toString()) {
                const error = new Error("Cannot delete other users posts");
                error.statusCode = 403;
                throw error;
            }
            if (!post) {
                const error = new Error("Could not find post.");
                error.statusCode = 404;
                throw error;
            }
            //Check logged in user
            clearImage(post.imageUrl);
            return Post.findByIdAndRemove(postId);
        })
        .then(() => {
            return User.findById(userId);
        })
        .then(user => {
            user.posts.pull(postId);
            return user.save();
        })
        .then(() => {
            res.status(200).json({ message: "Post successfully deleted!" });
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        });
};

exports.getStatus = (req, res, next) => {
    const { userId } = req;
    User.findById(userId)
        .then(user => {
            if (!user) {
                const error = new Error("No User found!");
                error.statusCode = 404;
                throw error;
            }
            return res.status(200).json({
                message: "User status fetched successfully!",
                status: user.status
            });
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        });
};

exports.updateStatus = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new Error("Status validation failed!");
        error.statusCode = 422;
        error.data = errors.array();
        throw error;
    }
    const { userId } = req;
    const { status } = req.body;
    User.findById(userId)
        .then(user => {
            if (!user) {
                const error = new Error("No User found!");
                error.statusCode = 404;
                throw error;
            }
            user.status = status;
            return user.save();
        })
        .then(user => {
            res.status(200).json({
                message: "Status updated successfully!",
                status: user.status
            });
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        });
};
