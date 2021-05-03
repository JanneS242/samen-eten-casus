var logger = require("tracer").console();
const studenthomes = require("../studenthome.json");

//UC-303 Lijst van maaltijden opvragen
exports.findAll = function (req, res, next) {
  const { homeId } = req.params;
  logger.log(req.params);
  let hometoreturn = studenthomes.find((home) => home.homeid == homeId);
  if (hometoreturn) {
    return res.status(200).json(hometoreturn.meal);
  } else {
    next({
      message: "Home doesn't exist",
      errCode: 404,
    });
  }
};

//UC-304 Details van een maaltijd opvragen
exports.findOne = function (req, res, next) {
  logger.log(req.params);
  const { homeId } = req.params;
  const { mealId } = req.params;
  const index = studenthomes.findIndex((home) => home.homeid == homeId);
  if (index == -1) {
    next({
      message: "Home doesn't exist",
      errCode: 404,
    });
  }
  const mealIndex = studenthomes[index].meals.findIndex(
    (meal) => meal.mealid == mealId
  );
  if (mealIndex == -1) {
    next({
      message: "meal doesn't exist",
      errCode: 404,
    });
  }
  res.status(200).json(studenthomes[index].meals[mealIndex]);
};

//UC-301 Maaltijd aanmaken
exports.addMealtoStudenthome = function (req, res, next) {
  logger.log(req.params);
  const { homeId } = req.params;
  var body = req.body;
  // let keys = Object.keys(body);
  if (body) {
    let keys = Object.keys(body);
    keys = keys.filter((key) => key !== "mealid");
    let index = studenthomes.findIndex((home) => home.homeId == homeId);
    let homemeals = studenthomes[index]["meals"];
    body = addToObject(body, "mealid", maxId.toString(), 0);
    // let isdup = false;
    // homemeals.forEach((homemeals) => {
    //             if (homemeals["userId"] == user["userId"]) {
    //                 isdup = true;
    //             }
    //         });

    // let postalCodeVar = body["postalcode"];
    // let phoneNumberVar = body["phonenumber"];
    // let streetVar = body["street"];
    // let numberVar = body["number"];

    // if (isdup == true) {
    //     next({ message: "meal already in home", errCode: 409 });
    // } else
    if (
      body["name"] == null ||
        body["description"] == null ||
        body["createdon"] == null ||
        body["offeredon"] == null ||
        body["price"] == null ||
        body["allergyinformation"] == null ||
      body["ingredients"] == null
    ) {
      next({ message: "An element is missing!", errCode: 400 });
    } else {
      studenthomes[index]["meals"].push(body);
      logger.log(studenthomes[index]["meals"]);
      res.status(200).json(body).end();
    }
  } else {
    next({ message: "The method did not succeed", errCode: 400 });
  }
}

  //UC-302 Maaltijd wijzigen
  exports.updateMeal = function (req, res, next) {
    const body = req.body;
    const { homeId } = req.params;
    const { mealId } = req.params;
    logger.log("homeId =" + homeId);
    const homeIndex = studenthomes.findIndex((home) => home.homeId == homeId);
    if (homeIndex == -1) {
      next({
        message: "Home doesn't exist",
        errCode: 404,
      });
    }
    logger.log("homeIndex =" + homeIndex);
    const mealIndex = studenthomes[homeIndex].meals.findIndex(
      (meal) => meal.mealid == mealId
    );
    if (mealIndex == -1) {
      next({
        message: "Meal doesn't exist",
        errCode: 404,
      });
    }
    // const keys = Object.keys(body);
    // keys.forEach((key) => {
    //   if (!studenthomes[index].meals[mealIndex][key]) {
    //     next({ message: "wrong body format", errCode: 400 });
    //   }
    //   studenthomes.studenthomes[index].meals[mealIndex][key] = body[key];
    // });
    if (
        body["name"] == null ||
          body["description"] == null ||
          body["createdon"] == null ||
          body["offeredon"] == null ||
          body["price"] == null ||
          body["allergyinformation"] == null ||
        body["ingredients"] == null
      ) {
        next({ message: "An element is missing!", errCode: 400 });
      } else {
        studenthomes[homeIndex].meals[mealIndex] = body;
        logger.log(studenthomes[homeIndex]["meals"]);
        res.status(200).json(studenthomes[homeIndex].meals[mealIndex]);
      }
  };


//UC-305 Maaltijd verwijderen
exports.deleteMeal = (req, res) => {
  const { homeId } = req.params;
  const { mealId } = req.params;
  const index = studenthomes.studenthomes.findIndex(
    (home) => home.homeid == homeId
  );
  if (index == -1) {
    res.status(404).send("HOme not found");
    return;
  }
  let mealToDelete = studenthomes.studenthomes[index].meals.find(
    (meal) => meal.mealid == mealId
  );
  if (!mealToDelete) {
    res.status(404).send("Meal not found");
    return;
  }
  studenthomes.studenthomes[index].meals = studenthomes.studenthomes[
    index
  ].meals.filter((meal) => meal.mealid != mealId);
  res.status(200).json(mealToDelete);
};

var maxId = getmaxId();
function getmaxId() {
  let max = 0;
  studenthomes.forEach((meal) => {
    if (parseInt(meal.mealid) > max) {
      max = meal.mealid;
    }
  });
  max++;
  return max;
}

var addToObject = function (obj, key, value, index) {
  var temp = {};
  var i = 0;
  for (var prop in obj) {
    if (i == index && key && value) {
      temp[key] = value;
    }
    temp[prop] = obj[prop];
    i++;
  }
  if (!index && key && value) {
    temp[key] = value;
  }
  return temp;
};
