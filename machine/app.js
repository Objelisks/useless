let express = require('express');
let app = express();
let bodyParser = require('body-parser');
let helmet = require('helmet');

let fs = require('fs');
let secrets = JSON.parse(fs.readFileSync('secrets.json'));

let r = require('rethinkdb');
let db = require('./server/db.js');
let blogHandler = require('./server/blogHandler.js');
let projectsHandler = require('./server/projectsHandler.js');

let session = require('express-session');
let RethinkStore = require('express-session-rethinkdb')(session);
let sessionStore = new RethinkStore({
  connectOptions: {
    servers: [
      { host: 'localhost', port: 28015 }
    ],
    db: 'test'
  },
  table: 'session'
});

let passport = require('passport');
let TwitterStrategy = require('passport-twitter').Strategy;

db.connect().then(() => {

// express middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(helmet());
app.use(session({
  secret: secrets.session_secret,
  store: sessionStore,
  resave: false,
  saveUninitialized: false
}));

// views
app.set('views', './views');
app.set('view engine', 'pug');
app.use(express.static('assets'));

// index
app.get('/', (req, res) => {
  res.render('index', {req: req});
});

// handle twitter login
passport.serializeUser(function(user, done) {
  done(null, user.id);
});
passport.deserializeUser(function(id, done) {
  db.run(r.table('users').get(id), function(err, user) {
    done(err, user);
  });
});
passport.use(new TwitterStrategy({
  consumerKey: secrets.twitter_consumerKey,
  consumerSecret: secrets.twitter_consumerSecret,
  callbackURL: 'https://objelisks.tech/twits'
}, (token, tokenSecret, profile, done) => {
  let user = { id: token, name: profile.username };
  db.run(r.table('users').get(token), (err, result) => {
    if(result) {
      done(null, result);
    } else {
      db.run(r.table('users').insert(user), (err, result) => {
        done(null, user);
      });
    }
  });
}));
app.use(passport.initialize());
app.use(passport.session());
app.get('/auth/twitter', passport.authenticate('twitter'));
app.get('/twits', passport.authenticate('twitter', {
  successRedirect: 'back',
  failureRedirect: 'back'
}));
app.get('/logout', (req, res) => {
  req.logout();
  res.redirect('back');
});

// website parts
app.use('/blog', blogHandler);
app.use('/projects', projectsHandler);

// o no
app.use((req, res) => {
  res.status(404).render('404', {});
});

// startitup
app.listen(3000, () => {
  console.log('listening on 3000');
});

});
