let express = require('express');
let app = express();
let bodyParser = require('body-parser');
let helmet = require('helmet');
let pluralize = require('pluralize');

let db = require('./server/db.js');

let fs = require('fs');
let secrets = JSON.parse(fs.readFileSync('secrets.json'));

let r = require('rethinkdb');
let session = require('express-session');
let RethinkStore = require('express-session-rethinkdb')(session);
let sessionStore = new RethinkStore({
  connectOptions: {
    servers: [
      { host: 'localhost', port: 28015 }
    ],
    db: 'machine'
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
  resave: true,
  saveUninitialized: true
}));

// views
app.set('views', './views');
app.set('view engine', 'pug');
app.use(express.static('assets'));

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
    if(err) console.error(err);
    if(result) {
      done(null, result);
    } else {
      db.run(r.table('users').insert(user), (err, result) => {
        if(err) console.error(err);
        done(null, user);
      });
    }
  });
}));
app.use(passport.initialize());
app.use(passport.session());
app.get('/auth/twitter', passport.authenticate('twitter'));
app.get('/twits', passport.authenticate('twitter', {
  successRedirect: '/',
  failureRedirect: '/'
}));
app.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/');
});

// website parts
app.use('/', require('./server/indexHandler.js'));
app.use('/blog', require('./server/blogHandler.js'));
app.use('/projects', require('./server/projectsHandler.js'));
app.use('/things', require('./server/thingsHandler.js'));
app.use('/admin', require('./server/adminHandler.js'));

// o no
app.use((req, res) => {
  res.status(404).render('404', {});
});

// startitup
let disableHttps = process.argv.some((arg) => { return arg === '--noHttps'});
let portSpecified = process.argv.indexOf('--port');
let actualPort = parseInt(process.argv[portSpecified + 1]);
let port = portSpecified > 1 ? actualPort : (disableHttps ? 3000 : 3001);

if(disableHttps) {
  let http = require('http');
  http.createServer(app).listen(port, () => {
    console.log('http listening on', port);
  });  
} else {
  let https = require('https');
  let httpsOptions = {
    key: fs.readFileSync('creds/key.pem'),
    cert: fs.readFileSync('creds/fullchain.pem')
  };
  
  https.createServer(httpsOptions, app).listen(port, () => {
    console.log('https listening on', port);
  });
}

});
