var logger = require("tracer").console();

const assert = require("assert");
const jwt = require("jsonwebtoken");
const pool = require("../database/database");
const jwtSecretKey = require("../database/config").jwtSecretKey;

const bcrypt = require('bcrypt');
const saltRounds = 10;

module.exports = {
  //UC-101 Registreren
  register(req, res, next) {
    const password = req.body.password;

    bcrypt.genSalt(saltRounds, function (err, salt) {
      if (err) {
        throw err;
      } else {
        bcrypt.hash(password, salt, function (err, hash) {
          if (err) {
            throw err;
          } else {
            console.log(hash);
            pool.getConnection((err, connection) => {
              if (err) {
                logger.error(
                  "Error getting connection from pool: " + err.toString()
                );
                res.status(500).json({
                  error: ex.toString(),
                  datetime: new Date().toISOString(),
                });
              }
              if (connection) {
                let { firstname, lastname, email, studentnr} =
                  req.body;

                connection.query(
                  "INSERT INTO `user` (`First_Name`, `Last_Name`, `Email`, `Student_Number`, `Password`) VALUES (?, ?, ?, ?, ?)",
                  [firstname, lastname, email, studentnr, hash],
                  (err, rows, fields) => {
                    connection.release();
                    if (err) {
                      logger.error("Error: " + err.toString());
                      res.status(400).json({
                        message: "This email has already been taken.",
                      });
                    } else {
                      logger.trace(rows);
                      const payload = {
                        id: rows.insertId,
                      };
                      const userinfo = {
                        id: rows.insertId,
                        firstName: firstname,
                        lastName: lastname,
                        emailAdress: email,
                        token: jwt.sign(payload, jwtSecretKey, {
                          expiresIn: "2h",
                        }),
                      };
                      logger.debug("Registered", userinfo);
                      res.status(200).json(userinfo);
                    }
                  }
                );
              }
            });
          }
        });
      }
    });

  },

  validateRegister(req, res, next) {
    try {
      assert(typeof req.body.firstname === "string", "firstname is missing.");
      assert(typeof req.body.lastname === "string", "lastname is missing.");
      assert(typeof req.body.email === "string", "email is missing.");
      assert(typeof req.body.studentnr === "number", "studentnr is missing.");
      assert(typeof req.body.password === "string", "password is missing.");
      next();
    } catch (ex) {
      logger.debug("validateRegister error: ", ex.toString());
      res.status(422).json({
        message: ex.toString(),
      });
    }
  },

  //UC-102 Login
  login(req, res, next) {
    pool.getConnection((err, connection) => {
      if (err) {
        logger.error("Error getting connection from pool");
        res.status(500);
      }
      if (connection) {
        connection.query(
          "SELECT `ID`, `Email`, `Password`, `First_Name`, `Last_Name` FROM `user` WHERE `Email` = ?",
          [req.body.email],
          (err, rows, fields) => {
            connection.release();
            if (err) {
              logger.error("Error: ", err.toString());
              res.status(500).json({
                error: err.toString(),
              });
            }else if (rows.length === 0){
              res.status(401).json({
                message: "User not found or password invalid",
              });
            } else {
              bcrypt.compare(
                req.body.password,
                rows[0].Password,
                function (err, isMatch) {
                  if (err) {
                    throw err;
                  } else if (!isMatch) {
                    console.log("Password doesn't match!");
                    logger.info("User not found or password invalid");
                    res.status(401).json({
                      message: "User not found or password invalid",
                    });
                  } else {
                    logger.info("passwords DID match, sending valid token");
                    const payload = {
                      id: rows[0].ID,
                    };
                    const userinfo = {
                      id: rows[0].ID,
                      firstName: rows[0].First_Name,
                      lastName: rows[0].Last_Name,
                      emailAdress: rows[0].Email,
                      token: jwt.sign(payload, jwtSecretKey, {
                        expiresIn: "2h",
                      }),
                    };
                    logger.debug("Logged in, sending: ", userinfo);
                    res.status(200).json(userinfo);
                  }
                }
              );
            }
          }
        );
      }
    });
  },


  validateLogin(req, res, next) {
    try {
      assert(typeof req.body.email === "string", "email must be a string.");
      assert(
        typeof req.body.password === "string",
        "password must be a string."
      );
      next();
    } catch (ex) {
      res.status(422).json({
        error: ex.toString(),
      });
    }
  },

  validateToken(req, res, next) {
    logger.info("validateToken called");
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      logger.warn("Authorization header missing!");
      res.status(401).json({
        error: "Authorization header missing!",
      });
    } else {
      const token = authHeader.substring(7, authHeader.length);

      jwt.verify(token, jwtSecretKey, (err, payload) => {
        if (err) {
          logger.warn("Not authorized");
          res.status(401).json({
            error: "Not authorized",
          });
        }
        if (payload) {
          logger.debug("token is valid", payload);
          req.userId = payload.id;
          next();
        }
      });
    }
  },

  checkIfAuthorized(req, res, next) {
    const { homeId } = req.params;

    const userId = req.userId;

    let sqlQuery = `SELECT * FROM home_administrators WHERE UserID = ${userId} AND StudenthomeID = ${homeId}`;
    pool.getConnection(function (err, connection) {
      if (err) {
        logger.error("update", err);
        next({ message: "Failed getting connection", errCode: 400 });
      }
      if (connection) {
        connection.query(
          sqlQuery,
          (error, results, fields) => {
            connection.release();
            if (error) {
              logger.error("update", error);
              next({ message: "Failed calling query", errCode: 400 });
            }
            if (results) {
              if(results.length === 0){
                next({ message: "You are not administrator of this studenthome", errCode: 401 });
              } else{
                logger.info("Administrator is right")
                next();
              }
            }
          }
        );
      }
    });
  },

  //UC-103 Systeeminfo opvragen
  info(req, res) {
    res
      .status(200)
      .json({
        name: "Janne Sterk",
        studentnumber: "2173624",
        description: "Samen eten is an app to get students connected",
        sonarqubeURL: "https://sonarqube.avans-informatica-breda.nl/dashboard?id=programmeren4-nodejs-jsterk",
      })
      .end();
  },
};
