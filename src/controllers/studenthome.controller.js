var logger = require("tracer").console();
const studenthomes = require("../studenthome.json");
const { findOne } = require("./meal.controller");

exports.searchByHomeId = function (req, res, next) {
  const { homeId } = req.params;
  logger.log(req.params);
  let hometoreturn = studenthomes.find((home) => home.homeId == homeId);
  if (hometoreturn) {
    return res.status(200).json(hometoreturn);
  } else {
    next({ message: "Home doesn't exist", errCode: 404 });
  }
};
exports.searchByNameAndCity = function (req, res, next) {
  logger.log(req.query);
  const { city } = req.query;
  const { name } = req.query;
  logger.log(city);
  logger.log(name);
  var post;
  var post2;
  if (city || name) {
    if (name) {
      post = studenthomes.filter((post) => post.name.startsWith(name));
      if (post.length == 0) {
        next({ message: "Name not found", errCode: 404 });
      }
    }
    logger.log(post);
    if (city) {
      if (post != null) {
        post2 = post.filter((post2) => post2.city == city);
        if (post2.length == 0) {
          next({ message: "City not found", errCode: 404 });
        }
      } else {
        post2 = studenthomes.filter((post2) => post2.city == city);
        if (post2.length == 0) {
          next({ message: "City not found", errCode: 404 });
        }
      }
    }
    if (post2 != null) {
      res.status(200).send(post2);
    } else {
      if (post != null) {
        res.status(200).send(post);
      } else {
        next({ message: "Not Found", errCode: 404 });
      }
    }
  } else {
    res.status(200).send(studenthomes);
  }
};
exports.delete = function (req, res, next) {
  const { homeId } = req.params;
  for (var i = 0; i < studenthomes.length; i++) {
    if (studenthomes[i].homeId == homeId) {
      console.log("The search found in JSON Object");
      break;
    } else {
      next({ message: "Home doesn't exist", errCode: 404 });
    }
  }
  let homeToDelete = studenthomes.find(
    (hometofind) => hometofind.homeId == homeId
  );
  if (homeToDelete !== null) {
    logger.log(homeToDelete.homeId);
    // studenthomes = studenthomes.filter((home) => home.homeId !== homeToDelete.homeId);
    res.status(200).json(homeToDelete);
  } else {
    next({ message: "Home doesn't exist", errCode: 404 });
  }
};

exports.update = function (req, res, next) {
  logger.log(req.params);
  const { homeId } = req.params;
  const body = req.body;
  // if(homeId > maxId){ //Does not work properly
  //     next({ message: "This studenthome does not exists", errCode: 400})
  // }
  for (var i = 0; i < studenthomes.length; i++) {
    if (studenthomes[i].homeId == homeId) {
      console.log("The search found in JSON Object");
      break;
    } else {
      next({ message: "This studenthome does not exists", errCode: 400 });
    }
  }
  // let home = studenthomes.find((home) => home.homeid == homeid);
  let home = studenthomes.filter((home) => {
    return home.homeId == homeId;
  })[0];
  const index = studenthomes.indexOf(home);
  if (body) {
    let keys = Object.keys(body);
    keys.forEach((key) => {
      if (home[key]) {
        home[key] = body[key];
      }
    });
    let postalCodeVar = body["postalcode"];
    let phoneNumberVar = body["phonenumber"];
    // let streetVar = body["street"];
    // let numberVar = body["number"];

    if (
      body["name"] == null ||
      body["street"] == null ||
      body["number"] == null ||
      body["postalcode"] == null ||
      body["city"] == null ||
      body["phonenumber"] == null
    ) {
      next({ message: "An element is missing!", errCode: 400 });
    } else if (!validatePostalCode(postalCodeVar)) {
      next({ message: "Postal code is invalid", errCode: 400 });
    } else if (!validatePhoneNumber(phoneNumberVar)) {
      next({ message: "Phonenumber is invalid", errCode: 400 });
    } else if (checkIfHomeIdAlreadyExists(homeId)) {
      next({ message: "This studenthome does not exists", errCode: 400 });
    } else {
      studenthomes[index] = home;
      // studenthomes.find((home) => home.homeId === homeId) = JSON.stringify(body);
      // res.status(200).send(home).end();
    }
  } else {
    // if(body["name"]==null || body["street"]==null || body["number"]==null || body["postalcode"]==null || body["city"]==null || body["phonenumber"]==null){
    next({ message: "The method did not succeed", errCode: 400 });
    // res.status(400).send("The method did not succeed")
  }
};

// exports.addUsertoStudenthome = function(req, res) {
//     const { homeId } = req.params;
//     var user = req.body;
//     let keys = Object.keys(user);
//     if(keys[0] == 'userid' && keys.length == 1){
//         let index = studenthomes.findIndex((home) => home.homeId == homeId);
//         let homeusers = studenthomes[index]["users"];
//         let isdup = false;
//         homeusers.forEach(homeuser => {
//             if(homeuser["userid"] == user["userid"]){
//                 isdup = true;
//             }
//         });
//         if(isdup == true){
//          next({ message: "user already in home", errCode: 409 })
//         }else{
//             studenthomes[index]["users"].push(user);
//             logger.log(studenthomes[index]["users"]);
//             res.status(200).send('added new user to home');
//         }
//     } else{
//       next({ message: "wrong body format", errCode: 400 })
//     }
// };

exports.create = function (req, res, next) {
  logger.log(maxId);
  var body = req.body;
  if (body) {
    var keys = Object.keys(studenthomes[0]);
    logger.log(keys);
    keys = keys.filter((key) => key !== "homeId");
    keys = keys.filter((key) => key !== "users");
    logger.log(keys);
    body = addToObject(body, "homeId", maxId.toString(), 0);
    // body["homeId"] = maxId.toString();
    body["users"] = [];
    maxId = maxId + 1;

    let postalCodeVar = body["postalcode"];
    let phoneNumberVar = body["phonenumber"];
    let streetVar = body["street"];
    let numberVar = body["number"];

    if (
      body["name"] == null ||
      body["street"] == null ||
      body["number"] == null ||
      body["postalcode"] == null ||
      body["city"] == null ||
      body["phonenumber"] == null
    ) {
      next({ message: "An element is missing!", errCode: 400 });
    } else if (!validatePostalCode(postalCodeVar)) {
      next({ message: "Postal code is invalid", errCode: 400 });
    } else if (!validatePhoneNumber(phoneNumberVar)) {
      next({ message: "Phonenumber is invalid", errCode: 400 });
    } else if (checkIfHomeAlreadyExists(streetVar, numberVar)) {
      next({ message: "This studenthome already exists", errCode: 400 });
    } else {
      studenthomes.push(body);
      logger.log(studenthomes);

      res.status(200).json(body);
    }
  } else {
    // if(body["name"]==null || body["street"]==null || body["number"]==null || body["postalcode"]==null || body["city"]==null || body["phonenumber"]==null){
    next({ message: "The method did not succeed", errCode: 400 });
    // res.status(400).send("The method did not succeed")
  }
};

var maxId = getmaxId();
function getmaxId() {
  let max = 0;
  studenthomes.forEach((home) => {
    if (parseInt(home.homeId) > max) {
      max = home.homeId;
    }
  });
  max++;
  return max;
}

function validatePostalCode(value) {
  return /^[1-9][0-9]{3}[ ]?([A-RT-Za-rt-z][A-Za-z]|[sS][BCbcE-Re-rT-Zt-z])$/.test(
    value
  );
}

function validatePhoneNumber(value) {
  return /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im.test(
    value
  );
}

function checkIfHomeAlreadyExists(street, number) {
  var isInArray =
    studenthomes.find(function (el) {
      return el.street === street && el.number === number;
    }) !== undefined;
  return isInArray;
}

function checkIfHomeIdAlreadyExists(id) {
  var isInArray =
    studenthomes.find(function (el) {
      return el.homeId === id;
    }) !== undefined;
  return isInArray;
}

var addToObject = function (obj, key, value, index) {
  var temp = {};
  var i = 0;
  for (var prop in obj) {
    if (i == index && key && value) {
      temp[key] = value;
    }
    temp[prop] = obj[prop];
    i++;
  }
  if (!index && key && value) {
    temp[key] = value;
  }
  return temp;
};

function checkProperties(obj) {
  for (var key in obj) {
    if (obj[key] !== null && obj[key] != "") return false;
  }
  return true;
}
