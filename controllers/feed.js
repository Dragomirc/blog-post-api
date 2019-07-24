const { validationResult } = require("express-validator/check");
const Post = require("../models/post");
exports.getPosts = (req, res, next) => {
    res.status(200).json({
        posts: [
            {
                _id: "1",
                title: "First Post",
                content: "This is the first post!",
                imageUrl: "images/test.jpg",
                creator: {
                    name: "Dragomir"
                },
                createdAt: new Date()
            }
        ]
    });
    next();
};

exports.postPost = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({
            messsage: "Validation failed, entered data is incorrect.",
            errors: errors.array(0)
        });
    }
    const { title, content } = req.body;
    const post = new Post({
        title,
        content,
        creator: { name: "Dragomir" },
        createdAt: new Date()
    });
    post.save()
        .then(post => {
            res.status(201).json({
                message: "Post created successfully!",
                post
            });
        })
        .catch(console.log);
};
