module.exports = function(app) {
    var studenthomeList = require('../controllers/studenthome.controller');

    //Create a new studenthome
    app.post('/api/studenthome', studenthomeList.create);

    //Retrieve all studenthomes
    app.get('/api/studenthome', studenthomeList.getAll);

    //Retrieve a single studenthome by homeId
    app.get('/api/studenthome/:homeId', studenthomeList.searchByHomeId);

    // //Retrieve a single studenthome by name and/or city
    // app.get('/api/studenthome', studenthomeList.searchByNameAndCity);

    // //Update studenthome
    // app.put('/api/studenthome/:homeId', studenthomeList.update);

    // //Delete a studenthome with homeId
    // app.delete('/api/studenthome/:homeId', studenthomeList.delete);
}