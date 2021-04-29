const importData = require("../infoData.json");
const importUser = require("../user.json");
var logger = require("tracer").console();


exports.info = function (req, res) {
  res.status(200).json(importData).end();
};

exports.create = function(req, res) {
    logger.log(maxId);
    var body = req.body;
    if(body){
        var keys = Object.keys(importUser[0]);
        logger.log(keys);
        keys = keys.filter(key => key !== 'userid');
        keys = keys.filter(key => key !== 'key')
        logger.log(keys);
        keys.forEach(key => {
            logger.log(key);
            if(!(body[key])){
              next({ message: "wrong body format", errCode: 400 })
            }
        });
        body = addToObject(body, "homeid", maxId.toString(), 0);
        body["key"] = makeKey(8);
        maxId = maxId + 1;
        importUser.push(body);
        logger.log(importUser);
       return res.status(201).json(body).end();
    }else{
      next({ message: "The method can't succeed", errCode: 400 })
    }
};

exports.read = function (req, res) {
  res.status(200).json(importUser).end();
};

function makeKey(length) {
  var result = [];
  var characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result.push(
      characters.charAt(Math.floor(Math.random() * charactersLength))
    );
  }
  return result.join("");
};

var maxId = getmaxId();
function getmaxId() {
  let max = 0;
  importUser.forEach((user) => {
    if (parseInt(user.userid) > max) {
      max = user.userid;
    }
  });
  max++;
  return max;
};

var addToObject = function(obj, key, value, index){
    var temp ={};
    var i = 0;
    for(var prop in obj){
            if(i == index && key && value){
                temp[key] = value;
            }
            temp[prop] = obj[prop];
            i++;
    }
    if(!index && key && value){
        temp[key] = value;
    }
    return temp;
};