var logger = require("tracer").console();
const studenthomes = require("../studenthome.json");

exports.searchByHomeId = function(req, res, next) {
    const { homeId } = req.params;
    logger.log(req.params);
    let hometoreturn = studenthomes.find((home) => home.homeid == homeId);
    if(hometoreturn){
        return res.status(200).json(hometoreturn);
    } else{
         next({ message: "Home doesn\'t exist", errCode: 404 })
    }
};
exports.searchByNameAndCity = function(req, res) {
    logger.log(req.query);
    const { city } = req.query;
    const { name } = req.query;
    logger.log(city);
    logger.log(name);
    var post;
    var post2;
    if(city || name){
    if(name) {
        post = studenthomes.filter((post) => post.name.startsWith(name));
        
    }
    logger.log(post);
    if(city){
        if(post != null){
            post2 = post.filter((post2) => post2.city == city);
        }else{
            post2 = studenthomes.filter((post2) => post2.city == city);
        }
    }
    if(post2 != null){
        res.status(200).send(post2);
    }else{
        if(post != null){
            res.status(200).send(post);
        } else{
            next({ message: "Not Found", errCode: 404 })
        }
    }} else {
        res.status(200).send(studenthomes);
    }
};
exports.delete = function(req, res) {
    const { homeId} = req.params;
    let homeToDelete = studenthomes.find((hometofind) => hometofind.homeid == homeId);
    if(homeToDelete !== null){
        logger.log(homeToDelete.homeid);
        studenthomes = studenthomes.filter((home) => home.homeid !== homeToDelete.homeid);
        res.status(200).json(homeToDelete);
    }else{
        next({ message: "Home doesn\'t exist", errCode: 404 })
    }
};

exports.update = function(req, res) {
    logger.log(req.params)
    const { homeId } = req.params;
    let home = studenthomes.find((home) => home.homeid == homeid);
    let home = studenthomes.filter(home => {
        return home.homeid == homeId;
    })[0];
    const index = studenthomes.indexOf(home);
    const body = req.body;
    let keys = Object.keys(body)
    keys.forEach(key =>  {
        if(home[key]){
            home[key] = body[key];
        }
    });
    studenthomes[index] = home;
    studenthomes.find((home) => home.homeid = homeid) = JSON.stringify(body);
    res.status(200).send(home).end();
};

exports.addUsertoStudenhome = function(req, res) {
    const { homeId } = req.params;
    var user = req.body;
    let keys = Object.keys(user);
    if(keys[0] == 'userid' && keys.length == 1){
        let index = studenthomes.findIndex((home) => home.homeid == homeId);
        let homeusers = studenthomes[index]["users"];
        let isdup = false;
        homeusers.forEach(homeuser => {
            if(homeuser["userid"] == user["userid"]){
                isdup = true;
            }
        });
        if(isdup == true){
         next({ message: "user already in home", errCode: 409 })
        }else{
            studenthomes[index]["users"].push(user);
            logger.log(studenthomes[index]["users"]);
            res.status(200).send('added new user to home');
        }
    } else{
      next({ message: "wrong body format", errCode: 400 })
    }
};

exports.create = function(req, res) {
    logger.log(maxId);
    var body = req.body;
    if(body){
        var keys = Object.keys(studenthomes[0]);
        logger.log(keys);
        keys = keys.filter(key => key !== 'homeid');
        keys = keys.filter(key => key !== 'users')
        logger.log(keys);
        keys.forEach(key => {
            logger.log(key);
            if(!(body[key])){
                next({ message: "wrong body format", errCode: 400 })
            }
        });
        body = addToObject(body, "homeid", maxId.toString(), 0);
        // body["homeid"] = maxId.toString();
        body["users"] = [];
        maxId = maxId + 1;
        studenthomes.push(body);
        logger.log(studenthomes);
        res.status(201).json(body).end();
    }else{
        next({ message: "The method can't succeed", errCode: 400 })
    }
};

var maxId = getmaxId();
function getmaxId(){
    let max = 0;
    studenthomes.forEach(home =>{
        if(parseInt(home.homeid) > max){
            max = home.homeid;
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
