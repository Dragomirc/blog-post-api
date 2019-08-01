require("dotenv").config();
const expect = require("chai").expect;
const mongoose = require("mongoose");
const sinon = require("sinon");
const io = require("../socket");
const User = require("../models/user");
const Post = require("../models/post");
const { getStatus, postPost } = require("../controllers/feed");

describe("Feed controler - getStatus", () => {
    let user;
    before(done => {
        mongoose
            .connect(
                `mongodb+srv://${process.env.MONGO_USER}:${
                    process.env.MONGO_PASSWORD
                }@cluster0-lie0b.mongodb.net/${
                    process.env.MONGO_TEST_DATABASE
                }?retryWrites=true&w=majority`
            )
            .then(result => {
                user = new User({
                    email: "test@test.com",
                    password: "tester",
                    name: "Test",
                    posts: []
                });
                user.save();
                done();
            });
    });
    after(done => {
        User.deleteMany()
            .then(() => {
                return mongoose.disconnect();
            })
            .then(() => {
                done();
            });
    });
    it("should send a response wiht a valid user status for an exisiting user", done => {
        const req = { userId: user._id };
        const res = {
            statusCode: 500,
            userStatus: null,
            status: function(code) {
                this.statusCode = code;
                return this;
            },
            json: function({ message, status }) {
                this.message = message;
                this.userStatus = status;
                return this;
            }
        };
        getStatus(req, res, () => {}).then(() => {
            expect(res.statusCode).to.be.equal(200);
            expect(res.userStatus).to.be.equal("I'm new!");
            done();
        });
    });
});

describe("Feed controller - postPost", () => {
    let user;
    before(done => {
        mongoose
            .connect(
                `mongodb+srv://${process.env.MONGO_USER}:${
                    process.env.MONGO_PASSWORD
                }@cluster0-lie0b.mongodb.net/${
                    process.env.MONGO_TEST_DATABASE
                }?retryWrites=true&w=majority`
            )
            .then(() => {
                user = new User({
                    email: "test@test.com",
                    password: "tester",
                    name: "Test",
                    posts: []
                });
                user.save();
                done();
            });
    });
    after(done => {
        User.deleteMany({})
            .then(() => {
                return mongoose.disconnect();
            })
            .then(() => {
                done();
            });
    });
    it("should add a create post to the posts of the creator", done => {
        const req = {
            body: {
                title: "Test Post",
                content: "A Test Post"
            },
            file: {
                path: "abc"
            },
            userId: user._id
        };
        const res = {
            status: function() {
                return this;
            },
            json: function() {}
        };
        io.init();
        postPost(req, res, () => {}).then(savedUser => {
            expect(savedUser).to.have.property("posts");
            expect(savedUser.posts).to.have.length(1);
            done();
        });
    });
});
