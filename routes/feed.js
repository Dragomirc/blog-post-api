const express = require("express");
const { body } = require("express-validator/check");
const feedController = require("../controllers/feed");
const { isAuth } = require("../middleware/is-auth");
const router = express.Router();

router.get("/posts", isAuth, feedController.getPosts);
router.get("/post/:postId", isAuth, feedController.getPost);
router.get("/status", isAuth, feedController.getStatus);
router.post(
    "/post",
    isAuth,
    [
        body("title")
            .trim()
            .isLength({ min: 5 }),
        body("content")
            .trim()
            .isLength({ min: 5 })
    ],
    feedController.postPost
);
router.put(
    "/post/:postId",
    isAuth,
    [
        body("title")
            .trim()
            .isLength({ min: 5 }),
        body("content")
            .trim()
            .isLength({ min: 5 })
    ],
    feedController.updatePost
);
router.patch(
    "/status",
    [
        body("status")
            .trim()
            .not()
            .isEmpty()
    ],
    isAuth,
    feedController.updateStatus
);
router.delete("/post/:postId", isAuth, feedController.deletePost);

module.exports = router;
