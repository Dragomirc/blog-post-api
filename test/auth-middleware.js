const expect = require("chai").expect;
const jwt = require("jsonwebtoken");
const sinon = require("sinon");
const authMiddleware = require("../middleware/is-auth");

describe("Auth middleware", () => {
    it("should throw an error if no authorization header is present", () => {
        const req = {
            get: () => null
        };
        expect(authMiddleware.isAuth.bind(this, req, {}, () => {})).to.throw(
            "Not authenticated."
        );
    });
    it("should throw an error if our autrixation header is only one string", () => {
        const req = {
            get: () => "Authorizationheader"
        };
        expect(authMiddleware.isAuth.bind(this, req, {}, () => {}))
            .to.throw()
            .with.property("statusCode", 500);
    });
    it("should throw an error if the token cannot be verified", () => {
        const req = {
            get: () => "Bearer xyz"
        };
        expect(authMiddleware.isAuth.bind(this, req, {}, () => {})).to.throw();
    });
    it("should yield a userId after decoding the token", () => {
        const req = {
            get: () => "Bearer xyz"
        };
        sinon.stub(jwt, "verify");
        jwt.verify.returns({ userId: "abc" });
        authMiddleware.isAuth(req, {}, () => {});
        expect(req).to.have.property("userId", "abc");
        jwt.verify.restore();
    });
});
