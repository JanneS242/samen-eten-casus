process.env.DB_DATABASE = process.env.DB_DATABASE || "studenthome_testdb";
process.env.NODE_ENV = "testing";
process.env.LOGLEVEL = "error";

const chai = require("chai");
const chaiHttp = require("chai-http");
const server = require("../../server");
const pool = require("../../src/database/database");

var logger = require("tracer").console();
const jwt = require("jsonwebtoken");

const bcrypt = require("bcrypt");
const saltRounds = 10;

const assert = require("assert");
chai.should();
chai.use(chaiHttp);

logger.debug(`Running tests using database '${process.env.DB_DATABASE}'`);

const CLEAR_DB = "DELETE IGNORE FROM `user`";

var passwordJanneSterk;
var passwordJanSmit;


const INSERT_JANSMIT = `INSERT INTO user (ID, First_Name, Last_Name, Email, Student_Number, Password) VALUES (1, "Jan", "Smit", "jsmit@server.nl", "1234567", ?)`;

const INSERT_JANNESTERK = `INSERT INTO user (ID, First_Name, Last_Name, Email, Student_Number, Password) VALUES (2, "Janne", "Sterk", "voorbeeld@email.nl", 897653, ?)`;

/**
 * Query om twee movies toe te voegen. Let op de UserId, die moet matchen
 * met de user die je ook toevoegt.
 */
const INSERT_Studenthome = `INSERT INTO studenthome (ID, Name, Address, House_Nr, UserID, Postal_Code, Telephone, City) VALUES ? `;

const values = [
  [1, "Princenhage", "Princenhage", 12, 1, "4706RA", "061234567891", "Breda"],
  [2, "Lampje", "Phillips", 14, 1, "4706RX", "061234567891", "Den Hout"],
  [3, "Lampjes", "Phillips", 18, 1, "4706RA", "061234567891", "Den Hout"],
  [4, "Prinsje", "Prinsje", 18, 1, "4706RC", "061234567891", "Breda"],
];

const INSERT_AUTHORIZATION = `INSERT INTO home_administrators (UserID, StudenthomeID) VALUES ?`;

const authValues = [
  [1, 1],
  [1, 2],
  [1, 3],
  [1, 4],
];

describe("Studenthome", function () {
  before((done) => {
    pool.query(CLEAR_DB, (err, rows, fields) => {
      if (err) {
        logger.error(`before CLEARING tables: ${err}`);
        done(err);
      } else {
        done();
      }
    });
  });

  before((done) => {
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
              done();
            }
          });
        });
      }
    });
  });

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

  before((done) => {
    pool.query(INSERT_Studenthome, [values], (err, rows, fields) => {
      if (err) {
        logger.error(`before INSERT_Studenthome: ${err}`);
        done(err);
      }
      if (rows) {
        logger.debug(`before INSERT_Studenthome done`);
        done();
      }
    });
  });

  before((done) => {
    pool.query(INSERT_AUTHORIZATION, [authValues], (err, rows, fields) => {
      if (err) {
        logger.error(`before INSERT_AUTHORIZATION: ${err}`);
        done(err);
      }
      if (rows) {
        logger.debug(`before INSERT_AUTHORIZATION done`);
        done();
      }
    });
  });

  after((done) => {
    pool.query(CLEAR_DB, (err, rows, fields) => {
      if (err) {
        console.log(`after error: ${err}`);
        done(err);
      } else {
        logger.info("After FINISHED");
        done();
      }
    });
  });

  var loggedInToken = "";
  before((done) => {
    chai
      .request(server)
      .post("/api/login")
      .send({
        email: "jsmit@server.nl",
        password: "secret",
      })
      .end((err, response) => {
        loggedInToken = response.body.token;
        done();
      });
  });

  var wrongLoggedInToken = "";
  before((done) => {
    chai
      .request(server)
      .post("/api/login")
      .send({
        email: "voorbeeld@email.nl",
        password: "wachtwoord",
      })
      .end((err, response) => {
        wrongLoggedInToken = response.body.token;
        done();
      });
  });

  describe("create", function () {
    it("TC-201-1 should return valid error when required value is not present", (done) => {
      chai
        .request(server)
        .post("/api/studenthome")
        .set("authorization", "Bearer " + loggedInToken)
        .send({
          // name is missing
          street: "Straat",
          number: 25,
          postalcode: "4812AC",
          phonenumber: "0765220565",
          city: "Breda",
        })
        .end((err, res) => {
          assert.ifError(err);
          res.should.have.status(400);
          res.should.be.an("object");
          res.body.should.be.an("object").that.has.all.keys("message", "error");
          let { message, error } = res.body;
          message.should.be.a("string").that.equals("Error!");
          error.should.be
            .a("string")
            .that.equals("AssertionError [ERR_ASSERTION]: name is missing!");
          done();
        });
    });

    it("TC-201-2 should return valid error when postalcode is invalid", (done) => {
      chai
        .request(server)
        .post("/api/studenthome")
        .set("authorization", "Bearer " + loggedInToken)
        .send({
          name: "Example",
          street: "Straat",
          number: 25,
          postalcode: "4812ACCC",
          phonenumber: "0765220565",
          city: "Breda",
        })
        .end((err, res) => {
          assert.ifError(err);
          res.should.have.status(400);
          res.should.be.an("object");
          res.body.should.be.an("object").that.has.all.keys("error", "message");
          let { error, message } = res.body;
          message.should.be.a("string").that.equals("Error!");
          error.should.be
            .a("string")
            .that.equals(
              "AssertionError [ERR_ASSERTION]: Postal code is invalid"
            );
          done();
        });
    });

    it("TC-201-3 should return valid error when phonenumber is invalid", (done) => {
      chai
        .request(server)
        .post("/api/studenthome")
        .set("authorization", "Bearer " + loggedInToken)
        .send({
          name: "Example",
          street: "Straat",
          number: 25,
          postalcode: "4812AC",
          phonenumber: "07652205gdfgdf65",
          city: "Breda",
        })
        .end((err, res) => {
          assert.ifError(err);
          res.should.have.status(400);
          res.should.be.an("object");
          res.body.should.be.an("object").that.has.all.keys("error", "message");
          let { message, error } = res.body;
          message.should.be.a("string").that.equals("Error!");
          error.should.be
            .a("string")
            .that.equals(
              "AssertionError [ERR_ASSERTION]: Phonenumber is invalid"
            );
          done();
        });
    });

    it("TC-201-4 Studenthome allready exist", (done) => {
      chai
        .request(server)
        .post("/api/studenthome")
        .set("authorization", "Bearer " + loggedInToken)
        .send({
          name: "Princenhage",
          street: "Princenhage",
          number: 12,
          postalcode: "4706RA",
          phonenumber: "061234567891",
          city: "Breda",
        })
        .end((err, res) => {
          assert.ifError(err);
          res.should.have.status(400);
          res.should.be.an("object");
          res.body.should.be.an("object").that.has.all.keys("error", "message");
          let { error, message } = res.body;
          message.should.be.a("string").that.equals("Failed calling query");
          error.should.be.a("string").that.equals("Some error occured");
          done();
        });
    });

    it("TC-201-5 Not logged in", (done) => {
      chai
        .request(server)
        .post("/api/studenthome")
        .send({
          //Enter a valid studenthome
          name: "Example",
          street: "Straat",
          number: 25,
          postalcode: "4812AC",
          phonenumber: "0765220565",
          city: "Breda",
        })
        .end((err, res) => {
          assert.ifError(err);
          res.should.have.status(401);
          res.should.be.an("object");
          res.body.should.be.an("object").that.has.all.keys("error");
          let { error } = res.body;
          error.should.be
            .a("string")
            .that.equals("Authorization header missing!");
          done();
        });
    });

    it("TC-201-6 should return body when body is correct", (done) => {
      chai
        .request(server)
        .post("/api/studenthome")
        .set("authorization", "Bearer " + loggedInToken)
        .send({
          //Enter a valid studenthome
          name: "Example",
          street: "Straat",
          number: 25,
          postalcode: "4812AC",
          phonenumber: "0765220565",
          city: "Breda",
        })
        .end((err, res) => {
          assert.ifError(err);
          res.should.have.status(200);
          res.body.should.be.an("object");
          // let result = res.body.result;
          // result.should.be.an("object");
          done();
        });
    });
  });

  describe("searchByNameAndCity", function () {
    it("TC-202-1 should return empty list", (done) => {
      chai
        .request(server)
        .get("/api/studenthome")
        .query({})
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an("object");
          done();
        });
    });

    it("TC-202-2 should return two studenthomes", (done) => {
      chai
        .request(server)
        .get("/api/studenthome")
        .query({
          city: "Den Hout",
        })
        .end((err, res) => {
          res.should.have.status(200);
          res.should.be.an("object");
          let { results } = res.body;
          results.should.be.an("array").that.has.length(2);
          done();
        });
    });

    it("TC-202-3 should return valid error when query city is wrong", (done) => {
      chai
        .request(server)
        .get("/api/studenthome")
        .query({
          city: "Goes",
        })
        .end((err, res) => {
          assert.ifError(err);
          res.should.have.status(404);
          res.should.be.an("object");
          res.body.should.be.an("object").that.has.all.keys("error", "message");
          let { error, message } = res.body;
          message.should.be.a("string").that.equals("City not found");
          error.should.be.a("string").that.equals("Some error occured");
          done();
        });
    });

    it("TC-202-4 should return valid error when query name is wrong", (done) => {
      chai
        .request(server)
        .get("/api/studenthome")
        .query({
          name: "WrongName",
        })
        .end((err, res) => {
          assert.ifError(err);
          res.should.have.status(404);
          res.should.be.an("object");
          res.body.should.be.an("object").that.has.all.keys("error", "message");
          let { error, message } = res.body;
          message.should.be.a("string").that.equals("Name not found");
          error.should.be.a("string").that.equals("Some error occured");
          done();
        });
    });

    it("TC-202-5 should return list with given city query", (done) => {
      chai
        .request(server)
        .get("/api/studenthome")
        .query({
          city: "Breda",
        })
        .end((err, res) => {
          assert.ifError(err);
          res.should.have.status(200);
          res.should.be.an("object");
          let { results } = res.body;
          results.should.be.an("array");
          done();
        });
    });

    it("TC-202-6 should return list with given name query", (done) => {
      chai
        .request(server)
        .get("/api/studenthome")
        .query({
          name: "Princenhage",
        })
        .end((err, res) => {
          assert.ifError(err);
          res.should.have.status(200);
          res.should.be.an("object");
          res.body.should.be.an("object").that.has.property("results");
          let { results } = res.body;
          results.should.be.an("array");
          done();
        });
    });
  });

  describe("searchByHomeId", function () {
    it("TC-203-1 should return a valid error when the homeId does not exist", (done) => {
      chai
        .request(server)
        .get("/api/studenthome/40")
        .end((err, res) => {
          assert.ifError(err);
          res.should.have.status(404);
          res.should.be.an("object");
          res.body.should.be.an("object").that.has.all.keys("error", "message");
          let { error, message } = res.body;
          message.should.be.a("string").that.equals("Home doesn't exist");
          error.should.be.a("string").that.equals("Some error occured");
          done();
        });
    });

    it("TC-203-2 should return a valid studenthome when the homeId does exist", (done) => {
      chai
        .request(server)
        .get("/api/studenthome/1")
        .send()
        .end((err, res) => {
          assert.ifError(err);
          res.should.have.status(200);
          res.should.be.an("object");
          res.body.should.be.an("object").that.has.property("results");
          let { results } = res.body;
          results.should.be.an("array");
          done();
        });
    });
  });

  describe("update", function () {
    it("TC-204-1 should return valid error when required value is not present", (done) => {
      chai
        .request(server)
        .put("/api/studenthome/1")
        .set("authorization", "Bearer " + loggedInToken)
        .send({
          street: "Princenhage",
          number: 11,
          postalcode: "4706RX",
          phonenumber: "061234567891",
          city: "Breda",
        })
        .end((err, res) => {
          assert.ifError(err);
          res.should.have.status(400);
          res.should.be.an("object");
          res.body.should.be.an("object").that.has.all.keys("message", "error");
          let { message, error } = res.body;
          message.should.be.a("string").that.equals("Error!");
          error.should.be
            .a("string")
            .that.equals("AssertionError [ERR_ASSERTION]: name is missing!");
          done();
        });
    });
  });

  it("TC-204-2 should return valid error when postalcode is invalid", (done) => {
    chai
      .request(server)
      .put("/api/studenthome/1")
      .set("authorization", "Bearer " + loggedInToken)
      .send({
        name: "Prince of Hage",
        street: "Princenhage",
        number: 11,
        postalcode: "4706RXX",
        phonenumber: "061234567891",
        city: "Breda",
      })
      .end((err, res) => {
        assert.ifError(err);
        res.should.have.status(400);
        res.should.be.an("object");
        res.body.should.be.an("object").that.has.all.keys("error", "message");
        let { error, message } = res.body;
        message.should.be.a("string").that.equals("Error!");
        error.should.be
          .a("string")
          .that.equals(
            "AssertionError [ERR_ASSERTION]: Postal code is invalid"
          );
        done();
      });
  });

  it("TC-204-3 should return valid error when phonenumber is invalid", (done) => {
    chai
      .request(server)
      .put("/api/studenthome/1")
      .set("authorization", "Bearer " + loggedInToken)
      .send({
        name: "Prince of Hage",
        street: "Princenhage",
        number: 11,
        postalcode: "4706RX",
        phonenumber: "06123456A7891",
        city: "Breda",
      })
      .end((err, res) => {
        assert.ifError(err);
        res.should.have.status(400);
        res.should.be.an("object");
        res.body.should.be.an("object").that.has.all.keys("error", "message");
        let { message, error } = res.body;
        message.should.be.a("string").that.equals("Error!");
        error.should.be
          .a("string")
          .that.equals(
            "AssertionError [ERR_ASSERTION]: Phonenumber is invalid"
          );
        done();
      });
  });

  it("TC-204-4 should return valid error when studenthome does not exist", (done) => {
    chai
      .request(server)
      .put("/api/studenthome/30")
      .set("authorization", "Bearer " + loggedInToken)
      .send({
        name: "Prince of Hage",
        street: "Princenhage",
        number: 11,
        postalcode: "4706RX",
        phonenumber: "061234567891",
        city: "Breda",
      })
      .end((err, res) => {
        assert.ifError(err);
        res.should.have.status(400);
        res.should.be.an("object");
        res.body.should.be.an("object").that.has.all.keys("error", "message");
        let { error, message } = res.body;
        message.should.be
          .a("string")
          .that.equals("This studenthome doesn't exists");
        error.should.be.a("string").that.equals("Some error occured");
        done();
      });

    it("TC-204-5 Not logged in", (done) => {
      chai
        .request(server)
        .put("/api/studenthome/1")
        .send({
          //Enter a valid studenthome
          name: "Prince of Hage",
          street: "Princenhage",
          number: 11,
          postalcode: "4706RX",
          phonenumber: "061234567891",
          city: "Breda",
        })
        .end((err, res) => {
          assert.ifError(err);
          res.should.have.status(401);
          res.should.be.an("object");
          res.body.should.be.an("object").that.has.all.keys("error");
          let { error } = res.body;
          error.should.be
            .a("string")
            .that.equals("Authorization header missing!");
          done();
        });
    });

    it("TC-204-6 should return body when body is correct", (done) => {
      chai
        .request(server)
        .put("/api/studenthome/1")
        .set("authorization", "Bearer " + loggedInToken)
        .send({
          //Enter a valid studenthome
          name: "Prince of Hage",
          street: "Princenhage",
          number: 11,
          postalcode: "4706RX",
          phonenumber: "061234567891",
          city: "Breda",
        })
        .end((err, res) => {
          assert.ifError(err);
          res.should.have.status(200);
          res.body.should.be.an("object").that.has.property("results");
          let results = res.body.result;
          results.should.be.an("object");
          done();
        });
    });
  });

  describe("delete", function () {
    it("TC-205-1 should return valid error when studenthome does not exist", (done) => {
      chai
        .request(server)
        .delete("/api/studenthome/30")
        .set("authorization", "Bearer " + loggedInToken)
        .send()
        .end((err, res) => {
          assert.ifError(err);
          res.should.have.status(400);
          res.should.be.an("object");
          res.body.should.be.an("object").that.has.all.keys("error", "message");
          let { error, message } = res.body;
          message.should.be
            .a("string")
            .that.equals("This studenthome doesn't exists");
          error.should.be.a("string").that.equals("Some error occured");
          done();
        });
    });

    it("TC-205-2 Not Login", (done) => {
      chai
        .request(server)
        .delete("/api/studenthome/1")
        .send()
        .end((err, res) => {
          assert.ifError(err);
          res.should.have.status(401);
          res.should.be.an("object");
          res.body.should.be.an("object").that.has.all.keys("error");
          let { error } = res.body;
          error.should.be
            .a("string")
            .that.equals("Authorization header missing!");
          done();
        });
    });

    it("TC-205-3 should return valid error when actor is not authorized", (done) => {
      chai
        .request(server)
        .delete("/api/studenthome/3")
        .set("authorization", "Bearer " + wrongLoggedInToken)
        .send()
        .end((err, res) => {
          assert.ifError(err);
          res.should.have.status(401);
          res.should.be.an("object");
          res.body.should.be.an("object").that.has.all.keys("error", "message");
          let { error, message } = res.body;
          message.should.be
            .a("string")
            .that.equals("You are not administrator of this studenthome");
          error.should.be.a("string").that.equals("Some error occured");
          done();
        });
    });

    it("TC-205-4 should return valid when studenthome is deleted succesful", (done) => {
      chai
        .request(server)
        .delete("/api/studenthome/3")
        .set("authorization", "Bearer " + loggedInToken)
        .send()
        .end((err, res) => {
          assert.ifError(err);
          res.should.have.status(200);
          res.should.be.an("object");
          res.body.should.be.an("object").that.has.all.keys("message");
          let { message } = res.body;
          message.should.be.a("string").that.equals("Deleted!");
          done();
        });
    });
  });

  describe("addAdministrator", function () {
    it("TC-206-1 should return valid error when user does not exist", (done) => {
      chai
        .request(server)
        .put("/api/studenthome/1/user")
        .set("authorization", "Bearer " + loggedInToken)
        .send({
          UserID: 20,
        })
        .end((err, res) => {
          assert.ifError(err);
          assert.ifError(err);
          res.should.have.status(400);
          res.should.be.an("object");

          res.body.should.be.an("object").that.has.all.keys("message", "error");

          let { message, error } = res.body;
          message.should.be.a("string").that.equals("This user doesn't exists");
          error.should.be.a("string");

          done();
        });
    });

    it("TC-206-2 Not Login", (done) => {
      chai
        .request(server)
        .put("/api/studenthome/1/user")
        .send({
          UserID: 20,
        })
        .end((err, res) => {
          assert.ifError(err);
          res.should.have.status(401);
          res.should.be.an("object");

          res.body.should.be.an("object").that.has.all.keys("error");

          let { error } = res.body;
          error.should.be
            .a("string")
            .that.equals("Authorization header missing!");

          done();
        });
    });

    it("TC-206-3 should return valid error when actor is not authorized", (done) => {
      chai
        .request(server)
        .put("/api/studenthome/3/user")
        .set("authorization", "Bearer " + wrongLoggedInToken)
        .send({
          UserID: 2,
        })
        .end((err, res) => {
          assert.ifError(err);
          res.should.have.status(401);
          res.should.be.an("object");
          res.body.should.be.an("object").that.has.all.keys("error", "message");
          let { error, message } = res.body;
          message.should.be
            .a("string")
            .that.equals("You are not administrator of this studenthome");
          error.should.be.a("string").that.equals("Some error occured");
          done();
        });
    });

    it("TC-206-4 should return valid user is added as administrator", (done) => {
      chai
        .request(server)
        .put("/api/studenthome/1/user")
        .set("authorization", "Bearer " + loggedInToken)
        .send({
          UserID: 2,
        })
        .end((err, res) => {
          assert.ifError(err);
          res.should.have.status(200);
          res.body.should.be.an("object").that.has.property("result");

          let result = res.body.result;
          result.should.be.an("object");

          done();
        });
    });
  });
});
