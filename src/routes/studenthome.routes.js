module.exports = function (app) {
  const studenthomecontroller = require("../controllers/studenthome.controller");
  const authcontroller = require("../controllers/authentication.controller")

  //Retrieve a single studenthome by homeId
  app.get("/api/studenthome/:homeId", studenthomecontroller.searchByHomeId);

  //Retrieve a single studenthome by name and/or city
  app.get("/api/studenthome", studenthomecontroller.searchByNameAndCity);

  //Create a new studenthome
  app.post("/api/studenthome", authcontroller.validateToken, studenthomecontroller.validateStudenthome, studenthomecontroller.create);

  //Delete a studenthome
  app.delete("/api/studenthome/:homeId", authcontroller.validateToken , studenthomecontroller.validateHomeID, authcontroller.checkIfAuthorized, studenthomecontroller.delete);

  //Update a studenthome
  app.put("/api/studenthome/:homeId", authcontroller.validateToken , studenthomecontroller.validateHomeID, authcontroller.checkIfAuthorized, studenthomecontroller.validateStudenthome, studenthomecontroller.update);

  //Add an administrator
  app.put('/api/studenthome/:homeId/user', authcontroller.validateToken, studenthomecontroller.validateUserID, authcontroller.checkIfAuthorized, studenthomecontroller.addAdminstrator);

};
