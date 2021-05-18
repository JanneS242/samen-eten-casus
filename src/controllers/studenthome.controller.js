var logger = require("tracer").console();
const assert = require("assert");
const pool = require("../database/database.js");

let controller = {
  validateStudenthome(req, res, next) {
    logger.info("validate create studenthome");
    logger.info(req.body);
    try {
      const { name, street, number, postalcode, city, phonenumber } = req.body;
      assert(typeof name === "string", "name is missing!");
      assert(typeof street === "string", "street is missing!");
      assert(typeof number === "number", "number is missing!");
      assert(typeof postalcode === "string", "postalcode is missing!");
      assert(typeof city === "string", "city is missing!");
      assert(typeof phonenumber === "string", "phonenumber is missing!");
      assert.match(
        postalcode,
        /^[1-9][0-9]{3}[ ]?([A-RT-Za-rt-z][A-Za-z]|[sS][BCbcE-Re-rT-Zt-z])$/,
        "Postal code is invalid"
      );
      assert.match(
        phonenumber,
        /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im,
        "Phonenumber is invalid"
      );
      next();
    } catch (err) {
      logger.trace("Studenthome data is INvalid: ", err);
      res.status(400).json({
        message: "Error!",
        error: err.toString(),
      });
    }
  },

  create(req, res, next) {
    var studenthome = req.body;
    let { name, street, number, postalcode, city, phonenumber } = studenthome;

    const userId = req.userId;

    let sqlQueryStudenthome =
      "INSERT INTO `studenthome` (`Name`, `Address`, `House_Nr`, `UserID`, `Postal_Code`, `Telephone`, `City`) VALUES (?, ?, ?, ?, ?, ?, ?)";

    let sqlQueryAdministrator =
      "INSERT INTO home_administrators (`UserID`, `StudenthomeID`) VALUES (?, ?)";
    pool.getConnection(function (err, connection) {
      if (err) {
        logger.error("create", err);
        next({ message: "Failed getting connection", errCode: 400 });
      }
      if (connection) {
        logger.log("create studenthome");
        connection.query(
          sqlQueryStudenthome,
          [name, street, number, userId, postalcode, phonenumber, city],
          (error, results, fields) => {
            connection.release();
            if (error) {
              logger.error("create", error);
              next({ message: "Failed calling query", errCode: 400 });
            }
            if (results) {
              logger.log("create administrator");
              var homeId = results.insertId;
              connection.query(
                sqlQueryAdministrator,
                [userId, homeId],
                (error, results, fields) => {
                  if (error) {
                    logger.error("create administrator", error);
                    next({ message: "Failed calling query", errCode: 400 });
                  }
                  if (results) {
                    logger.info("Administrator added!");
                    let joinQuery = `SELECT * FROM view_studenthome WHERE ID = ${homeId}`;
                    connection.query(joinQuery, (error, rows, fields) => {
                      // connection.release();
                      if (error) {
                        logger.error("create results", error);
                        next({ message: "Failed calling query", errCode: 400 });
                      } else {
                        if (
                          rows &&
                          rows.length === 1
                        ) {
                          var studenthomeInfo = {
                            id: rows[0].ID,
                            name: rows[0].Name,
                            street: rows[0].Address,
                            number: rows[0].House_Nr,
                            postalcode: rows[0].Postal_Code,
                            phonenumber: rows[0].Telephone,
                            city: rows[0].City,
                            contact: rows[0].Contact,
                            email: rows[0].Email,
                            studentnumber: rows[0].Student_Number,
                          };
                          res.status(200).json(studenthomeInfo);
                        } else {
                          logger.info("INVALID");
                        }
                      }
                    });
                  }
                }
              );
            }
          }
        );
      }
    });
  },

  validateHomeID(req, res, next) {
    const { homeId } = req.params;

    let queryAllHomeId = `SELECT * FROM studenthome WHERE ID = ${homeId}`;
    pool.getConnection(function (err, connection) {
      if (err) {
        logger.error("create", err);
        next({ message: "Failed getting connection", errCode: 400 });
      }
      if (connection) {
        connection.query(queryAllHomeId, (error, results, fields) => {
          connection.release();
          if (error) {
            logger.error("create", error);
            next({ message: "Failed calling query", errCode: 400 });
          }
          if (results) {
            if (results.length === 0) {
              next({
                message: "This studenthome doesn't exists",
                errCode: 400,
              });
            } else {
              next();
            }
          }
        });
      }
    });
  },

  update(req, res, next) {
    var studenthome = req.body;
    let { name, street, number, postalcode, city, phonenumber } = studenthome;
    logger.log(req.params);
    const { homeId } = req.params;

    const userId = req.userId;

    let sqlQuery = `UPDATE studenthome SET Name = ?, Address = ?, House_Nr = ?, UserID = ?, Postal_Code = ?, Telephone = ?, City = ? WHERE id = ${homeId}`;
    pool.getConnection(function (err, connection) {
      if (err) {
        logger.error("update", err);
        next({ message: "Failed getting connection", errCode: 400 });
      }
      if (connection) {
        connection.query(
          sqlQuery,
          [name, street, number, userId, postalcode, phonenumber, city],
          (error, results, fields) => {
            connection.release();
            if (error) {
              logger.error("update", error);
              next({ message: "Failed calling query", errCode: 400 });
            }
            if (results) {
              let joinQuery = `SELECT * FROM view_studenthome WHERE ID = ${homeId}`;
              connection.query(joinQuery, (error, rows, fields) => {
                if (error) {
                  logger.error("create results", error);
                  next({ message: "Failed calling query", errCode: 400 });
                } else {
                  if (
                    rows &&
                    rows.length === 1
                  ) {
                    var studenthomeInfo = {
                      id: rows[0].ID,
                      name: rows[0].Name,
                      street: rows[0].Address,
                      number: rows[0].House_Nr,
                      postalcode: rows[0].Postal_Code,
                      phonenumber: rows[0].Telephone,
                      city: rows[0].City,
                      contact: rows[0].Contact,
                      email: rows[0].Email,
                      studentnumber: rows[0].Student_Number,
                    };
                    res.status(200).json(studenthomeInfo);
                  } else {
                    logger.info("INVALID");
                  }
                }
              });
            }
          }
        );
      }
    });
  },

  searchByHomeId(req, res, next) {
    const { homeId } = req.params;
    logger.log(req.params);
    let joinQuery = `SELECT * FROM view_studenthome WHERE ID = ${homeId}`;

    pool.getConnection(function (err, connection) {
      if (err) {
        logger.error("searchByHomeId", err);
        next({ message: "Failed getting connection", errCode: 400 });
      }
      if (connection) {
        connection.query(joinQuery, (error, results, fields) => {
          connection.release();
          if (error) {
            logger.error("searchByHomeId", error);
            next({ message: "Failed calling query", errCode: 400 });
          }
          if (results) {
            if (results.length === 0) {
              next({ message: "Home doesn't exist", errCode: 404 });
            } else {
              res.status(200).json({ results });
            }
          }
        });
      }
    });
  },

  searchByNameAndCity(req, res, next) {
    logger.log(req.query);
    const { city } = req.query;
    const { name } = req.query;
    logger.log(city);
    logger.log(name);
    let sqlFullQuery = `SELECT * FROM view_studenthome WHERE Name = '${name}' AND City = '${city}'`;
    let sqlNameQuery = `SELECT * FROM view_studenthome WHERE Name = '${name}'`;
    let sqlCityQuery = `SELECT * FROM view_studenthome WHERE City = '${city}'`;
    if (name && city) {
      pool.getConnection(function (err, connection) {
        if (err) {
          logger.error("searchByNameAndCity FULL", err);
          next({ message: "Failed getting connection", errCode: 400 });
        }
        if (connection) {
          connection.query(sqlFullQuery, (error, results, fields) => {
            connection.release();
            if (error) {
              logger.error("searchByNameAndCity FULL", error);
              next({ message: "Failed calling query", errCode: 400 });
            }
            if (results) {
              res.status(200).json({ results });
            }
          });
        }
      });
    } else if (name) {
      pool.getConnection(function (err, connection) {
        if (err) {
          logger.error("searchByNameAndCity NAME", err);
          next({ message: "Failed getting connection", errCode: 400 });
        }
        if (connection) {
          connection.query(sqlNameQuery, (error, results, fields) => {
            connection.release();
            if (error) {
              logger.error("searchByNameAndCity NAME", error);
              next({ message: "Failed calling query", errCode: 400 });
            }
            if (results) {
              if (results.length === 0) {
                next({ message: "Name not found", errCode: 404 });
              } else {
                res.status(200).json({ results });
              }
            }
          });
        }
      });
    } else if (city) {
      pool.getConnection(function (err, connection) {
        if (err) {
          logger.error("searchByNameAndCity CITY", err);
          next({ message: "Failed getting connection", errCode: 400 });
        }
        if (connection) {
          connection.query(sqlCityQuery, (error, results, fields) => {
            connection.release();
            if (error) {
              logger.error("searchByNameAndCity CITY", error);
              next({ message: "Failed calling query", errCode: 400 });
            }
            if (results) {
              if (results.length === 0) {
                next({ message: "City not found", errCode: 404 });
              } else {
                res.status(200).json({ results });
              }
            }
          });
        }
      });
    } else if(name == null && city == null){
       res.status(200).json({});
    }
  },

  delete(req, res, next) {
    const { homeId } = req.params;
    let sqlDeleteQuery = `DELETE FROM studenthome WHERE id = ${homeId}`;

    pool.getConnection(function (err, connection) {
      if (err) {
        logger.error("delete", err);
        next({ message: "Failed getting connection", errCode: 400 });
      }
      if (connection) {
        connection.query(sqlDeleteQuery, (error, results, fields) => {
          connection.release();
          if (error) {
            logger.error("delete", error);
            next({ message: "Failed calling query", errCode: 400 });
          }
          if (results) {
            if (results.affectedRows === 0) {
              next({ message: "Home doesn't exist", errCode: 404 });
            } else {
              res.status(200).json({
                message: "Deleted!",
              });
            }
          }
        });
      }
    });
  },

  validateUserID (req, res, next) {
    const user = req.body;
    let { UserID } = user;
    logger.trace("User =", user);
    let queryAllHomeId = `SELECT * FROM user WHERE ID = ${UserID}`;
    pool.getConnection(function (err, connection) {
      if (err) {
        logger.error("create", err);
        next({ message: "Failed getting connection", errCode: 400 });
      }
      if (connection) {
        connection.query(queryAllHomeId, (error, results, fields) => {
          connection.release();
          if (error) {
            logger.error("create", error);
            next({ message: "Failed calling query", errCode: 400 });
          }
          if (results) {
            if (results.length === 0) {
              next({
                message: "This user doesn't exists",
                errCode: 400,
              });
            } else {
              next();
            }
          }
        });
      }
    });
  },

  addAdminstrator (req, res) {
    const { homeId } = req.params;
    logger.info("addUsertoStudenthome called");
    const user = req.body;
    let { UserID } = user;
    logger.trace("studenthome =", homeId);
    // !!
    const userid = req.userId;
    let sqlQuery = `INSERT INTO home_administrators(UserID, StudenthomeID) VALUES(?,?)`;
    logger.debug("addUsertoStudenthome", "sqlQuery =", sqlQuery);
    pool.getConnection(function (err, connection) {
      if (err) {
        logger.error("addUsertoStudenthome", error);
        res.status(400).json({
          message: "addUsertoStudenthome failed getting connection!",
          error: err,
        });
      }
      if (connection) {
        // Use the connection
        connection.query(sqlQuery, [UserID, homeId,], (error, results, fields) => {
          // When done with the connection, release it.
          connection.release();
          // Handle error after the release.
          if (error) {
            logger.error("addUsertoStudenthome", error.toString());
            res.status(400).json({
              message: " addUsertoStudenthome failed calling query",
              error: error.toString(),
            });
          }
          if (results) {
            logger.trace("results: ", results);
            res.status(200).json({
              result: {
                userId: UserID,
                homeId: homeId
              },
            });
          }
        });
      }
    });
  },
};

module.exports = controller;
