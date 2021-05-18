process.env.DB_DATABASE = process.env.DB_DATABASE || "studenthome_testdb";
process.env.NODE_ENV = "testing";
process.env.LOGLEVEL = "error";

console.log(`Running tests using database '${process.env.DB_DATABASE}'`);
const chai = require("chai");
const chaiHttp = require("chai-http");
const server = require("../../server");
const pool = require("../../src/database/database");

var logger = require("tracer").console();

chai.should();
chai.use(chaiHttp);
const assert = require("assert");

const bcrypt = require("bcrypt");
const saltRounds = 10;

const CLEAR_DB = "DELETE IGNORE FROM `user`";

var passwordJanSmit;
var passwordJanneSterk;

const INSERT_JANSMIT = `INSERT INTO user (ID, First_Name, Last_Name, Email, Student_Number, Password) VALUES (1, "Jan", "Smit", "jsmit@server.nl", "1234567", ?)`;

const INSERT_JANNESTERK = `INSERT INTO user (ID, First_Name, Last_Name, Email, Student_Number, Password) VALUES (2, "Janne", "Sterk", "voorbeeld@email.nl", 897653, ?)`;

describe("Authentication", () => {
  before((done) => {
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
          done();
        });
    });
  });

  it("TC-101-4 User Exist", (done) => {
    bcrypt.genSalt(saltRounds, function (err, salt) {
      if (err) {
        throw err;
      } else {
        bcrypt.hash("secret", 10, function (err, hash) {
          if (err) console.log(err);
          passwordJanSmit = hash;
          pool.query(INSERT_JANSMIT, [hash], (err, rows, fields) => {
            if (err) {
              logger.error(`before INSERT_JANSMIT: ${err}`);
              done(err);
            }
            if (rows) {
              logger.debug(`before INSERT_JANSMIT done`);
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
                  done();
                });
            }
          });
        });
      }
    });
  });

  describe("UC102 Login", () => {
    before((done) => {
      bcrypt.genSalt(saltRounds, function (err, salt) {
        if (err) {
          throw err;
        } else {
          bcrypt.hash("wachtwoord", 10, function (err, hash) {
            if (err) console.log(err);
            passwordJanneSterk = hash;
            pool.query(INSERT_JANNESTERK, [hash], (err, rows, fields) => {
              if (err) {
                logger.error(`before INSERT_JANNESTERK: ${err}`);
                done(err);
              }
              if (rows) {
                logger.debug(`before INSERT_JANNESTERK done`);
                done();
              }
            });
          });
        }
      });
    });

    it("TC-102-1 required field is missing", (done) => {
      chai
        .request(server)
        .post("/api/login")
        .send({
          password: "wachtwoord",
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
          email: "voorbeeld@email.nllll",
          password: "wachtwoord",
        })
        .end((err, res) => {
          assert.ifError(err);
          res.should.have.status(401);
          res.body.should.be.an("object").that.has.all.keys("message");
          let { message } = res.body;
          message.should.be
            .a("string")
            .that.equals("User not found or password invalid");
          done();
        });
    });
    it("TC-102-3 Invalid password", (done) => {
      chai
        .request(server)
        .post("/api/login")
        .send({
          email: "voorbeeld@email.nl",
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
          done();
        });
    });

    
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

          done();
        });
    });

    it("TC-102-5 should return a token when providing valid information", (done) => {
      chai
        .request(server)
        .post("/api/login")
        .send({
          email: "voorbeeld@email.nl",
          password: "wachtwoord",
        })
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a("object");
          const response = res.body;
          response.should.have.property("token").which.is.a("string");
          done();
        });
    });

    describe("Info", () => {
      it("TC-103-1 should return owner info", (done) => {
        chai
          .request(server)
          .get("/api/info")
          .send()
          .end((err, res) => {
            assert.ifError(err);
            res.should.have.status(200);
            res.body.should.be.a("object");
            

            done();
          });
      });

      describe("Endpoint does not exist", () => {
        it("TC-104-1 should return error if endpoint does not exist", (done) => {
          chai
            .request(server)
            .get("/info")
            .send()
            .end((err, res) => {
              assert.ifError(err);
              res.should.have.status(401);
              res.body.should.be
                .an("object")
                .that.has.all.keys("error", "message");

              let { error, message } = res.body;
              error.should.be.a("string").that.equals("Some error occured");
              message.should.be
                .a("string")
                .that.equals("Endpoint /info does not exists");

              done();
            });
        });
      });
    });
  });
});
