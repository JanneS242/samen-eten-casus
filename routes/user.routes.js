module.exports = function(app) {
    var user = require('../controllers/user.controller');

    app.get('/api/info', user.info);

    app.post('/api/register', user.create);
}