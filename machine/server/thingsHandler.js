let express = require('express');
let fs = require('fs');

let routes = express.Router();

routes.get('/', (req, res) => {
    // collect toys
    fs.readdir('./assets/things/', (err, files) => {
        if(err) return res.status(500).send(err);
        
        let things = files.map((folder) => {
           return {
               name: folder,
               url: folder
           }; 
        });
        
        res.render('things/index', {
           req: req,
           things: things
        });
    });
});

module.exports = routes;