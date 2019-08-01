const expect = require("chai").expect;
const sinon = require("sinon");
const User = require("../models/user");
const { login, signup } = require("../controllers/auth");

describe("Auth controller - login", () => {
    it("should throw an error if accessing the database fails with code 500", done => {
        sinon.stub(User, "findOne");
        User.findOne.throws();
        const req = {
            body: {
                email: "test@test.com",
                password: "tester"
            }
        };
        login(req, {}, () => {}).then(result => {
            expect(result).to.be.an("error");
            expect(result).to.have.property("statusCode", 500);
            User.findOne.restore();
            done();
        });
    });
});
