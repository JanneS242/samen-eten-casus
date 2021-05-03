var logger = require("tracer").console();

(exports.logRequest = function (req, res, next) {
  logger.log("Generic logging handler called");
  next();
}),
  (req, res, next) => {
    const reqMethod = req.method;
    const reqUrl = req.url;
    logger.log(`${reqMethod} request at ${reqUrl}`);

    next();
  };

exports.logRequestPath = function (req, res, next) {
  logger.log("Catch-all endpoint called");
  next({ message: `Endpoint ${req.url} does not exists`, errCode: 401 });
};

exports.handleError = function (error, req, res, next) {
  logger.log("Errorhandler called!", error);
  res.status(error.errCode).json({
    error: "Some error occured",
    message: error.message,
  });
};
