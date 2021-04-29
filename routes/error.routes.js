module.exports = function(app) {
    var error = require('../controller/error.controller.js');

    app.all("*", error.logRequest)

    app.all("*", error.logRequestPath)

    app.use(error.handleError)
    
}