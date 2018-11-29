/* Imports */
var http = require('http');
var express = require("express");
var app = express();
var path = require('path');

var sql         = require('./lib/mysql-pool');
var login       = require('./lib/login');

// var routes = require('./routes/routes.js');
// var uuid = require('node-uuid');
// var cookieSession = require('cookie-session');
var bodyParser = require('body-parser');
// var mongoose = require('mongoose');
var cookieParser = require('cookie-parser');
// var passport = require('passport');
// var auth = require('./auth');

/* Dependency Setup */
app.engine('html', require('ejs').__express);
app.set('view engine', 'html');
app.set('views', '../frontend');
app.use(express.static('../frontend'));

// var generateCookieSecret = () => 'iamasecret' + uuid.v4();
// app.use(cookieSession({secret: generateCookieSecret()}));
app.use(cookieParser("9061nl24areDTMoLhUpaBLtEAaMDHZFrBlOdiFX7tys4HBx9FCDQ8c"));
function authenticate(req, res, next) {
  if (!req.cookies.token) {
    res.redirect('/login');
  } else {
    var token = req.cookies.token;
    sql.pool.getConnection(function(err, connection) {
      if (err != null) {
        res.json({error: error});
        connection.release();
      }
      login.auth(connection, token, function(error, user_id) {
        if (error != null) {
          res.redirect('/login');
        } else {
          res.cookie('user_id',user_id,{signed: true});
          next();
        }
        connection.release();
      });
    });
  }
}
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
 	extended: true
}));

// auth(passport);
// app.use(passport.initialize());

/* Routing */
app.get('/login', function (req, res) {
  //res.redirect('/');
  res.render('login/login');
});
app.get('/register', function (req, res) {
  //res.redirect('/');
  res.render('register/register');
});
app.get('/verify', function (req, res) {
  //res.redirect('/');
  res.render('verify/verify');
});
app.get('/restricted', authenticate, function (req, res) {
  res.render('analytics/analytics');
})
app.get('/', (req, res) => {
  res.render('landing/landing')
});
app.get('/analytics', (req, res) => res.render('analytics/analytics'));
app.get('/host', (req, res) => res.render('host/host'));
app.get('/waiter', (req, res) => res.render('waiter/waiter'));
app.get('/kitchen', (req, res) => res.render('kitchen/kitchen'));
app.get('/settings', (req, res) => res.render('settings/settings'));

// app.get('/loggedIn',
// 	passport.authenticate('google', {failureRedirect: '/'}),
// 	routes.post_login
// );
// app.post('/verifyLogin', routes.verify_login);
//
// app.get('/auth/google', passport.authenticate('google', {
//     scope: ['https://www.googleapis.com/auth/userinfo.profile']
// }));
//
// app.get('/create', (req, res) => res.render('create'));
// app.get('/club/:clubname', routes.club_page);
// app.get('/clubpage/:clubname/admin/:adminid', routes.club_page_admin);
// app.get('/conflict', (req, res) => res.render('conflict'));
// app.post('/submitConflict', routes.submit_conflict);
// app.get('/welcome', (req, res) => res.render('welcome'));
// app.post('/createClub', routes.new_club);
// app.post('/createEvent', routes.create_event);
// app.post('/editDescription', routes.update_description);
// app.get('/join/:clubname', routes.join_club_landing_page);
// app.get('/join', routes.join_club);


/* Start App */
app.set('port', process.env.PORT || 8080);

var server = app.listen(app.get('port'), function () {
console.log('Express server listening on port %d', server.address().port);
});

/* To be stored in Config.JSON */
// Client ID: 916258004164-3304q68p6dgrhsqdb1b2d00ncg6gs4mc.apps.googleusercontent.com
// Client secret: M2bVdirEI6D3giseHeZGvRRa
//create a server object:
// http.createServer(function (req, res) {
//   console.log('Running the server!');
//   res.write('Hello World Main Site Ready!'); //write a response to the client
//   res.end(); //end the response
// }).listen(8080); //the server object listens on port 8080
