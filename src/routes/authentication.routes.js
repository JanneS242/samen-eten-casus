module.exports = function(app) {
    const AuthController = require('../controllers/authentication.controller')

    //UC-101 Registreren
    app.post('/api/register', AuthController.validateRegister, AuthController.register);

    //UC-102 Login
    app.post('/api/login', AuthController.validateLogin, AuthController.login)

    //UC-103 Systeeminfo opvragen
    app.get('/api/info', AuthController.info);
}