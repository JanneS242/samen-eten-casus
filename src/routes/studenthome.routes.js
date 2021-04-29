module.exports = function(app) {
 
   var studenthome = require('../../src/controllers/studenthome.controller');
    
   //Retrieve a single studenthome by homeId
   app.get('/api/studenthome/:homeId', studenthome.searchByHomeId);

   //Retrieve a single studenthome by name and/or city
   app.get('/api/studenthome', studenthome.searchByNameAndCity);
    
   //Create a new studenthome
   app.post('/api/studenthome', studenthome.create);

   //Delete a studenthome 
   app.delete('/api/studenthome/:homeId', studenthome.delete);
    
   //Update a studenthome
   app.put('/api/studenthome/:homeId', studenthome.update);
    
   app.put('/api/studenthome/:homeId/user', studenthome.addUsertoStudenhome);
    
   }