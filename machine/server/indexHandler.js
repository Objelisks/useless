let express = require('express');
let pluralize = require('pluralize');

let routes = express.Router();

routes.get('/', (req, res) => {
  res.render('index/index', {req: req, pluralize: pluralize});
});

module.exports = routes;