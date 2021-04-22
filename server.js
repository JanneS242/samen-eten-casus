const express = require("express");
const app = express();

const importData = require("./data.json");

const port = process.env.PORT || 3000
app.get("/", (req,res) => {
  res.send("Hello World. YOU BETTER WORK!");
})

app.get("/classes", (req, res) => {
  res.send(importData);
})


// const express = require("express");
// var path = require('path');
// const app = express();
// const importData = require("./data.json");
// const studenthomes = require("./studentenhome.json");
// // const host = '127.0.0.1';
// const port = process.env.PORT || 3000;
// app.use(express.json());
// app.get("/", (req, res) => {
//     res.sendFile(path.join(__dirname + '/index.html'));
// });
// app.get("/api/info", (req, res) => {
//     res.status(200).send(importData);
// });
// app.post("/api/studenthome", (req, res) => {
//     let studenhome = {
//         homeid: studenthomes.length + 1,
//         name: req.body.name,
//         streetname: req.body.streetname,
//         number: req.body.number,
//         zipcode: req.body.zipcode,
//         city: req.body.city,
//         phonenumber: req.body.phonenumber,
//     };
//     if (studenhome) {
//         studenthomes.push(studenhome);
//         res.status(201).send(studenhome);
//     }
//     res.status(400).send("Didnt work lmao");
// });
// //Verwijderen op homeID
// app.delete("/api/studenthome", (req, res) => {
//     console.log(req.query);
//     const { homeid } = req.query;
//     var post;
//     if (homeId) {
//         post = studenthomes.find((post) => post.homeid === homeid);
//         if (post)
//             res.status(202).send(post);
//         else
//             res.status(400).send(`Can't delete studenthome`);
//     }
//     res.status(200).send(importStudenthuis.studenthomes);
// });
// //Zoeken op homeID
// app.get("/api/studenthome", (req, res) => {
//     console.log(req.query);
//     const { homeId } = req.query;
//     var post;
//     if (homeId) {
//         post = studenthomes.find((post) => post.homeid === homeid);
//         if (post) res.status(200).send(post);
//         else res.status(400).send(`Not Found`);
//     }
// });
// //Update studenthome
// app.put("/api/studenthome/:homeid", (req, res) => {
//     let homeid = req.params.homeid;
//     let studenthome = studenthomes.filter((studenthome) => {
//         return studenthome.homeid == homeid;
//     })[0];
//     const index = studenthomes.indexOf(studenthome);
//     let keys = Object.keys(req.body);
//     keys.forEach((key) => {
//         studenthome[key] = req.body[key];
//     });
//     studenthomes[index] = studenthome;
//     res.json(studenthomes[index]);
//     res.status(201).send(studenthome);
// });
// //Zoeken op Naam - plaats
// app.get("/api/studenthome", (req, res) => {
//     console.log(req.query);
//     const { city } = req.query;
//     const { name } = req.query;
//     console.log(city);
//     console.log(name);
//     var post;
//     var post2;
//     if (name) {
//         post = studenthomes.filter((post) => post.name.startsWith(name));
//     }
//     console.log(post);
//     if (city) {
//         if (post != null) {
//             post2 = post.filter((post2) => post2.city == city);
//         } else {
//             post2 = studenthomes.filter((post2) => post2.city == city);
//         }
//     }
//     if (post2 != null) {
//         res.status(200).send(post2);
//     } else {
//         if (post != null) {
//             res.status(200).send(post);
//         } else {
//             res.status(404).send("Not Found");
//         }
//     }
// });
// app.listen(port, () => {
//     console.log(`Listening on port http://Localhost:${port}`);
// });