let express = require('express');
let multer = require('multer');
let r = require('rethinkdb');
let fs = require('fs');
let db = require('./db.js');
let common = require('./common.js');

let upload = multer({ dest: './assets/images/projects' });
let routes = express.Router();

routes.param('project', (req, res, next, id) => {
  db.run(r.table('projects').get(id), (err, project) => {
    if(err) {
      next(err);
    } else {
      req.project = project;
      next();
    }
  });
});

routes.get('/', (req, res) => {
  db.run(r.table('projects').orderBy({index: r.desc('date')}).limit(10), (err, cursor) => {
      if(err) {
        res.status(500).send(err);
      } else {
        cursor.toArray((err, projects) => {
          if(err) {
            res.status(500).send(err);
          } else {
            res.render('projects/index', {
              req: req,
              projects: projects
            });
          }
        });
      }
  });
});

routes.get('/edit/new',
  common.validateAdmin, (req, res) => {
  res.render('projects/edit', {
    req: req,
    editing: false
  });
});

routes.post('/',
  upload.single('img'),
  common.validateAdmin, (req, res) => {
  
  let entry = {
    title: req.body.title,
    body: req.body.body,
    date: new Date(),
    img: req.file.filename,
    actions: req.body.actions ? req.body.actions : []
  };

  db.run(r.table('projects').insert(entry), (err, result) => {
    if(err) {
      res.status(500).send(err);
    } else {
      res.redirect('/projects');
    }
  });
});

routes.delete('/:project',
  common.validateAdmin, (req, res) => {
  db.run(r.table('projects').get(req.project.id).delete(), (err, result) => {
    if(err) {
      res.status(500).send(err);
    } else {
      fs.unlink('./assets/images/projects/' + req.project.img, () => {
        console.log('deleted img');
      });
      res.redirect('/projects');
    }
  });
});

module.exports = routes;
