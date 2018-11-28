var app 		    = require('express')();
var bodyParser 	= require('body-parser');
var cors = require('cors');
var sql         = require('./lib/mysql-pool');
var login       = require('./lib/login');

app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies
app.use(cors()); //enables CORS


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
      res.json({'error': error, 'pat': pat});
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
      res.json({'error': error, 'private_key':pkey});
    });
  });
});
app.put('/login/register', function(req, res) {
  var trt = req.body.private_key,
      code = req.body.sms_key;
  sql.pool.getConnection(function(err, connection) {
    login.verify(connection, trt, code, function(error, pat) {
      res.json({'error': error, 'token': pat});
    });
  });
});

app.delete('/login/', function(req, res) {
  var pat = req.body.token;
  sql.pool.getConnection(function(err, connection) {
    login.logout(connection,pat, function(error) {
      res.json({'error': error});
      connection.release();
    });
  });
});

app.listen(8000);
