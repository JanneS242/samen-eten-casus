var logger = require("tracer").console();
const studenthomes = require("../studentenhome.json");

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
exports.addMealtoStudenhome = function (req, res) {
    logger.log(req.params);
    const { homeId } = req.params;
    var meal = req.body;
    let keys = Object.keys(meal);
    if (keys[0] == "userid" && keys.length == 1) {
        let index = studenthomes.findIndex((home) => home.homeid == homeId);
        let homemeals = studenthomes[index]["meals"];
        let isdup = false;
        homemeals.forEach((homemeals) => {
            if (homemeals["userid"] == user["userid"]) {
                isdup = true;
            }
        });
        if (isdup == true) {
            next({ message: "meal already in home", errCode: 409 });
        } else {
            studenthomes[index]["meals"].push(meal);
            logger.log(studenthomes[index]["meals"]);
            res.status(200).json(meal).end();
        }
    } else {
        next({ message: "wrong body format", errCode: 400 });
    }
};

//UC-302 Maaltijd wijzigen
exports.updateMeal = function (req, res) {
    const body = req.body;
    const {mealId} = req.params;
    const { homeId } = req.params;
    logger.log(homeId);
    const index = studenthomes.findIndex((home) => home.homeid == homeId);
    if(index == -1){
        next({
            message: "Home doesn't exist",
            errCode: 404,
        });
    }
    logger.log(index)
    const mealIndex = studenthomes[index].meals.findIndex((meal) => meal.mealid == mealId);
    if(mealIndex == -1){
        next({
            message: "meal doesn't exist",
            errCode: 404,
        });
    }
    const keys = Object.keys(body);
    keys.forEach((key) =>{
      if(!studenthomes[index].meals[mealIndex][key]){
        next({ message: "wrong body format", errCode: 400 });
      }
      studenthomes.studenthomes[index].meals[mealIndex][key] = body[key];
    });
    res.status(200).json(studenthomes.studenthomes[index].meals[mealIndex])
  };

  //UC-305 Maaltijd verwijderen
  exports.deleteMeal = (req, res) => {
    const { homeId } = req.params;
    const { mealId } = req.params;
    const index = studenthomes.studenthomes.findIndex((home) => home.homeid == homeId);
    if(index == -1){
      res.status(404).send('HOme not found');
      return;
    }
    let mealToDelete = studenthomes.studenthomes[index].meals.find((meal) => meal.mealid == mealId);
    if(!mealToDelete){
      res.status(404).send('Meal not found');
      return;
    }
    studenthomes.studenthomes[index].meals = studenthomes.studenthomes[index].meals.filter((meal) => meal.mealid != mealId);
    res.status(200).json(mealToDelete);
  }