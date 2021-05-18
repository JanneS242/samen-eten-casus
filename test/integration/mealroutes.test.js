process.env.DB_DATABASE = process.env.DB_DATABASE || "studenthome_testdb";
process.env.NODE_ENV = "testing";
process.env.LOGLEVEL = "error";

const chai = require("chai");
const chaiHttp = require("chai-http");
chai.should();
chai.use(chaiHttp);

const server = require("../../server");
const pool = require("../../src/database/database");
const assert = require("assert");

const bcrypt = require("bcrypt");
const saltRounds = 10;

var logger = require("tracer").console();
const jwt = require("jsonwebtoken");

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

const INSERT_MEALS = `INSERT INTO meal (ID, Name, Description, Ingredients, Allergies, CreatedOn, OfferedOn, Price, MaxParticipants, UserID, StudenthomeID) VALUES ?`;

const mealValues = [
  [
    1,
    "Stampot",
    "Stampot met vlees",
    "Aardappels, Vlees",
    "Lactose",
    new Date(),
    new Date(),
    3,
    7,
    1,
    1,
  ],
  [
    2,
    "Vleesstoof",
    "Stoof van vlees",
    "Vlees",
    "",
    new Date(),
    new Date(),
    3,
    4,
    1,
    1,
  ],
  [
    3,
    "Kipschotel",
    "Schotel met kip",
    "Kip",
    "",
    new Date(),
    new Date(),
    2,
    6,
    1,
    2,
  ],
  [
    4,
    "Lasagna",
    "Lasagna Bolognese",
    "Vlees, Tomatensaus",
    "Lactose",
    new Date(),
    new Date(),
    2.5,
    7,
    1,
    3,
  ],
];

describe("Meal", function () {
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
    pool.query(INSERT_MEALS, [mealValues], (err, rows, fields) => {
      if (err) {
        logger.error(`before INSERT_MEALS: ${err}`);
        done(err);
      }
      if (rows) {
        logger.debug(`before INSERT_MEALS done`);
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
    it("TC-301-1 should return valid error when required value is not present", (done) => {
      chai
        .request(server)
        .post("/api/studenthome/1/meal")
        .set("authorization", "Bearer " + loggedInToken)
        .send({
          //Name is missing
          description: "Bread with ham",
          createdon: "2021-05-03",
          offeredon: "2021-05-03",
          price: 2,
          allergyinformation: "",
          ingredients: ["Bread, Butter, Ham"],
          maxparticipants: 7,
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

    it("TC-301-2 Not logged in", (done) => {
      chai
        .request(server)
        .post("/api/studenthome/1/meal")
        .send({
          //Enter a valid studenthome
          name: "Sandwich with ham",
          description: "Bread with ham",
          createdon: "2021-05-03",
          offeredon: "2021-05-03",
          price: 2,
          allergyinformation: "",
          ingredients: ["Bread, Butter, Ham"],
          maxparticipants: 7,
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

    it("TC-301-3 should return body if everything goes well", (done) => {
      chai
        .request(server)
        .post("/api/studenthome/1/meal")
        .set("authorization", "Bearer " + loggedInToken)
        .send({
          name: "Sandwich",
          description: "Bread with ham",
          createdon: "2021-05-03",
          offeredon: "2021-05-03",
          price: 2,
          allergyinformation: "",
          ingredients: ["Bread, Butter, Ham"],
          maxparticipants: 7,
        })
        .end((err, res) => {
          assert.ifError(err);
          res.should.have.status(200);
          res.should.be.an("object");

          res.body.should.be.an("object");

          done();
        });
    });
  });

  describe("update", function () {
    it("TC-302-1 should return valid error when required value is not present", (done) => {
      chai
        .request(server)
        .put("/api/studenthome/1/meal/1")
        .set("authorization", "Bearer " + loggedInToken)
        .send({
          //Name is missing
          description: "Bread with ham",
          createdon: "2021-05-03",
          offeredon: "2021-05-03",
          price: 2,
          allergyinformation: "",
          ingredients: ["Bread, Butter, Ham"],
          maxparticipants: 7,
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

    it("TC-302-5 Not logged in", (done) => {
      chai
        .request(server)
        .put("/api/studenthome/1/meal/1")
        .send({
          //Enter a valid studenthome
          name: "Sandwich with ham",
          description: "Bread with ham",
          createdon: "2021-05-03",
          offeredon: "2021-05-03",
          price: 2,
          allergyinformation: "",
          ingredients: ["Bread, Butter, Ham"],
          maxparticipants: 7,
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

    it("TC-302-3 should return valid error when actor is not authorized", (done) => {
      chai
        .request(server)
        .put("/api/studenthome/1/meal/1")
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

    it("TC-302-4 should return error if meal does not exists", (done) => {
      chai
        .request(server)
        .put("/api/studenthome/1/meal/30")
        .set("authorization", "Bearer " + loggedInToken)
        .send({
          name: "Sandwich with ham",
          description: "Bread with ham",
          createdon: "2021-05-03",
          offeredon: "2021-05-03",
          price: 2,
          allergyinformation: "",
          ingredients: ["Bread, Butter, Ham"],
          maxparticipants: 7,
        })
        .end((err, res) => {
          assert.ifError(err);
          res.should.have.status(400);
          res.should.be.an("object");

          res.body.should.be.an("object").that.has.all.keys("message", "error");

          let { message, error } = res.body;
          message.should.be.a("string").that.equals("This meal doesn't exists");
          error.should.be.a("string");

          done();
        });
    });
  });

  it("TC-302-5 should return body if everything goes well", (done) => {
    chai
      .request(server)
      .put("/api/studenthome/1/meal/1")
      .set("authorization", "Bearer " + loggedInToken)
      .send({
        name: "Sandwich",
        description: "Bread with ham",
        createdon: "2021-05-03",
        offeredon: "2021-05-03",
        price: 2,
        allergyinformation: "",
        ingredients: ["Bread, Butter, Ham"],
        maxparticipants: 7,
      })
      .end((err, res) => {
        assert.ifError(err);
        res.should.have.status(200);
        res.should.be.an("object");

        res.body.should.be.an("object");

        done();
      });
  });

  describe("findAll", function () {
    it("TC-303-1 should return list of meals when all goes well", (done) => {
      chai
        .request(server)
        .get("/api/studenthome/1/meal")
        .send()
        .end((err, res) => {
          assert.ifError(err);
          res.should.have.status(200);
          res.should.be.an("object");

          done();
        });
    });
  });

  describe("findOne", function () {
    it("TC-304-1 should return valid error when meal does not exist", (done) => {
      chai
        .request(server)
        .get("/api/studenthome/1/meal/30")
        .send()
        .end((err, res) => {
          assert.ifError(err);
          res.should.have.status(404);
          res.should.be.an("object");

          res.body.should.be.an("object").that.has.all.keys("message", "error");

          let { message, error } = res.body;
          message.should.be.a("string").that.equals("Meals don't exist");
          error.should.be.a("string");

          done();
        });
    });

    it("TC-304-2 should return meal when all goes well", (done) => {
      chai
        .request(server)
        .get("/api/studenthome/1/meal")
        .send()
        .end((err, res) => {
          assert.ifError(err);
          res.should.have.status(200);
          res.should.be.an("object");

          done();
        });
    });
  });

  describe("deleteMeal", function () {
    it("TC-305-2 Not logged in", (done) => {
      chai
        .request(server)
        .delete("/api/studenthome/1/meal/1")
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

    it("TC-305-3 should return valid error when actor is not authorized", (done) => {
      chai
        .request(server)
        .delete("/api/studenthome/1/meal/1")
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

    it("TC-305-4 should return valid error when meal does not exist", (done) => {
      chai
        .request(server)
        .delete("/api/studenthome/1/meal/30")
        .set("authorization", "Bearer " + loggedInToken)
        .send()
        .end((err, res) => {
          assert.ifError(err);
          res.should.have.status(400);
          res.should.be.an("object");

          res.body.should.be.an("object").that.has.all.keys("message", "error");

          let { message, error } = res.body;
          message.should.be.a("string").that.equals("This meal doesn't exists");
          error.should.be.a("string");

          done();
        });
    });

    it("TC-305-5 should return meal when all goes well", (done) => {
      chai
        .request(server)
        .delete("/api/studenthome/1/meal/1")
        .set("authorization", "Bearer " + loggedInToken)
        .send()
        .end((err, res) => {
          assert.ifError(err);
          res.should.have.status(200);
          res.should.be.an("object");

          done();
        });
    });
  });
});
