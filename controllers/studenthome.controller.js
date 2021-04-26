var logger = require('tracer').console()

var studenthomes = require('../controllers/studenthome.controller')

//Create a studenthome (POST method)
exports.create = function(req, res){
    let addedStudenthome = {
        homeId: importStudentHomeData.length + 1,
        name: req.body.name,
        street: req.body.streetname,
        number: req.body.number,
        postalcode: req.body.zipcode,
        city: req.body.city,
        phonenumber: req.body.phonenumber,
    };
    if (addedStudenthome) {
      studenthomes.push(addedStudenthome);
      res.status(201).send(addedStudenthome);
    } else{
        // next({error: "Studenthome is not added", errCode: 400})
        res.status(400).send("Error: Studenthome is not added");
    }
}

//Get all studenthomes (GET method)
exports.getAll = function(req, res){
    res.status(200).send(studenthomes)
}

//Get studenthome by homeId
exports.searchByHomeId = function(req, res){
    logger.log(req.params);
    const { homeId } = req.params;
    var post;
    if (homeId) {
    post = studenthomes.find((post) => post.homeId == homeId);
    if (post) {
        res.status(200).send(post);
    } else {
        // next({ error : "Studenthome not found" , errCode: 400})
        res.status(400).send(`Not Found`);
    }
}

//Get studenthome by name and/or city
exports.searchByNameAndCity = function(req, res){
    const { city } = req.query;
    const { name } = req.query;
    logger.log(city);
    logger.log(name);
    var post;
    var post2;
    if (name) {
        post = studenthomes.filter((post) => post.name.startsWith(name));
    }
    console.log(post);
    if (city) {
        if (post != null) {
            post2 = post.filter((post2) => post2.city == city);
        } else {
            post2 = studenthomes.filter((post2) => post2.city == city);
        }
    }
    if (post2 != null) {
        res.status(200).send(post2);
    } else {
        if (post != null) {
            res.status(200).send(post);
        } else {
        //   next({error : "Studenthome not found", errCode: 404})
            res.status(404).send("Not Found");
        }
    }
}

//Update studenthome (PUT method)
exports.update = function(req, res){
    let homeId = req.params.homeId;
    let studenthome = studenthomes.filter((studenthome) => {
        return studenthome.homeId == homeId;
    })[0];
    const index = studenthomes.indexOf(studenthome);
    let keys = Object.keys(req.body);
    keys.forEach((key) => {
        studenthome[key] = req.body[key];
    });
    studenthomes[index] = studenthome;
    res.json(studenthomes[index]);
    res.status(201).send(studenthome);
}

//Delete studenthome
exports.delete = function(req, res){
    logger.log(req.params.homeId);
    let homeId = req.params.homeId
    var post;
    if (homeId) {
        post = importStudentHomeData.find((post) => post.homeId === homeId);
        if (post)
            res.status(202).send(post);
        else
            res.status(400).send(`Can't delete studenthome`);
    }
}

}
