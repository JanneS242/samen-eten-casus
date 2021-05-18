var logger = require("tracer").console();
const assert = require("assert");
const pool = require("../database/database.js");

let controller = {
  validateMeal(req, res, next) {
    logger.info("validate meal");
    logger.info(req.body);
    try {
      const {
        name,
        description,
        price,
        allergyinformation,
        ingredients,
        maxparticipants,
      } = req.body;
      assert(typeof name === "string", "name is missing!");
      assert(typeof description === "string", "description is missing!");
      assert(typeof price === "number", "price is missing!");
      assert(
        typeof allergyinformation === "string",
        "allergyinformation is missing!"
      );
      assert(typeof ingredients === "object", "ingredients are missing!");
      assert(
        typeof maxparticipants === "number",
        "maxparticipants are missing!"
      );
      next();
    } catch (err) {
      logger.trace("Meal data is INvalid: ", err);
      res.status(400).json({
        message: "Error!",
        error: err.toString(),
      });
    }
  },

  validateMealID(req, res, next) {
    const { homeId } = req.params;
    const { mealId } = req.params;

    let queryAllMealId = `SELECT * FROM meal WHERE ID = ${mealId} AND StudenthomeID = ${homeId}`;
    pool.getConnection(function (err, connection) {
      if (err) {
        logger.error("validateMealID", err);
        next({ message: "Failed getting connection", errCode: 400 });
      }
      if (connection) {
        connection.query(queryAllMealId, (error, results, fields) => {
          connection.release();
          if (error) {
            logger.error("validateMealID", error);
            next({ message: "Failed calling query", errCode: 400 });
          }
          if (results) {
            if (results.length === 0) {
              next({
                message: "This meal doesn't exists",
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

  //UC-301 Maaltijd aanmaken
  addMealtoStudenthome(req, res, next) {
    logger.log(req.params);
    const { homeId } = req.params;
    var meal = req.body;
    let {
      name,
      description,
      price,
      allergyinformation,
      ingredients,
      maxparticipants,
    } = meal;

    const userId = req.userId;

    let sqlQuery =
      "INSERT INTO `meal` (`Name`, `Description`, `Ingredients`, `Allergies`, `CreatedOn`, `OfferedOn`, `Price`, `UserID`, `StudenthomeID`, `MaxParticipants`) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
    pool.getConnection(function (err, connection) {
      if (err) {
        logger.error("create", err);
        next({ message: "Failed getting connection", errCode: 400 });
      }
      if (connection) {
        connection.query(
          sqlQuery,
          [
            name,
            description,
            ingredients,
            allergyinformation,
            new Date(),
            new Date(),
            price,
            userId,
            homeId,
            maxparticipants,
          ],
          (error, results, fields) => {
            connection.release();
            if (error) {
              logger.error("create", error);
              next({ message: "Failed calling query", errCode: 400 });
            }
            if (results) {
              var mealId = results.insertId;
              let joinQuery = `SELECT * FROM view_meal WHERE StudenthomeID = ${homeId} AND ID = ${mealId}`;
                    connection.query(joinQuery, (error, rows, fields) => {
                      if (error) {
                        logger.error("create results", error);
                        next({ message: "Failed calling query", errCode: 400 });
                      } else {
                        if (
                          rows &&
                          rows.length === 1 
                        ) {
                          var mealInfo = {
                            homeId: rows[0].StudenthomeID,
                            homeName: rows[0].StudenhomeName,
                            mealId: rows[0].ID,
                            description: rows[0].Description,
                            ingredients: rows[0].Ingredients,
                            allergies: rows[0].Allergies,
                            createdOn: rows[0].CreatedOn,
                            offeredOn: rows[0].OfferedOn,
                            maxparticipants: rows[0].MaxParticipants,
                            contact: rows[0].Contact,
                            email: rows[0].Email,
                            studentnumber: rows[0].Student_Number,
                          };
                          res.status(200).json(mealInfo);
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

  //UC-302 Maaltijd wijzigen
  updateMeal(req, res, next) {
    logger.log(req.params);
    const { homeId } = req.params;
    var meal = req.body;
    let {
      name,
      description,
      price,
      allergyinformation,
      ingredients,
      maxparticipants,
    } = meal;

    const { mealId } = req.params;

    const userId = req.userId;

    let sqlQuery = `UPDATE meal SET Name = ?, Description = ?, Ingredients = ?, Allergies = ?, CreatedOn = ?, OfferedOn = ?, Price = ?, UserID = ?, MaxParticipants = ? WHERE ID = ? AND StudenthomeID = ?`;
    pool.getConnection(function (err, connection) {
      if (err) {
        logger.error("updateMeal", err);
        next({ message: "Failed getting connection", errCode: 400 });
      }
      if (connection) {
        connection.query(
          sqlQuery,
          [
            name,
            description,
            ingredients,
            allergyinformation,
            new Date(),
            new Date(),
            price,
            userId,
            maxparticipants,
            mealId,
            homeId,
          ],
          (error, results, fields) => {
            connection.release();
            if (error) {
              logger.error("updateMeal", error);
              next({ message: "Failed calling query", errCode: 400 });
            }
            if (results) {
              let joinQuery = `SELECT * FROM view_meal WHERE StudenthomeID = ? AND ID = ?`;
              connection.query(joinQuery, [homeId, mealId], (error, rows, fields) => {
                if (error) {
                  logger.error("create results", error);
                  next({ message: "Failed calling query", errCode: 400 });
                } else {
                  if (
                    rows &&
                    rows.length === 1 
                  ) {
                    var studenthomeInfo = {
                      homeId: rows[0].StudenthomeID,
                            homeName: rows[0].StudenthomeName,
                            mealId: rows[0].ID,
                            description: rows[0].Description,
                            ingredients: rows[0].Ingredients,
                            allergies: rows[0].Allergies,
                            createdOn: rows[0].CreatedOn,
                            offeredOn: rows[0].OfferedOn,
                            maxparticipants: rows[0].MaxParticipants,
                            contact: rows[0].Contact,
                            email: rows[0].Email,
                            studentnumber: rows[0].Student_Number,
                    };
                    res.status(200).json(studenthomeInfo);
                  } else {
                    logger.info("INVALID");
                    next({ message: "Failed calling JOIN query", errCode: 400 });
                  }
                }
              });
            }
          }
        );
      }
    });
  },

  //UC-303 Lijst van maaltijden opvragen
  findAll(req, res, next) {
    const { homeId } = req.params;
    logger.log(req.params);
    let sqlQuery = `SELECT * FROM meal WHERE StudenthomeID = ${homeId}`;

    pool.getConnection(function (err, connection) {
      if (err) {
        logger.error("findAll", err);
        next({ message: "Failed getting connection", errCode: 400 });
      }
      if (connection) {
        connection.query(sqlQuery, (error, results, fields) => {
          connection.release();
          if (error) {
            logger.error("findAll", error);
            next({ message: "Failed calling query", errCode: 400 });
          }
          if (results) {
            if (results.length === 0) {
              next({ message: "Meals don't exist", errCode: 404 });
            } else {
              res.status(200).json({ results });
            }
          }
        });
      }
    });
  },

  //UC-304 Details van een maaltijd opvragen
  findOne(req, res, next) {
    const { homeId } = req.params;
    const { mealId } = req.params;
    logger.log(req.params);
    let sqlQuery = `SELECT * FROM view_meal WHERE StudenthomeID = ${homeId} AND ID = ${mealId}`;

    pool.getConnection(function (err, connection) {
      if (err) {
        logger.error("findAll", err);
        next({ message: "Failed getting connection", errCode: 400 });
      }
      if (connection) {
        connection.query(sqlQuery, (error, results, fields) => {
          connection.release();
          if (error) {
            logger.error("findAll", error);
            next({ message: "Failed calling query", errCode: 400 });
          }
          if (results) {
            if (results.length === 0) {
              next({ message: "Meals don't exist", errCode: 404 });
            } else {
              res.status(200).json({ results });
            }
          }
        });
      }
    });
  },

  //UC-305 Maaltijd verwijderen
  deleteMeal(req, res, next) {
    const { homeId } = req.params;
    const { mealId } = req.params;
    let sqlDeleteQuery = `DELETE FROM meal WHERE id = ${mealId} AND StudenthomeID = ${homeId}`;

    pool.getConnection(function (err, connection) {
      if (err) {
        logger.error("deleteMeal", err);
        next({ message: "Failed getting connection", errCode: 400 });
      }
      if (connection) {
        connection.query(sqlDeleteQuery, (error, results, fields) => {
          connection.release();
          if (error) {
            logger.error("deleteMeal", error);
            next({ message: "Failed calling query", errCode: 400 });
          }
          if (results) {
            if (results.affectedRows === 0) {
              next({ message: "Meal doesn't exist", errCode: 404 });
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
};

module.exports = controller;
