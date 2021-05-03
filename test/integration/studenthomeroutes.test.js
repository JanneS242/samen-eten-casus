const chai = require("chai");
const chaiHttp = require("chai-http");
chai.should();
chai.use(chaiHttp);


const server = require("../../server");
// const database = require("../../src/studenthome.json")
const assert = require("assert");


describe("StudentHome", function () {
    
    describe("create", function () {
      it("TC-201-1 should return valid error when required value is not present", (done) => {
        chai
          .request(server)
          .post("/api/studenthome")
          .send({
            // name is missing
            street: "BergLaan",
            number: "25",
            postalcode: "4617AA",
            city: "Amsterdam",
            phonenumber: "0164230480",
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
      
      
      it("TC-201-2 should return valid error when postalcode is invalid", (done) => {
        chai
          .request(server)
          .post("/api/studenthome")
          .send({
            name: "Woonhuis",
            street: "BergLaan",
            number: "25",
            //Enter an invalid postalcode
            postalcode: "2A3456",
            city: "Amsterdam",
            phonenumber: "0164230480",
          })
          .end((err, res) => {
            assert.ifError(err);
            res.should.have.status(400);
            res.should.be.an("object");
   
            res.body.should.be.an("object").that.has.all.keys("message", "error");
   
            let { message, error } = res.body;
            message.should.be.a("string").that.equals("Postal code is invalid");
            error.should.be.a("string");
   
            done();
          });
      });

    
      
      it("TC-201-3 should return valid error when phonenumber is invalid", (done) => {
        chai
          .request(server)
          .post("/api/studenthome")
          .send({
            name: "Woonhuis",
            street: "BergLaan",
            number: "25",
            postalcode: "4819AC",
            city: "Amsterdam",
            //Enter invalid phonenumber
            phonenumber: "123456789023908",
          })
          .end((err, res) => {
            assert.ifError(err);
            res.should.have.status(400);
            res.should.be.an("object");
   
            res.body.should.be.an("object").that.has.all.keys("message", "error");
   
            let { message, error } = res.body;
            message.should.be.a("string").that.equals("Phonenumber is invalid");
            error.should.be.a("string");
   
            done();
          });
      });
      
      it("TC-201-4 should return valid error when studenthome already exists", (done) => {
        chai
          .request(server)
          .post("/api/studenthome")
          .send({
              //Enter already existing studenthome with already existing adress
            name: "T63",
            street: "Academiesingel",
            number: 40,
            postalcode: "4811AC",
            city: "Breda",
            phonenumber: "0765220565",
          })
          .end((err, res) => {
            assert.ifError(err);
            res.should.have.status(400);
            res.should.be.an("object");
   
            res.body.should.be.an("object").that.has.all.keys("message", "error");
   
            let { message, error } = res.body;
            message.should.be.a("string").that.equals("This studenthome already exists");
            error.should.be.a("string");
   
            done();
          });
      });

      //TC-201-5 Niet ingelogd


      it("TC-201-6 should return body when body is correct", (done) => {
        chai
          .request(server)
          .post("/api/studenthome")
          .send({
              //Enter a valid studenthome
            name: "Example",
            street: "Straat",
            number: 35,
            postalcode: "4812AC",
            city: "Breda",
            phonenumber: "0765220565",
          })
          .end((err, res) => {
            res.should.have.status(200);
            res.should.be.an("object");
            
            res.body.should.be.an("object")
   
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
              res.should.be.an("object")
              res.body.should.be.an("array")
        
              done();
            });
        });
    });
    

        it("TC-202-2 should return two studenthomes", (done) => {
            chai
              .request(server)
              .get("/api/studenthome")
              .query({
                city: "Breda"
              })
              .end((err, res) => {
                res.should.have.status(200);
                res.should.be.an("object")
       
                res.body.should.be.an("array")
                res.body.should.have.lengthOf(2);
       
                done();
              });
          });

          it("TC-202-3 should return valid error when query city is wrong", (done) => {
            chai
              .request(server)
              .get("/api/studenthome")
              .query({
                city: "Den Haag"
              })
              .end((err, res) => {
                assert.ifError(err);
                res.should.have.status(404);
                res.should.be.an("object");
       
                res.body.should.be.an("object").that.has.all.keys("message", "error");
       
                let { message, error } = res.body;
                message.should.be.a("string").that.equals("City not found");
                error.should.be.a("string");
       
                done();
              });
          });

          it("TC-202-4 should return valid error when query name is wrong", (done) => {
            chai
              .request(server)
              .get("/api/studenthome")
              .query({
                name: "WrongName"
              })
              .end((err, res) => {
                assert.ifError(err);
                res.should.have.status(404);
                res.should.be.an("object");
       
                res.body.should.be.an("object").that.has.all.keys("message", "error");
       
                let { message, error } = res.body;
                message.should.be.a("string").that.equals("Name not found");
                error.should.be.a("string");
       
                done();
              });
          });

          it("TC-202-5 should return list with given city query", (done) => {
            chai
              .request(server)
              .get("/api/studenthome")
              .query({
                city: "Breda"
              })
              .end((err, res) => {
                assert.ifError(err);
                res.should.have.status(200);
                res.should.be.an("object");
                res.body.should.be.an("array");
                done();
              });
          });

          it("TC-202-6 should return list with given name query", (done) => {
            chai
              .request(server)
              .get("/api/studenthome")
              .query({
                name: "Xior"
              })
              .end((err, res) => {
                assert.ifError(err);
                res.should.have.status(200);
                res.should.be.an("object");
                res.body.should.be.an("array")

                done();
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
         
                  res.body.should.be.an("object").that.has.all.keys("message", "error");
         
                  let { message, error } = res.body;
                  message.should.be.a("string").that.equals("Home doesn\'t exist");
                  error.should.be.a("string");
         
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
                    res.body.should.be.an("object")

                    done();
                  });
              });
            });

         describe("update", function () {
           it("TC-204-1 should return valid error when required value is not present", (done) => {
                chai
                    .request(server)
                    .put("/api/studenthome/1")
                    .send({
                      // name is missing
                      street: "BergLaan",
                      number: "25",
                      postalcode: "4617AA",
                      city: "Amsterdam",
                      phonenumber: "0164230480",
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
              });
                
                it("TC-204-2 should return valid error when postalcode is invalid", (done) => {
                  chai
                    .request(server)
                    .put("/api/studenthome/1")
                    .send({
                      name: "Woonhuis",
                      street: "BergLaan",
                      number: "25",
                      //Enter an invalid postalcode
                      postalcode: "2A3456",
                      city: "Amsterdam",
                      phonenumber: "0164230480",
                    })
                    .end((err, res) => {
                      assert.ifError(err);
                      res.should.have.status(400);
                      res.should.be.an("object");
             
                      res.body.should.be.an("object").that.has.all.keys("message", "error");
             
                      let { message, error } = res.body;
                      message.should.be.a("string").that.equals("Postal code is invalid");
                      error.should.be.a("string");
             
                      done();
                    });
                });
                
                it("TC-204-3 should return valid error when phonenumber is invalid", (done) => {
                  chai
                    .request(server)
                    .put("/api/studenthome/1")
                    .send({
                      name: "Woonhuis",
                      street: "BergLaan",
                      number: "25",
                      postalcode: "4819AC",
                      city: "Amsterdam",
                      //Enter invalid phonenumber
                      phonenumber: "123456789023098",
                    })
                    .end((err, res) => {
                      assert.ifError(err);
                      res.should.have.status(400);
                      res.should.be.an("object");
             
                      res.body.should.be.an("object").that.has.all.keys("message", "error");
             
                      let { message, error } = res.body;
                      message.should.be.a("string").that.equals("Phonenumber is invalid");
                      error.should.be.a("string");
             
                      done();
                    });
                });
                
                it("TC-204-4 should return valid error when studenthome does not exist", (done) => {
                  chai
                    .request(server)
                    .put("/api/studenthome/30")
                    .send({
                        //Enter not existing studenthome
                      name: "Example",
                      street: "Street",
                      number: 40,
                      postalcode: "2345LP",
                      city: "Breda",
                      phonenumber: "0765220565",
                    })
                    .end((err, res) => {
                      assert.ifError(err);
                      res.should.have.status(400);
                      res.should.be.an("object");
             
                      res.body.should.be.an("object").that.has.all.keys("message", "error");
             
                      let { message, error } = res.body;
                      message.should.be.a("string").that.equals("This studenthome does not exists");
                      error.should.be.a("string");
             
                      done();
                    });
                
    //             //TC-204-5 Niet ingelogd
    //             //TC-204-6 Studentenhuis succesvol toegevoegd
                  it("TC-204-6 should return body when body is correct", (done) => {
                    chai
                      .request(server)
                      .put("/api/studenthome/1")
                      .send({
                          //Enter a valid studenthome
                        name: "Example",
                        street: "Straat",
                        number: 35,
                        postalcode: "4812AC",
                        city: "Breda",
                        phonenumber: "0765220565",
                      })
                      .end((err, res) => {
                        res.should.have.status(200);
                        res.should.be.an("object");
                        
                        res.body.should.be.an("object")
              
                        done();
                      });
                  });
                    
              });


      //  describe("delete", function () {
      //      it("TC-205-1 should return valid error when studenthome does not exist", (done) => {
      //           chai
      //               .request(server)
      //               .delete("/api/studenthome/30")
      //               .send()
      //               .end((err, res) => {
      //                 assert.ifError(err);
      //                 res.should.have.status(404);
      //                 res.should.be.an("object");
             
      //                 res.body.should.be.an("object").that.has.all.keys("message", "error");
             
      //                 let { message, error } = res.body;
      //                 message.should.be.a("string").that.equals("Home doesn\'t exist");
      //                 error.should.be.a("string");
             
      //                 done();
      //               });
      //           });
      //         });

    //             //TC-205-2 Niet ingelogd
    //             //TC-205-3 Actor is geen eigenaar

    //             it("TC-205-4 should return valid when studenthome is deleted succesful", (done) => {
    //                 chai
    //                     .request(server)
    //                     .delete("/api/studenthome/:homeId")
    //                     .send() // Params ingeven? -> Niet bestaande studenthome
    //                     .end((err, res) => {
    //                       assert.ifError(err);
    //                       res.should.have.status(200);
    //                     //   res.should.be.an("object");
                 
    //                     //   res.body.should.be.an("object").that.has.all.keys("message", "error");
                 
    //                     //   let { message, error } = res.body;
    //                     //   message.should.be.a("string").that.equals("name is missing!");
    //                     //   error.should.be.a("string");
                 
    //                       done();
    //                     });
    //                 });
    //             });

    //             //UC-Gebruiker toevoegen aan studenthome
    // });
  });