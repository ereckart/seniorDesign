var app 		    = require('express')();
var bodyParser 	= require('body-parser');
var sql         = require('./lib/mysql-pool');
var login       = require('./lib/login');

app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

app.get('/', function(req, res) {
  res.send("API Root");
  res.end();
  console.log('API domain');
});

app.post('/login', function(req, res) {
  var phone = req.body.phone,
      password = req.body.password;
  sql.pool.getConnection(function(err, connection) {
    login.login(connection, phone, password, function(error, pat) {
      var output = {};
      output.error = error;
      output.pat = pat;
      res.json(output);
    });
  });
});
app.post('/login/register', function(req, res) {
  var phone = req.body.phone,
      password = req.body.password,
      first = req.body.first,
      last = req.body.last;
  sql.pool.getConnection(function(err, connection) {
    login.register(connection, first, last, phone, password,function(error, pkey) {
      var output = {};
      output.error = error;
      output.private_key = pkey;
      res.json(output);
    });
  });
});
app.put('/login/register', function(req, res) {
  var trt = req.body.private_key,
      code = req.body.sms_key;
  sql.pool.getConnection(function(err, connection) {
    login.verify(connection, trt, code, function(error, pat) {
      var output = {};
      output.error = error;
      output.pat = pat;
      res.json(output);
    });
  });
});

app.listen(8000);
