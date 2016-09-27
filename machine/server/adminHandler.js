let express = require('express');

let routes = express.Router();

routes.get('/', (req, res) => {
    // collect toys
    res.render('admin/index', {
        req: req
    });
});

module.exports = routes;