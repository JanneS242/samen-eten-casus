module.exports = function(app) {
    var error = require('.././controllers/error.controller');

    app.all("*", error.logRequest)

    app.all("*", error.logRequestPath)

    app.use(error.handleError)
    
}