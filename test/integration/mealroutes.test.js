const chai = require("chai");
const chaiHttp = require("chai-http");
chai.should();
chai.use(chaiHttp);

const server = require("../../server");
// const database = require("../../src/studenthome.json")
const assert = require("assert");

describe("Meal", function () {
  describe("create", function () {
    it("TC-301-1 should return valid error when required value is not present", (done) => {
      chai
        .request(server)
        .post("/api/studenthome/1/meal")
        .send({
            //Name is missing
            description: "Bread with ham",
            createdon: "2021-05-03",
            offeredon: "2021-05-03",
            price: "€2",
            allergyinformation: "",
            ingredients: ["Bread", "Butter", "Ham"], 
        })
        .end((err, res) => {
          assert.ifError(err);
          res.should.have.status(400);
          res.should.be.an("object");

          res.body.should.be.an("object").that.has.all.keys("message", "error");

          let { message, error } = res.body;
          message.should.be.a("string").that.equals("An element is missing!");
          error.should.be.a("string");

          done();
        });
    });

    //TC-301-2 Niet ingelogd

    it("TC-301-3 should return body if everything goes well", (done) => {
        chai
          .request(server)
          .post("/api/studenthome/1/meal")
          .send({
              name: "Sandwich with ham",
              description: "Bread with ham",
              createdon: "2021-05-03",
              offeredon: "2021-05-03",
              price: "€2",
              allergyinformation: "",
              ingredients: ["Bread", "Butter", "Ham"], 
          })
          .end((err, res) => {
            assert.ifError(err);
            res.should.have.status(200);
            res.should.be.an("object");
  
            res.body.should.be.an("object")
  
           
            done();
          });
        });
    });

    describe("update", function () {
        it("TC-302-1 should return valid error when required value is not present", (done) => {
          chai
            .request(server)
            .put("/api/studenthome/1/meal/1")
            .send({
                //Name is missing
                description: "Bread with ham",
                createdon: "2021-05-03",
                offeredon: "2021-05-03",
                price: "€2",
                allergyinformation: "",
                ingredients: ["Bread", "Butter", "Ham"], 
            })
            .end((err, res) => {
              assert.ifError(err);
              res.should.have.status(400);
              res.should.be.an("object");
    
              res.body.should.be.an("object").that.has.all.keys("message", "error");
    
              let { message, error } = res.body;
              message.should.be.a("string").that.equals("An element is missing!");
              error.should.be.a("string");
    
              done();
            });
        });
    
        //TC-302-2 Niet ingelogd
        //TC-302-3 Niet de eigenaar van de data
    
        it("TC-302-4 should return error if meal does not exists", (done) => {
            chai
              .request(server)
              .put("/api/studenthome/1/meal/30")
              .send({
                  name: "Sandwich with ham",
                  description: "Bread with ham",
                  createdon: "2021-05-03",
                  offeredon: "2021-05-03",
                  price: "€2",
                  allergyinformation: "",
                  ingredients: ["Bread", "Butter", "Ham"], 
              })
              .end((err, res) => {
                assert.ifError(err);
              res.should.have.status(404);
              res.should.be.an("object");
    
              res.body.should.be.an("object").that.has.all.keys("message", "error");
    
              let { message, error } = res.body;
              message.should.be.a("string").that.equals("Meal doesn't exist");
              error.should.be.a("string");
    
              done();
              });
            });
        });

        it("TC-302-5 should return body if everything goes well", (done) => {
            chai
              .request(server)
              .put("/api/studenthome/1/meal/1")
              .send({
                  name: "Sandwich with ham",
                  description: "Bread with ham",
                  createdon: "2021-05-03",
                  offeredon: "2021-05-03",
                  price: "€2",
                  allergyinformation: "",
                  ingredients: ["Bread", "Butter", "Ham"], 
              })
              .end((err, res) => {
                assert.ifError(err);
                res.should.have.status(200);
                res.should.be.an("object");
      
                res.body.should.be.an("object")
      
               
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
                        message.should.be.a("string").that.equals("Meal doesn't exist");
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
              //TC-305-1 Verplicht veld ontbreekt -> Niet van toepassing hier? Geen body?
              //TC-305-2 Niet ingelogd
              //TC-305-3 Niet de eigenaar van de data  

                it("TC-305-4 should return valid error when meal does not exist", (done) => {
                    chai
                      .request(server)
                      .delete("/api/studenthome/1/meal/30")
                      .send()
                      .end((err, res) => {
                        assert.ifError(err);
                        res.should.have.status(404);
                        res.should.be.an("object");

                        res.body.should.be.an("object").that.has.all.keys("message", "error");
    
                        let { message, error } = res.body;
                        message.should.be.a("string").that.equals("Meal doesn't exist");
                        error.should.be.a("string");
              
                        done();
                      });
                  });
                  
                it("TC-305-5 should return meal when all goes well", (done) => {
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
});
