module.exports = function(app) {

    const mealcontroller = require('../../src/controllers/meal.controller');
    const authcontroller = require("../controllers/authentication.controller")

    //UC-303 Lijst van maaltijden opvragen
    app.get('/api/studenthome/:homeId/meal', mealcontroller.findAll);

    //UC-304 Details van een maaltijd opvragen
    app.get('/api/studenthome/:homeId/meal/:mealId', mealcontroller.findOne);

    //UC-301 Maaltijd aanmaken
    app.post('/api/studenthome/:homeId/meal', authcontroller.validateToken, mealcontroller.validateMeal, mealcontroller.addMealtoStudenthome);

    //UC-302 Maaltijd wijzigen
    app.put('/api/studenthome/:homeId/meal/:mealId', authcontroller.validateToken, mealcontroller.validateMealID, authcontroller.checkIfAuthorized, mealcontroller.validateMeal, mealcontroller.updateMeal);

    //UC-305 Maaltijd verwijderen
    app.delete('/api/studenthome/:homeId/meal/:mealId', authcontroller.validateToken, mealcontroller.validateMealID, authcontroller.checkIfAuthorized, mealcontroller.deleteMeal);
}