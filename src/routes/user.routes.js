module.exports = function(app) {
    var user = require('../../src/controllers/user.controller');

    //UC-103 Systeeminfo opvragen
    app.get('/api/info', user.info);

    //UC-101 Registreren
    app.post('/api/register', user.create);

    //UC-102 Login
    
}