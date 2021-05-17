process.env.DB_DATABASE = process.env.DB_DATABASE || "studenthome_testdb";
process.env.NODE_ENV = "testing";
process.env.LOGLEVEL = "error";

console.log(`Running tests using database '${process.env.DB_DATABASE}'`);
const chai = require("chai");
const chaiHttp = require("chai-http");
const server = require("../../server");
const pool = require("../../src/database/database");

chai.should();
chai.use(chaiHttp);
const assert = require("assert");

const CLEAR_DB = "DELETE IGNORE FROM `user`";
const INSERT_JAN_SMIT =
  "INSERT INTO `user` (`First_Name`, `Last_Name`, `Email`, `Student_Number`, `Password`) VALUES('FirstName', 'LastName', 'jsmit@server.nl', 1234567, 'secret')";

describe("Authentication", () => {
  before((done) => {
    // console.log('beforeEach')
    pool.getConnection(function (err, connection) {
      if (err) {
        logger.error("", err);
        next({ message: "Failed getting connection", errCode: 400 });
      }
      if (connection) {
        connection.query(CLEAR_DB, (err, rows, fields) => {
          if (err) {
            console.log(`beforeEach CLEAR error: ${err}`);
            done(err);
          } else {
            done();
          }
        });
      }
    });
  });

  after((done) => {
    // console.log('beforeEach')
    pool.getConnection(function (err, connection) {
      if (err) {
        logger.error("", err);
        next({ message: "Failed getting connection", errCode: 400 });
      }
      if (connection) {
        connection.query(CLEAR_DB, (err, rows, fields) => {
          if (err) {
            console.log(`beforeEach CLEAR error: ${err}`);
            done(err);
          } else {
            done();
          }
        });
      }
    });
  });

  describe("UC101 Registration", () => {
    it("TC-101-1 required field is missing", (done) => {
      chai
        .request(server)
        .post("/api/register")
        .send({
          firstname: "FirstName",
          lastname: "LastName",
          studentnr: 1234567,
          password: "secret",
        })
        .end((err, res) => {
          assert.ifError(err);
          res.should.have.status(422);
          res.should.be.an("object");

          done();
        });
    });
    it("TC-101-2 invalid email adres", (done) => {
      chai
        .request(server)
        .post("/api/register")
        .send({
          firstname: "FirstName",
          lastname: "LastName",
          email: 1213,
          studentnr: 1234567,
          password: "secret",
        })
        .end((err, res) => {
          assert.ifError(err);
          res.should.have.status(422);
          done();
        });
    });
    it("TC-101-3 invalid password", (done) => {
      chai
        .request(server)
        .post("/api/register")
        .send({
          firstname: "FirstName",
          lastname: "LastName",
          email: "FirstName@email.nl",
          studentnr: 1234567,
          password: 2324,
        })
        .end((err, res) => {
          assert.ifError(err);
          res.should.have.status(422);
          done();
        });
    });
    it("TC-101-5 should return a token when providing valid information", (done) => {
      chai
        .request(server)
        .post("/api/register")
        .send({
          firstname: "FirstName",
          lastname: "LastName",
          email: "test@test.nl",
          studentnr: 1234567,
          password: "secret",
        })
        .end((err, res) => {
          assert.ifError(err);
          res.should.have.status(200);
          res.body.should.be.a("object");
          const response = res.body;
          response.should.have.property("token").which.is.a("string");
          // response.should.have.property('username').which.is.a('string')
          done();
        });
    });
  });

  it("TC-101-4 User Exist", (done) => {
    pool.getConnection(function (err, connection) {
      if (err) {
        logger.error("", err);
        next({ message: "Failed getting connection", errCode: 400 });
      }
      if (connection) {
        connection.query(INSERT_JAN_SMIT, (err, rows, fields) => {
          if (err) {
            console.log(`beforeEach JAN SMIT error: ${err}`);
            done(err);
          } else {
            chai
              .request(server)
              .post("/api/register")
              .send({
                firstname: "FirstName",
                lastname: "LastName",
                email: "jsmit@server.nl",
                studentnr: 1234567,
                password: "secret",
              })
              .end((err, res) => {
                assert.ifError(err);
                res.should.have.status(400);
                res.should.be.an("object");
                res.body.should.be.an("object").that.has.all.keys("message");
                let { message } = res.body;
                message.should.be
                  .a("string")
                  .that.equals("This email has already been taken.");
                //datetime.should.be.a(Date);
                done();
              });
          }
        });
      }
    });
  });

  describe("UC102 Login", () => {
    it("TC-102-1 required field is missing", (done) => {
      chai
        .request(server)
        .post("/api/login")
        .send({
          password: "secret",
        })
        .end((err, res) => {
          assert.ifError(err);
          res.should.have.status(422);
          res.body.should.be.an("object").that.has.all.keys("error");
          let { error } = res.body;
          error.should.be.a("string");
          done();
        });
    });

    it("TC-102-2 Invalid email adres", (done) => {
      chai
        .request(server)
        .post("/api/login")
        .send({
          email: "jsmit@server.nll",
          password: "secret",
        })
        .end((err, res) => {
          assert.ifError(err);
          res.should.have.status(401);
          res.body.should.be.an("object").that.has.all.keys("message");
          let { message } = res.body;
          message.should.be
            .a("string")
            .that.equals("User not found or password invalid");
          //datetime.should.be.a(new Date().toISOString());
          done();
        });
    });
    it("TC-102-3 Invalid password", (done) => {
      chai
        .request(server)
        .post("/api/login")
        .send({
          email: "jsmit@server.nll",
          password: "secrett",
        })
        .end((err, res) => {
          assert.ifError(err);
          res.should.have.status(401);
          res.body.should.be.an("object").that.has.all.keys("message");
          let { message } = res.body;
          message.should.be
            .a("string")
            .that.equals("User not found or password invalid");
          //datetime.should.be.a(new Date().toISOString());
          done();
        });
    });
    /**
     * This assumes that a user with given credentials exists. That is the case
     * when register has been done before login.
     */
    it("TC-102-4 User does not exist", (done) => {
      chai
        .request(server)
        .post("/api/login")
        .send({
          email: "test@test.nlf",
          password: "secret",
        })
        .end((err, res) => {
          assert.ifError(err);
          res.should.have.status(401);
          res.body.should.be.an("object").that.has.all.keys("message");

          let { message } = res.body;
          message.should.be
            .a("string")
            .that.equals("User not found or password invalid");
          //datetime.should.be.a(new Date().toISOString());
          done();
        });
    });

    /**
     * This assumes that a user with given credentials exists. That is the case
     * when register has been done before login.
     */
    it("TC-102-5 should return a token when providing valid information", (done) => {
      chai
        .request(server)
        .post("/api/login")
        .send({
          email: "jsmit@server.nl",
          password: "secret",
        })
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a("object");
          const response = res.body;
          response.should.have.property("token").which.is.a("string");
          // response.should.have.property('username').which.is.a('string')
          done();
        });
    });
  });
});
