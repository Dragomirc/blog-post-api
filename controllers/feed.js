const { validationResult } = require("express-validator/check");
const fs = require("fs");
const path = require("path");
const io = require("../socket");
const Post = require("../models/post");
const User = require("../models/user");
exports.getPosts = async (req, res, next) => {
    const currentPage = req.query.page || 1;
    const perPage = 2;
    try {
        const totalItems = await Post.find().countDocuments();
        const posts = await Post.find()
            .sort({ createdAt: -1 })
            .populate("creator")
            .skip((currentPage - 1) * perPage)
            .limit(perPage);

        res.status(200).json({
            message: "Fetched posts succesfully",
            posts,
            totalItems
        });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};

exports.postPost = async (req, res, next) => {
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
    const post = new Post({
        title,
        content,
        imageUrl,
        creator: userId
    });

    try {
        await post.save();
        const user = await User.findById(userId);
        user.posts.push({ postId: post._id });
        const savedUser = await user.save();
        io.getIo().emit("posts", {
            action: "create",
            post: { ...post._doc, creator: { _id: userId, name: user.name } }
        });
        res.status(201).json({
            message: "Post created successfully!",
            post,
            creator: {
                _id: user._id,
                name: user.name
            }
        });

        return savedUser;
    } catch (err) {
        console.log(err);
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};

exports.getPost = async (req, res, next) => {
    const { postId } = req.params;
    try {
        const post = await Post.findById(postId);
        if (!post) {
            const error = new Error("Could not find post.");
            error.statusCode = 404;
            throw error;
        }
        res.status(200).json({ message: "Post fetched", post });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};
exports.updatePost = async (req, res, next) => {
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
    try {
        const post = await Post.findById(postId).populate("creator");

        if (userId !== post.creator._id.toString()) {
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
        const updatedPost = await post.save();
        io.getIo().emit("posts", {
            action: "update",
            post: updatedPost
        });
        res.status(200).json({ message: "Post updated!", post: updatedPost });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};

const clearImage = filePath => {
    filePath = path.join(__dirname, "..", filePath);
    fs.unlink(filePath, err => console.log(err));
};
exports.deletePost = async (req, res, next) => {
    const { postId } = req.params;
    const { userId } = req;
    try {
        const post = await Post.findById(postId);
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
        const pos = await Post.findByIdAndRemove(postId);
        const user = await User.findById(userId);
        user.posts.pull(postId);
        await user.save();
        io.getIo().emit("posts", { action: "delete", post: pos });
        res.status(200).json({ message: "Post successfully deleted!" });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};

exports.getStatus = async (req, res, next) => {
    const { userId } = req;
    try {
        const user = await User.findById(userId);
        if (!user) {
            const error = new Error("No User found!");
            error.statusCode = 404;
            throw error;
        }
        return res.status(200).json({
            message: "User status fetched successfully!",
            status: user.status
        });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
        return err;
    }
};

exports.updateStatus = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new Error("Status validation failed!");
        error.statusCode = 422;
        error.data = errors.array();
        throw error;
    }
    const { userId } = req;
    const { status } = req.body;
    try {
        const user = await User.findById(userId);
        if (!user) {
            const error = new Error("No User found!");
            error.statusCode = 404;
            throw error;
        }
        user.status = status;
        await user.save();
        res.status(200).json({
            message: "Status updated successfully!",
            status: user.status
        });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};
