const express = require("express");
const app = express();

const importInfoData = require("./infoData.json");
const importStudentHomeData = require("./studenthomesData")

const port = process.env.PORT || 3000

app.use(express.json());

// //General error message
// app.all("*", (req, res) => {
//   console.log("Catch-all endpoint aangeroepen")

//   res.status(400).send("Endpoint " +req.url+ " does not exists")
// })

// //Error message
// app.use("*", (error, req, res, next) => {
//   console.log("Errorhandler called!")
//   // console.log(error)

//   res.status(error.errCode).send({
//     error: "Some error occurred",
//     message : error.message
//   })

// })

//Home-page
app.get("/", (req,res) => {
  res.send("Welcome!");
})

//Info about maker-page
app.get("/api/info", (req, res) => {
  res.status(200).send(importInfoData);
})

//Studenthome info page
app.post("/api/studenthome", (req, res) => {
  let addedStudenthome = {
            homeid: importStudentHomeData.studenthomes.length + 1,
            name: req.body.name,
            streetname: req.body.streetname,
            number: req.body.number,
            zipcode: req.body.zipcode,
            city: req.body.city,
            phonenumber: req.body.phonenumber,
        };
        if (addedStudenthome) {
          importStudentHomeData.add(addedStudenthome, () =>{
          });
          res.status(201).send(addedStudenthome);
        }
        // next({error: "Studenthome is not added", errCode: 400})
        res.status(400).send("Error: Studenthome is not added");
  })

  //Search studenthome with name and/or city
  app.get("/api/studenthome", (req, res) => {
    console.log(req.query);
    const { city } = req.query;
    const { name } = req.query;
    console.log(city);
    console.log(name);
    var post;
    var post2;
    if (name) {
        post = importStudentHomeData.filter((post) => post.name.startsWith(name));
    }
    console.log(post);
    if (city) {
        if (post != null) {
            post2 = post.filter((post2) => post2.city == city);
        } else {
            post2 = importStudentHomeData.filter((post2) => post2.city == city);
        }
    }
    if (post2 != null) {
        res.status(200).send(post2);
    } else {
        if (post != null) {
            res.status(200).send(post);
        } else {
          // next({error : "Studenthome not found", errCode: 404})
            res.status(404).send("Not Found");
        }
    }
  })

  //Details from studenthome with given homeId
  app.get("/api/studenthome/:homeId", (req, res) => {
    console.log(req.params);
    const { homeId } = req.params;
    var post;
    if (homeId) {
    post = importStudentHomeData.find((post) => post.homeId == homeId);
    if (post) res.status(200).send(post);
    else  res.status(400).send(`Not Found`);
    // next({ error : "Studenthome not found" , errCode: 400})
    }
  })

  // //Update studenthome with given homeId
  // app.put("/api/studenthome/:homeId", (req, res) => {
  //       const { homeId } = req.params;
  //       let studenthome = importStudentHomeData.filter((studenthome) => {
  //           return studenthome.homeId == homeId;
  //       })[0];
  //       const index = importStudentHomeData.indexOf(studenthome);
  //       let keys = Object.keys(req.body);
  //       keys.forEach((key) => {
  //           studenthome[key] = req.body[key];
  //       });
  //       importStudentHomeData[index] = studenthome;
  //       res.json(importStudentHomeData[index]);
  //       res.status(201).send(studenthome);
  // });

// //   //Delete studenthome with given homeId
//   app.delete("/api/studenthome/:homeId", (req, res) => {
//         console.log(req.params);
//         let homeId = req.params.homeId;
//         var post;
//         if (homeId) {
//             post = importStudentHomeData.find((post) => post.homeId === homeId);
//             if (post)
//                 res.status(202).send(post);
//             else
//                 res.status(400).send(`Can't delete studenthome`);
//         }
//         res.status(200).send(importStudentHomeData);
//     });



app.listen(port, () => {
  console.log("Example app is listening on port 3000")
})