module.exports = function(app) {

    var meals = require('../../src/controllers/meal.controller');

    //UC-303 Lijst van maaltijden opvragen
    app.get('/api/studenthome/:homeId/meal', meals.findAll);

    //UC-304 Details van een maaltijd opvragen
    app.get('/api/studenthome/:homeId/meal/:mealId', meals.findOne);

    //UC-301 Maaltijd aanmaken
    app.post('/api/studenthome/:homeId/meal', meals.addMealtoStudenhome);

    //UC-302 Maaltijd wijzigen
    app.put('/api/studenthome/:homeId/meal/:mealId', meals.updateMeal);

    //UC-305 Maaltijd verwijderen
    app.delete('/api/studenthome/:homeId/meal/:mealId', meals.deleteMeal);
}