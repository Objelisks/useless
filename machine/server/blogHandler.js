let express = require('express');
let r = require('rethinkdb');
let db = require('./db.js');
let common = require('./common.js');
let marked = require('marked');

let routes = express.Router();

routes.param('page', (req, res, next, id) => {
  req.page = Math.abs(parseInt(id));
  next();
});

routes.param('article', (req, res, next, id) => {
  db.run(r.table('articles').get(id), (err, article) => {
    if(err) {
      next(err);
    } else {
      req.article = article;
      next();
    }
  });
});

routes.get(['/', '/page/:page'], (req, res) => {
  let page = req.page ? (req.page-1)*10 : 0;
  db.run(r.table('articles').orderBy({index: r.desc('date')}).skip(page).limit(10), (err, cursor) => {
      if(err) {
        res.status(500).send(err);
      } else {
        cursor.toArray((err, articles) => {
          if(err) {
            res.status(500).send(err);
          } else {
            res.render('blog/index', {
              req: req,
              articles: articles,
              marked: marked
            });
          }
        });
      }
  });
});

routes.get('/:article', (req, res) => {
  res.render('blog/index', {
    req: req,
    article: req.article,
    marked: marked
  });
});

routes.get('/edit/new',
  common.validateAdmin, (req, res) => {
  res.render('blog/edit', {
    req: req,
    editing: false,
    marked: marked
  });
});

routes.get('/edit/:article',
  common.validateAdmin, (req, res) => {
  res.render('blog/edit', {
    req: req,
    article: req.article,
    editing: true,
    marked: marked
  });
});

routes.post('/',
  common.validateAdmin, (req, res) => {
  req.body.date = new Date();
  db.run(r.table('articles').get(req.body.id).replace(req.body), (err, result) => {
    if(err) {
      res.status(500).send(err);
    } else {
      res.redirect('/blog/' + req.body.id);
    }
  });
});

routes.delete('/:article',
  common.validateAdmin, (req, res) => {
  db.run(r.table('articles').get(req.article.id).delete(), (err, result) => {
      if(err) {
        res.status(500).send(err);
      } else {
        res.status(204).send();
      }
  });
});

module.exports = routes;
